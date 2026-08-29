import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §55-57 — file de
// correction manuelle : rejets explicites, protection contre un second
// correcteur qui écraserait le premier, clôture qui ne se déclenche QU'une
// fois (jamais une seconde notification RESULT_AVAILABLE), traçabilité
// (answer_graded_manual / grading_finalized).
describe("Correction manuelle — lib/manual-grading.ts", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { submitManualGrade, finalizeManualGradingIfComplete, listPendingManualGrading, ManualGradingError } = await import("../../lib/manual-grading");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `mg${counter}`;
  }

  function makeFixture(opts: { withMcq: boolean }) {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);

    const manualId = createQuestion({
      kostQuestionId: `TEST-${t}-man`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Expliquez.", choices: [], correctAnswer: { mode: "manual" }, createdBy: adminId,
    });
    const manualQuestionIds = [manualId];
    if (opts.withMcq) {
      const mcqId = createQuestion({
        kostQuestionId: `TEST-${t}-mcq`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
        stem: "Q1", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
      });
      manualQuestionIds.unshift(mcqId);
    }

    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds, questionCount: manualQuestionIds.length, durationMinutes: 30, passThresholdPct: 50,
      scope: "test", createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), closeAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aqs = getDb().prepare(`SELECT id, snapshot_id FROM attempt_questions WHERE attempt_id = ? ORDER BY position`).all(attempt.id) as { id: number; snapshot_id: number }[];
    const byQuestion = new Map<number, number>();
    for (const aq of aqs) {
      const snap = getDb().prepare(`SELECT question_id FROM assessment_question_snapshots WHERE id = ?`).get(aq.snapshot_id) as { question_id: number };
      byQuestion.set(snap.question_id, aq.id);
    }
    const manualAqId = byQuestion.get(manualId)!;
    saveAnswer(attempt.id, candidateId, manualAqId, ["ma réponse libre"]);
    if (opts.withMcq) {
      const mcqAqId = [...byQuestion.entries()].find(([qid]) => qid !== manualId)![1];
      saveAnswer(attempt.id, candidateId, mcqAqId, ["A"]); // volontairement correct
    }
    submitAttempt(attempt.id, candidateId);
    return { adminId, candidateId, attemptId: attempt.id, manualAqId };
  }

  test("rejette une question qui n'est pas en correction manuelle (qtype != short_answer)", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [qid], questionCount: 1, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), closeAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["A"]);
    submitAttempt(attempt.id, candidateId);

    assert.throws(
      () => submitManualGrade(aq.id, true, adminId, "administrator"),
      (err: unknown) => err instanceof ManualGradingError && /pas à correction manuelle/.test(err.message)
    );
  });

  test("rejette une réponse introuvable avec un message explicite", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    assert.throws(
      () => submitManualGrade(999999, true, adminId, "administrator"),
      (err: unknown) => err instanceof ManualGradingError && /introuvable/.test(err.message)
    );
  });

  test("un second correcteur ne peut jamais écraser silencieusement la décision du premier", () => {
    const { adminId, manualAqId } = makeFixture({ withMcq: false });
    submitManualGrade(manualAqId, true, adminId, "administrator");
    assert.throws(
      () => submitManualGrade(manualAqId, false, adminId, "administrator"),
      (err: unknown) => err instanceof ManualGradingError && /déjà été corrigée/.test(err.message)
    );
    // La première décision doit rester intacte.
    const row = getDb().prepare(`SELECT is_correct FROM attempt_answers WHERE attempt_question_id = ?`).get(manualAqId) as { is_correct: number };
    assert.equal(row.is_correct, 1);
  });

  test("finalizeManualGradingIfComplete renvoie finalized=false tant qu'une AUTRE question manuelle de la même tentative reste en attente", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    const q1 = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q1", choices: [], correctAnswer: { mode: "manual" }, createdBy: adminId,
    });
    const q2 = createQuestion({
      kostQuestionId: `TEST-${t}-2`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q2", choices: [], correctAnswer: { mode: "manual" }, createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [q1, q2], questionCount: 2, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), closeAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aqs = getDb().prepare(`SELECT id, snapshot_id FROM attempt_questions WHERE attempt_id = ? ORDER BY position`).all(attempt.id) as { id: number; snapshot_id: number }[];
    for (const aq of aqs) saveAnswer(attempt.id, candidateId, aq.id, ["réponse"]);
    submitAttempt(attempt.id, candidateId);

    const firstAq = aqs[0]!;
    const { finalized } = (() => {
      submitManualGrade(firstAq.id, true, adminId, "administrator");
      return finalizeManualGradingIfComplete(attempt.id);
    })();
    assert.equal(finalized, false, "il reste une question non corrigée — pas de clôture prématurée");

    const result = getDb().prepare(`SELECT grading_state, passed FROM results WHERE attempt_id = ?`).get(attempt.id) as { grading_state: string; passed: number | null };
    assert.equal(result.grading_state, "AWAITING_MANUAL_REVIEW");
    assert.equal(result.passed, null);
  });

  test("finalizeManualGradingIfComplete clôture une seule fois — score final correct, jamais un second déclenchement", () => {
    const { adminId, attemptId, manualAqId } = makeFixture({ withMcq: true });
    // Avant correction : AWAITING_MANUAL_REVIEW, raw_score ne reflète que la
    // partie auto-notée (le mcq, correct = 1 point sur 2 possibles).
    const before = getDb().prepare(`SELECT grading_state, raw_score, max_raw_score FROM results WHERE attempt_id = ?`).get(attemptId) as { grading_state: string; raw_score: number; max_raw_score: number };
    assert.equal(before.grading_state, "AWAITING_MANUAL_REVIEW");
    assert.equal(before.raw_score, 1);
    assert.equal(before.max_raw_score, 2);

    submitManualGrade(manualAqId, true, adminId, "administrator", "Réponse acceptable.");
    const first = finalizeManualGradingIfComplete(attemptId);
    assert.equal(first.finalized, true);

    const after = getDb().prepare(`SELECT grading_state, raw_score, max_raw_score, score_100, percentage, passed FROM results WHERE attempt_id = ?`).get(attemptId) as {
      grading_state: string; raw_score: number; max_raw_score: number; score_100: number; percentage: number; passed: number;
    };
    assert.equal(after.grading_state, "COMPLETE");
    assert.equal(after.raw_score, 2, "mcq (1pt) + manuel jugé correct (1pt) = 2");
    assert.equal(after.score_100, 100);
    assert.equal(after.percentage, 100);
    assert.equal(after.passed, 1);

    // Un second appel (ex. double-clic sur le bouton de notation côté
    // admin, ou un ré-appel accidentel de l'action serveur) ne doit
    // JAMAIS re-finaliser ni renvoyer une seconde notification.
    const second = finalizeManualGradingIfComplete(attemptId);
    assert.equal(second.finalized, false, "déjà clôturé — jamais une seconde notification RESULT_AVAILABLE");

    const graderRow = getDb().prepare(`SELECT graded_by, grader_comment FROM attempt_answers WHERE attempt_question_id = ?`).get(manualAqId) as { graded_by: number; grader_comment: string };
    assert.equal(graderRow.graded_by, adminId);
    assert.equal(graderRow.grader_comment, "Réponse acceptable.");
  });

  test("les deux étapes de correction manuelle sont journalisées (answer_graded_manual puis grading_finalized)", () => {
    const { adminId, attemptId, manualAqId } = makeFixture({ withMcq: false });
    submitManualGrade(manualAqId, false, adminId, "administrator");
    finalizeManualGradingIfComplete(attemptId);

    const logs = getDb().prepare(`SELECT action, target_id FROM audit_logs WHERE target_type = 'attempt' AND target_id = ? ORDER BY id`).all(attemptId) as { action: string; target_id: number }[];
    const actions = logs.map((l) => l.action);
    assert.ok(actions.includes("answer_graded_manual"), "la décision du correcteur doit être journalisée");
    assert.ok(actions.includes("grading_finalized"), "la clôture définitive doit être journalisée");
  });

  test("listPendingManualGrading ne liste jamais une tentative encore in_progress ni une question déjà corrigée", () => {
    const { adminId, attemptId, manualAqId } = makeFixture({ withMcq: false });
    const before = listPendingManualGrading(null);
    assert.ok(before.some((p) => p.attempt_question_id === manualAqId), "la question manuelle en attente doit apparaître après soumission");

    submitManualGrade(manualAqId, true, adminId, "administrator");
    const after = listPendingManualGrading(null);
    assert.ok(!after.some((p) => p.attempt_question_id === manualAqId), "une fois corrigée, elle doit disparaître de la file d'attente");
  });

  test("listPendingManualGrading respecte le périmètre tenant (restrictToGroupIdsOrNull)", () => {
    const { manualAqId } = makeFixture({ withMcq: false });
    const restricted = listPendingManualGrading([-1]); // aucun groupe réel dans ce périmètre
    assert.ok(!restricted.some((p) => p.attempt_question_id === manualAqId), "hors périmètre — ne doit jamais apparaître");
  });
});
