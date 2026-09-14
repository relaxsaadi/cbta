import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { createUser, getRoleForUser } from "../../lib/users";
import { generateMfaSecret, totpAt } from "../../lib/mfa";
import { claimMfaLogin, deriveMfaCredentialGeneration } from "../../lib/mfa-login-boundary";

before(() => setupTestDb());

let seq = 0;
function createCandidate() {
  seq += 1;
  return createUser({
    username: `role-cardinality-auth-${seq}`,
    password: `Strong-Role-Cardinality-${seq}!`,
    fullName: `Role Cardinality ${seq}`,
    role: "candidate",
  });
}

function addRole(userId: number, role: "administrator" | "auditor" | "pedagogical_manager") {
  const row = getDb().prepare(`SELECT id FROM roles WHERE code = ?`).get(role) as { id: number } | undefined;
  assert.ok(row);
  getDb().prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(userId, row.id);
}

describe("Authentication role cardinality — fail closed (#245)", () => {
  test("single canonical role resolves normally, while zero roles resolve to no authority", () => {
    const normalUserId = createCandidate();
    assert.equal(getRoleForUser(normalUserId), "candidate");

    const zeroRoleUserId = createCandidate();
    getDb().prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(zeroRoleUserId);
    assert.equal(getRoleForUser(zeroRoleUserId), null);
  });

  test("candidate plus any staff role never resolves to an arbitrary effective role", () => {
    for (const staffRole of ["administrator", "auditor", "pedagogical_manager"] as const) {
      const userId = createCandidate();
      addRole(userId, staffRole);

      assert.equal(
        getRoleForUser(userId),
        null,
        `candidate + ${staffRole} must not be collapsed to one arbitrary login role`
      );

      const evidence = getDb()
        .prepare(`SELECT COUNT(*) AS count FROM user_roles WHERE user_id = ?`)
        .get(userId) as { count: number };
      assert.equal(evidence.count, 2, "fail-closed resolution must preserve contradictory role evidence");
    }
  });

  test("MFA factor 2 refuses a now-ambiguous identity before creating a durable session", () => {
    const userId = createCandidate();
    const secret = generateMfaSecret();
    getDb()
      .prepare(`UPDATE users SET mfa_enabled = 1, mfa_secret = ? WHERE id = ?`)
      .run(secret, userId);

    const user = getDb()
      .prepare(`SELECT password_hash, last_login_at FROM users WHERE id = ?`)
      .get(userId) as { password_hash: string; last_login_at: string | null };
    const credentialGeneration = deriveMfaCredentialGeneration(user.password_hash);

    // Simulate persisted role corruption after factor 1 but before factor 2.
    addRole(userId, "administrator");

    const result = claimMfaLogin(
      userId,
      totpAt(secret, Date.now()),
      credentialGeneration,
      { ip: "127.0.0.1", userAgent: "role-cardinality-test" }
    );

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "invalid_session");

    const sessions = getDb()
      .prepare(`SELECT COUNT(*) AS count FROM sessions WHERE user_id = ? AND revoked_at IS NULL`)
      .get(userId) as { count: number };
    assert.equal(sessions.count, 0);

    const after = getDb()
      .prepare(`SELECT last_login_at FROM users WHERE id = ?`)
      .get(userId) as { last_login_at: string | null };
    assert.equal(after.last_login_at, user.last_login_at);

    const evidence = getDb()
      .prepare(`SELECT COUNT(*) AS count FROM user_roles WHERE user_id = ?`)
      .get(userId) as { count: number };
    assert.equal(evidence.count, 2, "MFA denial must not auto-repair contradictory role rows");
  });
});
