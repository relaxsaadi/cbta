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
  const {
    createAssessmentDraft, publishAssessment,
    listAssignedCandidateIds, assignCandidatesToAssessment,
  } = await import("../../lib/assessments");
  const { getDb } = await import("../../lib/db");
  const suffix = `reassign-lifecycle-${Date.now()}-${++fixtureNumber}`;
  const admin = createUser({ username: `admin.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "Test Admin", role: "administrator" });
  const first = createUser({ username: `first.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "First Candidate", role: "candidate" });
  const second = createUser({ username: `second.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "Second Candidate", role: "candidate" });
  const company = createCompany({ name: `Test Company ${suffix}`, scope: "test", createdBy: admin });
  const group = createGroup({ companyId: company, name: "Synthetic Group", scope: "test", createdBy: admin });
  addCandidateToGroup(group, first, admin);
  addCandidateToGroup(group, second, admin);
  createQuestion({
    kostQuestionId: `TEST-REASSIGN-LIFECYCLE-${suffix}`, functionCode: "7.8", qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Synthetic question",
    choices: [{ key: "A", text: "A" }, { key: "B", text: "B" }],
    correctAnswer: ["A"], createdBy: admin,
  });
  const assessment = createAssessmentDraft({
    type: "examen", name: "Synthetic Reassignment Lifecycle", functionCode: "7.8", groupId: group,
    questionSource: "random", questionCount: 1, durationMinutes: 30,
    passThresholdPct: 80, scope: "test", createdBy: admin,
  });
  return { admin, first, second, assessment, getDb, publishAssessment, listAssignedCandidateIds, assignCandidatesToAssessment };
}

function countReassignmentAudits(db: ReturnType<Awaited<ReturnType<typeof fixture>>["getDb"]>, assessmentId: number): number {
  return (db.prepare(
    "SELECT COUNT(*) AS n FROM audit_logs WHERE target_type = 'assessment' AND target_id = ? AND action = 'assessment_assign'"
  ).get(assessmentId) as { n: number }).n;
}

test("forged reassignment to a draft assessment fails before assignment or success audit", async () => {
  const f = await fixture();
  const db = f.getDb();
  const auditBefore = countReassignmentAudits(db, f.assessment);
  assert.throws(
    () => f.assignCandidatesToAssessment(f.assessment, [f.second], f.admin),
    /Affectation impossible : seules les évaluations publiées ou ouvertes/
  );
  assert.deepEqual(f.listAssignedCandidateIds(f.assessment), []);
  assert.equal(countReassignmentAudits(db, f.assessment), auditBefore);
  const denial = db.prepare(
    "SELECT metadata_json FROM audit_logs WHERE target_type = 'assessment' AND target_id = ? AND action = 'assessment_assign_denied' ORDER BY id DESC LIMIT 1"
  ).get(f.assessment) as { metadata_json: string } | undefined;
  assert.ok(denial, "rejected lifecycle mutation must have a durable failure audit");
  assert.equal((JSON.parse(denial.metadata_json) as { reason: string }).reason, "invalid_assessment_status");
  assert.equal(
    (db.prepare("SELECT status FROM assessments WHERE id = ?").get(f.assessment) as { status: string }).status,
    "draft"
  );
});

for (const lifecycleStatus of ["archived", "closed", "suspended"] as const) {
  test(`${lifecycleStatus} assessment cannot gain assignments or a fabricated success audit`, async () => {
    const f = await fixture();
    f.publishAssessment(f.assessment, f.admin, { candidateUserIds: [f.first] });
    const db = f.getDb();
    db.prepare("UPDATE assessments SET status = ? WHERE id = ?").run(lifecycleStatus, f.assessment);
    const auditBefore = countReassignmentAudits(db, f.assessment);
    assert.throws(
      () => f.assignCandidatesToAssessment(f.assessment, [f.second], f.admin),
      /Affectation impossible : seules les évaluations publiées ou ouvertes/
    );
    assert.deepEqual(f.listAssignedCandidateIds(f.assessment), [f.first]);
    assert.equal(countReassignmentAudits(db, f.assessment), auditBefore);
    const denial = db.prepare(
      "SELECT metadata_json FROM audit_logs WHERE target_type = 'assessment' AND target_id = ? AND action = 'assessment_assign_denied' ORDER BY id DESC LIMIT 1"
    ).get(f.assessment) as { metadata_json: string } | undefined;
    assert.ok(denial, "rejected lifecycle mutation must have a durable failure audit");
    const metadata = JSON.parse(denial.metadata_json) as { reason: string; status: string };
    assert.equal(metadata.reason, "invalid_assessment_status");
    assert.equal(metadata.status, lifecycleStatus);
  });
}

test("open assessment accepts reassignment as a valid active lifecycle state", async () => {
  const f = await fixture();
  f.publishAssessment(f.assessment, f.admin, { candidateUserIds: [f.first] });
  const db = f.getDb();
  db.prepare("UPDATE assessments SET status = 'open' WHERE id = ?").run(f.assessment);
  const auditBefore = countReassignmentAudits(db, f.assessment);
  assert.equal(f.assignCandidatesToAssessment(f.assessment, [f.second], f.admin), 1);
  assert.deepEqual(
    f.listAssignedCandidateIds(f.assessment).sort((a, b) => a - b),
    [f.first, f.second].sort((a, b) => a - b)
  );
  assert.equal(countReassignmentAudits(db, f.assessment), auditBefore + 1);
});

test("published assessment still accepts a valid candidate and records reassignment", async () => {
  const f = await fixture();
  f.publishAssessment(f.assessment, f.admin, { candidateUserIds: [f.first] });
  const db = f.getDb();
  const auditBefore = countReassignmentAudits(db, f.assessment);
  assert.equal(f.assignCandidatesToAssessment(f.assessment, [f.second], f.admin), 1);
  assert.deepEqual(
    f.listAssignedCandidateIds(f.assessment).sort((a, b) => a - b),
    [f.first, f.second].sort((a, b) => a - b)
  );
  assert.equal(countReassignmentAudits(db, f.assessment), auditBefore + 1);
});
