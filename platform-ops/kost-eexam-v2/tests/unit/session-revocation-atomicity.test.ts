import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Session registry — set-based bulk revocation (#52)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createDbSession, listSessionsForUser, revokeAllSessionsForUser } = await import("../../lib/sessions-registry");
  const { getDb } = await import("../../lib/db");

  test("revokes every active session for one user in one call", () => {
    const actorId = createUser({ username: "revoke.actor", password: "Test123!", fullName: "Revoke Actor", role: "administrator" });
    const userId = createUser({ username: "revoke.all", password: "Test123!", fullName: "Revoke All", role: "candidate" });

    createDbSession({ userId });
    createDbSession({ userId });
    createDbSession({ userId });

    const changed = revokeAllSessionsForUser(userId, actorId);
    assert.equal(changed, 3);

    const rows = listSessionsForUser(userId);
    assert.equal(rows.length, 3);
    assert.ok(rows.every((row) => row.revoked_at !== null));
    assert.ok(rows.every((row) => row.revoked_by === actorId));
  });

  test("exceptId preserves only the explicitly excluded session", () => {
    const actorId = createUser({ username: "revoke.except.actor", password: "Test123!", fullName: "Except Actor", role: "administrator" });
    const userId = createUser({ username: "revoke.except", password: "Test123!", fullName: "Except User", role: "candidate" });

    const keep = createDbSession({ userId });
    createDbSession({ userId });
    createDbSession({ userId });

    const changed = revokeAllSessionsForUser(userId, actorId, keep.dbSessionId);
    assert.equal(changed, 2);

    const rows = listSessionsForUser(userId);
    const preserved = rows.find((row) => row.id === keep.dbSessionId);
    assert.ok(preserved);
    assert.equal(preserved.revoked_at, null);
    assert.equal(preserved.revoked_by, null);
    assert.equal(rows.filter((row) => row.revoked_at !== null).length, 2);
  });

  test("an injected SQLite failure rolls back the whole bulk revocation instead of leaving a partially revoked set", () => {
    const db = getDb();
    const actorId = createUser({ username: "revoke.fail.actor", password: "Test123!", fullName: "Failure Actor", role: "administrator" });
    const userId = createUser({ username: "revoke.fail", password: "Test123!", fullName: "Failure User", role: "candidate" });

    const first = createDbSession({ userId });
    const blocked = createDbSession({ userId });
    const third = createDbSession({ userId });

    db.exec(`
      CREATE TRIGGER fail_one_session_revocation
      BEFORE UPDATE OF revoked_at ON sessions
      WHEN OLD.id = ${blocked.dbSessionId} AND NEW.revoked_at IS NOT NULL
      BEGIN
        SELECT RAISE(ABORT, 'injected session revocation failure');
      END;
    `);

    try {
      assert.throws(
        () => revokeAllSessionsForUser(userId, actorId),
        /injected session revocation failure/
      );

      const rows = listSessionsForUser(userId);
      const byId = new Map(rows.map((row) => [row.id, row]));
      for (const sessionId of [first.dbSessionId, blocked.dbSessionId, third.dbSessionId]) {
        const row = byId.get(sessionId);
        assert.ok(row);
        assert.equal(row.revoked_at, null, `session ${sessionId} must remain unrevoked after statement rollback`);
        assert.equal(row.revoked_by, null);
      }
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_one_session_revocation`);
    }
  });
});
