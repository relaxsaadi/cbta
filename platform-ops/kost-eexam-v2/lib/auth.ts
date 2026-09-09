import "server-only";
import { getSession } from "./session";
import { findUserByUsername, findUserById, getRoleForUser, touchLastLogin } from "./users";
import { verifyPassword } from "./passwords";
import { createDbSession, revokeDbSession } from "./sessions-registry";
import { audit } from "./audit";
import { checkLoginRateLimit, recordLoginFailure, resetLoginRateLimit } from "./rate-limit";
import { isNewLoginsBlocked } from "./platform-settings";
import { isTemporaryPasswordExpired } from "./temp-password";
import { claimMfaLogin, compensateMfaLoginClaim } from "./mfa-login-boundary";
import type { ConsoleRole } from "./session";
import type { UserRow } from "./users";

export interface LoginResult {
  ok: boolean;
  error?: string;
  mfaRequired?: boolean;
}

/** Finalise une connexion sans MFA (création de la ligne `sessions`, cookie
 * iron-session, audit). Le chemin MFA utilise une frontière SQLite distincte
 * dans lib/mfa-login-boundary.ts afin que la réévaluation d'éligibilité,
 * l'usage éventuel d'un code de secours et la création de session soient
 * sérialisés sous le même verrou d'écriture. */
async function finalizeLogin(user: UserRow, role: ConsoleRole, meta: { ip?: string; userAgent?: string }): Promise<void> {
  const { dbSessionId } = createDbSession({ userId: user.id, ipAddress: meta.ip, userAgent: meta.userAgent });
  touchLastLogin(user.id);

  const session = await getSession();
  session.isLoggedIn = true;
  session.userId = user.id;
  session.username = user.username;
  session.fullName = user.full_name;
  session.role = role;
  session.dbSessionId = dbSessionId;
  session.pendingMfaUserId = undefined;
  await session.save();

  audit({ actorUserId: user.id, actorRole: role, action: "login", result: "success", ipAddress: meta.ip, sessionId: dbSessionId });
}

/** Point d'entrée unique de connexion — vérifie l'identifiant/mot de passe
 * natifs (plus aucun relais Moodle, voir docs §1.5), crée une ligne dans le
 * registre `sessions` (nécessaire pour la révocation server-side, §20),
 * puis le cookie iron-session ne porte que la référence à cette ligne.
 * Mission "PRODUCTION READINESS" §25 : si le compte a activé MFA, le mot
 * de passe seul ne complète JAMAIS la connexion — une session "en
 * attente" (pendingMfaUserId, jamais isLoggedIn) est posée, et
 * `completeMfaLogin()` doit réussir avant tout accès à une route
 * protégée. */
export async function login(username: string, password: string, meta: { ip?: string; userAgent?: string }): Promise<LoginResult> {
  const rateLimitKey = `${meta.ip ?? "unknown"}:${username}`;
  const rateLimit = checkLoginRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    audit({ actorUserId: null, actorRole: null, action: "login", result: "failure", ipAddress: meta.ip, metadata: { username, reason: "rate_limited" } });
    const minutes = Math.ceil(rateLimit.retryAfterSeconds / 60);
    return { ok: false, error: `Trop de tentatives échouées pour ce compte. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` };
  }

  const user = findUserByUsername(username);
  // pending_activation (mission email §8-9) : password_hash porte un
  // hachage aléatoire inconnu de tous — vérifié AVANT verifyPassword pour
  // renvoyer un message utile ("activez votre compte") plutôt que le
  // message générique "mot de passe incorrect" qui serait techniquement
  // toujours vrai ici mais trompeur pour un vrai candidat.
  if (user?.status === "pending_activation") {
    audit({ actorUserId: user.id, actorRole: null, action: "login", result: "failure", ipAddress: meta.ip, metadata: { reason: "pending_activation" } });
    return { ok: false, error: "Ce compte n'est pas encore activé. Consultez l'email d'invitation reçu pour créer votre mot de passe." };
  }
  if (!user || !verifyPassword(password, user.password_hash)) {
    recordLoginFailure(rateLimitKey);
    audit({ actorUserId: user?.id ?? null, actorRole: null, action: "login", result: "failure", ipAddress: meta.ip, metadata: { username } });
    return { ok: false, error: "Identifiant ou mot de passe incorrect." };
  }
  if (user.status === "suspended") {
    audit({ actorUserId: user.id, actorRole: null, action: "login", result: "failure", ipAddress: meta.ip, metadata: { reason: "suspended" } });
    return { ok: false, error: "Ce compte est suspendu. Contactez un administrateur." };
  }
  // 'archived' (mission "COMPLETE USER MANAGEMENT", 2026-08-29) — bug réel
  // trouvé en relisant ce garde-fou après l'ajout du statut : archiver un
  // compte ne modifie jamais password_hash, donc verifyPassword() ci-dessus
  // continuerait de réussir pour un mot de passe encore valide — sans ce
  // contrôle explicite, un compte archivé resterait connectable tant que
  // son mot de passe n'a pas changé, en contradiction directe avec "ARCHIVÉ
  // ne peut jamais se connecter" (exigence explicite de la mission).
  if (user.status === "archived") {
    audit({ actorUserId: user.id, actorRole: null, action: "login", result: "failure", ipAddress: meta.ip, metadata: { reason: "archived" } });
    return { ok: false, error: "Ce compte a été archivé. Contactez un administrateur." };
  }
  // Mot de passe temporaire (mission "ADMIN/CLIENT/CANDIDATE UX
  // IMPROVEMENTS", 2026-08-30, §7) — refusé une fois expiré MÊME s'il
  // correspond encore au hash stocké (verifyPassword() a déjà réussi
  // ci-dessus) : lib/temp-password.ts::isTemporaryPasswordExpired().
  // Jamais confondu avec "mot de passe incorrect" — message dédié, pour
  // que le candidat sache qu'il doit demander un nouvel accès plutôt que
  // de ressaisir le même mot de passe.
  if (isTemporaryPasswordExpired(user)) {
    audit({ actorUserId: user.id, actorRole: null, action: "login", result: "failure", ipAddress: meta.ip, metadata: { reason: "temp_password_expired" } });
    return { ok: false, error: "Ce mot de passe temporaire a expiré. Contactez un administrateur pour un nouvel accès." };
  }
  const role = getRoleForUser(user.id);
  if (!role) {
    audit({ actorUserId: user.id, actorRole: null, action: "login", result: "failure", ipAddress: meta.ip, metadata: { reason: "no_role" } });
    return { ok: false, error: "Aucun rôle n'est associé à ce compte." };
  }
  // Addendum §9-11 — action immédiate d'incident : mode maintenance ou
  // blocage dédié des nouvelles connexions. administrator TOUJOURS
  // exempté (doit pouvoir se connecter pour lever le blocage) — voir
  // lib/platform-settings.ts.
  if (role !== "administrator" && isNewLoginsBlocked()) {
    audit({ actorUserId: user.id, actorRole: role, action: "login", result: "failure", ipAddress: meta.ip, metadata: { reason: "platform_logins_blocked" } });
    return { ok: false, error: "Connexions temporairement suspendues (maintenance en cours). Réessayez plus tard ou contactez un administrateur." };
  }

  resetLoginRateLimit(rateLimitKey);

  if (user.mfa_enabled === 1) {
    const session = await getSession();
    session.isLoggedIn = false;
    session.pendingMfaUserId = user.id;
    await session.save();
    audit({ actorUserId: user.id, actorRole: role, action: "login_password_ok_mfa_pending", result: "success", ipAddress: meta.ip });
    return { ok: false, mfaRequired: true };
  }

  await finalizeLogin(user, role, meta);
  return { ok: true };
}

/** Second facteur — mot de passe déjà vérifié (session "en attente"),
 * exige un code TOTP à 6 chiffres OU un code de secours à usage unique.
 *
 * La décision d'autorisation est reprise à zéro à cette frontière : statut
 * du compte, expiration du mot de passe temporaire, blocage des nouvelles
 * connexions, rôle et configuration MFA sont relus sous BEGIN IMMEDIATE.
 * Le même verrou couvre la consommation d'un éventuel code de secours et la
 * création de la session serveur. Ainsi, une décision de suspension/archive
 * qui gagne la course ne peut pas être contournée par un ancien cookie MFA,
 * et deux requêtes ne peuvent pas dépenser le même code de secours. */
export async function completeMfaLogin(code: string, meta: { ip?: string; userAgent?: string }): Promise<LoginResult> {
  const session = await getSession();
  const pendingUserId = session.pendingMfaUserId;
  if (!pendingUserId) {
    return { ok: false, error: "Aucune connexion en attente de vérification MFA. Reconnectez-vous." };
  }

  // Snapshot uniquement utilisé pour le limiteur anti-force-brute. Il ne
  // participe PAS à la décision d'autorisation : claimMfaLogin() relit tout
  // l'état pertinent sous le verrou SQLite avant de créer une session.
  const preflightUser = findUserById(pendingUserId);
  const preflightRole = preflightUser ? getRoleForUser(preflightUser.id) : null;
  if (!preflightUser || !preflightRole) {
    session.destroy();
    return { ok: false, error: "Session de connexion invalide. Reconnectez-vous." };
  }

  const rateLimitKey = `${meta.ip ?? "unknown"}:${preflightUser.username}`;
  const rateLimit = checkLoginRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    audit({ actorUserId: preflightUser.id, actorRole: preflightRole, action: "mfa_verify", result: "failure", ipAddress: meta.ip, metadata: { reason: "rate_limited" } });
    const minutes = Math.ceil(rateLimit.retryAfterSeconds / 60);
    return { ok: false, error: `Trop de tentatives échouées. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` };
  }

  const claim = claimMfaLogin(pendingUserId, code, meta);
  if (!claim.ok) {
    if (claim.reason === "invalid_code") {
      recordLoginFailure(rateLimitKey);
      audit({ actorUserId: claim.userId ?? preflightUser.id, actorRole: claim.role ?? preflightRole, action: "mfa_verify", result: "failure", ipAddress: meta.ip });
      return { ok: false, error: "Code invalide. Réessayez." };
    }

    // Une modification administrative ou de politique intervenue entre les
    // deux facteurs invalide définitivement cette tentative MFA. Ne pas
    // laisser le cookie pending être rejoué après le refus.
    session.destroy();
    audit({
      actorUserId: claim.userId ?? preflightUser.id,
      actorRole: claim.role ?? preflightRole,
      action: "mfa_verify",
      result: "failure",
      ipAddress: meta.ip,
      metadata: { reason: claim.reason },
    });

    if (claim.reason === "account_not_active") {
      return { ok: false, error: "Ce compte n'est plus autorisé à se connecter. Reconnectez-vous ou contactez un administrateur." };
    }
    if (claim.reason === "temp_password_expired") {
      return { ok: false, error: "Ce mot de passe temporaire a expiré. Reconnectez-vous avec un nouvel accès." };
    }
    if (claim.reason === "platform_logins_blocked") {
      return { ok: false, error: "Connexions temporairement suspendues (maintenance en cours). Réessayez plus tard ou contactez un administrateur." };
    }
    return { ok: false, error: "Session de connexion invalide. Reconnectez-vous." };
  }

  session.isLoggedIn = true;
  session.userId = claim.userId;
  session.username = claim.username;
  session.fullName = claim.fullName;
  session.role = claim.role;
  session.dbSessionId = claim.dbSessionId;
  session.pendingMfaUserId = undefined;

  try {
    await session.save();
  } catch {
    // Le cookie navigateur n'a pas été persisté : ne jamais laisser une
    // session serveur active que le client ne possède pas. La compensation
    // révoque toujours cette session et restaure le code de secours /
    // last_login uniquement si aucun état plus récent ne les a remplacés.
    const compensation = compensateMfaLoginClaim(claim);
    session.destroy();
    audit({
      actorUserId: claim.userId,
      actorRole: claim.role,
      action: "mfa_verify",
      result: "failure",
      ipAddress: meta.ip,
      sessionId: claim.dbSessionId,
      metadata: {
        reason: "session_cookie_persist_failed",
        recoveryCodeRestored: compensation.recoveryCodeRestored,
        lastLoginRestored: compensation.lastLoginRestored,
      },
    });
    return { ok: false, error: "Impossible de finaliser la connexion. Reconnectez-vous." };
  }

  resetLoginRateLimit(rateLimitKey);
  if (claim.usedRecoveryCode) {
    audit({ actorUserId: claim.userId, actorRole: claim.role, action: "mfa_recovery_code_used", result: "success", ipAddress: meta.ip, sessionId: claim.dbSessionId });
  }
  audit({ actorUserId: claim.userId, actorRole: claim.role, action: "login", result: "success", ipAddress: meta.ip, sessionId: claim.dbSessionId });
  return { ok: true };
}

export async function logout(): Promise<void> {
  const session = await getSession();
  if (session.dbSessionId && session.userId) {
    revokeDbSession(session.dbSessionId, session.userId);
    audit({ actorUserId: session.userId, actorRole: session.role ?? null, action: "logout", result: "success", sessionId: session.dbSessionId });
  }
  session.destroy();
}
