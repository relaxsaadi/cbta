// MFA factor-2 authorization boundary.
//
// This module deliberately has no `server-only` import so the exact same
// SQLite decision can be exercised by node:test. Callers that expose it to
// HTTP remain server actions/routes. The security invariant is enforced by
// BEGIN IMMEDIATE: factor-2 eligibility, recovery-code consumption and the
// durable server-session row are decided under one SQLite writer lock.
// This prevents an older pending-MFA cookie from reopening access after a
// suspension/archive/login-block decision that won first, and prevents two
// concurrent requests from consuming the same recovery code successfully.
import { getDb, nowIso, transaction } from "./db";
import { findUserById, getRoleForUser } from "./users";
import { isTemporaryPasswordExpired } from "./temp-password";
import { isNewLoginsBlocked } from "./platform-settings";
import { verifyTotpCode, consumeRecoveryCode } from "./mfa";
import { createDbSession, revokeDbSession } from "./sessions-registry";
import type { ConsoleRole } from "./session";

export type MfaClaimFailureReason =
  | "invalid_session"
  | "account_not_active"
  | "temp_password_expired"
  | "platform_logins_blocked"
  | "invalid_code";

export interface MfaLoginClaim {
  ok: true;
  userId: number;
  username: string;
  fullName: string;
  role: ConsoleRole;
  dbSessionId: number;
  loginAt: string;
  previousLastLoginAt: string | null;
  usedRecoveryCode: boolean;
  previousRecoveryCodesJson: string | null;
  recoveryCodesJsonAfterClaim: string | null;
}

export interface MfaLoginClaimFailure {
  ok: false;
  reason: MfaClaimFailureReason;
  userId: number | null;
  role: ConsoleRole | null;
}

export type MfaLoginClaimResult = MfaLoginClaim | MfaLoginClaimFailure;

export function claimMfaLogin(
  userId: number,
  code: string,
  meta: { ip?: string; userAgent?: string }
): MfaLoginClaimResult {
  return transaction(() => {
    // Re-read every authorization-relevant field only after BEGIN IMMEDIATE.
    // A stale UserRow captured at the password step is never trusted here.
    const user = findUserById(userId);
    const role = user ? getRoleForUser(user.id) : null;
    if (!user || !role || user.mfa_enabled !== 1 || !user.mfa_secret) {
      return { ok: false, reason: "invalid_session", userId: user?.id ?? null, role };
    }
    if (user.status !== "active") {
      return { ok: false, reason: "account_not_active", userId: user.id, role };
    }
    if (isTemporaryPasswordExpired(user)) {
      return { ok: false, reason: "temp_password_expired", userId: user.id, role };
    }
    // Existing incident-recovery policy is preserved: administrators remain
    // able to authenticate while new logins are globally blocked.
    if (role !== "administrator" && isNewLoginsBlocked()) {
      return { ok: false, reason: "platform_logins_blocked", userId: user.id, role };
    }

    const isTotpValid = verifyTotpCode(user.mfa_secret, code);
    let usedRecoveryCode = false;
    let recoveryCodesJsonAfterClaim = user.mfa_recovery_codes_json;

    if (!isTotpValid) {
      if (!user.mfa_recovery_codes_json) {
        return { ok: false, reason: "invalid_code", userId: user.id, role };
      }
      const remaining = consumeRecoveryCode(user.mfa_recovery_codes_json, code);
      if (remaining === null) {
        return { ok: false, reason: "invalid_code", userId: user.id, role };
      }

      // CAS is retained in addition to BEGIN IMMEDIATE. The write lock makes
      // the read/verify/update serializable across SQLite connections; the
      // equality predicate also fails closed if this code is ever reused in a
      // different transaction structure later.
      const updated = getDb()
        .prepare(
          `UPDATE users
           SET mfa_recovery_codes_json = ?
           WHERE id = ? AND mfa_recovery_codes_json = ?`
        )
        .run(remaining, user.id, user.mfa_recovery_codes_json);
      if (Number(updated.changes) !== 1) {
        return { ok: false, reason: "invalid_code", userId: user.id, role };
      }
      usedRecoveryCode = true;
      recoveryCodesJsonAfterClaim = remaining;
    }

    const loginAt = nowIso();
    const { dbSessionId } = createDbSession({
      userId: user.id,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });
    getDb().prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`).run(loginAt, user.id);

    return {
      ok: true,
      userId: user.id,
      username: user.username,
      fullName: user.full_name,
      role,
      dbSessionId,
      loginAt,
      previousLastLoginAt: user.last_login_at,
      usedRecoveryCode,
      previousRecoveryCodesJson: user.mfa_recovery_codes_json,
      recoveryCodesJsonAfterClaim,
    };
  });
}

/**
 * Best-effort compensation when iron-session cannot persist the browser
 * cookie after the durable SQLite claim succeeded. The server session is
 * always revoked. Recovery codes and last_login are restored only with CAS
 * predicates proving that no newer state has replaced the value meanwhile;
 * stale MFA material is never reintroduced over a newer rotation/claim.
 */
export function compensateMfaLoginClaim(claim: MfaLoginClaim): {
  recoveryCodeRestored: boolean;
  lastLoginRestored: boolean;
} {
  return transaction(() => {
    revokeDbSession(claim.dbSessionId, claim.userId);
    let recoveryCodeRestored = !claim.usedRecoveryCode;
    let lastLoginRestored = false;

    if (
      claim.usedRecoveryCode &&
      claim.previousRecoveryCodesJson !== null &&
      claim.recoveryCodesJsonAfterClaim !== null
    ) {
      const restored = getDb()
        .prepare(
          `UPDATE users
           SET mfa_recovery_codes_json = ?
           WHERE id = ? AND mfa_recovery_codes_json = ?`
        )
        .run(
          claim.previousRecoveryCodesJson,
          claim.userId,
          claim.recoveryCodesJsonAfterClaim
        );
      recoveryCodeRestored = Number(restored.changes) === 1;
    }

    const restoredLastLogin = getDb()
      .prepare(
        `UPDATE users
         SET last_login_at = ?
         WHERE id = ? AND last_login_at = ?`
      )
      .run(claim.previousLastLoginAt, claim.userId, claim.loginAt);
    lastLoginRestored = Number(restoredLastLogin.changes) === 1;

    return { recoveryCodeRestored, lastLoginRestored };
  });
}
