import { test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { createDbSession, isDbSessionValid } from "../../lib/sessions-registry";

setupTestDb();

function createUser(username: string): number {
  const result = getDb()
    .prepare(`INSERT INTO users (username, password_hash, full_name, status) VALUES (?, ?, ?, 'active')`)
    .run(username, "test-hash", username);
  return Number(result.lastInsertRowid);
}

function roleId(code: "candidate" | "pedagogical_manager" | "administrator" | "auditor"): number {
  const row = getDb().prepare(`SELECT id FROM roles WHERE code = ?`).get(code) as { id: number } | undefined;
  assert.ok(row, `expected seeded role ${code}`);
  return row.id;
}

function assignRole(userId: number, code: "candidate" | "pedagogical_manager" | "administrator" | "auditor"): void {
  getDb().prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(userId, roleId(code));
}

test("DB-session authorization is bound to the same active user", () => {
  const userId = createUser("session-owner");
  const otherUserId = createUser("other-user");
  const { dbSessionId } = createDbSession({ userId });

  assert.equal(isDbSessionValid(dbSessionId, userId), true, "active owner session should be valid");
  assert.equal(
    isDbSessionValid(dbSessionId, otherUserId),
    false,
    "a valid dbSessionId must not authorize cookie identity from another user"
  );

  getDb().prepare(`UPDATE users SET status = 'suspended' WHERE id = ?`).run(userId);
  assert.equal(
    isDbSessionValid(dbSessionId, userId),
    false,
    "suspended account must fail closed even if its session row was not revoked"
  );

  getDb().prepare(`UPDATE users SET status = 'archived' WHERE id = ?`).run(userId);
  assert.equal(
    isDbSessionValid(dbSessionId, userId),
    false,
    "archived account must fail closed even if its session row was not revoked"
  );
});

test("protected DB-session authorization fails closed on persisted role ambiguity or drift (#245)", () => {
  const userId = createUser("role-bound-session-owner");
  assignRole(userId, "candidate");
  const { dbSessionId } = createDbSession({ userId });

  assert.equal(
    isDbSessionValid(dbSessionId, userId, "candidate"),
    true,
    "one persisted candidate role matching the authenticated role should remain valid"
  );
  assert.equal(
    isDbSessionValid(dbSessionId, userId, "administrator"),
    false,
    "a cookie role that does not match the unique persisted role must fail closed"
  );

  assignRole(userId, "administrator");
  assert.equal(
    isDbSessionValid(dbSessionId, userId, "candidate"),
    false,
    "the same existing session must fail immediately after a second persisted role appears"
  );
  assert.equal(
    isDbSessionValid(dbSessionId, userId, "administrator"),
    false,
    "multi-role state must not become valid by choosing the other role"
  );

  getDb().prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(userId);
  assignRole(userId, "administrator");
  assert.equal(
    isDbSessionValid(dbSessionId, userId, "candidate"),
    false,
    "a unique persisted role changed since login must invalidate the stale cookie role"
  );
  assert.equal(
    isDbSessionValid(dbSessionId, userId, "administrator"),
    true,
    "the DB guard itself recognizes the new unique role; protected callers must still supply the authenticated cookie role"
  );

  getDb().prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(userId);
  assert.equal(
    isDbSessionValid(dbSessionId, userId, "candidate"),
    false,
    "zero persisted roles must also fail closed at the protected authorization boundary"
  );
});
