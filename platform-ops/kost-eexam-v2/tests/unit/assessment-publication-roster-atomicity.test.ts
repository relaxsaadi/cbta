import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

let fixtureNumber = 0;

async function fixture() {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup, removeCandidateFromGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, listAssignedCandidateIds } = await import("../../lib/assessments");
  const { getDb } = await import("../../lib/db");
  const suffix = `publish-roster-${Date.now()}-${++fixtureNumber}`;
  const admin = createUser({ username: `admin.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "Test Admin", role: "administrator" });
  const allowed = createUser({ username: `allowed.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "Allowed Candidate", role: "candidate" });
  const removed = createUser({ username: `removed.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "Removed Candidate", role: "candidate" });
  const company = createCompany({ name: `Test Company ${suffix}`, scope: "test", createdBy: admin });
  const group = createGroup({ companyId: company, name: "Test Group", scope: "test", createdBy: admin });
  addCandidateToGroup(group, allowed, admin);
  addCandidateToGroup(group, removed, admin);
  createQuestion({
    kostQuestionId: `TEST-PUBLISH-ROSTER-${suffix}`, functionCode: "7.5", qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Synthetic question",
    choices: [{ key: "A", text: "A" }, { key: "B", text: "B" }],
    correctAnswer: ["A"], createdBy: admin,
  });
  const assessment = createAssessmentDraft({
    type: "examen", name: "Synthetic Publication", functionCode: "7.5", groupId: group,
    questionSource: "random", questionCount: 1, durationMinutes: 30,
    passThresholdPct: 80, scope: "test", createdBy: admin,
  });
  return { admin, allowed, removed, group, assessment, getDb, removeCandidateFromGroup, publishAssessment, listAssignedCandidateIds };
}

test("selected publication refuses the entire batch after membership revocation, with durable denial audit", async () => {
  const f = await fixture();
  const db = f.getDb();
  f.removeCandidateFromGroup(f.group, f.removed);

  assert.throws(
    () => f.publishAssessment(f.assessment, f.admin, { candidateUserIds: [f.allowed, f.removed] }),
    /Ce candidat n'appartient pas au groupe sélectionné/
  );
  const assessment = db.prepare("SELECT status FROM assessments WHERE id = ?").get(f.assessment) as { status: string };
  assert.equal(assessment.status, "draft", "rejected selected batch must not publish");
  assert.deepEqual(f.listAssignedCandidateIds(f.assessment), [], "valid candidate must not be partly assigned");
  const snapshots = db.prepare(
    "SELECT COUNT(*) AS n FROM assessment_question_snapshots WHERE assessment_id = ?"
  ).get(f.assessment) as { n: number };
  assert.equal(snapshots.n, 0, "rejected publication must not freeze question snapshots");
  const audit = db.prepare(
    "SELECT metadata_json FROM audit_logs WHERE target_id = ? AND action = 'assessment_assign_denied' ORDER BY id DESC LIMIT 1"
  ).get(f.assessment) as { metadata_json: string } | undefined;
  assert.ok(audit, "the denial must be audited outside rollback");
  const metadata = JSON.parse(audit.metadata_json) as { invalidCandidateUserIds: number[] };
  assert.deepEqual(metadata.invalidCandidateUserIds, [f.removed]);
});

test("valid selected publication persists only selected members with snapshots and assignment audit", async () => {
  const f = await fixture();
  f.publishAssessment(f.assessment, f.admin, { candidateUserIds: [f.allowed] });
  const db = f.getDb();
  assert.deepEqual(f.listAssignedCandidateIds(f.assessment), [f.allowed]);
  const current = db.prepare("SELECT status FROM assessments WHERE id = ?").get(f.assessment) as { status: string };
  assert.equal(current.status, "published");
  const snapshot = db.prepare(
    "SELECT COUNT(*) AS n FROM assessment_question_snapshots WHERE assessment_id = ?"
  ).get(f.assessment) as { n: number };
  assert.equal(snapshot.n, 1);
  const audit = db.prepare(
    "SELECT metadata_json FROM audit_logs WHERE target_id = ? AND action = 'assessment_assign' ORDER BY id DESC LIMIT 1"
  ).get(f.assessment) as { metadata_json: string };
  const metadata = JSON.parse(audit.metadata_json) as { mode: string; candidateUserIds: number[] };
  assert.equal(metadata.mode, "individual");
  assert.deepEqual(metadata.candidateUserIds, [f.allowed]);
});
