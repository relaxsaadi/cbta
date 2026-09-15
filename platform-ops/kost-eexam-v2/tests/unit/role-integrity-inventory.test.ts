import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { createUser } from "../../lib/users";
import {
  listCandidateRelationIntegrityAnomalies,
  listRoleIntegrityAnomalies,
} from "../../lib/role-integrity";

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

function createAdministrator(label: string) {
  seq += 1;
  return createUser({
    username: `role-inventory-${label}-${seq}`,
    password: `Strong-Role-Inventory-${seq}!`,
    fullName: `Sensitive Full Name ${label} ${seq}`,
    email: `role-inventory-${label}-${seq}@example.invalid`,
    role: "administrator",
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

describe("Historical candidate relation integrity inventory (#78)", () => {
  test("reports poisoned preserved relations without mutating them", () => {
    const db = getDb();
    const validCandidateId = createCandidate("relation-valid");
    const zeroRoleUserId = createCandidate("relation-zero");
    const multiRoleUserId = createCandidate("relation-multi");
    const staffOnlyUserId = createAdministrator("relation-staff");

    db.prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(zeroRoleUserId);
    const administrator = db
      .prepare(`SELECT id FROM roles WHERE code = 'administrator'`)
      .get() as { id: number };
    db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(multiRoleUserId, administrator.id);

    const companyId = Number(
      db.prepare(`INSERT INTO companies (name, scope) VALUES (?, 'test')`).run(`Relation Inventory Company ${seq}`).lastInsertRowid
    );
    const groupId = Number(
      db.prepare(`INSERT INTO groups (company_id, name, scope) VALUES (?, ?, 'test')`).run(companyId, `Relation Inventory Group ${seq}`).lastInsertRowid
    );

    db.prepare(`INSERT INTO group_members (group_id, candidate_user_id) VALUES (?, ?)`).run(groupId, validCandidateId);
    db.prepare(`INSERT INTO group_members (group_id, candidate_user_id) VALUES (?, ?)`).run(groupId, zeroRoleUserId);

    const assessmentId = Number(
      db.prepare(
        `INSERT INTO assessments (type, name, function_code, group_id, question_count, duration_minutes, scope)
         VALUES ('examen', ?, '7.1', ?, 1, 30, 'test')`
      ).run(`Relation Inventory Assessment ${seq}`, groupId).lastInsertRowid
    );
    db.prepare(`INSERT INTO assessment_assignments (assessment_id, candidate_user_id) VALUES (?, ?)`).run(assessmentId, multiRoleUserId);

    const familiarizationSessionId = Number(
      db.prepare(
        `INSERT INTO familiarization_sessions (group_id, function_code, held_at)
         VALUES (?, '7.1', ?)`
      ).run(groupId, "2026-09-15T08:00:00.000Z").lastInsertRowid
    );
    const attendanceId = Number(
      db.prepare(
        `INSERT INTO familiarization_attendance (session_id, candidate_user_id, present)
         VALUES (?, ?, 0)`
      ).run(familiarizationSessionId, staffOnlyUserId).lastInsertRowid
    );

    const anomalies = listCandidateRelationIntegrityAnomalies();

    assert.equal(
      anomalies.some(
        (row) =>
          row.relation === "group_members" &&
          row.record_key === `${groupId}:${validCandidateId}`
      ),
      false
    );
    assert.deepEqual(
      anomalies.find(
        (row) =>
          row.relation === "group_members" &&
          row.record_key === `${groupId}:${zeroRoleUserId}`
      ),
      {
        relation: "group_members",
        record_key: `${groupId}:${zeroRoleUserId}`,
        user_id: zeroRoleUserId,
        category: "missing_role",
        role_count: 0,
        role_codes: [],
      }
    );
    assert.deepEqual(
      anomalies.find(
        (row) =>
          row.relation === "assessment_assignments" &&
          row.record_key === `${assessmentId}:${multiRoleUserId}`
      ),
      {
        relation: "assessment_assignments",
        record_key: `${assessmentId}:${multiRoleUserId}`,
        user_id: multiRoleUserId,
        category: "multiple_roles",
        role_count: 2,
        role_codes: ["administrator", "candidate"],
      }
    );
    assert.deepEqual(
      anomalies.find(
        (row) =>
          row.relation === "familiarization_attendance" &&
          row.record_key === `${attendanceId}`
      ),
      {
        relation: "familiarization_attendance",
        record_key: `${attendanceId}`,
        user_id: staffOnlyUserId,
        category: "non_candidate_role",
        role_count: 1,
        role_codes: ["administrator"],
      }
    );

    // Evidence-only contract: the inventory never deletes or rewrites the poisoned rows.
    assert.equal(
      (db.prepare(`SELECT COUNT(*) AS count FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).get(groupId, zeroRoleUserId) as { count: number }).count,
      1
    );
    assert.equal(
      (db.prepare(`SELECT COUNT(*) AS count FROM assessment_assignments WHERE assessment_id = ? AND candidate_user_id = ?`).get(assessmentId, multiRoleUserId) as { count: number }).count,
      1
    );
    assert.equal(
      (db.prepare(`SELECT COUNT(*) AS count FROM familiarization_attendance WHERE id = ?`).get(attendanceId) as { count: number }).count,
      1
    );
  });

  test("relation inventory exposes identifiers and role evidence only, never account PII", () => {
    const anomalies = listCandidateRelationIntegrityAnomalies();
    for (const anomaly of anomalies) {
      assert.deepEqual(
        Object.keys(anomaly).sort(),
        ["category", "record_key", "relation", "role_codes", "role_count", "user_id"]
      );
    }

    const payload = JSON.stringify(anomalies);
    assert.equal(payload.includes("Sensitive Full Name"), false);
    assert.equal(payload.includes("@example.invalid"), false);
    assert.equal(payload.includes("role-inventory-"), false);
  });
});
