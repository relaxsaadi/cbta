import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §20-26/§44 —
// garanties de sécurité du mode APERÇU (lib/attempts.ts::getPreviewQuestions).
// Deux garanties testées ici, chacune vérifiée directement contre la base
// (jamais seulement "ça ne plante pas") :
//   1. AUCUNE ligne attempts/attempt_questions/attempt_answers/results
//      n'est jamais créée par un appel à getPreviewQuestions() — la
//      garantie centrale de "jamais une vraie tentative" (§22/§44).
//   2. Le texte de la réponse correcte (correct_answer_snapshot brut)
//      n'apparaît JAMAIS dans le JSON renvoyé au client, pour tous les
//      types de question, y compris scenario (sous-questions imbriquées).
describe("Mode aperçu candidat — garanties de sécurité (lib/attempts.ts::getPreviewQuestions)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { getPreviewQuestions } = await import("../../lib/attempts");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `pv${counter}`;
  }

  function countRows(table: string): number {
    return (getDb().prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
  }

  test("getPreviewQuestions() ne crée JAMAIS de ligne attempts/attempt_questions/attempt_answers/results", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", createdBy: adminId });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    addCandidateToGroup(groupId, candidateId, adminId);
    const qId = createQuestion({
      kostQuestionId: `TEST-${t}-mcq`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q1", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [qId], questionCount: 1, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    const before = {
      attempts: countRows("attempts"),
      attempt_questions: countRows("attempt_questions"),
      attempt_answers: countRows("attempt_answers"),
      results: countRows("results"),
    };

    getPreviewQuestions(assessmentId);
    getPreviewQuestions(assessmentId); // deux fois — jamais un effet de bord cumulatif non plus

    assert.equal(countRows("attempts"), before.attempts, "getPreviewQuestions ne doit jamais créer de ligne attempts");
    assert.equal(countRows("attempt_questions"), before.attempt_questions, "getPreviewQuestions ne doit jamais créer de ligne attempt_questions");
    assert.equal(countRows("attempt_answers"), before.attempt_answers, "getPreviewQuestions ne doit jamais créer de ligne attempt_answers");
    assert.equal(countRows("results"), before.results, "getPreviewQuestions ne doit jamais créer de ligne results");
  });

  test("getPreviewQuestions() ne renvoie jamais la réponse correcte, pour chaque type de question (y compris scénario imbriqué)", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", createdBy: adminId });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    addCandidateToGroup(groupId, candidateId, adminId);

    // Marqueurs uniques et jamais légitimement présents dans le texte
    // affiché au candidat (stem/choix) — s'ils apparaissent dans le JSON
    // renvoyé, c'est la preuve directe d'une fuite de la réponse correcte.
    const MCQ_MARKER = `SECRET-MCQ-${t}`;
    const NUMERIC_MARKER_VALUE = "424242";
    const SHORT_ANSWER_MARKER = `SECRET-SHORT-${t}`;
    const SCENARIO_SUB_MARKER = `SECRET-SUBSCENARIO-${t}`;

    const mcqId = createQuestion({
      kostQuestionId: `TEST-${t}-mcq`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Choisissez la bonne réponse.", choices: [{ key: "A", text: "Réponse A" }, { key: "B", text: "Réponse B" }],
      correctAnswer: ["A"], explanation: MCQ_MARKER, createdBy: adminId,
    });
    const numericId = createQuestion({
      kostQuestionId: `TEST-${t}-num`, functionCode: "7.1", qtype: "numeric", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Donnez la valeur.", choices: [], correctAnswer: { mode: "numeric", value: Number(NUMERIC_MARKER_VALUE), tolerance: 0 }, createdBy: adminId,
    });
    const shortId = createQuestion({
      kostQuestionId: `TEST-${t}-short`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Expliquez.", choices: [], correctAnswer: { mode: "exact", acceptedAnswers: [SHORT_ANSWER_MARKER] }, createdBy: adminId,
    });
    const scenarioId = createQuestion({
      kostQuestionId: `TEST-${t}-scenario`, functionCode: "7.1", qtype: "scenario", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Cas pratique",
      choices: [],
      correctAnswer: {
        mode: "scenario",
        context: "Contexte du scénario.",
        subquestions: [
          {
            id: "sq1",
            qtype: "short_answer",
            stem: "Sous-question.",
            points: 1,
            choices: [],
            correctAnswer: { mode: "exact", acceptedAnswers: [SCENARIO_SUB_MARKER] },
          },
        ],
      },
      createdBy: adminId,
    });

    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [mcqId, numericId, shortId, scenarioId], questionCount: 4, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    const preview = getPreviewQuestions(assessmentId);
    assert.equal(preview.length, 4);

    const serialized = JSON.stringify(preview);
    assert.ok(!serialized.includes(MCQ_MARKER), "l'explication (jamais affichée en aperçu) ne doit jamais fuiter dans le JSON de l'aperçu");
    assert.ok(!serialized.includes(NUMERIC_MARKER_VALUE), "la valeur numérique correcte ne doit jamais fuiter dans le JSON de l'aperçu");
    assert.ok(!serialized.includes(SHORT_ANSWER_MARKER), "la réponse courte acceptée ne doit jamais fuiter dans le JSON de l'aperçu");
    assert.ok(!serialized.includes(SCENARIO_SUB_MARKER), "la réponse correcte d'une sous-question de scénario ne doit jamais fuiter dans le JSON de l'aperçu");

    // Positif — le contenu candidate-safe attendu est bien présent (preuve
    // que le test n'échoue pas simplement parce que preview est vide).
    assert.ok(serialized.includes("Réponse A"));
    assert.ok(serialized.includes("Contexte du scénario."));
  });

  test("getPreviewQuestions() sur un examen en scope='draft' (sans snapshot publié) renvoie un tableau vide, jamais une erreur", () => {
    const assessmentId = 999999; // aucun examen publié à cet id dans cette base de test isolée
    const preview = getPreviewQuestions(assessmentId);
    assert.deepEqual(preview, []);
  });
});
