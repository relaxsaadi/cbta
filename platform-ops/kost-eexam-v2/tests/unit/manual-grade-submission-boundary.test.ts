import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());
let counter = 0;

// Synthetic-only question and candidate data. No live bank, secrets, or approval records.
async function fixture(kind: "short_answer" | "scenario") {
  const name = `manual-submission-boundary-${kind}-${++counter}`;
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, saveScenarioSubanswer, submitAttempt } = await import("../../lib/attempts");
  const { submitManualGrade, submitScenarioSubgrade, finalizeManualGradingIfComplete } = await import("../../lib/manual-grading");
  const { getDb } = await import("../../lib/db");

  const adminId = createUser({
    username: `${name}.admin`, password: "Strong-Test-Password-2026!",
    fullName: "Synthetic Administrator", role: "administrator",
  });
  const candidateId = createUser({
    username: `${name}.candidate`, password: "Strong-Test-Password-2026!",
    fullName: "Synthetic Candidate", role: "candidate",
  });
  const companyId = createCompany({ name, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);
  const isScenario = kind === "scenario";
  const questionId = createQuestion({
    kostQuestionId: `TEST-${name}`, functionCode: "7.8", qtype: kind,
    sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Synthetic prompt", choices: [],
    correctAnswer: isScenario
      ? { mode: "scenario", context: "Synthetic context", subquestions: [
          { id: "sq1", qtype: "short_answer", stem: "Synthetic subquestion", points: 2,
            choices: [], correctAnswer: { mode: "manual" } },
        ] }
      : { mode: "manual" },
    createdBy: adminId,
  });
  const assessmentId = createAssessmentDraft({
    type: "examen", name, functionCode: "7.8", groupId,
    questionSource: "manual", manualQuestionIds: [questionId],
    questionCount: 1, durationMinutes: 30, passThresholdPct: 80,
    scope: "test", createdBy: adminId,
  });
  publishAssessment(assessmentId, adminId);
  const attemptId = startAttempt(assessmentId, candidateId, {}).id;
  const db = getDb();
  const q = db.prepare("SELECT id FROM attempt_questions WHERE attempt_id = ?").get(attemptId) as { id: number };
  if (isScenario) saveScenarioSubanswer(attemptId, candidateId, q.id, "sq1", ["Synthetic response"]);
  else saveAnswer(attemptId, candidateId, q.id, ["Synthetic response"]);

  return {
    db, attemptId, attemptQuestionId: q.id, adminId, candidateId,
    submitAttempt, submitManualGrade, submitScenarioSubgrade, finalizeManualGradingIfComplete,
  };
}

function answerState(f: Awaited<ReturnType<typeof fixture>>) {
  return f.db.prepare("SELECT is_correct, points_awarded, graded_by, scenario_grading_json FROM attempt_answers WHERE attempt_question_id = ?")
    .get(f.attemptQuestionId);
}

function manualAudits(f: Awaited<ReturnType<typeof fixture>>): number {
  return (f.db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE target_type = 'attempt' AND target_id = ? AND action = 'answer_graded_manual'")
    .get(f.attemptId) as { n: number }).n;
}

test("standalone human grade rejects an in-progress saved answer before it is submitted", async () => {
  const f = await fixture("short_answer");
  const initial = answerState(f);
  assert.throws(
    () => f.submitManualGrade(f.attemptQuestionId, true, f.adminId, "administrator"),
    /soumise avant correction/,
  );
  assert.deepEqual(answerState(f), initial);
  assert.equal(manualAudits(f), 0);

  f.submitAttempt(f.attemptId, f.candidateId);
  f.submitManualGrade(f.attemptQuestionId, true, f.adminId, "administrator");
  assert.equal(manualAudits(f), 1);
  assert.deepEqual(f.finalizeManualGradingIfComplete(f.attemptId), { finalized: true });
});

test("scenario human subgrade also rejects in-progress answers and permits auto-submitted attempts", async () => {
  const f = await fixture("scenario");
  const initial = answerState(f);
  assert.throws(
    () => f.submitScenarioSubgrade(f.attemptQuestionId, "sq1", true, f.adminId, "administrator"),
    /soumise avant correction/,
  );
  assert.deepEqual(answerState(f), initial);
  assert.equal(manualAudits(f), 0);

  f.submitAttempt(f.attemptId, f.candidateId, { auto: true });
  const row = f.db.prepare("SELECT status FROM attempts WHERE id = ?").get(f.attemptId) as { status: string };
  assert.equal(row.status, "auto_submitted");
  assert.equal(f.submitScenarioSubgrade(f.attemptQuestionId, "sq1", true, f.adminId, "administrator").finalized, true);
  assert.equal(manualAudits(f), 1);
  assert.deepEqual(f.finalizeManualGradingIfComplete(f.attemptId), { finalized: true });
});
