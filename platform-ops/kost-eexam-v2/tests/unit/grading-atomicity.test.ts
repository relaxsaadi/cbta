import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

test("grading rollback: malformed later answer cannot leave earlier question partly graded", async () => {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { getDb } = await import("../../lib/db");

  const adminId = createUser({
    username: "atomic.admin", password: "x".repeat(12),
    fullName: "Atomic Admin", role: "administrator",
  });
  const candidateId = createUser({
    username: "atomic.candidate", password: "x".repeat(12),
    fullName: "Atomic Candidate", role: "candidate",
  });
  const companyId = createCompany({ name: "Atomicity Test Company", scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name: "Atomicity Test Group", scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);

  const ids = [1, 2].map((i) =>
    createQuestion({
      kostQuestionId: `TEST-GRADING-ATOMIC-${i}`,
      functionCode: "7.2",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: `Atomic grading question ${i}`,
      choices: [{ key: "A", text: "Correct" }, { key: "B", text: "Incorrect" }],
      correctAnswer: ["A"],
      createdBy: adminId,
    })
  );
  const assessmentId = createAssessmentDraft({
    type: "examen",
    name: "Atomic grading test",
    functionCode: "7.2",
    groupId,
    questionSource: "manual",
    manualQuestionIds: ids,
    questionCount: 2,
    durationMinutes: 30,
    passThresholdPct: 80,
    scope: "test",
    createdBy: adminId,
    openAt: new Date(Date.now() - 60_000).toISOString(),
    closeAt: new Date(Date.now() + 3_600_000).toISOString(),
  });
  publishAssessment(assessmentId, adminId);

  const attempt = startAttempt(assessmentId, candidateId, {});
  const db = getDb();
  const questions = db.prepare(
    `SELECT id FROM attempt_questions WHERE attempt_id = ? ORDER BY position`
  ).all(attempt.id) as { id: number }[];
  assert.equal(questions.length, 2);
  saveAnswer(attempt.id, candidateId, questions[0]!.id, ["A"]);
  saveAnswer(attempt.id, candidateId, questions[1]!.id, ["A"]);

  // Simulate an unreadable legacy/corrupted stored answer on the second
  // question. Never alter a real exam or regulatory question-bank record.
  db.prepare(`UPDATE attempt_answers SET answer_json = ? WHERE attempt_question_id = ?`)
    .run("{broken", questions[1]!.id);

  // Before atomicity protection the first row received a grade, then the
  // second threw, leaving a submitted attempt without results.
  assert.throws(() => submitAttempt(attempt.id, candidateId), SyntaxError);

  for (const { id } of questions) {
    const row = db.prepare(
      `SELECT is_correct, points_awarded FROM attempt_answers WHERE attempt_question_id = ?`
    ).get(id) as { is_correct: number | null; points_awarded: number | null };
    assert.equal(row.is_correct, null, "no earlier answer may remain graded after an exception");
    assert.equal(row.points_awarded, null, "no partial grade may be committed");
  }

  assert.equal(db.prepare(`SELECT 1 FROM results WHERE attempt_id = ?`).get(attempt.id), undefined);
  const gradedEvents = db.prepare(
    `SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'attempt_graded' AND target_id = ?`
  ).get(attempt.id) as { n: number };
  assert.equal(gradedEvents.n, 0, "no false success audit should survive failed grading");

  const status = db.prepare(`SELECT status FROM attempts WHERE id = ?`).get(attempt.id) as { status: string };
  assert.equal(status.status, "in_progress", "failed grading must also roll back submission status");
  assert.equal(db.prepare(`SELECT 1 FROM audit_logs WHERE action = 'attempt_submit' AND target_id = ?`).get(attempt.id), undefined);

  // Repair only the synthetic test payload, then retry the same attempt.
  db.prepare(`UPDATE attempt_answers SET answer_json = ? WHERE attempt_question_id = ?`)
    .run('["A"]', questions[1]!.id);
  submitAttempt(attempt.id, candidateId);
  submitAttempt(attempt.id, candidateId); // delayed network retry must be a no-op

  assert.equal((db.prepare(`SELECT status FROM attempts WHERE id = ?`).get(attempt.id) as { status: string }).status, "submitted");
  assert.equal((db.prepare(`SELECT grading_state FROM results WHERE attempt_id = ?`).get(attempt.id) as { grading_state: string }).grading_state, "COMPLETE");
  for (const action of ["attempt_submit", "attempt_graded"]) {
    const entry = db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = ? AND target_id = ?`)
      .get(action, attempt.id) as { n: number };
    assert.equal(entry.n, 1, `exactly one ${action} audit after repair and retry`);
  }
});
