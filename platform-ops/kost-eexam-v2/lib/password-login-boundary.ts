// Password-only authentication claim boundary.
//
// This module deliberately has no `server-only` import so the exact SQLite
// decision can be exercised by node:test. HTTP callers remain server-side.
// The security invariant is enforced by BEGIN IMMEDIATE: the account state,
// singleton role, credential continuity, MFA state and incident stop-control
// are all re-read under the same writer lock that creates the durable server
// session and updates last_login_at.
import { getDb, nowIso, transaction } from "./db";
import { findUserById, getRoleForUser } from "./users";
import { isTemporaryPasswordExpired } from "./temp-password";
import { isNewLoginsBlocked } from "./platform-settings";
import { createDbSession, revokeDbSession } from "./sessions-registry";
import type { ConsoleRole } from "./session";

export type PasswordLoginClaimFailureReason =
  | "invalid_session"
  | "credential_changed"
  | "role_changed"
  | "account_not_active"
  | "temp_password_expired"
  | "platform_logins_blocked"
  | "mfa_required";

export interface PasswordLoginClaim {
  ok: true;
  userId: number;
  username: string;
  fullName: string;
  role: ConsoleRole;
  dbSessionId: number;
  loginAt: string;
  previousLastLoginAt: string | null;
}

export interface PasswordLoginClaimFailure {
  ok: false;
  reason: PasswordLoginClaimFailureReason;
  userId: number | null;
  role: ConsoleRole | null;
}

export type PasswordLoginClaimResult = PasswordLoginClaim | PasswordLoginClaimFailure;

/**
 * Claim a completed password-only login against current durable state.
 *
 * `expectedPasswordHash` is the in-process hash that was successfully
 * verified during factor 1. It is never persisted or logged here. Requiring
 * both the same credential and the same singleton role under the writer lock
 * prevents a password reset or authority change that wins after preflight
 * from being bypassed by stale state.
 */
export function claimPasswordLogin(
  userId: number,
  expectedPasswordHash: string,
  expectedRole: ConsoleRole,
  meta: { ip?: string; userAgent?: string }
): PasswordLoginClaimResult {
  return transaction((db) => {
    const user = findUserById(userId);
    const role = user ? getRoleForUser(user.id) : null;

    if (!user || !role) {
      return { ok: false, reason: "invalid_session", userId: user?.id ?? null, role };
    }
    if (!expectedPasswordHash || user.password_hash !== expectedPasswordHash) {
      return { ok: false, reason: "credential_changed", userId: user.id, role };
    }
    if (role !== expectedRole) {
      return { ok: false, reason: "role_changed", userId: user.id, role };
    }
    if (user.status !== "active") {
      return { ok: false, reason: "account_not_active", userId: user.id, role };
    }
    if (isTemporaryPasswordExpired(user)) {
      return { ok: false, reason: "temp_password_expired", userId: user.id, role };
    }
    // A concurrent MFA enable must never leave the already-verified password
    // path able to complete without factor 2. The caller asks the user to
    // restart authentication so the normal MFA pending-cookie flow is used.
    if (user.mfa_enabled === 1) {
      return { ok: false, reason: "mfa_required", userId: user.id, role };
    }
    // Existing recovery policy is preserved: administrators may still log in
    // while maintenance/new-login blocking is active so they can recover the
    // platform. Every other role fails closed if the stop wins this lock.
    if (role !== "administrator" && isNewLoginsBlocked()) {
      return { ok: false, reason: "platform_logins_blocked", userId: user.id, role };
    }

    const loginAt = nowIso();
    const { dbSessionId } = createDbSession({
      userId: user.id,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });
    db.prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`).run(loginAt, user.id);

    return {
      ok: true,
      userId: user.id,
      username: user.username,
      fullName: user.full_name,
      role,
      dbSessionId,
      loginAt,
      previousLastLoginAt: user.last_login_at,
    };
  });
}

/**
 * Compensate a claimed password-only login when the browser cookie cannot be
 * published, or when the mandatory success audit fails after cookie staging.
 *
 * The server session is always revoked. last_login_at is restored only when a
 * CAS predicate proves no newer successful login has replaced the claim's
 * timestamp. A stale compensation therefore never overwrites newer history.
 */
export function compensatePasswordLoginClaim(claim: PasswordLoginClaim): {
  lastLoginRestored: boolean;
} {
  return transaction((db) => {
    revokeDbSession(claim.dbSessionId, claim.userId);
    const restored = db
      .prepare(
        `UPDATE users
         SET last_login_at = ?
         WHERE id = ? AND last_login_at = ?`
      )
      .run(claim.previousLastLoginAt, claim.userId, claim.loginAt);
    return { lastLoginRestored: Number(restored.changes) === 1 };
  });
}
