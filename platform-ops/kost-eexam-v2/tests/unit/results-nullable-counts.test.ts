import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §20-25 — bug réel
// observé en staging (/results/52, tentative de Brahimi encore EN COURS) :
// correct_count/incorrect_count étaient calculés par un COUNT() inconditionnel,
// produisant un vrai 0 indiscernable de "pas encore noté". Corrigé par une
// CASE WHEN r.attempt_id IS NOT NULL... ELSE NULL dans lib/results.ts. Ce
// test verrouille le comportement exact attendu : NULL avant notation, un
// vrai entier (y compris 0) après.
describe("Nullabilité correct_count/incorrect_count et exclusion des tentatives en cours — lib/results.ts", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { listResults, getAttemptDetail } = await import("../../lib/results");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `rnc${counter}`;
  }

  function makeFixture() {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    const qCorrect = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q1", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const qWrong = createQuestion({
      kostQuestionId: `TEST-${t}-2`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q2", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [qCorrect, qWrong], questionCount: 2, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), closeAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    return { adminId, candidateId, assessmentId };
  }

  test("BUG RÉEL /results/52 — tentative EN COURS : correct_count/incorrect_count sont NULL, jamais 0 fabriqué (getAttemptDetail)", () => {
    const { candidateId, assessmentId } = makeFixture();
    const attempt = startAttempt(assessmentId, candidateId, {});
    // Aucune réponse, aucune soumission — la tentative reste in_progress,
    // exactement le scénario réel observé sur staging.

    const detail = getAttemptDetail(attempt.id)!;
    assert.equal(detail.status, "in_progress");
    assert.equal(detail.correct_count, null, "jamais un 0 fabriqué avant la moindre notation");
    assert.equal(detail.incorrect_count, null, "jamais un 0 fabriqué avant la moindre notation");
  });

  test("après soumission et notation, correct_count/incorrect_count sont de vrais entiers (y compris un authentique 0)", () => {
    const { candidateId, assessmentId } = makeFixture();
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aqs = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ? ORDER BY position`).all(attempt.id) as { id: number }[];
    // Répond FAUX aux deux questions — un 0 authentique et mesuré, distinct
    // du NULL "pas encore noté" du test précédent.
    for (const aq of aqs) saveAnswer(attempt.id, candidateId, aq.id, ["B"]);
    submitAttempt(attempt.id, candidateId);

    const detail = getAttemptDetail(attempt.id)!;
    assert.equal(detail.status, "submitted");
    assert.equal(detail.correct_count, 0, "un vrai 0 mesuré — distinct du NULL du cas non-noté");
    assert.equal(detail.incorrect_count, 2);
  });

  test("listResults() — même nullabilité NULL-avant-notation que getAttemptDetail (BASE_QUERY)", () => {
    const { candidateId, assessmentId } = makeFixture();
    startAttempt(assessmentId, candidateId, {});
    const rows = listResults({ assessmentId });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.correct_count, null);
    assert.equal(rows[0]!.incorrect_count, null);
  });

  test("listResults({excludeInProgress:true}) — une tentative EN COURS n'apparaît jamais dans la liste des résultats du candidat (bug réel #5, /mes-resultats)", () => {
    const { candidateId, assessmentId } = makeFixture();
    startAttempt(assessmentId, candidateId, {}); // jamais soumise

    const withInProgress = listResults({ assessmentId });
    assert.equal(withInProgress.length, 1, "visible côté admin/résultats (à surveiller)");

    const excludingInProgress = listResults({ assessmentId, excludeInProgress: true });
    assert.equal(excludingInProgress.length, 0, "jamais visible côté /mes-resultats candidat tant que non envoyée");
  });

  test("listResults({excludeInProgress:true}) — une tentative SOUMISE reste bien visible", () => {
    const { candidateId, assessmentId } = makeFixture();
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ? LIMIT 1`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["A"]);
    submitAttempt(attempt.id, candidateId);

    const rows = listResults({ assessmentId, excludeInProgress: true });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.status, "submitted");
  });

  test("getAttemptDetail expose grading_state — AWAITING_MANUAL_REVIEW quand une question à correction manuelle est en attente", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Expliquez.", choices: [], correctAnswer: { mode: "manual" }, createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [qid], questionCount: 1, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), closeAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["réponse"]);
    submitAttempt(attempt.id, candidateId);

    const detail = getAttemptDetail(attempt.id)!;
    assert.equal(detail.grading_state, "AWAITING_MANUAL_REVIEW");
  });
});
