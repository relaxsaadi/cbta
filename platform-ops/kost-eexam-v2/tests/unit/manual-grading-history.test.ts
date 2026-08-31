import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
// §4-7 — "Historique des corrections" doit montrer qui a corrigé, quand,
// et si le résultat de la tentative est déjà finalisé (lib/manual-
// grading.ts::listGradedManually/listGradedScenarioSubquestions, colonnes
// graded_at/grader_name/attempt_grading_state ajoutées cette mission).
describe("Historique de correction manuelle — qui/quand/statut finalisé (lib/manual-grading.ts)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { submitManualGrade, listGradedManually, finalizeManualGradingIfComplete } = await import("../../lib/manual-grading");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `mgh${counter}`;
  }

  test("submitManualGrade() pose graded_at ; listGradedManually() résout grader_name et attempt_grading_state", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const graderId = createUser({ username: `${t}.grader`, password: "x".repeat(10), fullName: "Correcteur Test", role: "pedagogical_manager" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: graderId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    const qId = createQuestion({
      kostQuestionId: `TEST-${t}`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Expliquez.", choices: [], correctAnswer: { mode: "manual" }, createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [qId], questionCount: 1, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["Ma réponse"]);
    submitAttempt(attempt.id, candidateId, {});

    const before = Date.now();
    submitManualGrade(aq.id, true, graderId, "pedagogical_manager", "Bonne réponse");
    finalizeManualGradingIfComplete(attempt.id);

    const graded = listGradedManually(null, {});
    const row = graded.find((g) => g.attempt_question_id === aq.id)!;
    assert.ok(row, "la réponse corrigée doit apparaître dans l'historique");
    assert.equal(row.grader_name, "Correcteur Test");
    assert.ok(row.graded_at, "graded_at doit être posé");
    assert.ok(new Date(row.graded_at!).getTime() >= before - 1000, "graded_at doit être un horodatage récent, pas une valeur figée/nulle");
    assert.equal(row.attempt_grading_state, "COMPLETE", "après finalizeManualGradingIfComplete(), le statut de la tentative doit refléter COMPLETE");
  });

  test("attempt_grading_state reste AWAITING_MANUAL_REVIEW tant que d'autres réponses de la même tentative sont encore en attente", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const graderId = createUser({ username: `${t}.grader`, password: "x".repeat(10), fullName: "Correcteur", role: "administrator" });
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
    });
    publishAssessment(assessmentId, adminId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aqs = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ? ORDER BY position`).all(attempt.id) as { id: number }[];
    saveAnswer(attempt.id, candidateId, aqs[0]!.id, ["R1"]);
    saveAnswer(attempt.id, candidateId, aqs[1]!.id, ["R2"]);
    submitAttempt(attempt.id, candidateId, {});

    submitManualGrade(aqs[0]!.id, true, graderId, "administrator");
    // aqs[1] reste volontairement non corrigée.

    const graded = listGradedManually(null, {});
    const row = graded.find((g) => g.attempt_question_id === aqs[0]!.id)!;
    assert.equal(row.attempt_grading_state, "AWAITING_MANUAL_REVIEW", "une autre réponse de la même tentative reste en attente — jamais COMPLETE tant que tout n'est pas corrigé");
  });
});
