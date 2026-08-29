import "server-only";
import { getSession } from "./session";
import { findUserByUsername, findUserById, getRoleForUser, touchLastLogin } from "./users";
import { verifyPassword } from "./passwords";
import { verifyTotpCode, consumeRecoveryCode } from "./mfa";
import { createDbSession, revokeDbSession } from "./sessions-registry";
import { audit } from "./audit";
import { checkLoginRateLimit, recordLoginFailure, resetLoginRateLimit } from "./rate-limit";
import { isNewLoginsBlocked } from "./platform-settings";
import { getDb } from "./db";
import type { ConsoleRole } from "./session";
import type { UserRow } from "./users";

export interface LoginResult {
  ok: boolean;
  error?: string;
  mfaRequired?: boolean;
}

/** Finalise une connexion (création de la ligne `sessions`, cookie
 * iron-session, audit) — point d'écriture UNIQUE partagé par le chemin
 * sans MFA et par `completeMfaLogin()`, jamais dupliqué. */
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
 * Même limiteur anti-force-brute que le mot de passe (clé partagée) —
 * empêche un balayage de codes MFA après un mot de passe déjà compromis. */
export async function completeMfaLogin(code: string, meta: { ip?: string; userAgent?: string }): Promise<LoginResult> {
  const session = await getSession();
  const pendingUserId = session.pendingMfaUserId;
  if (!pendingUserId) {
    return { ok: false, error: "Aucune connexion en attente de vérification MFA. Reconnectez-vous." };
  }
  const user = findUserById(pendingUserId);
  const role = user ? getRoleForUser(user.id) : null;
  if (!user || !role || !user.mfa_secret) {
    session.destroy();
    return { ok: false, error: "Session de connexion invalide. Reconnectez-vous." };
  }

  const rateLimitKey = `${meta.ip ?? "unknown"}:${user.username}`;
  const rateLimit = checkLoginRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    audit({ actorUserId: user.id, actorRole: role, action: "mfa_verify", result: "failure", ipAddress: meta.ip, metadata: { reason: "rate_limited" } });
    const minutes = Math.ceil(rateLimit.retryAfterSeconds / 60);
    return { ok: false, error: `Trop de tentatives échouées. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` };
  }

  const isTotpValid = verifyTotpCode(user.mfa_secret, code);
  let usedRecoveryCode = false;
  if (!isTotpValid && user.mfa_recovery_codes_json) {
    const remaining = consumeRecoveryCode(user.mfa_recovery_codes_json, code);
    if (remaining !== null) {
      getDb().prepare(`UPDATE users SET mfa_recovery_codes_json = ? WHERE id = ?`).run(remaining, user.id);
      usedRecoveryCode = true;
    }
  }

  if (!isTotpValid && !usedRecoveryCode) {
    recordLoginFailure(rateLimitKey);
    audit({ actorUserId: user.id, actorRole: role, action: "mfa_verify", result: "failure", ipAddress: meta.ip });
    return { ok: false, error: "Code invalide. Réessayez." };
  }

  resetLoginRateLimit(rateLimitKey);
  if (usedRecoveryCode) {
    audit({ actorUserId: user.id, actorRole: role, action: "mfa_recovery_code_used", result: "success", ipAddress: meta.ip });
  }
  await finalizeLogin(user, role, meta);
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
