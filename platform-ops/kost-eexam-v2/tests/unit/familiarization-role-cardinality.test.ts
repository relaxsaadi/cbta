import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Familiarization attendance — current candidate role cardinality (#78/#245)", () => {
  test("operational roster and mutations fail closed while historical attendance evidence is preserved", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const {
      createFamiliarizationSession,
      getCandidateFamiliarizationHistory,
      listAttendance,
      markAttendance,
    } = await import("../../lib/familiarization");
    const { getDb } = await import("../../lib/db");

    const managerId = createUser({
      username: "familiarization-role-manager",
      password: "x".repeat(10),
      fullName: "Familiarization Role Manager",
      role: "pedagogical_manager",
    });
    const candidateId = createUser({
      username: "familiarization-role-candidate",
      password: "x".repeat(10),
      fullName: "Valid Familiarization Candidate",
      role: "candidate",
    });
    const staffId = createUser({
      username: "familiarization-role-staff",
      password: "x".repeat(10),
      fullName: "Historical Familiarization Staff",
      role: "auditor",
    });
    const rolelessId = createUser({
      username: "familiarization-role-roleless",
      password: "x".repeat(10),
      fullName: "Historical Familiarization Roleless",
      role: "candidate",
    });
    const ambiguousId = createUser({
      username: "familiarization-role-ambiguous",
      password: "x".repeat(10),
      fullName: "Historical Familiarization Ambiguous",
      role: "candidate",
    });

    const companyId = createCompany({ name: "Familiarization role company", scope: "test", createdBy: managerId });
    const groupId = createGroup({
      companyId,
      name: "Familiarization role group",
      scope: "test",
      pedagogicalManagerId: managerId,
      createdBy: managerId,
    });
    addCandidateToGroup(groupId, candidateId, managerId);

    const db = getDb();
    db.prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(rolelessId);
    const adminRole = db.prepare(`SELECT id FROM roles WHERE code = 'administrator'`).get() as { id: number } | undefined;
    assert.ok(adminRole);
    db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(ambiguousId, adminRole.id);

    const sessionId = createFamiliarizationSession({
      groupId,
      functionCode: "7.1",
      heldAt: "2026-09-15T08:00:00.000Z",
      organizedBy: managerId,
      organizerRole: "pedagogical_manager",
    });

    // Preserve poisoned historical attendance rows as evidence. They must not
    // be reinterpreted as current candidate authority by UI/PDF consumers.
    const historicalIds = [staffId, rolelessId, ambiguousId];
    for (const userId of historicalIds) {
      db.prepare(
        `INSERT INTO familiarization_attendance (session_id, candidate_user_id, present) VALUES (?, ?, 0)`
      ).run(sessionId, userId);
    }

    assert.deepEqual(
      listAttendance(sessionId).map((row) => row.candidate_user_id),
      [candidateId],
      "operational attendance must exclude staff-only, roleless, and candidate+staff identities"
    );

    const historicalCount = db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM familiarization_attendance
         WHERE session_id = ? AND candidate_user_id IN (?, ?, ?)`
      )
      .get(sessionId, staffId, rolelessId, ambiguousId) as { count: number };
    assert.equal(historicalCount.count, 3, "operational filtering must not delete historical attendance evidence");

    for (const userId of historicalIds) {
      assert.throws(
        () => markAttendance(sessionId, userId, true, { id: managerId, role: "pedagogical_manager" }),
        /candidat non ambigu/,
        "historical non-candidate/ambiguous attendance must not be mutable as current candidate attendance"
      );
    }

    const poisonedRows = db
      .prepare(
        `SELECT candidate_user_id, present, marked_at, marked_by
         FROM familiarization_attendance
         WHERE session_id = ? AND candidate_user_id IN (?, ?, ?)
         ORDER BY candidate_user_id`
      )
      .all(sessionId, staffId, rolelessId, ambiguousId) as {
      candidate_user_id: number;
      present: number;
      marked_at: string | null;
      marked_by: number | null;
    }[];
    assert.equal(poisonedRows.length, 3);
    for (const row of poisonedRows) {
      assert.equal(row.present, 0);
      assert.equal(row.marked_at, null);
      assert.equal(row.marked_by, null);
    }

    const deniedSuccessAudits = db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM audit_logs
         WHERE target_type = 'familiarization_session'
           AND target_id = ?
           AND action IN ('familiarization_attendance_present', 'familiarization_attendance_absent')`
      )
      .get(sessionId) as { count: number };
    assert.equal(deniedSuccessAudits.count, 0, "denied attendance mutations must not emit success audit events");

    // Historical user history remains historical evidence even when the same
    // identity is excluded from current operational attendance authority.
    assert.equal(getCandidateFamiliarizationHistory(staffId).length, 1);
    assert.equal(getCandidateFamiliarizationHistory(rolelessId).length, 1);
    assert.equal(getCandidateFamiliarizationHistory(ambiguousId).length, 1);

    markAttendance(sessionId, candidateId, true, { id: managerId, role: "pedagogical_manager" });
    const current = listAttendance(sessionId);
    assert.equal(current.length, 1);
    assert.equal(current[0]?.candidate_user_id, candidateId);
    assert.equal(current[0]?.present, 1);

    const validSuccessAudits = db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM audit_logs
         WHERE target_type = 'familiarization_session'
           AND target_id = ?
           AND action = 'familiarization_attendance_present'`
      )
      .get(sessionId) as { count: number };
    assert.equal(validSuccessAudits.count, 1, "a valid canonical candidate mutation must retain its success audit");
  });
});
