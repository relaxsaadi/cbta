import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §16 —
// dimensions de filtre ajoutées à listPendingManualGrading/
// listPendingScenarioSubquestions, et les deux nouvelles fonctions
// d'historique "Corrigé" (listGradedManually/listGradedScenarioSubquestions).
// Ne re-teste pas les garde-fous déjà couverts par manual-grading.test.ts
// (rejets, double-correction, clôture) — uniquement le filtrage et le
// bascule pending -> historique.
describe("Filtres de correction manuelle (lib/manual-grading.ts §16)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { submitManualGrade, listPendingManualGrading, listGradedManually } = await import("../../lib/manual-grading");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `mgf${counter}`;
  }

  // Deux fixtures INDÉPENDANTES (client/groupe/fonction/examen/candidat
  // tous distincts) — nécessaire pour prouver qu'un filtre isole
  // réellement l'un sans jamais retourner l'autre.
  function makeFixture(functionCode: string) {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: `Candidat ${t}`, role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);

    const manualId = createQuestion({
      kostQuestionId: `TEST-${t}-man`, functionCode, qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Expliquez.", choices: [], correctAnswer: { mode: "manual" }, createdBy: adminId,
    });

    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode, groupId, questionSource: "manual",
      manualQuestionIds: [manualId], questionCount: 1, durationMinutes: 30, passThresholdPct: 50,
      scope: "test", createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), closeAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ? ORDER BY position`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["réponse libre"]);
    submitAttempt(attempt.id, candidateId);
    return { adminId, candidateId, companyId, groupId, assessmentId, attemptQuestionId: aq.id };
  }

  test("companyId/groupId/functionCode/assessmentId/candidateUserId isolent correctement — jamais l'autre fixture", () => {
    const a = makeFixture("7.1");
    const b = makeFixture("7.2");

    const byCompanyA = listPendingManualGrading(null, { companyId: a.companyId });
    assert.equal(byCompanyA.length, 1);
    assert.equal(byCompanyA[0]!.company_id, a.companyId);

    const byGroupB = listPendingManualGrading(null, { groupId: b.groupId });
    assert.equal(byGroupB.length, 1);
    assert.equal(byGroupB[0]!.group_id, b.groupId);

    const byFunctionA = listPendingManualGrading(null, { functionCode: "7.1" });
    assert.ok(byFunctionA.some((r) => r.assessment_id === a.assessmentId));
    assert.ok(!byFunctionA.some((r) => r.assessment_id === b.assessmentId));

    const byAssessmentB = listPendingManualGrading(null, { assessmentId: b.assessmentId });
    assert.equal(byAssessmentB.length, 1);
    assert.equal(byAssessmentB[0]!.assessment_id, b.assessmentId);

    const byCandidateA = listPendingManualGrading(null, { candidateUserId: a.candidateId });
    assert.equal(byCandidateA.length, 1);
    assert.equal(byCandidateA[0]!.candidate_user_id, a.candidateId);
  });

  test("dateFrom/dateTo — bornes inclusives sur submitted_at", () => {
    const a = makeFixture("7.3");
    const row = getDb().prepare(`SELECT submitted_at FROM attempts WHERE id = (SELECT attempt_id FROM attempt_questions WHERE id = ?)`).get(a.attemptQuestionId) as { submitted_at: string };
    const submittedDate = row.submitted_at.slice(0, 10);
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);

    assert.ok(listPendingManualGrading(null, { candidateUserId: a.candidateId, dateFrom: submittedDate, dateTo: submittedDate }).length === 1);
    assert.equal(listPendingManualGrading(null, { candidateUserId: a.candidateId, dateFrom: tomorrow }).length, 0, "une date de début future doit exclure la réponse");
    assert.equal(listPendingManualGrading(null, { candidateUserId: a.candidateId, dateTo: yesterday }).length, 0, "une date de fin passée doit exclure la réponse");
  });

  test("listGradedManually — vide avant correction, contient la réponse APRÈS correction, jamais dans listPendingManualGrading ensuite", () => {
    const a = makeFixture("7.4");
    assert.equal(listGradedManually(null, { candidateUserId: a.candidateId }).length, 0, "rien dans l'historique avant toute correction");
    assert.equal(listPendingManualGrading(null, { candidateUserId: a.candidateId }).length, 1);

    submitManualGrade(a.attemptQuestionId, true, a.adminId, "administrator");

    const graded = listGradedManually(null, { candidateUserId: a.candidateId });
    assert.equal(graded.length, 1);
    assert.equal(graded[0]!.is_correct, true);
    assert.equal(graded[0]!.graded_by, a.adminId);
    assert.equal(listPendingManualGrading(null, { candidateUserId: a.candidateId }).length, 0, "une fois corrigée, ne doit plus jamais réapparaître dans la file 'à corriger'");
  });

  test("restrictToGroupIdsOrNull (frontière multi-client) s'applique en ET avec les filtres — un groupe hors périmètre reste exclu même si demandé explicitement", () => {
    const a = makeFixture("7.5");
    const b = makeFixture("7.6");
    // Un responsable dont le périmètre est limité au groupe de `a` ne doit
    // jamais voir `b`, même en filtrant explicitement par son companyId.
    const scoped = listPendingManualGrading([a.groupId], { companyId: b.companyId });
    assert.equal(scoped.length, 0, "un identifiant hors périmètre ne doit jamais élargir l'accès, même combiné à un filtre explicite");
  });
});
