import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("#245 — incident origin is fail-closed on persisted role ambiguity", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { declareIncident, getIncident } = await import("../../lib/incidents");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function makeUser(role: "candidate" | "administrator" | "auditor" | "pedagogical_manager") {
    counter += 1;
    return createUser({
      username: `incident-origin-${counter}`,
      password: "x".repeat(10),
      fullName: `Incident Origin ${counter}`,
      role,
    });
  }

  function addRole(userId: number, role: "administrator" | "auditor" | "pedagogical_manager") {
    getDb()
      .prepare(`INSERT INTO user_roles (user_id, role_id) SELECT ?, id FROM roles WHERE code = ?`)
      .run(userId, role);
  }

  function roleCodes(userId: number): string[] {
    return (
      getDb()
        .prepare(
          `SELECT r.code
           FROM user_roles ur
           JOIN roles r ON r.id = ur.role_id
           WHERE ur.user_id = ?
           ORDER BY r.code`
        )
        .all(userId) as { code: string }[]
    ).map((row) => row.code);
  }

  test("a single canonical candidate role is labelled as candidate origin", () => {
    const candidateId = makeUser("candidate");
    const incidentId = declareIncident({
      type: "other",
      severity: "low",
      description: "single candidate role",
      createdBy: candidateId,
      createdByRole: "candidate",
    });

    assert.equal(getIncident(incidentId)!.reported_by_candidate, 1);
  });

  test("candidate + staff identities are not labelled as authoritative candidate origin and evidence is preserved", () => {
    for (const extraRole of ["administrator", "auditor", "pedagogical_manager"] as const) {
      const candidateId = makeUser("candidate");
      const incidentId = declareIncident({
        type: "other",
        severity: "low",
        description: `candidate plus ${extraRole}`,
        createdBy: candidateId,
        createdByRole: "candidate",
      });

      assert.equal(getIncident(incidentId)!.reported_by_candidate, 1);
      addRole(candidateId, extraRole);

      assert.equal(
        getIncident(incidentId)!.reported_by_candidate,
        0,
        `candidate + ${extraRole} must fail closed instead of being presented as a canonical candidate origin`
      );
      assert.deepEqual(
        roleCodes(candidateId),
        ["candidate", extraRole].sort(),
        "origin classification must not delete or repair contradictory historical role evidence"
      );
    }
  });

  test("zero-role and non-candidate identities are not labelled as candidate origin", () => {
    const candidateId = makeUser("candidate");
    const candidateIncidentId = declareIncident({
      type: "other",
      severity: "low",
      description: "candidate role later removed",
      createdBy: candidateId,
      createdByRole: "candidate",
    });
    getDb().prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(candidateId);
    assert.equal(getIncident(candidateIncidentId)!.reported_by_candidate, 0);

    const adminId = makeUser("administrator");
    const adminIncidentId = declareIncident({
      type: "other",
      severity: "low",
      description: "administrator origin",
      createdBy: adminId,
      createdByRole: "administrator",
    });
    assert.equal(getIncident(adminIncidentId)!.reported_by_candidate, 0);
  });
});
