import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { createUser } from "../../lib/users";
import { listUsers } from "../../lib/user-directory";

before(() => setupTestDb());

let seq = 0;
function createCandidate() {
  seq += 1;
  return createUser({
    username: `role-cardinality-directory-${seq}`,
    password: `Strong-Role-Directory-${seq}!`,
    fullName: `Role Directory ${seq}`,
    role: "candidate",
  });
}

function addRole(userId: number, role: "administrator" | "auditor" | "pedagogical_manager") {
  const row = getDb().prepare(`SELECT id FROM roles WHERE code = ?`).get(role) as { id: number } | undefined;
  assert.ok(row);
  getDb().prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(userId, row.id);
}

describe("User directory role filter cardinality — fail closed (#245)", () => {
  test("a single canonical role remains visible through its role filter", () => {
    const userId = createCandidate();
    const rows = listUsers({ userIdsOrNull: null, role: "candidate", search: `role-cardinality-directory-${seq}` });
    assert.deepEqual(rows.map((row) => row.id), [userId]);
  });

  test("candidate plus any staff role is excluded from every matching role-filtered directory view without mutation", () => {
    for (const staffRole of ["administrator", "auditor", "pedagogical_manager"] as const) {
      const userId = createCandidate();
      const username = `role-cardinality-directory-${seq}`;
      addRole(userId, staffRole);

      const candidateRows = listUsers({ userIdsOrNull: null, role: "candidate", search: username });
      assert.ok(!candidateRows.some((row) => row.id === userId), `candidate + ${staffRole} must not appear as candidate`);

      const staffRows = listUsers({ userIdsOrNull: null, role: staffRole, search: username });
      assert.ok(!staffRows.some((row) => row.id === userId), `candidate + ${staffRole} must not appear as ${staffRole}`);

      const evidence = getDb()
        .prepare(`SELECT COUNT(*) AS count FROM user_roles WHERE user_id = ?`)
        .get(userId) as { count: number };
      assert.equal(evidence.count, 2, "read-only filtering must preserve contradictory role evidence");
    }
  });
});
