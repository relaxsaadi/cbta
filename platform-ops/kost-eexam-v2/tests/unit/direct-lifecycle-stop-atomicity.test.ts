import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Direct user lifecycle stops — failure-atomic boundaries (#52)", async () => {
  before(() => setupTestDb());

  const { createUser, findUserById } = await import("../../lib/users");
  const {
    createDbSession,
    listSessionsForUser,
    SessionCreationDeniedError,
  } = await import("../../lib/sessions-registry");
  const {
    suspendUserAtomically,
    archiveUserAtomically,
    archiveUsersBatchAtomically,
  } = await import("../../lib/direct-lifecycle-stop");
  const { getDb } = await import("../../lib/db");

  const actor = () => {
    const id = createUser({
      username: `lifecycle.actor.${Math.random().toString(16).slice(2)}`,
      password: "Test123!",
      fullName: "Lifecycle Actor",
      role: "administrator",
    });
    return { id, role: "administrator" as const };
  };

  test("direct suspension commits expected-state transition, all session revocations and one success audit", () => {
    const admin = actor();
    const userId = createUser({
      username: "lifecycle.suspend.success",
      password: "Test123!",
      fullName: "Lifecycle Suspend Success",
      role: "candidate",
    });
    const first = createDbSession({ userId });
    const second = createDbSession({ userId });

    const result = suspendUserAtomically(userId, admin);
    assert.equal(result.changed, true);
    if (!result.changed) return;
    assert.equal(result.previousStatus, "active");
    assert.equal(result.sessionsRevoked, 2);
    assert.equal(findUserById(userId)?.status, "suspended");

    const sessions = listSessionsForUser(userId);
    for (const sessionId of [first.dbSessionId, second.dbSessionId]) {
      const row = sessions.find((candidate) => candidate.id === sessionId);
      assert.ok(row);
      assert.ok(row.revoked_at);
      assert.equal(row.revoked_by, admin.id);
    }

    const auditCount = getDb()
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_suspended' AND target_id = ? AND result = 'success'`)
      .get(userId) as { n: number };
    assert.equal(auditCount.n, 1);
  });

  test("injected suspension audit failure rolls status and session revocation back together", () => {
    const db = getDb();
    const admin = actor();
    const userId = createUser({
      username: "lifecycle.suspend.rollback",
      password: "Test123!",
      fullName: "Lifecycle Suspend Rollback",
      role: "candidate",
    });
    const activeSession = createDbSession({ userId });

    db.exec(`
      CREATE TRIGGER fail_direct_suspend_audit
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = 'user_suspended' AND NEW.target_id = ${userId}
      BEGIN
        SELECT RAISE(ABORT, 'injected direct suspend audit failure');
      END;
    `);

    try {
      assert.throws(
        () => suspendUserAtomically(userId, admin),
        /injected direct suspend audit failure/
      );
      assert.equal(findUserById(userId)?.status, "active");
      const row = listSessionsForUser(userId).find((candidate) => candidate.id === activeSession.dbSessionId);
      assert.ok(row);
      assert.equal(row.revoked_at, null);
      assert.equal(row.revoked_by, null);
      const auditCount = db
        .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_suspended' AND target_id = ?`)
        .get(userId) as { n: number };
      assert.equal(auditCount.n, 0);
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_direct_suspend_audit`);
    }
  });

  test("stale/replayed suspension records no false success audit", () => {
    const admin = actor();
    const userId = createUser({
      username: "lifecycle.suspend.replay",
      password: "Test123!",
      fullName: "Lifecycle Suspend Replay",
      role: "candidate",
    });

    const first = suspendUserAtomically(userId, admin);
    assert.equal(first.changed, true);
    const replay = suspendUserAtomically(userId, admin);
    assert.equal(replay.changed, false);
    if (replay.changed) return;
    assert.equal(replay.reason, "invalid_state");
    assert.equal(replay.currentStatus, "suspended");

    const auditCount = getDb()
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_suspended' AND target_id = ?`)
      .get(userId) as { n: number };
    assert.equal(auditCount.n, 1);
  });

  test("direct archive rolls status, archived_at, sessions and success audit back on failure", () => {
    const db = getDb();
    const admin = actor();
    const userId = createUser({
      username: "lifecycle.archive.rollback",
      password: "Test123!",
      fullName: "Lifecycle Archive Rollback",
      role: "candidate",
    });
    const activeSession = createDbSession({ userId });

    db.exec(`
      CREATE TRIGGER fail_direct_archive_audit
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = 'user_archived' AND NEW.target_id = ${userId}
      BEGIN
        SELECT RAISE(ABORT, 'injected direct archive audit failure');
      END;
    `);

    try {
      assert.throws(
        () => archiveUserAtomically(userId, admin),
        /injected direct archive audit failure/
      );
      const user = findUserById(userId);
      assert.equal(user?.status, "active");
      assert.equal(user?.archived_at, null);
      const row = listSessionsForUser(userId).find((candidate) => candidate.id === activeSession.dbSessionId);
      assert.ok(row);
      assert.equal(row.revoked_at, null);
      assert.equal(row.revoked_by, null);
      const auditCount = db
        .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_archived' AND target_id = ?`)
        .get(userId) as { n: number };
      assert.equal(auditCount.n, 0);
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_direct_archive_audit`);
    }
  });

  test("batch archive is all-or-nothing when a later user's audit persistence fails", () => {
    const db = getDb();
    const admin = actor();
    const firstUserId = createUser({
      username: "lifecycle.batch.rollback.first",
      password: "Test123!",
      fullName: "Lifecycle Batch First",
      role: "candidate",
    });
    const secondUserId = createUser({
      username: "lifecycle.batch.rollback.second",
      password: "Test123!",
      fullName: "Lifecycle Batch Second",
      role: "candidate",
    });
    const firstSession = createDbSession({ userId: firstUserId });
    const secondSession = createDbSession({ userId: secondUserId });

    db.exec(`
      CREATE TRIGGER fail_second_batch_archive_audit
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = 'user_archived' AND NEW.target_id = ${secondUserId}
      BEGIN
        SELECT RAISE(ABORT, 'injected later batch archive failure');
      END;
    `);

    try {
      assert.throws(
        () => archiveUsersBatchAtomically([firstUserId, secondUserId], admin),
        /injected later batch archive failure/
      );

      for (const userId of [firstUserId, secondUserId]) {
        const user = findUserById(userId);
        assert.equal(user?.status, "active");
        assert.equal(user?.archived_at, null);
      }
      const firstRow = listSessionsForUser(firstUserId).find((candidate) => candidate.id === firstSession.dbSessionId);
      const secondRow = listSessionsForUser(secondUserId).find((candidate) => candidate.id === secondSession.dbSessionId);
      assert.ok(firstRow);
      assert.ok(secondRow);
      assert.equal(firstRow.revoked_at, null);
      assert.equal(secondRow.revoked_at, null);

      const auditCount = db
        .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_archived' AND target_id IN (?, ?)`)
        .get(firstUserId, secondUserId) as { n: number };
      assert.equal(auditCount.n, 0, "earlier batch audit must roll back when a later row fails");
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_second_batch_archive_audit`);
    }
  });

  test("batch prevalidation rejects a missing id before mutating any selected user", () => {
    const admin = actor();
    const userId = createUser({
      username: "lifecycle.batch.prevalidate",
      password: "Test123!",
      fullName: "Lifecycle Batch Prevalidate",
      role: "candidate",
    });
    const activeSession = createDbSession({ userId });
    const missingId = 987654321;

    const result = archiveUsersBatchAtomically([userId, missingId], admin);
    assert.deepEqual(result, { ok: false, reason: "user_missing", userId: missingId });
    assert.equal(findUserById(userId)?.status, "active");
    const row = listSessionsForUser(userId).find((candidate) => candidate.id === activeSession.dbSessionId);
    assert.ok(row);
    assert.equal(row.revoked_at, null);
  });

  test("successful batch revokes every active session and skips already archived rows without duplicate audit", () => {
    const admin = actor();
    const firstUserId = createUser({
      username: "lifecycle.batch.success.first",
      password: "Test123!",
      fullName: "Lifecycle Batch Success First",
      role: "candidate",
    });
    const secondUserId = createUser({
      username: "lifecycle.batch.success.second",
      password: "Test123!",
      fullName: "Lifecycle Batch Success Second",
      role: "candidate",
    });
    createDbSession({ userId: firstUserId });
    createDbSession({ userId: firstUserId });
    createDbSession({ userId: secondUserId });

    const first = archiveUsersBatchAtomically([firstUserId, secondUserId], admin);
    assert.deepEqual(first, { ok: true, archived: 2, skippedAlreadyArchived: 0 });
    for (const userId of [firstUserId, secondUserId]) {
      assert.equal(findUserById(userId)?.status, "archived");
      assert.ok(findUserById(userId)?.archived_at);
      assert.ok(listSessionsForUser(userId).every((row) => row.revoked_at !== null));
    }

    const replay = archiveUsersBatchAtomically([firstUserId, secondUserId], admin);
    assert.deepEqual(replay, { ok: true, archived: 0, skippedAlreadyArchived: 2 });
    const auditCount = getDb()
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_archived' AND target_id IN (?, ?)`)
      .get(firstUserId, secondUserId) as { n: number };
    assert.equal(auditCount.n, 2, "replayed already-archived batch must not create duplicate success audits");
  });

  test("#235 ordering remains fail-closed whether session creation or direct stop wins first", () => {
    const admin = actor();

    const sessionFirstUserId = createUser({
      username: "lifecycle.order.session-first",
      password: "Test123!",
      fullName: "Lifecycle Session First",
      role: "candidate",
    });
    const createdBeforeStop = createDbSession({ userId: sessionFirstUserId });
    const stopped = suspendUserAtomically(sessionFirstUserId, admin);
    assert.equal(stopped.changed, true);
    const revoked = listSessionsForUser(sessionFirstUserId).find((row) => row.id === createdBeforeStop.dbSessionId);
    assert.ok(revoked?.revoked_at);

    const stopFirstUserId = createUser({
      username: "lifecycle.order.stop-first",
      password: "Test123!",
      fullName: "Lifecycle Stop First",
      role: "candidate",
    });
    const stopFirst = suspendUserAtomically(stopFirstUserId, admin);
    assert.equal(stopFirst.changed, true);
    assert.throws(
      () => createDbSession({ userId: stopFirstUserId }),
      (err: unknown) => err instanceof SessionCreationDeniedError
    );
    assert.equal(listSessionsForUser(stopFirstUserId).length, 0);
  });
});
