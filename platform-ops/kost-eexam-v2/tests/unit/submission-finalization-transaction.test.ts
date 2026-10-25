import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Synthetic 7.2 fixtures only: no production exam questions, approvals or
// regulatory-source assertions are introduced by this technical regression.
let groupId: number;
let adminId: number;
let questionIds: number[];
let sequence = 0;

before(async () => {
  setupTestDb();
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  adminId = createUser({
    username: "submission-transaction.admin", password: "x".repeat(12),
    fullName: "Submission Transaction Admin", role: "administrator",
  });
  const companyId = createCompany({ name: "Submission Transaction Test Company", scope: "test", createdBy: adminId });
  groupId = createGroup({ companyId, name: "Submission Transaction Test Group", scope: "test", createdBy: adminId });
  questionIds = [1, 2].map((i) => createQuestion({
    kostQuestionId: `TEST-SUBMISSION-TXN-${i}`,
    functionCode: "7.2", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: `Submission transaction test question ${i}`,
    choices: [{ key: "A", text: "Correct" }, { key: "B", text: "Incorrect" }],
    correctAnswer: ["A"], createdBy: adminId,
  }));
});

async function makeAttempt() {
  const { createUser } = await import("../../lib/users");
  const { addCandidateToGroup } = await import("../../lib/groups");
  const { startAttempt, saveAnswer } = await import("../../lib/attempts");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { getDb } = await import("../../lib/db");
  const candidateUserId = createUser({
    username: `submission-transaction.candidate${++sequence}`,
    password: "x".repeat(12),
    fullName: "Submission Transaction Candidate", role: "candidate",
  });
  addCandidateToGroup(groupId, candidateUserId, adminId);
  // Publication allocates assessment assignments to the CURRENT group
  // membership; create a fresh synthetic assessment after adding this
  // candidate, never rely on a future group join for a prior publication.
  const assessmentId = createAssessmentDraft({
    type: "examen", name: `Submission transaction rollback test ${sequence}`,
    functionCode: "7.2", groupId, questionSource: "manual",
    manualQuestionIds: questionIds, questionCount: 2,
    durationMinutes: 30, passThresholdPct: 80, scope: "test",
    createdBy: adminId,
    openAt: new Date(Date.now() - 60_000).toISOString(),
    closeAt: new Date(Date.now() + 3_600_000).toISOString(),
  });
  publishAssessment(assessmentId, adminId);
  const attempt = startAttempt(assessmentId, candidateUserId, {});
  const db = getDb();
  const rows = db.prepare(
    `SELECT id FROM attempt_questions WHERE attempt_id = ? ORDER BY position`
  ).all(attempt.id) as { id: number }[];
  assert.equal(rows.length, 2);
  for (const row of rows) saveAnswer(attempt.id, candidateUserId, row.id, ["A"]);
  return { db, attemptId: attempt.id, candidateUserId, questionIds: rows.map((r) => r.id) };
}

function assertNoFinalization(attemptId: number, questionIds: number[], db: import("node:sqlite").DatabaseSync) {
  const row = db.prepare(
    `SELECT status, submitted_at FROM attempts WHERE id = ?`
  ).get(attemptId) as { status: string; submitted_at: string | null };
  assert.equal(row.status, "in_progress", "terminal status must roll back");
  assert.equal(row.submitted_at, null, "submission timestamp must roll back");
  assert.equal(db.prepare(`SELECT 1 FROM results WHERE attempt_id = ?`).get(attemptId), undefined);
  for (const id of questionIds) {
    const answer = db.prepare(
      `SELECT is_correct, points_awarded FROM attempt_answers WHERE attempt_question_id = ?`
    ).get(id) as { is_correct: number | null; points_awarded: number | null };
    assert.equal(answer.is_correct, null, "no partial grade");
    assert.equal(answer.points_awarded, null, "no partial points");
  }
  const audits = db.prepare(
    `SELECT COUNT(*) AS n FROM audit_logs
     WHERE target_type = 'attempt' AND target_id = ?
       AND action IN ('attempt_submit', 'attempt_auto_submit', 'attempt_graded')`
  ).get(attemptId) as { n: number };
  assert.equal(audits.n, 0, "no success audit may survive a failed submission");
}

const faults = ["first_grade", "second_grade", "result_insert", "graded_audit"] as const;
for (const fault of faults) {
  test(`#37: ${fault} failure rolls back submission, grading, result and audits; retry succeeds once`, async () => {
    const { submitAttempt } = await import("../../lib/attempts");
    const { db, attemptId, candidateUserId, questionIds } = await makeAttempt();
    const when = fault === "first_grade"
      ? `BEFORE UPDATE OF is_correct ON attempt_answers WHEN NEW.attempt_question_id = ${questionIds[0]}`
      : fault === "second_grade"
      ? `BEFORE UPDATE OF is_correct ON attempt_answers WHEN NEW.attempt_question_id = ${questionIds[1]}`
      : fault === "result_insert"
      ? "BEFORE INSERT ON results"
      : "BEFORE INSERT ON audit_logs WHEN NEW.action = 'attempt_graded'";
    db.exec(`CREATE TEMP TRIGGER synthetic_submission_fault ${when}
      BEGIN SELECT RAISE(ABORT, 'synthetic_${fault}'); END`);
    try {
      assert.throws(() => submitAttempt(attemptId, candidateUserId), new RegExp(`synthetic_${fault}`));
    } finally {
      db.exec("DROP TRIGGER IF EXISTS temp.synthetic_submission_fault");
    }
    assertNoFinalization(attemptId, questionIds, db);

    submitAttempt(attemptId, candidateUserId);
    submitAttempt(attemptId, candidateUserId); // delayed network retry
    const status = db.prepare(
      `SELECT status FROM attempts WHERE id = ?`
    ).get(attemptId) as { status: string };
    assert.equal(status.status, "submitted");
    const result = db.prepare(
      `SELECT grading_state, passed FROM results WHERE attempt_id = ?`
    ).get(attemptId) as { grading_state: string; passed: number | null };
    assert.equal(result.grading_state, "COMPLETE");
    assert.equal(result.passed, 1);
    for (const action of ["attempt_submit", "attempt_graded"]) {
      const audit = db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = ?`)
        .get(attemptId, action) as { n: number };
      assert.equal(audit.n, 1, `exactly one ${action}`);
    }
  });
}

test("#37: failed sweep auto-submit remains retriable on next sweep after fault removal", async () => {
  const { sweepExpiredAttempts } = await import("../../lib/attempts");
  const { db, attemptId, questionIds } = await makeAttempt();
  db.prepare(`UPDATE attempts SET expires_at = ? WHERE id = ?`)
    .run(new Date(Date.now() - 120_000).toISOString(), attemptId);
  db.exec(`CREATE TEMP TRIGGER synthetic_submission_fault BEFORE INSERT ON results
    BEGIN SELECT RAISE(ABORT, 'synthetic_auto_submit_result'); END`);
  try {
    assert.throws(() => sweepExpiredAttempts(), /synthetic_auto_submit_result/);
  } finally {
    db.exec("DROP TRIGGER IF EXISTS temp.synthetic_submission_fault");
  }
  assertNoFinalization(attemptId, questionIds, db);
  assert.equal(sweepExpiredAttempts().some((r) => r.attemptId === attemptId), true);
  assert.equal((db.prepare(`SELECT status FROM attempts WHERE id = ?`).get(attemptId) as { status: string }).status, "auto_submitted");
  assert.ok(db.prepare(`SELECT 1 FROM results WHERE attempt_id = ?`).get(attemptId));
  assert.equal((db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = 'attempt_auto_submit'`)
    .get(attemptId) as { n: number }).n, 1);
});

test("#37: preexisting submitted-without-result record fails loudly instead of silent no-op", async () => {
  const { submitAttempt, AttemptError } = await import("../../lib/attempts");
  const { db, attemptId, candidateUserId } = await makeAttempt();
  db.prepare(`UPDATE attempts SET status = 'submitted', submitted_at = ? WHERE id = ?`)
    .run(new Date().toISOString(), attemptId);
  assert.throws(() => submitAttempt(attemptId, candidateUserId), AttemptError);
  assert.equal(db.prepare(`SELECT 1 FROM results WHERE attempt_id = ?`).get(attemptId), undefined);
});
