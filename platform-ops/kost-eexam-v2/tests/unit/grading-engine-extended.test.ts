import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §41-50/§26-30 —
// moteur de notation étendu (numeric/short_answer) et machine à états de
// notation (COMPLETE / AWAITING_MANUAL_REVIEW). Les 244 questions
// réglementaires existantes (mcq_single/mcq_multi/true_false) ne sont
// jamais concernées par ces nouveaux chemins — testé séparément par
// versioning.test.ts (déjà vert, non modifié par cette mission).
describe("Moteur de notation étendu — numeric/short_answer/correction manuelle", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { gradeAttempt } = await import("../../lib/grading");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `ge${counter}`;
  }

  function makeCandidateAndGroup(t: string) {
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    return { adminId, candidateId, groupId };
  }

  function publishSingleQuestionExam(t: string, adminId: number, groupId: number, questionId: number) {
    const assessmentId = createAssessmentDraft({
      type: "examen",
      name: `Examen ${t}`,
      functionCode: "7.1",
      groupId,
      questionSource: "manual",
      manualQuestionIds: [questionId],
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 80,
      scope: "test",
      createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      closeAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    return assessmentId;
  }

  // --- A. Numeric — correspondance exacte (tolérance 0) ---
  test("A — numeric : valeur exacte avec tolérance 0 est notée correcte", () => {
    const t = tag();
    const { adminId, candidateId, groupId } = makeCandidateAndGroup(t);
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "numeric", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Combien ?", choices: [], correctAnswer: { mode: "numeric", value: 10, tolerance: 0 }, createdBy: adminId,
    });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["10"]);
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score, max_raw_score, grading_state FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number; max_raw_score: number; grading_state: string };
    assert.equal(result.raw_score, 1);
    assert.equal(result.grading_state, "COMPLETE");
  });

  // --- B. Numeric — dans la tolérance ---
  test("B — numeric : valeur dans la tolérance configurée est notée correcte", () => {
    const t = tag();
    const { adminId, candidateId, groupId } = makeCandidateAndGroup(t);
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "numeric", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Combien ?", choices: [{ key: "unit", text: "kg" }], correctAnswer: { mode: "numeric", value: 10, tolerance: 0.5, unit: "kg" }, createdBy: adminId,
    });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["10.3"]);
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number };
    assert.equal(result.raw_score, 1);
  });

  // --- C. Numeric — hors tolérance ---
  test("C — numeric : valeur hors tolérance est notée incorrecte", () => {
    const t = tag();
    const { adminId, candidateId, groupId } = makeCandidateAndGroup(t);
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "numeric", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Combien ?", choices: [], correctAnswer: { mode: "numeric", value: 10, tolerance: 0.5 }, createdBy: adminId,
    });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["12"]);
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number };
    assert.equal(result.raw_score, 0);
  });

  // --- D. Numeric — réponse non numérique jamais une exception, toujours incorrecte ---
  test("D — numeric : une réponse non numérique/vide est notée incorrecte, jamais une exception", () => {
    const t = tag();
    const { adminId, candidateId, groupId } = makeCandidateAndGroup(t);
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "numeric", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Combien ?", choices: [], correctAnswer: { mode: "numeric", value: 10, tolerance: 0 }, createdBy: adminId,
    });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    assert.doesNotThrow(() => submitAttempt(attempt.id, candidateId)); // jamais répondu
    const result = getDb().prepare(`SELECT raw_score FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number };
    assert.equal(result.raw_score, 0);
  });

  // --- E. Short answer exact — normalisation (casse/espaces) ---
  test("E — short_answer mode exact : normalisation insensible à la casse et aux espaces", () => {
    const t = tag();
    const { adminId, candidateId, groupId } = makeCandidateAndGroup(t);
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Sigle ?", choices: [], correctAnswer: { mode: "exact", acceptedAnswers: ["United Nations"] }, createdBy: adminId,
    });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["  united   nations  "]);
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score, grading_state FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number; grading_state: string };
    assert.equal(result.raw_score, 1);
    assert.equal(result.grading_state, "COMPLETE");
  });

  // --- F. Short answer exact — aucune correspondance ---
  test("F — short_answer mode exact : aucune correspondance parmi les réponses acceptées est incorrecte", () => {
    const t = tag();
    const { adminId, candidateId, groupId } = makeCandidateAndGroup(t);
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Sigle ?", choices: [], correctAnswer: { mode: "exact", acceptedAnswers: ["UN"] }, createdBy: adminId,
    });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["EU"]);
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number };
    assert.equal(result.raw_score, 0);
  });

  // --- G. Short answer manuel — jamais auto-noté, grading_state bascule, passed=NULL ---
  test("G — short_answer mode manual : jamais auto-noté (is_correct NULL), grading_state='AWAITING_MANUAL_REVIEW', passed NULL", () => {
    const t = tag();
    const { adminId, candidateId, groupId } = makeCandidateAndGroup(t);
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Expliquez.", choices: [], correctAnswer: { mode: "manual" }, createdBy: adminId,
    });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["Ma réponse libre."]);
    submitAttempt(attempt.id, candidateId);

    const answerRow = getDb().prepare(`SELECT is_correct FROM attempt_answers WHERE attempt_question_id = ?`).get(aq.id) as { is_correct: number | null };
    assert.equal(answerRow.is_correct, null, "jamais auto-noté");

    const result = getDb().prepare(`SELECT passed, grading_state FROM results WHERE attempt_id = ?`).get(attempt.id) as { passed: number | null; grading_state: string };
    assert.equal(result.passed, null, "résultat réellement inconnu, jamais un booléen fabriqué");
    assert.equal(result.grading_state, "AWAITING_MANUAL_REVIEW");
  });

  // --- H. Examen mixte (1 auto mcq + 1 manuel) — max_raw_score inclut tout, raw_score seulement la partie auto-notée ---
  test("H — examen mixte (mcq auto-noté + short_answer manuel) : max_raw_score compte les deux, raw_score/grading_state reflètent l'attente", () => {
    const t = tag();
    const { adminId, candidateId, groupId } = makeCandidateAndGroup(t);
    const mcqId = createQuestion({
      kostQuestionId: `TEST-${t}-mcq`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q1", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const manualId = createQuestion({
      kostQuestionId: `TEST-${t}-man`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q2", choices: [], correctAnswer: { mode: "manual" }, createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Mixte ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [mcqId, manualId], questionCount: 2, durationMinutes: 30, passThresholdPct: 80,
      scope: "test", createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), closeAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aqs = getDb().prepare(`SELECT id, snapshot_id FROM attempt_questions WHERE attempt_id = ? ORDER BY position`).all(attempt.id) as { id: number; snapshot_id: number }[];
    for (const aq of aqs) {
      const snap = getDb().prepare(`SELECT question_id FROM assessment_question_snapshots WHERE id = ?`).get(aq.snapshot_id) as { question_id: number };
      saveAnswer(attempt.id, candidateId, aq.id, snap.question_id === mcqId ? ["A"] : ["une explication"]);
    }
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score, max_raw_score, grading_state FROM results WHERE attempt_id = ?`).get(attempt.id) as {
      raw_score: number;
      max_raw_score: number;
      grading_state: string;
    };
    assert.equal(result.max_raw_score, 2, "le maximum possible compte les deux questions, correction en attente ou pas");
    assert.equal(result.raw_score, 1, "seule la partie auto-notée (le mcq) contribue tant que le manuel est en attente");
    assert.equal(result.grading_state, "AWAITING_MANUAL_REVIEW");
  });

  // --- I. gradeAttempt() ne se réexécute jamais pour la même tentative (garde-fou) ---
  test("I — gradeAttempt() appelée deux fois sur la même tentative renvoie le résultat déjà écrit sans le recalculer", () => {
    const t = tag();
    const { adminId, candidateId, groupId } = makeCandidateAndGroup(t);
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["A"]);
    submitAttempt(attempt.id, candidateId);

    const before = getDb().prepare(`SELECT raw_score, graded_at FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number; graded_at: string };
    const second = gradeAttempt(attempt.id);
    const after = getDb().prepare(`SELECT raw_score, graded_at FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number; graded_at: string };
    assert.equal(second.rawScore, before.raw_score);
    assert.equal(after.graded_at, before.graded_at, "jamais réécrit — le garde-fou renvoie le résultat déjà existant, jamais un recalcul");
  });

  // --- J. Un second appel submitAttempt() (double-clic) ne réécrase JAMAIS une correction manuelle déjà écrite ---
  test("J — soumettre deux fois la même tentative (double-clic) ne réinitialise jamais une correction manuelle déjà écrite", async () => {
    const { submitManualGrade } = await import("../../lib/manual-grading");
    const t = tag();
    const { adminId, candidateId, groupId } = makeCandidateAndGroup(t);
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Expliquez.", choices: [], correctAnswer: { mode: "manual" }, createdBy: adminId,
    });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["Ma réponse."]);
    submitAttempt(attempt.id, candidateId); // première soumission réelle

    submitManualGrade(aq.id, true, adminId, "administrator"); // un correcteur statue APRÈS l'envoi

    // Double-clic tardif (retry réseau) sur le même bouton "Terminer et envoyer" —
    // submitAttempt() est déjà idempotente (attempt.status !== 'in_progress' → no-op).
    submitAttempt(attempt.id, candidateId);

    const answerRow = getDb().prepare(`SELECT is_correct FROM attempt_answers WHERE attempt_question_id = ?`).get(aq.id) as { is_correct: number | null };
    assert.equal(answerRow.is_correct, 1, "la décision humaine doit survivre à un second appel submitAttempt()");
  });
});
