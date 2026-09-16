import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

async function fixture(suffix: string, publish = true) {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");

  const adminId = createUser({
    username: `admin.lifecycle.matrix.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Admin ${suffix}`,
    role: "administrator",
  });
  const candidateId = createUser({
    username: `candidate.lifecycle.matrix.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Candidate ${suffix}`,
    role: "candidate",
  });
  const companyId = createCompany({ name: `Company ${suffix}`, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name: `Group ${suffix}`, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);
  createQuestion({
    kostQuestionId: `TEST-LIFECYCLE-MATRIX-${suffix}`,
    functionCode: "7.6",
    qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: "Question de matrice lifecycle",
    choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }],
    correctAnswer: ["A"],
    createdBy: adminId,
  });
  const assessmentId = createAssessmentDraft({
    type: "examen",
    name: `Assessment ${suffix}`,
    functionCode: "7.6",
    groupId,
    questionSource: "random",
    questionCount: 1,
    durationMinutes: 30,
    passThresholdPct: 80,
    feedbackMode: "immediate",
    scope: "test",
    createdBy: adminId,
  });
  if (publish) publishAssessment(assessmentId, adminId);
  return { adminId, assessmentId };
}

async function statusOf(assessmentId: number): Promise<string> {
  const { getDb } = await import("../../lib/db");
  const row = getDb().prepare(`SELECT status FROM assessments WHERE id = ?`).get(assessmentId) as { status: string } | undefined;
  return row?.status ?? "missing";
}

async function auditCount(action: string, assessmentId: number): Promise<number> {
  const { getDb } = await import("../../lib/db");
  const row = getDb().prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = ? AND target_id = ?`).get(action, assessmentId) as { n: number };
  return Number(row.n);
}

test("published/open lifecycle matrix keeps ordinary suspend and close behavior", async () => {
  const { suspendAssessment, closeAssessment } = await import("../../lib/assessments");

  const suspended = await fixture("published-suspend");
  suspendAssessment(suspended.assessmentId, suspended.adminId, "matrix proof");
  assert.equal(await statusOf(suspended.assessmentId), "suspended");
  assert.equal(await auditCount("assessment_suspend", suspended.assessmentId), 1);

  const closed = await fixture("published-close");
  closeAssessment(closed.assessmentId, closed.adminId);
  assert.equal(await statusOf(closed.assessmentId), "closed");
  assert.equal(await auditCount("assessment_close", closed.assessmentId), 1);
});

test("draft cannot be reopened or suspended through lifecycle helpers", async () => {
  const { reopenAssessment, suspendAssessment } = await import("../../lib/assessments");
  const { adminId, assessmentId } = await fixture("draft-denials", false);

  assert.throws(() => reopenAssessment(assessmentId, adminId), /Transition d'évaluation impossible/);
  assert.equal(await statusOf(assessmentId), "draft");
  assert.throws(() => suspendAssessment(assessmentId, adminId), /Transition d'évaluation impossible/);
  assert.equal(await statusOf(assessmentId), "draft");
  assert.equal(await auditCount("assessment_reopen", assessmentId), 0);
  assert.equal(await auditCount("assessment_suspend", assessmentId), 0);
  assert.equal(await auditCount("assessment_transition_denied", assessmentId), 2);
});

test("archived assessment cannot be reopened", async () => {
  const { getDb } = await import("../../lib/db");
  const { reopenAssessment } = await import("../../lib/assessments");
  const { adminId, assessmentId } = await fixture("archived-reopen");
  getDb().prepare(`UPDATE assessments SET status = 'archived' WHERE id = ?`).run(assessmentId);

  assert.throws(() => reopenAssessment(assessmentId, adminId), /Transition d'évaluation impossible/);
  assert.equal(await statusOf(assessmentId), "archived");
  assert.equal(await auditCount("assessment_reopen", assessmentId), 0);
  assert.equal(await auditCount("assessment_transition_denied", assessmentId), 1);
});

test("closed assessment cannot be suspended or reopened", async () => {
  const { closeAssessment, reopenAssessment, suspendAssessment } = await import("../../lib/assessments");
  const { adminId, assessmentId } = await fixture("closed-denials");
  closeAssessment(assessmentId, adminId);

  assert.throws(() => suspendAssessment(assessmentId, adminId), /Transition d'évaluation impossible/);
  assert.throws(() => reopenAssessment(assessmentId, adminId), /Transition d'évaluation impossible/);
  assert.equal(await statusOf(assessmentId), "closed");
  assert.equal(await auditCount("assessment_suspend", assessmentId), 0);
  assert.equal(await auditCount("assessment_reopen", assessmentId), 0);
  assert.equal(await auditCount("assessment_transition_denied", assessmentId), 2);
});

test("suspended assessment reopens only through the reviewed transition", async () => {
  const { suspendAssessment, reopenAssessment } = await import("../../lib/assessments");
  const { adminId, assessmentId } = await fixture("valid-reopen");

  suspendAssessment(assessmentId, adminId, "matrix proof");
  reopenAssessment(assessmentId, adminId);
  assert.equal(await statusOf(assessmentId), "published");
  assert.equal(await auditCount("assessment_suspend", assessmentId), 1);
  assert.equal(await auditCount("assessment_reopen", assessmentId), 1);
});

test("missing assessment never emits a lifecycle success audit", async () => {
  const { getDb } = await import("../../lib/db");
  const { suspendAssessment } = await import("../../lib/assessments");
  const adminId = (getDb().prepare(`SELECT id FROM users ORDER BY id LIMIT 1`).get() as { id: number }).id;
  const missingId = 2_147_000_000;

  assert.throws(() => suspendAssessment(missingId, adminId), /Évaluation introuvable/);
  assert.equal(await auditCount("assessment_suspend", missingId), 0);
});
