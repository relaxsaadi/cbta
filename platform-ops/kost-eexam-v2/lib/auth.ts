import "server-only";
import { getSession } from "./session";
import { findUserByUsername, getRoleForUser, touchLastLogin } from "./users";
import { verifyPassword } from "./passwords";
import { createDbSession, revokeDbSession } from "./sessions-registry";
import { audit } from "./audit";
import { checkLoginRateLimit, recordLoginFailure, resetLoginRateLimit } from "./rate-limit";

export interface LoginResult {
  ok: boolean;
  error?: string;
}

/** Point d'entrée unique de connexion — vérifie l'identifiant/mot de passe
 * natifs (plus aucun relais Moodle, voir docs §1.5), crée une ligne dans le
 * registre `sessions` (nécessaire pour la révocation server-side, §20),
 * puis le cookie iron-session ne porte que la référence à cette ligne. */
export async function login(username: string, password: string, meta: { ip?: string; userAgent?: string }): Promise<LoginResult> {
  const rateLimitKey = `${meta.ip ?? "unknown"}:${username}`;
  const rateLimit = checkLoginRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    audit({ actorUserId: null, actorRole: null, action: "login", result: "failure", ipAddress: meta.ip, metadata: { username, reason: "rate_limited" } });
    const minutes = Math.ceil(rateLimit.retryAfterSeconds / 60);
    return { ok: false, error: `Trop de tentatives échouées pour ce compte. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` };
  }

  const user = findUserByUsername(username);
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

  resetLoginRateLimit(rateLimitKey);
  const { dbSessionId } = createDbSession({ userId: user.id, ipAddress: meta.ip, userAgent: meta.userAgent });
  touchLastLogin(user.id);

  const session = await getSession();
  session.isLoggedIn = true;
  session.userId = user.id;
  session.username = user.username;
  session.fullName = user.full_name;
  session.role = role;
  session.dbSessionId = dbSessionId;
  await session.save();

  audit({ actorUserId: user.id, actorRole: role, action: "login", result: "success", ipAddress: meta.ip, sessionId: dbSessionId });
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
