import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { createUser, listUsersByRole } from "../../lib/users";

before(() => setupTestDb());

let seq = 0;
function createCandidate() {
  seq += 1;
  return createUser({
    username: `role-cardinality-list-by-role-${seq}`,
    password: `Strong-Role-List-${seq}!`,
    fullName: `Role List ${seq}`,
    role: "candidate",
  });
}

function addRole(userId: number, role: "administrator" | "auditor" | "pedagogical_manager") {
  const row = getDb().prepare(`SELECT id FROM roles WHERE code = ?`).get(role) as { id: number } | undefined;
  assert.ok(row);
  getDb().prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(userId, row.id);
}

describe("listUsersByRole role cardinality — fail closed (#245)", () => {
  test("a single canonical role remains visible", () => {
    const userId = createCandidate();
    assert.ok(listUsersByRole("candidate").some((row) => row.id === userId));
  });

  test("candidate plus any staff role is excluded from both matching lists without deleting evidence", () => {
    for (const staffRole of ["administrator", "auditor", "pedagogical_manager"] as const) {
      const userId = createCandidate();
      addRole(userId, staffRole);

      assert.ok(!listUsersByRole("candidate").some((row) => row.id === userId));
      assert.ok(!listUsersByRole(staffRole).some((row) => row.id === userId));

      const evidence = getDb()
        .prepare(`SELECT COUNT(*) AS count FROM user_roles WHERE user_id = ?`)
        .get(userId) as { count: number };
      assert.equal(evidence.count, 2, "read-only role listing must preserve contradictory evidence");
    }
  });

  test("zero-role identities are not reinterpreted as any role", () => {
    const userId = createCandidate();
    getDb().prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(userId);

    for (const role of ["candidate", "administrator", "auditor", "pedagogical_manager"] as const) {
      assert.ok(!listUsersByRole(role).some((row) => row.id === userId));
    }
  });
});
