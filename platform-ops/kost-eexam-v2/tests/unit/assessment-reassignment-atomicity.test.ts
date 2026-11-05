import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

let fixtureNumber = 0;

async function fixture() {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, listAssignedCandidateIds, assignCandidatesToAssessment } =
    await import("../../lib/assessments");
  const { getDb } = await import("../../lib/db");
  const suffix = `reassign-atomic-${Date.now()}-${++fixtureNumber}`;
  const admin = createUser({ username: `admin.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "Test Admin", role: "administrator" });
  const first = createUser({ username: `first.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "First Candidate", role: "candidate" });
  const second = createUser({ username: `second.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "Second Candidate", role: "candidate" });
  const company = createCompany({ name: `Test Company ${suffix}`, scope: "test", createdBy: admin });
  const group = createGroup({ companyId: company, name: "Synthetic Group", scope: "test", createdBy: admin });
  addCandidateToGroup(group, first, admin);
  addCandidateToGroup(group, second, admin);
  createQuestion({
    kostQuestionId: `TEST-REASSIGN-${suffix}`, functionCode: "7.6", qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Synthetic question",
    choices: [{ key: "A", text: "A" }, { key: "B", text: "B" }],
    correctAnswer: ["A"], createdBy: admin,
  });
  const assessment = createAssessmentDraft({
    type: "examen", name: "Synthetic Reassignment", functionCode: "7.6", groupId: group,
    questionSource: "random", questionCount: 1, durationMinutes: 30,
    passThresholdPct: 80, scope: "test", createdBy: admin,
  });
  publishAssessment(assessment, admin, { candidateUserIds: [first] });
  return { admin, first, second, assessment, group, getDb, listAssignedCandidateIds, assignCandidatesToAssessment };
}

test("a failed reassignment success-audit INSERT rolls back the candidate assignment", async () => {
  const f = await fixture();
  const db = f.getDb();
  const countAudit = () => (db.prepare(
    "SELECT COUNT(*) AS n FROM audit_logs WHERE target_type = 'assessment' AND target_id = ? AND action = 'assessment_assign'"
  ).get(f.assessment) as { n: number }).n;
  const beforeAudits = countAudit();
  assert.deepEqual(f.listAssignedCandidateIds(f.assessment), [f.first]);

  // A deterministic synthetic DB-side failure after the assignment INSERT:
  // without a single write transaction the candidate remains assigned but
  // the mandatory success-audit entry is missing.
  db.exec(`
    CREATE TEMP TRIGGER fail_reassignment_audit
    BEFORE INSERT ON audit_logs
    WHEN NEW.action = 'assessment_assign'
    BEGIN
      SELECT RAISE(ABORT, 'injected reassignment audit failure');
    END;
  `);
  try {
    assert.throws(
      () => f.assignCandidatesToAssessment(f.assessment, [f.second], f.admin),
      /injected reassignment audit failure/
    );
  } finally {
    db.exec("DROP TRIGGER IF EXISTS fail_reassignment_audit");
  }

  assert.deepEqual(f.listAssignedCandidateIds(f.assessment), [f.first]);
  assert.equal(countAudit(), beforeAudits, "failed reassignment must not leave a fabricated success audit");
});

test("valid reassignment persists one candidate and its success audit", async () => {
  const f = await fixture();
  const db = f.getDb();
  assert.equal(f.assignCandidatesToAssessment(f.assessment, [f.second], f.admin), 1);
  assert.deepEqual(f.listAssignedCandidateIds(f.assessment).sort((a,b)=>a-b), [f.first, f.second].sort((a,b)=>a-b));
  const audit = db.prepare(
    "SELECT metadata_json FROM audit_logs WHERE target_id = ? AND action = 'assessment_assign' ORDER BY id DESC LIMIT 1"
  ).get(f.assessment) as { metadata_json: string };
  const metadata = JSON.parse(audit.metadata_json) as { reassignment?: boolean; candidateUserIds: number[] };
  assert.equal(metadata.reassignment, true);
  assert.deepEqual(metadata.candidateUserIds, [f.second]);
});
