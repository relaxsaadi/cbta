import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());
let sequence = 0;

// Synthetic-only examination; no production keys, candidate records, or approvals.
async function fixture() {
  const tag = `manual-atomic-${++sequence}`;
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { submitManualGrade, finalizeManualGradingIfComplete } = await import("../../lib/manual-grading");
  const { getDb } = await import("../../lib/db");

  const adminId = createUser({
    username: `${tag}.admin`, password: "Strong-Test-Password-2026!",
    fullName: "Synthetic Administrator", role: "administrator",
  });
  const candidateId = createUser({
    username: `${tag}.candidate`, password: "Strong-Test-Password-2026!",
    fullName: "Synthetic Candidate", role: "candidate",
  });
  const companyId = createCompany({ name: tag, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name: tag, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);
  const questionId = createQuestion({
    kostQuestionId: `TEST-${tag}`, functionCode: "7.8",
    qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: "Synthetic manual-only prompt", choices: [],
    correctAnswer: { mode: "manual" }, createdBy: adminId,
  });
  const assessmentId = createAssessmentDraft({
    type: "examen", name: tag, functionCode: "7.8", groupId,
    questionSource: "manual", manualQuestionIds: [questionId],
    questionCount: 1, durationMinutes: 30, passThresholdPct: 80,
    scope: "test", createdBy: adminId,
  });
  publishAssessment(assessmentId, adminId);
  const attemptId = startAttempt(assessmentId, candidateId, {}).id;
  const db = getDb();
  const q = db.prepare("SELECT id FROM attempt_questions WHERE attempt_id = ?")
    .get(attemptId) as { id: number };
  saveAnswer(attemptId, candidateId, q.id, ["Synthetic response"]);
  submitAttempt(attemptId, candidateId);
  const initial = db.prepare("SELECT is_correct FROM attempt_answers WHERE attempt_question_id = ?")
    .get(q.id) as { is_correct: number | null };
  assert.equal(initial.is_correct, null);
  return { db, attemptId, questionId: q.id, adminId, submitManualGrade, finalizeManualGradingIfComplete };
}

function auditCount(f: Awaited<ReturnType<typeof fixture>>, action: string): number {
  return (f.db.prepare(
    "SELECT COUNT(*) AS n FROM audit_logs WHERE target_type = 'attempt' AND target_id = ? AND action = ?"
  ).get(f.attemptId, action) as { n: number }).n;
}

function gradeRow(f: Awaited<ReturnType<typeof fixture>>) {
  return f.db.prepare(
    "SELECT is_correct, points_awarded, graded_by FROM attempt_answers WHERE attempt_question_id = ?"
  ).get(f.questionId) as { is_correct: number | null; points_awarded: number | null; graded_by: number | null };
}

function resultRow(f: Awaited<ReturnType<typeof fixture>>) {
  return f.db.prepare(
    "SELECT grading_state, raw_score, passed FROM results WHERE attempt_id = ?"
  ).get(f.attemptId) as { grading_state: string; raw_score: number; passed: number | null };
}

test("failed standalone grading audit rolls back the verdict and permits a clean retry", async () => {
  const f = await fixture();
  const before = gradeRow(f);
  f.db.exec(`CREATE TEMP TRIGGER synthetic_manual_grade_audit_failure
    BEFORE INSERT ON audit_logs WHEN NEW.action = 'answer_graded_manual'
    BEGIN SELECT RAISE(ABORT, 'synthetic manual audit failure'); END;`);
  try {
    assert.throws(
      () => f.submitManualGrade(f.questionId, true, f.adminId, "administrator"),
      /synthetic manual audit failure/
    );
    assert.deepEqual(gradeRow(f), before);
    assert.equal(auditCount(f, "answer_graded_manual"), 0);
  } finally {
    f.db.exec("DROP TRIGGER IF EXISTS temp.synthetic_manual_grade_audit_failure");
  }
  f.submitManualGrade(f.questionId, true, f.adminId, "administrator");
  assert.deepEqual(gradeRow(f), { is_correct: 1, points_awarded: 1, graded_by: f.adminId });
  assert.equal(auditCount(f, "answer_graded_manual"), 1);
});

test("failed finalization audit rolls back result publication, then finalizes exactly once", async () => {
  const f = await fixture();
  f.submitManualGrade(f.questionId, true, f.adminId, "administrator");
  const before = resultRow(f);
  assert.equal(before.grading_state, "AWAITING_MANUAL_REVIEW");
  f.db.exec(`CREATE TEMP TRIGGER synthetic_manual_finalize_audit_failure
    BEFORE INSERT ON audit_logs WHEN NEW.action = 'grading_finalized'
    BEGIN SELECT RAISE(ABORT, 'synthetic finalization audit failure'); END;`);
  try {
    assert.throws(
      () => f.finalizeManualGradingIfComplete(f.attemptId),
      /synthetic finalization audit failure/
    );
    assert.deepEqual(resultRow(f), before);
    assert.equal(auditCount(f, "grading_finalized"), 0);
  } finally {
    f.db.exec("DROP TRIGGER IF EXISTS temp.synthetic_manual_finalize_audit_failure");
  }
  assert.deepEqual(f.finalizeManualGradingIfComplete(f.attemptId), { finalized: true });
  assert.equal(resultRow(f).grading_state, "COMPLETE");
  assert.equal(resultRow(f).raw_score, 1);
  assert.equal(auditCount(f, "grading_finalized"), 1);
  assert.deepEqual(f.finalizeManualGradingIfComplete(f.attemptId), { finalized: false });
  assert.equal(auditCount(f, "grading_finalized"), 1);
});
