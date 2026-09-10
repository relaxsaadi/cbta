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
