import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Core user provisioning — runtime role validation and atomic role assignment (#46)", async () => {
  before(() => setupTestDb());

  const {
    createUser,
    createUserPendingActivation,
    findUserByUsername,
    getRoleForUser,
  } = await import("../../lib/users");
  const { getDb } = await import("../../lib/db");

  test("forged pending-activation role fails before persisting a user", () => {
    const username = "provision.invalid.pending";
    assert.throws(
      () =>
        createUserPendingActivation({
          username,
          fullName: "Invalid Pending Role",
          role: "not_a_real_role" as never,
        }),
      /Rôle inconnu/
    );
    assert.equal(findUserByUsername(username), undefined);
  });

  test("forged direct createUser role also leaves no account row", () => {
    const username = "provision.invalid.direct";
    assert.throws(
      () =>
        createUser({
          username,
          password: "Test123!",
          fullName: "Invalid Direct Role",
          role: "not_a_real_role" as never,
        }),
      /Rôle inconnu/
    );
    assert.equal(findUserByUsername(username), undefined);
  });

  test("injected user_roles failure rolls the user insert back", () => {
    const db = getDb();
    const username = "provision.role.insert.rollback";
    db.exec(`
      CREATE TRIGGER fail_user_role_assignment
      BEFORE INSERT ON user_roles
      BEGIN
        SELECT RAISE(ABORT, 'injected user role assignment failure');
      END;
    `);

    try {
      assert.throws(
        () =>
          createUserPendingActivation({
            username,
            fullName: "Role Assignment Rollback",
            role: "candidate",
          }),
        /injected user role assignment failure/
      );
      assert.equal(findUserByUsername(username), undefined);
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_user_role_assignment`);
    }
  });

  test("all four canonical roles remain provisionable and correctly bound", () => {
    const roles = ["candidate", "pedagogical_manager", "administrator", "auditor"] as const;
    for (const role of roles) {
      const username = `provision.valid.${role}`;
      const userId = createUserPendingActivation({
        username,
        fullName: `Valid ${role}`,
        role,
      });
      assert.equal(findUserByUsername(username)?.status, "pending_activation");
      assert.equal(getRoleForUser(userId), role);
    }
  });

  test("duplicate failure does not create an extra user or role row", () => {
    const db = getDb();
    const username = "provision.duplicate";
    const firstId = createUserPendingActivation({
      username,
      fullName: "Duplicate First",
      role: "candidate",
    });

    assert.throws(
      () =>
        createUserPendingActivation({
          username,
          fullName: "Duplicate Second",
          role: "auditor",
        }),
      /UNIQUE constraint failed/
    );

    const users = db.prepare(`SELECT id FROM users WHERE username = ?`).all(username) as { id: number }[];
    assert.deepEqual(users.map((row) => row.id), [firstId]);
    const roleRows = db.prepare(`SELECT role_id FROM user_roles WHERE user_id = ?`).all(firstId) as { role_id: number }[];
    assert.equal(roleRows.length, 1);
    assert.equal(getRoleForUser(firstId), "candidate");
  });
});
