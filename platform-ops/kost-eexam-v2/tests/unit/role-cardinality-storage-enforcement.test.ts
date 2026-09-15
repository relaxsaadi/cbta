import assert from "node:assert/strict";
import { test } from "node:test";
import { getDb } from "../../lib/db";
import { enforceSinglePersistedRolePerUser } from "../../lib/role-cardinality-storage";
import { setupTestDb } from "./test-db";

setupTestDb();

test("persisted role enforcement fails closed, preserves conflicts, then prevents future multi-role rows", () => {
  const db = getDb();
  const candidateRole = db.prepare(`SELECT id FROM roles WHERE code = 'candidate'`).get() as { id: number };
  const adminRole = db.prepare(`SELECT id FROM roles WHERE code = 'administrator'`).get() as { id: number };

  const multiUserId = Number(
    db
      .prepare(
        `INSERT INTO users (username, email, password_hash, full_name)
         VALUES (?, ?, ?, ?)`
      )
      .run("private.multi", "private.multi@example.invalid", "not-a-real-secret", "Private Multi").lastInsertRowid
  );
  db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(multiUserId, candidateRole.id);
  db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(multiUserId, adminRole.id);

  const missingUserId = Number(
    db
      .prepare(
        `INSERT INTO users (username, email, password_hash, full_name)
         VALUES (?, ?, ?, ?)`
      )
      .run("private.missing", "private.missing@example.invalid", "not-a-real-secret", "Private Missing").lastInsertRowid
  );

  assert.throws(
    () => enforceSinglePersistedRolePerUser(),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, new RegExp(`user_id=${multiUserId},category=multiple_roles,role_count=2`));
      assert.match(error.message, new RegExp(`user_id=${missingUserId},category=missing_role,role_count=0`));
      assert.doesNotMatch(error.message, /private\.multi|private\.missing|example\.invalid|Private Multi|Private Missing/);
      return true;
    }
  );

  const preservedMultiRoles = db
    .prepare(`SELECT role_id FROM user_roles WHERE user_id = ? ORDER BY role_id`)
    .all(multiUserId) as { role_id: number }[];
  assert.deepEqual(
    preservedMultiRoles.map((row) => row.role_id),
    [candidateRole.id, adminRole.id].sort((a, b) => a - b)
  );
  assert.equal(
    (db.prepare(`SELECT COUNT(*) AS n FROM users WHERE id = ?`).get(missingUserId) as { n: number }).n,
    1
  );
  assert.equal(
    (db
      .prepare(`SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'index' AND name = 'uq_user_roles_single_role_per_user'`)
      .get() as { n: number }).n,
    0
  );

  // Explicit operator remediation in the test: enforcement itself must never
  // choose which role survives or manufacture a missing role.
  db.prepare(`DELETE FROM user_roles WHERE user_id = ? AND role_id = ?`).run(multiUserId, adminRole.id);
  db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(missingUserId, candidateRole.id);

  enforceSinglePersistedRolePerUser();

  const indexRow = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'uq_user_roles_single_role_per_user'`)
    .get() as { name: string } | undefined;
  assert.equal(indexRow?.name, "uq_user_roles_single_role_per_user");

  assert.throws(
    () => db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(multiUserId, adminRole.id),
    /UNIQUE constraint failed: user_roles\.user_id/
  );

  // Idempotent after the boundary is already installed.
  enforceSinglePersistedRolePerUser();
  assert.equal(
    (db.prepare(`SELECT COUNT(*) AS n FROM user_roles WHERE user_id = ?`).get(multiUserId) as { n: number }).n,
    1
  );
});
