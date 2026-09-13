import { audit } from "./audit";
import { transaction, nowIso } from "./db";
import { isDbSessionValid, revokeAllSessionsForUser } from "./sessions-registry";
import { clearMustChangePassword } from "./temp-password";
import { findUserById, getRoleForUser, setPassword } from "./users";

export type ForcedPasswordChangeCommitResult =
  | { ok: false; reason: "user_missing" | "invalid_session" }
  | {
      ok: true;
      changed: false;
      user: { id: number; email: string | null; fullName: string; username: string };
    }
  | {
      ok: true;
      changed: true;
      changedAt: string;
      sessionsRevoked: number;
      user: { id: number; email: string | null; fullName: string; username: string };
    };

/**
 * Authoritative mutation boundary for the mandatory temporary-password flow.
 *
 * The encrypted browser cookie is not sufficient authority: the exact
 * server-side DB session must still be current, unrevoked, unexpired and
 * bound to the same currently-active user at the moment the credential is
 * changed. The eligibility check and every SQLite effect that represents a
 * successful forced password change are serialized under one BEGIN IMMEDIATE
 * transaction so a suspension/archive/revocation that wins first makes this
 * operation fail closed, while a password change that wins first commits
 * before the later lifecycle stop and is then subject to that stop.
 *
 * Network notification is intentionally NOT performed here. Callers may send
 * it only after this function has committed successfully.
 */
export function completeForcedPasswordChange(params: {
  userId: number;
  dbSessionId: number;
  password: string;
}): ForcedPasswordChangeCommitResult {
  return transaction(() => {
    const user = findUserById(params.userId);
    if (!user) return { ok: false, reason: "user_missing" };

    // isDbSessionValid() also re-reads users.status and requires 'active'.
    // Running it after BEGIN IMMEDIATE removes the check-then-write window
    // against lifecycle/session revocation writers.
    if (!isDbSessionValid(params.dbSessionId, params.userId)) {
      return { ok: false, reason: "invalid_session" };
    }

    const userSnapshot = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      username: user.username,
    };

    // Safe idempotent re-submit from the same still-valid authoritative
    // session: no credential mutation and, importantly, no duplicate success
    // audit event.
    if (user.must_change_password !== 1) {
      return { ok: true, changed: false, user: userSnapshot };
    }

    setPassword(user.id, params.password);
    clearMustChangePassword(user.id);

    // The session that just proved its authority is intentionally retained;
    // every other active session is revoked in the same transaction. If any
    // later required write (including audit) fails, all of these changes roll
    // back together.
    const sessionsRevoked = revokeAllSessionsForUser(user.id, user.id, params.dbSessionId);
    const changedAt = nowIso();
    audit({
      actorUserId: user.id,
      actorRole: getRoleForUser(user.id),
      action: "forced_password_change_completed",
      targetType: "user",
      targetId: user.id,
      result: "success",
      sessionId: params.dbSessionId,
      metadata: { sessionsRevoked },
    });

    return {
      ok: true,
      changed: true,
      changedAt,
      sessionsRevoked,
      user: userSnapshot,
    };
  });
}
