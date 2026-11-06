import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());
let seq = 0;

async function fixture() {
  const prefix = `submit-grade-atomic-${++seq}`;
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { getDb } = await import("../../lib/db");

  const adminId = createUser({ username: `${prefix}.admin`, password: "Strong-Test-Password-2026!", fullName: "Synthetic Admin", role: "administrator" });
  const candidateId = createUser({ username: `${prefix}.candidate`, password: "Strong-Test-Password-2026!", fullName: "Synthetic Candidate", role: "candidate" });
  const companyId = createCompany({ name: prefix, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name: prefix, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);
  const questionId = createQuestion({
    kostQuestionId: `TEST-${prefix}`, functionCode: "7.8", qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Synthetic question",
    choices: [{ key: "A", text: "A" }, { key: "B", text: "B" }],
    correctAnswer: ["A"], createdBy: adminId,
  });
  const assessmentId = createAssessmentDraft({
    type: "examen", name: prefix, functionCode: "7.8", groupId,
    questionSource: "manual", manualQuestionIds: [questionId],
    questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId,
  });
  publishAssessment(assessmentId, adminId);
  const attemptId = startAttempt(assessmentId, candidateId, {}).id;
  const db = getDb();
  const question = db.prepare("SELECT id FROM attempt_questions WHERE attempt_id = ?").get(attemptId) as { id: number };
  saveAnswer(attemptId, candidateId, question.id, ["A"]);
  return { db, attemptId, candidateId, questionId: question.id, submitAttempt };
}

function snapshot(f: Awaited<ReturnType<typeof fixture>>) {
  const status = f.db.prepare("SELECT status, submitted_at FROM attempts WHERE id = ?").get(f.attemptId) as { status: string; submitted_at: string | null };
  const answer = f.db.prepare("SELECT is_correct, points_awarded FROM attempt_answers WHERE attempt_question_id = ?")
    .get(f.questionId) as { is_correct: number | null; points_awarded: number | null };
  const result = f.db.prepare("SELECT COUNT(*) AS n FROM results WHERE attempt_id = ?").get(f.attemptId) as { n: number };
  const logs = f.db.prepare("SELECT action FROM audit_logs WHERE target_type = 'attempt' AND target_id = ? AND action IN ('attempt_submit','attempt_graded')")
    .all(f.attemptId) as { action: string }[];
  return { status, answer, results: result.n, auditActions: logs.map(r => r.action).sort() };
}

test("invalid saved JSON rolls back submission and allows a corrected retry", async () => {
  const f = await fixture();
  f.db.prepare("UPDATE attempt_answers SET answer_json = ? WHERE attempt_question_id = ?").run("{broken", f.questionId);
  assert.throws(() => f.submitAttempt(f.attemptId, f.candidateId));
  assert.deepEqual(snapshot(f), {
    status: { status: "in_progress", submitted_at: null },
    answer: { is_correct: null, points_awarded: null },
    results: 0, auditActions: [],
  });
  f.db.prepare("UPDATE attempt_answers SET answer_json = ? WHERE attempt_question_id = ?").run('["A"]', f.questionId);
  f.submitAttempt(f.attemptId, f.candidateId);
  const after = snapshot(f);
  assert.equal(after.status.status, "submitted");
  assert.equal(after.results, 1);
  assert.equal(after.answer.is_correct, 1);
  assert.deepEqual(after.auditActions, ["attempt_graded", "attempt_submit"]);
  f.submitAttempt(f.attemptId, f.candidateId); // no regrading or duplicate audit
  assert.deepEqual(snapshot(f), after);
});

test("late result-insert failure rolls back partial grading, status and audit atomically", async () => {
  const f = await fixture();
  f.db.exec(`CREATE TEMP TRIGGER synthetic_result_write_failure
    BEFORE INSERT ON results BEGIN SELECT RAISE(ABORT, 'synthetic result failure'); END;`);
  try {
    assert.throws(() => f.submitAttempt(f.attemptId, f.candidateId), /synthetic result failure/);
    assert.deepEqual(snapshot(f), {
      status: { status: "in_progress", submitted_at: null },
      answer: { is_correct: null, points_awarded: null },
      results: 0, auditActions: [],
    });
  } finally {
    f.db.exec("DROP TRIGGER IF EXISTS temp.synthetic_result_write_failure");
  }
  f.submitAttempt(f.attemptId, f.candidateId, { auto: true });
  const after = snapshot(f);
  assert.equal(after.status.status, "auto_submitted");
  assert.equal(after.results, 1);
  assert.equal(after.answer.is_correct, 1);
  assert.deepEqual(after.auditActions, ["attempt_graded"]); // auto-submit action is distinct
});
