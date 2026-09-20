import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";

before(() => setupTestDb());

let seq = 0;

async function createFixture() {
  seq += 1;
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createFamiliarizationSession } = await import("../../lib/familiarization");

  const managerId = createUser({
    username: `fam.atomic.manager.${seq}`,
    password: "x".repeat(12),
    fullName: `Fam Atomic Manager ${seq}`,
    role: "pedagogical_manager",
  });
  const candidateId = createUser({
    username: `fam.atomic.candidate.${seq}`,
    password: "x".repeat(12),
    fullName: `Fam Atomic Candidate ${seq}`,
    role: "candidate",
    email: `fam.atomic.candidate.${seq}@example.test`,
  });
  const companyId = createCompany({ name: `Fam Atomic Company ${seq}`, scope: "test", createdBy: managerId });
  const groupId = createGroup({
    companyId,
    name: `Fam Atomic Group ${seq}`,
    scope: "test",
    pedagogicalManagerId: managerId,
    createdBy: managerId,
  });
  addCandidateToGroup(groupId, candidateId, managerId);
  const sessionId = createFamiliarizationSession({
    groupId,
    functionCode: "7.1",
    heldAt: `2026-09-20T1${seq % 10}:00:00.000Z`,
    audience: "candidats",
    organizedBy: managerId,
    organizerRole: "pedagogical_manager",
  });
  return { managerId, candidateId, companyId, groupId, sessionId };
}

function auditCount(action: string, targetId: number): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = ? AND target_type = 'familiarization_session' AND target_id = ?`)
    .get(action, targetId) as { n: number };
  return Number(row.n);
}

function installAuditFailureTrigger(name: string, action: string) {
  getDb().exec(`
    CREATE TEMP TRIGGER ${name}
    BEFORE INSERT ON audit_logs
    WHEN NEW.action = '${action}'
    BEGIN
      SELECT RAISE(ABORT, 'injected familiarization audit failure');
    END;
  `);
}

function dropTrigger(name: string) {
  getDb().exec(`DROP TRIGGER IF EXISTS ${name}`);
}

describe("Familiarisation roster/audit integrity (#70)", () => {
  test("attendance mutation rolls back if its success audit cannot be persisted", async () => {
    const { markAttendance } = await import("../../lib/familiarization");
    const fixture = await createFixture();
    const action = "familiarization_attendance_present";
    const trigger = `fail_fam_attendance_audit_${seq}`;

    const before = getDb()
      .prepare(`SELECT present, marked_at, marked_by FROM familiarization_attendance WHERE session_id = ? AND candidate_user_id = ?`)
      .get(fixture.sessionId, fixture.candidateId) as { present: number; marked_at: string | null; marked_by: number | null };
    const beforeAudits = auditCount(action, fixture.sessionId);

    installAuditFailureTrigger(trigger, action);
    try {
      assert.throws(
        () => markAttendance(fixture.sessionId, fixture.candidateId, true, { id: fixture.managerId, role: "pedagogical_manager" }),
        /injected familiarization audit failure/
      );
    } finally {
      dropTrigger(trigger);
    }

    const after = getDb()
      .prepare(`SELECT present, marked_at, marked_by FROM familiarization_attendance WHERE session_id = ? AND candidate_user_id = ?`)
      .get(fixture.sessionId, fixture.candidateId) as { present: number; marked_at: string | null; marked_by: number | null };
    assert.deepEqual(after, before, "attendance state must roll back with the failed audit insert");
    assert.equal(auditCount(action, fixture.sessionId), beforeAudits);
  });

  test("evidence insert rolls back if its success audit cannot be persisted", async () => {
    const { addFamiliarizationEvidence } = await import("../../lib/familiarization");
    const fixture = await createFixture();
    const action = "familiarization_evidence_attached";
    const trigger = `fail_fam_evidence_audit_${seq}`;
    const beforeRows = Number(
      (getDb().prepare(`SELECT COUNT(*) AS n FROM familiarization_evidence WHERE session_id = ?`).get(fixture.sessionId) as { n: number }).n
    );
    const beforeAudits = auditCount(action, fixture.sessionId);

    installAuditFailureTrigger(trigger, action);
    try {
      assert.throws(
        () => addFamiliarizationEvidence(fixture.sessionId, "Référence E2E non sensible", { id: fixture.managerId, role: "pedagogical_manager" }),
        /injected familiarization audit failure/
      );
    } finally {
      dropTrigger(trigger);
    }

    const afterRows = Number(
      (getDb().prepare(`SELECT COUNT(*) AS n FROM familiarization_evidence WHERE session_id = ?`).get(fixture.sessionId) as { n: number }).n
    );
    assert.equal(afterRows, beforeRows, "evidence row must roll back with the failed audit insert");
    assert.equal(auditCount(action, fixture.sessionId), beforeAudits);
  });

  test("invitation recipients are frozen from committed attendance roster, not later live group membership", async () => {
    const { createUser } = await import("../../lib/users");
    const { addCandidateToGroup } = await import("../../lib/groups");
    const { listFamiliarizationInvitationRecipients } = await import("../../lib/familiarization");
    const fixture = await createFixture();

    const addedLaterId = createUser({
      username: `fam.atomic.late.${seq}`,
      password: "x".repeat(12),
      fullName: `Fam Atomic Late Candidate ${seq}`,
      role: "candidate",
      email: `fam.atomic.late.${seq}@example.test`,
    });

    // Change the live group AFTER the familiarisation session committed:
    // remove its original candidate and add another. The historical session
    // roster must not be rewritten by either change.
    getDb().prepare(`DELETE FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).run(fixture.groupId, fixture.candidateId);
    addCandidateToGroup(fixture.groupId, addedLaterId, fixture.managerId);

    const recipients = listFamiliarizationInvitationRecipients(fixture.sessionId);
    assert.deepEqual(
      recipients.map((row) => row.candidate_user_id),
      [fixture.candidateId],
      "notification recipient source must remain the committed session roster"
    );
  });

  test("a non-rostered candidate cannot fabricate an attendance success audit", async () => {
    const { createUser } = await import("../../lib/users");
    const { markAttendance } = await import("../../lib/familiarization");
    const fixture = await createFixture();
    const outsiderId = createUser({
      username: `fam.atomic.outsider.${seq}`,
      password: "x".repeat(12),
      fullName: `Fam Atomic Outsider ${seq}`,
      role: "candidate",
    });
    const action = "familiarization_attendance_present";
    const beforeAudits = auditCount(action, fixture.sessionId);

    assert.throws(
      () => markAttendance(fixture.sessionId, outsiderId, true, { id: fixture.managerId, role: "pedagogical_manager" }),
      /Seul un compte candidat non ambigu/
    );
    assert.equal(auditCount(action, fixture.sessionId), beforeAudits, "no success audit may be emitted for a non-rostered candidate");
  });
});
