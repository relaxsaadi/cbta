import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());
let seq = 0;

// Synthetic scenario only. No production question, answer or candidate data.
async function fixture() {
  const prefix = `scenario-verdict-atomic-${++seq}`;
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, submitAttempt } = await import("../../lib/attempts");
  const { submitScenarioSubgrade, finalizeManualGradingIfComplete } = await import("../../lib/manual-grading");
  const { getDb } = await import("../../lib/db");

  const adminId = createUser({ username: `${prefix}.admin`, password: "Strong-Test-Password-2026!", fullName: "Synthetic Admin", role: "administrator" });
  const candidateId = createUser({ username: `${prefix}.candidate`, password: "Strong-Test-Password-2026!", fullName: "Synthetic Candidate", role: "candidate" });
  const companyId = createCompany({ name: prefix, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name: prefix, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);
  const questionId = createQuestion({
    kostQuestionId: `TEST-${prefix}`, functionCode: "7.8", qtype: "scenario",
    sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Synthetic manual scenario",
    choices: [],
    correctAnswer: {
      mode: "scenario", context: "Synthetic context",
      subquestions: [
        { id: "sq1", qtype: "short_answer", stem: "Synthetic prompt 1", points: 2, choices: [], correctAnswer: { mode: "manual" } },
        { id: "sq2", qtype: "short_answer", stem: "Synthetic prompt 2", points: 3, choices: [], correctAnswer: { mode: "manual" } },
      ],
    },
    createdBy: adminId,
  });
  const assessmentId = createAssessmentDraft({
    type: "examen", name: prefix, functionCode: "7.8", groupId,
    questionSource: "manual", manualQuestionIds: [questionId],
    questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId,
  });
  publishAssessment(assessmentId, adminId);
  const attemptId = startAttempt(assessmentId, candidateId, {}).id;
  submitAttempt(attemptId, candidateId);
  const db = getDb();
  const question = db.prepare("SELECT id FROM attempt_questions WHERE attempt_id = ?").get(attemptId) as { id: number };
  const pending = db.prepare("SELECT is_correct FROM attempt_answers WHERE attempt_question_id = ?").get(question.id) as { is_correct: number | null };
  assert.equal(pending.is_correct, null);
  return { db, attemptId, attemptQuestionId: question.id, adminId, submitScenarioSubgrade, finalizeManualGradingIfComplete };
}

function verdict(f: Awaited<ReturnType<typeof fixture>>) {
  return f.db.prepare("SELECT is_correct, points_awarded, scenario_grading_json FROM attempt_answers WHERE attempt_question_id = ?")
    .get(f.attemptQuestionId) as { is_correct: number | null; points_awarded: number | null; scenario_grading_json: string | null };
}

function manualAuditCount(f: Awaited<ReturnType<typeof fixture>>) {
  return (f.db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE target_type = 'attempt' AND target_id = ? AND action = 'answer_graded_manual'")
    .get(f.attemptId) as { n: number }).n;
}

test("scenario verdict write failure rolls back its earlier audit, then permits retry", async () => {
  const f = await fixture();
  f.db.exec(`CREATE TEMP TRIGGER synthetic_scenario_verdict_failure
    BEFORE UPDATE OF scenario_grading_json ON attempt_answers
    BEGIN SELECT RAISE(ABORT, 'synthetic scenario verdict failure'); END;`);
  try {
    assert.throws(
      () => f.submitScenarioSubgrade(f.attemptQuestionId, "sq1", true, f.adminId, "administrator"),
      /synthetic scenario verdict failure/
    );
    assert.deepEqual(verdict(f), { is_correct: null, points_awarded: null, scenario_grading_json: null });
    assert.equal(manualAuditCount(f), 0);
  } finally {
    f.db.exec("DROP TRIGGER IF EXISTS temp.synthetic_scenario_verdict_failure");
  }
  const accepted = f.submitScenarioSubgrade(f.attemptQuestionId, "sq1", true, f.adminId, "administrator");
  assert.deepEqual(accepted, { attemptId: f.attemptId, finalized: false });
  assert.equal(manualAuditCount(f), 1);
  assert.equal(JSON.parse(verdict(f).scenario_grading_json ?? "{}").sq1.pointsAwarded, 2);
});

test("separate subquestion verdicts retain both decisions and finalize exactly once", async () => {
  const f = await fixture();
  assert.equal(f.submitScenarioSubgrade(f.attemptQuestionId, "sq1", true, f.adminId, "administrator").finalized, false);
  assert.equal(f.submitScenarioSubgrade(f.attemptQuestionId, "sq2", false, f.adminId, "administrator").finalized, true);
  const row = verdict(f);
  const progress = JSON.parse(row.scenario_grading_json ?? "{}");
  assert.deepEqual(Object.keys(progress).sort(), ["sq1", "sq2"]);
  assert.equal(row.is_correct, 0);
  assert.equal(row.points_awarded, 2);
  assert.equal(manualAuditCount(f), 2);
  assert.throws(() => f.submitScenarioSubgrade(f.attemptQuestionId, "sq1", true, f.adminId, "administrator"));
  assert.equal(manualAuditCount(f), 2);
  assert.deepEqual(f.finalizeManualGradingIfComplete(f.attemptId), { finalized: true });
  assert.deepEqual(f.finalizeManualGradingIfComplete(f.attemptId), { finalized: false });
  const result = f.db.prepare("SELECT raw_score, max_raw_score, grading_state FROM results WHERE attempt_id = ?")
    .get(f.attemptId) as { raw_score: number; max_raw_score: number; grading_state: string };
  assert.equal(result.raw_score, 2);
  assert.equal(result.max_raw_score, 5);
  assert.equal(result.grading_state, "COMPLETE");
});


test("scenario manual grader rejects malformed historical metadata before any verdict or audit", async () => {
  // Corrupt only a synthetic frozen snapshot after a valid submission.
  // These are not real DGR examination questions or candidate records.
  for (const failure of ["duplicate_id", "negative_points", "unknown_subtype", "invalid_json"] as const) {
    const f = await fixture();
    const snapshot = f.db.prepare(
      `SELECT s.id, s.correct_answer_snapshot FROM assessment_question_snapshots s
       JOIN attempt_questions aq ON aq.snapshot_id = s.id WHERE aq.id = ?`
    ).get(f.attemptQuestionId) as { id: number; correct_answer_snapshot: string };
    let malformed = "{not-json";
    if (failure !== "invalid_json") {
      const spec = JSON.parse(snapshot.correct_answer_snapshot) as {
        mode: string;
        subquestions: Array<{ id: string; qtype: string; points: number }>;
      };
      if (failure === "duplicate_id") spec.subquestions[1]!.id = spec.subquestions[0]!.id;
      if (failure === "negative_points") spec.subquestions[0]!.points = -5;
      if (failure === "unknown_subtype") spec.subquestions[1]!.qtype = "unknown_legacy";
      malformed = JSON.stringify(spec);
    }
    f.db.prepare("UPDATE assessment_question_snapshots SET correct_answer_snapshot = ? WHERE id = ?")
      .run(malformed, snapshot.id);

    const previous = verdict(f);
    const auditsBefore = manualAuditCount(f);
    assert.throws(
      () => f.submitScenarioSubgrade(f.attemptQuestionId, "sq1", true, f.adminId, "administrator"),
      /Métadonnées du scénario invalides/,
      failure,
    );
    assert.deepEqual(verdict(f), previous, failure);
    assert.equal(manualAuditCount(f), auditsBefore, failure);
  }
});


test("pending scenario queue skips corrupt historical rows without hiding healthy pending work", async () => {
  const { listPendingScenarioSubquestions } = await import("../../lib/manual-grading");
  const healthy = await fixture();
  const damaged: Array<Awaited<ReturnType<typeof fixture>>> = [];

  // All corruption is deliberately synthetic and occurs AFTER submission.
  // A single bad snapshot/answer/progress must not take down the shared queue.
  for (const kind of ["invalid_snapshot", "duplicate_subquestion", "invalid_answer", "invalid_progress"] as const) {
    const f = await fixture();
    const snapshot = f.db.prepare(
      `SELECT s.id, s.correct_answer_snapshot FROM assessment_question_snapshots s
       JOIN attempt_questions aq ON aq.snapshot_id = s.id WHERE aq.id = ?`
    ).get(f.attemptQuestionId) as { id: number; correct_answer_snapshot: string };
    if (kind === "invalid_snapshot") {
      f.db.prepare("UPDATE assessment_question_snapshots SET correct_answer_snapshot = ? WHERE id = ?")
        .run("{corrupt-json", snapshot.id);
    } else if (kind === "duplicate_subquestion") {
      const spec = JSON.parse(snapshot.correct_answer_snapshot);
      spec.subquestions[1].id = spec.subquestions[0].id;
      f.db.prepare("UPDATE assessment_question_snapshots SET correct_answer_snapshot = ? WHERE id = ?")
        .run(JSON.stringify(spec), snapshot.id);
    } else if (kind === "invalid_answer") {
      f.db.prepare("UPDATE attempt_answers SET answer_json = ? WHERE attempt_question_id = ?")
        .run("{corrupt-answer", f.attemptQuestionId);
    } else {
      f.db.prepare("UPDATE attempt_answers SET scenario_grading_json = ? WHERE attempt_question_id = ?")
        .run("{corrupt-progress", f.attemptQuestionId);
    }
    damaged.push(f);
  }

  const pending = listPendingScenarioSubquestions(null);
  assert.equal(pending.filter((row) => row.attempt_question_id === healthy.attemptQuestionId).length, 2);
  for (const f of damaged) {
    assert.equal(pending.some((row) => row.attempt_question_id === f.attemptQuestionId), false);
    assert.equal(manualAuditCount(f), 0);
  }
});
