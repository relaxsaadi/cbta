import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { createUser } from "../../lib/users";
import { listRoleIntegrityAnomalies } from "../../lib/role-integrity";

before(() => setupTestDb());

let seq = 0;
function createCandidate(label: string) {
  seq += 1;
  return createUser({
    username: `role-inventory-${label}-${seq}`,
    password: `Strong-Role-Inventory-${seq}!`,
    fullName: `Sensitive Full Name ${label} ${seq}`,
    email: `role-inventory-${label}-${seq}@example.invalid`,
    role: "candidate",
  });
}

describe("Role integrity readiness inventory (#245)", () => {
  test("reports only contradictory identities and preserves their role evidence", () => {
    const validUserId = createCandidate("valid");
    const zeroRoleUserId = createCandidate("zero");
    const multiRoleUserId = createCandidate("multi");

    getDb().prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(zeroRoleUserId);
    const administrator = getDb()
      .prepare(`SELECT id FROM roles WHERE code = 'administrator'`)
      .get() as { id: number };
    getDb()
      .prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(multiRoleUserId, administrator.id);

    const anomalies = listRoleIntegrityAnomalies();

    assert.equal(anomalies.some((row) => row.user_id === validUserId), false);
    assert.deepEqual(
      anomalies.find((row) => row.user_id === zeroRoleUserId),
      {
        user_id: zeroRoleUserId,
        category: "missing_role",
        role_count: 0,
        role_codes: [],
      }
    );
    assert.deepEqual(
      anomalies.find((row) => row.user_id === multiRoleUserId),
      {
        user_id: multiRoleUserId,
        category: "multiple_roles",
        role_count: 2,
        role_codes: ["administrator", "candidate"],
      }
    );

    // Inventory is evidence-only: it must not repair/delete either conflicting row.
    const persisted = getDb()
      .prepare(`SELECT COUNT(*) AS count FROM user_roles WHERE user_id = ?`)
      .get(multiRoleUserId) as { count: number };
    assert.equal(persisted.count, 2);
  });

  test("inventory payload contains no direct account PII fields", () => {
    const anomalies = listRoleIntegrityAnomalies();
    for (const anomaly of anomalies) {
      assert.deepEqual(
        Object.keys(anomaly).sort(),
        ["category", "role_codes", "role_count", "user_id"]
      );
    }

    const payload = JSON.stringify(anomalies);
    assert.equal(payload.includes("Sensitive Full Name"), false);
    assert.equal(payload.includes("@example.invalid"), false);
    assert.equal(payload.includes("role-inventory-"), false);
  });
});
