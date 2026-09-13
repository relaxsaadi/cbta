import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Forced password change — authoritative session/lifecycle boundary (#60)", async () => {
  before(() => setupTestDb());

  const { completeForcedPasswordChange } = await import("../../lib/forced-password-change");
  const { createUserPendingActivation, findUserById } = await import("../../lib/users");
  const { createTemporaryAccess } = await import("../../lib/temp-password");
  const {
    createDbSession,
    isDbSessionValid,
    listSessionsForUser,
    revokeDbSession,
  } = await import("../../lib/sessions-registry");
  const { verifyPassword } = await import("../../lib/passwords");
  const { getDb } = await import("../../lib/db");

  function createTemporaryCandidate(username: string) {
    const userId = createUserPendingActivation({
      username,
      fullName: username,
      role: "candidate",
      email: `${username}@example.com`,
    });
    const { plaintext } = createTemporaryAccess(userId);
    return { userId, plaintext };
  }

  function passwordState(userId: number) {
    return getDb()
      .prepare(`SELECT password_hash, must_change_password, temp_password_expires_at, status FROM users WHERE id = ?`)
      .get(userId) as {
      password_hash: string;
      must_change_password: number;
      temp_password_expires_at: string | null;
      status: string;
    };
  }

  function successAuditCount(userId: number): number {
    const row = getDb()
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'forced_password_change_completed' AND target_id = ? AND result = 'success'`)
      .get(userId) as { n: number };
    return row.n;
  }

  test("valid active DB session changes the credential atomically, retains itself and revokes every other session", () => {
    const { userId, plaintext } = createTemporaryCandidate("forced.boundary.success");
    const current = createDbSession({ userId });
    const otherA = createDbSession({ userId });
    const otherB = createDbSession({ userId });

    const result = completeForcedPasswordChange({
      userId,
      dbSessionId: current.dbSessionId,
      password: "NewChosenPassword123!",
    });

    assert.equal(result.ok, true);
    assert.equal(result.ok && result.changed, true);
    assert.equal(findUserById(userId)?.must_change_password, 0);
    assert.equal(findUserById(userId)?.temp_password_expires_at, null);

    const state = passwordState(userId);
    assert.equal(verifyPassword(plaintext, state.password_hash), false, "temporary credential must no longer verify");
    assert.equal(verifyPassword("NewChosenPassword123!", state.password_hash), true);
    assert.equal(isDbSessionValid(current.dbSessionId, userId), true, "winning authoritative session is intentionally retained");

    const sessions = listSessionsForUser(userId);
    const currentRow = sessions.find((row) => row.id === current.dbSessionId);
    const otherARow = sessions.find((row) => row.id === otherA.dbSessionId);
    const otherBRow = sessions.find((row) => row.id === otherB.dbSessionId);
    assert.ok(currentRow && otherARow && otherBRow);
    assert.equal(currentRow.revoked_at, null);
    assert.ok(otherARow.revoked_at);
    assert.ok(otherBRow.revoked_at);
    assert.equal(successAuditCount(userId), 1);
  });

  test("a revoked DB session fails closed even if the encrypted cookie would still claim login", () => {
    const { userId } = createTemporaryCandidate("forced.boundary.revoked");
    const current = createDbSession({ userId });
    revokeDbSession(current.dbSessionId, userId);
    const before = passwordState(userId);

    const result = completeForcedPasswordChange({
      userId,
      dbSessionId: current.dbSessionId,
      password: "MustNotBeStored123!",
    });

    assert.deepEqual(result, { ok: false, reason: "invalid_session" });
    const after = passwordState(userId);
    assert.equal(after.password_hash, before.password_hash);
    assert.equal(after.must_change_password, 1);
    assert.equal(after.temp_password_expires_at, before.temp_password_expires_at);
    assert.equal(successAuditCount(userId), 0);
  });

  test("suspension wins before the action: no credential/flag mutation and no success audit", () => {
    const { userId } = createTemporaryCandidate("forced.boundary.suspended");
    const current = createDbSession({ userId });
    const before = passwordState(userId);
    getDb().prepare(`UPDATE users SET status = 'suspended' WHERE id = ?`).run(userId);

    const result = completeForcedPasswordChange({
      userId,
      dbSessionId: current.dbSessionId,
      password: "MustNotBeStored123!",
    });

    assert.deepEqual(result, { ok: false, reason: "invalid_session" });
    const after = passwordState(userId);
    assert.equal(after.status, "suspended");
    assert.equal(after.password_hash, before.password_hash);
    assert.equal(after.must_change_password, 1);
    assert.equal(after.temp_password_expires_at, before.temp_password_expires_at);
    assert.equal(successAuditCount(userId), 0);
  });

  test("archive wins before the action: no credential/flag mutation and no success audit", () => {
    const { userId } = createTemporaryCandidate("forced.boundary.archived");
    const current = createDbSession({ userId });
    const before = passwordState(userId);
    getDb().prepare(`UPDATE users SET status = 'archived', archived_at = ? WHERE id = ?`).run(new Date().toISOString(), userId);

    const result = completeForcedPasswordChange({
      userId,
      dbSessionId: current.dbSessionId,
      password: "MustNotBeStored123!",
    });

    assert.deepEqual(result, { ok: false, reason: "invalid_session" });
    const after = passwordState(userId);
    assert.equal(after.status, "archived");
    assert.equal(after.password_hash, before.password_hash);
    assert.equal(after.must_change_password, 1);
    assert.equal(after.temp_password_expires_at, before.temp_password_expires_at);
    assert.equal(successAuditCount(userId), 0);
  });

  test("an injected success-audit failure rolls back password, temp flags and other-session revocation", () => {
    const { userId, plaintext } = createTemporaryCandidate("forced.boundary.rollback");
    const current = createDbSession({ userId });
    const other = createDbSession({ userId });
    const before = passwordState(userId);
    const db = getDb();

    db.exec(`
      CREATE TRIGGER fail_forced_password_change_audit
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = 'forced_password_change_completed'
      BEGIN
        SELECT RAISE(ABORT, 'injected forced password audit failure');
      END;
    `);

    try {
      assert.throws(
        () =>
          completeForcedPasswordChange({
            userId,
            dbSessionId: current.dbSessionId,
            password: "MustRollBack123!",
          }),
        /injected forced password audit failure/
      );

      const after = passwordState(userId);
      assert.equal(after.password_hash, before.password_hash, "password hash must roll back with audit failure");
      assert.equal(verifyPassword(plaintext, after.password_hash), true, "temporary credential remains authoritative after rollback");
      assert.equal(after.must_change_password, 1);
      assert.equal(after.temp_password_expires_at, before.temp_password_expires_at);

      const sessions = listSessionsForUser(userId);
      assert.equal(sessions.find((row) => row.id === current.dbSessionId)?.revoked_at, null);
      assert.equal(sessions.find((row) => row.id === other.dbSessionId)?.revoked_at, null, "other-session revocation must roll back too");
      assert.equal(successAuditCount(userId), 0);
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_forced_password_change_audit`);
    }
  });

  test("idempotent retry from the retained valid session does not create a duplicate success audit", () => {
    const { userId } = createTemporaryCandidate("forced.boundary.retry");
    const current = createDbSession({ userId });

    const first = completeForcedPasswordChange({
      userId,
      dbSessionId: current.dbSessionId,
      password: "RetrySafePassword123!",
    });
    assert.equal(first.ok && first.changed, true);

    const retry = completeForcedPasswordChange({
      userId,
      dbSessionId: current.dbSessionId,
      password: "DifferentButIgnored123!",
    });
    assert.equal(retry.ok, true);
    assert.equal(retry.ok && retry.changed, false);
    assert.equal(successAuditCount(userId), 1);

    const state = passwordState(userId);
    assert.equal(verifyPassword("RetrySafePassword123!", state.password_hash), true);
    assert.equal(verifyPassword("DifferentButIgnored123!", state.password_hash), false);
  });
});
