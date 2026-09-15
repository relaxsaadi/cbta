import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { createUser } from "../../lib/users";
import { listCandidateRelationIntegrityAnomalies } from "../../lib/role-integrity";

before(() => setupTestDb());

describe("Candidate-only user_functions integrity boundary (#245)", () => {
  test("reports a preserved staff user_functions row without deleting it or exposing account PII", () => {
    const db = getDb();
    const adminId = createUser({
      username: "function-integrity-admin",
      password: "Strong-Function-Integrity-Admin!",
      fullName: "Sensitive Administrator Name",
      email: "function-integrity-admin@example.invalid",
      role: "administrator",
    });
    const staffId = createUser({
      username: "function-integrity-staff",
      password: "Strong-Function-Integrity-Staff!",
      fullName: "Sensitive Auditor Name",
      email: "function-integrity-staff@example.invalid",
      role: "auditor",
    });
    const candidateId = createUser({
      username: "function-integrity-candidate",
      password: "Strong-Function-Integrity-Candidate!",
      fullName: "Sensitive Candidate Name",
      email: "function-integrity-candidate@example.invalid",
      role: "candidate",
    });

    // Simule deux lignes préexistantes : une valide et une sémantiquement
    // empoisonnée. L'inventaire ne doit ni réparer ni supprimer la seconde.
    db.prepare(`INSERT INTO user_functions (user_id, function_code, assigned_by) VALUES (?, '7.8', ?)`).run(candidateId, adminId);
    db.prepare(`INSERT INTO user_functions (user_id, function_code, assigned_by) VALUES (?, '7.9', ?)`).run(staffId, adminId);

    const anomalies = listCandidateRelationIntegrityAnomalies();

    assert.equal(
      anomalies.some(
        (row) => row.relation === "user_functions" && row.record_key === `${candidateId}:7.8`
      ),
      false,
      "une relation de candidat valide ne doit pas être signalée"
    );

    assert.deepEqual(
      anomalies.find(
        (row) => row.relation === "user_functions" && row.record_key === `${staffId}:7.9`
      ),
      {
        relation: "user_functions",
        record_key: `${staffId}:7.9`,
        user_id: staffId,
        category: "non_candidate_role",
        role_count: 1,
        role_codes: ["auditor"],
      }
    );

    const persisted = db
      .prepare(`SELECT COUNT(*) AS count FROM user_functions WHERE user_id = ? AND function_code = '7.9'`)
      .get(staffId) as { count: number };
    assert.equal(persisted.count, 1, "l'inventaire doit être strictement read-only");

    const payload = JSON.stringify(anomalies);
    assert.equal(payload.includes("Sensitive Auditor Name"), false);
    assert.equal(payload.includes("function-integrity-staff@example.invalid"), false);
    assert.equal(payload.includes("function-integrity-staff"), false);
  });
});
