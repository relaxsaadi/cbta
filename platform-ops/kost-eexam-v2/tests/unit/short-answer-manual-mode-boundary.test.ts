import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());
let sequence = 0;

// Synthetic-only historical corruption fixture; no production questions or candidates.
async function fixture() {
  const name = `manual-mode-boundary-${++sequence}`;
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { listPendingManualGrading, submitManualGrade } = await import("../../lib/manual-grading");
  const { getDb } = await import("../../lib/db");

  const adminId = createUser({
    username: `${name}.admin`, password: "Strong-Test-Password-2026!",
    fullName: "Synthetic Admin", role: "administrator",
  });
  const candidateId = createUser({
    username: `${name}.candidate`, password: "Strong-Test-Password-2026!",
    fullName: "Synthetic Candidate", role: "candidate",
  });
  const companyId = createCompany({ name, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);
  const questionId = createQuestion({
    kostQuestionId: `TEST-${name}`, functionCode: "7.6", qtype: "short_answer",
    sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Synthetic exact answer",
    choices: [], correctAnswer: { mode: "exact", acceptedAnswers: ["Synthetic correct"] },
    createdBy: adminId,
  });
  const assessmentId = createAssessmentDraft({
    type: "examen", name, functionCode: "7.6", groupId,
    questionSource: "manual", manualQuestionIds: [questionId],
    questionCount: 1, durationMinutes: 30, passThresholdPct: 80,
    scope: "test", createdBy: adminId,
  });
  publishAssessment(assessmentId, adminId);
  const attemptId = startAttempt(assessmentId, candidateId, {}).id;
  const db = getDb();
  const question = db.prepare("SELECT id, snapshot_id FROM attempt_questions WHERE attempt_id = ?")
    .get(attemptId) as { id: number; snapshot_id: number };
  saveAnswer(attemptId, candidateId, question.id, ["Synthetic wrong"]);
  submitAttempt(attemptId, candidateId);
  // Deliberately recreate a partially-migrated / incomplete historical grade
  // so an exact-mode answer has a NULL grade despite a submitted attempt.
  db.prepare("UPDATE attempt_answers SET is_correct = NULL, points_awarded = NULL WHERE attempt_question_id = ?")
    .run(question.id);
  return { db, attemptId, candidateId, adminId, question,
    listPendingManualGrading, submitManualGrade };
}

function checkRejected(f: Awaited<ReturnType<typeof fixture>>) {
  const beforeRow = f.db.prepare("SELECT is_correct, points_awarded, graded_by FROM attempt_answers WHERE attempt_question_id = ?")
    .get(f.question.id);
  const queue = f.listPendingManualGrading(null, { candidateUserId: f.candidateId });
  assert.equal(queue.some((r) => r.attempt_question_id === f.question.id), false);
  assert.throws(
    () => f.submitManualGrade(f.question.id, true, f.adminId, "administrator"),
    /pas à correction manuelle/,
  );
  assert.deepEqual(
    f.db.prepare("SELECT is_correct, points_awarded, graded_by FROM attempt_answers WHERE attempt_question_id = ?")
      .get(f.question.id),
    beforeRow,
  );
  const audits = f.db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE target_type = 'attempt' AND target_id = ? AND action = 'answer_graded_manual'")
    .get(f.attemptId) as { n: number };
  assert.equal(audits.n, 0);
}

test("legacy pending exact-mode short answer cannot enter manual queue or receive human verdict", async () => {
  checkRejected(await fixture());
});

test("malformed historical short-answer key remains excluded from manual grading", async () => {
  const f = await fixture();
  f.db.prepare("UPDATE assessment_question_snapshots SET correct_answer_snapshot = ? WHERE id = ?")
    .run("{not-valid-json", f.question.snapshot_id);
  checkRejected(f);
});
