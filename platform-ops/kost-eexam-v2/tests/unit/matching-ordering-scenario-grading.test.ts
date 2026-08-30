import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "MISSION FINALE CIBLÉE" (2026-08-30) — les 3 derniers types
// requis : matching (§2, ALL_OR_NOTHING), ordering (§3, ALL_OR_NOTHING),
// scenario (§4-5, crédit partiel = somme des sous-questions, correction
// manuelle propagée depuis les sous-questions vers le scénario entier).
describe("Moteur de notation — matching/ordering/scenario", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, saveScenarioSubanswer, submitAttempt } = await import("../../lib/attempts");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `mos${counter}`;
  }

  function makeFixture() {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    return { t, adminId, candidateId, groupId };
  }

  function publishSingleQuestionExam(t: string, adminId: number, groupId: number, questionId: number, passThresholdPct = 80) {
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [questionId], questionCount: 1, durationMinutes: 30, passThresholdPct,
      scope: "test", createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), closeAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    return assessmentId;
  }

  // ============================================================
  // MATCHING (§2)
  // ============================================================
  const MATCHING_CHOICES = [
    { key: "L1", text: "Azote" },
    { key: "L2", text: "Oxygène" },
    { key: "R1", text: "Gaz inerte" },
    { key: "R2", text: "Comburant" },
  ];
  const MATCHING_CORRECT = { mode: "matching" as const, pairs: [{ left: "L1", right: "R1" }, { left: "L2", right: "R2" }] };

  test("A — matching : toutes les paires correctes → crédit plein", () => {
    const { t, adminId, candidateId, groupId } = makeFixture();
    const qid = createQuestion({ kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "matching", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Associez.", choices: MATCHING_CHOICES, correctAnswer: MATCHING_CORRECT, createdBy: adminId });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["L1:R1", "L2:R2"]);
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score, max_raw_score, grading_state FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number; max_raw_score: number; grading_state: string };
    assert.equal(result.raw_score, 1);
    assert.equal(result.grading_state, "COMPLETE");
  });

  test("B — matching : une paire inversée → incorrecte (ALL_OR_NOTHING, jamais de crédit partiel)", () => {
    const { t, adminId, candidateId, groupId } = makeFixture();
    const qid = createQuestion({ kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "matching", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Associez.", choices: MATCHING_CHOICES, correctAnswer: MATCHING_CORRECT, createdBy: adminId });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["L1:R2", "L2:R1"]); // les deux inversées
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number };
    assert.equal(result.raw_score, 0, "une seule paire correcte sur deux ne doit jamais donner un demi-point");
  });

  test("C — matching : appariement incomplet (une paire manquante) → incorrecte", () => {
    const { t, adminId, candidateId, groupId } = makeFixture();
    const qid = createQuestion({ kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "matching", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Associez.", choices: MATCHING_CHOICES, correctAnswer: MATCHING_CORRECT, createdBy: adminId });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["L1:R1"]); // L2 jamais répondu
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number };
    assert.equal(result.raw_score, 0);
  });

  // ============================================================
  // ORDERING (§3)
  // ============================================================
  const ORDERING_CHOICES = [
    { key: "S1", text: "Identifier le danger" },
    { key: "S2", text: "Isoler la zone" },
    { key: "S3", text: "Notifier les autorités" },
  ];
  const ORDERING_CORRECT = { mode: "ordering" as const, sequence: ["S1", "S2", "S3"] };

  test("D — ordering : séquence exacte → crédit plein", () => {
    const { t, adminId, candidateId, groupId } = makeFixture();
    const qid = createQuestion({ kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "ordering", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Ordonnez.", choices: ORDERING_CHOICES, correctAnswer: ORDERING_CORRECT, createdBy: adminId });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["S1", "S2", "S3"]);
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number };
    assert.equal(result.raw_score, 1);
  });

  test("E — ordering : mauvais ordre → incorrecte", () => {
    const { t, adminId, candidateId, groupId } = makeFixture();
    const qid = createQuestion({ kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "ordering", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Ordonnez.", choices: ORDERING_CHOICES, correctAnswer: ORDERING_CORRECT, createdBy: adminId });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["S2", "S1", "S3"]);
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number };
    assert.equal(result.raw_score, 0);
  });

  test("F — ordering : séquence incomplète → incorrecte", () => {
    const { t, adminId, candidateId, groupId } = makeFixture();
    const qid = createQuestion({ kostQuestionId: `TEST-${t}-1`, functionCode: "7.1", qtype: "ordering", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Ordonnez.", choices: ORDERING_CHOICES, correctAnswer: ORDERING_CORRECT, createdBy: adminId });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["S1", "S2"]);
    submitAttempt(attempt.id, candidateId);
    const result = getDb().prepare(`SELECT raw_score FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number };
    assert.equal(result.raw_score, 0);
  });

  // ============================================================
  // SCENARIO (§4-5) — mcq_single (1pt) + numeric (2pt) + short_answer manuel (1pt) = 4pts total
  // ============================================================
  function scenarioCorrectAnswer() {
    return {
      mode: "scenario" as const,
      context: "Un colis de Classe 8 présente une fuite en zone de tri.",
      subquestions: [
        { id: "sq1", qtype: "mcq_single" as const, stem: "Que faire en premier ?", points: 1, choices: [{ key: "A", text: "Isoler" }, { key: "B", text: "Ignorer" }], correctAnswer: ["A"] },
        { id: "sq2", qtype: "numeric" as const, stem: "Distance de sécurité (m) ?", points: 2, choices: [], correctAnswer: { mode: "numeric" as const, value: 10, tolerance: 0 } },
        { id: "sq3", qtype: "short_answer" as const, stem: "Décrivez la procédure de notification.", points: 1, choices: [], correctAnswer: { mode: "manual" as const } },
      ],
    };
  }

  function publishScenario(t: string, adminId: number, groupId: number) {
    const qid = createQuestion({
      kostQuestionId: `TEST-${t}-scn`, functionCode: "7.1", qtype: "scenario", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Incident de fuite — Classe 8", choices: [], correctAnswer: scenarioCorrectAnswer(), createdBy: adminId,
    });
    return { qid, assessmentId: publishSingleQuestionExam(t, adminId, groupId, qid, 50) };
  }

  test("G — scenario : sous-questions auto-notées correctes + manuelle non statuée → AWAITING_MANUAL_REVIEW, max_raw_score = somme des 3 sous-questions, raw_score = seulement la partie auto", () => {
    const { t, adminId, candidateId, groupId } = makeFixture();
    const { assessmentId } = publishScenario(t, adminId, groupId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq1", ["A"]);
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq2", ["10"]);
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq3", ["Ma réponse rédigée."]);
    submitAttempt(attempt.id, candidateId);

    const result = getDb().prepare(`SELECT raw_score, max_raw_score, grading_state, passed FROM results WHERE attempt_id = ?`).get(attempt.id) as {
      raw_score: number; max_raw_score: number; grading_state: string; passed: number | null;
    };
    assert.equal(result.max_raw_score, 4, "1 + 2 + 1 — le maximum possible compte les 3 sous-questions dès la publication");
    // La ligne scénario ENTIÈRE (une seule ligne attempt_answers, is_correct
    // IS NULL) suit exactement le même contrat que le short_answer autonome
    // en attente : ni points_awarded ni raw_score interim ne sont jamais
    // exposés tant que grading_state != 'COMPLETE' (vérifié : TOUTES les
    // pages qui lisent score_100/percentage/passed le font derrière ce même
    // garde-fou — jamais montré au candidat/admin). Le crédit RÉEL (3/4)
    // n'apparaît qu'à la clôture — voir le test H ci-dessous.
    assert.equal(result.raw_score, 0, "raw_score interim non significatif tant que la ligne reste en attente — jamais exposé");
    assert.equal(result.grading_state, "AWAITING_MANUAL_REVIEW");
    assert.equal(result.passed, null, "résultat réellement inconnu tant que sq3 n'est pas statuée");

    const answerRow = getDb().prepare(`SELECT is_correct FROM attempt_answers WHERE attempt_question_id = ?`).get(aq.id) as { is_correct: number | null };
    assert.equal(answerRow.is_correct, null, "la ligne scénario entière reste non notée tant qu'une sous-question manuelle est en attente");
  });

  test("H — scenario : correction manuelle de la sous-question correcte → clôture, crédit plein (4/4), réussi", async () => {
    const { submitScenarioSubgrade, finalizeManualGradingIfComplete } = await import("../../lib/manual-grading");
    const { t, adminId, candidateId, groupId } = makeFixture();
    const { assessmentId } = publishScenario(t, adminId, groupId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq1", ["A"]);
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq2", ["10"]);
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq3", ["Notification correcte."]);
    submitAttempt(attempt.id, candidateId);

    const { finalized: subFinalized } = submitScenarioSubgrade(aq.id, "sq3", true, adminId, "administrator", "Bonne réponse.");
    assert.equal(subFinalized, true, "dernière sous-question manuelle du scénario statuée — la ligne scénario elle-même se clôture");

    const { finalized: attemptFinalized } = finalizeManualGradingIfComplete(attempt.id);
    assert.equal(attemptFinalized, true, "plus aucune correction en attente ailleurs dans la tentative");

    const result = getDb().prepare(`SELECT raw_score, max_raw_score, score_100, passed, grading_state FROM results WHERE attempt_id = ?`).get(attempt.id) as {
      raw_score: number; max_raw_score: number; score_100: number; passed: number; grading_state: string;
    };
    assert.equal(result.raw_score, 4);
    assert.equal(result.score_100, 100);
    assert.equal(result.passed, 1);
    assert.equal(result.grading_state, "COMPLETE");

    const answerRow = getDb().prepare(`SELECT is_correct, points_awarded FROM attempt_answers WHERE attempt_question_id = ?`).get(aq.id) as { is_correct: number; points_awarded: number };
    assert.equal(answerRow.is_correct, 1);
    assert.equal(answerRow.points_awarded, 4);
  });

  test("I — scenario : correction manuelle de la sous-question INCORRECTE → clôture, crédit partiel (3/4), reflète fidèlement le score réel", async () => {
    const { submitScenarioSubgrade, finalizeManualGradingIfComplete } = await import("../../lib/manual-grading");
    const { t, adminId, candidateId, groupId } = makeFixture();
    const { assessmentId } = publishScenario(t, adminId, groupId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq1", ["A"]);
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq2", ["10"]);
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq3", ["Réponse hors sujet."]);
    submitAttempt(attempt.id, candidateId);

    submitScenarioSubgrade(aq.id, "sq3", false, adminId, "administrator");
    finalizeManualGradingIfComplete(attempt.id);

    const result = getDb().prepare(`SELECT raw_score, max_raw_score, passed, grading_state FROM results WHERE attempt_id = ?`).get(attempt.id) as {
      raw_score: number; max_raw_score: number; passed: number; grading_state: string;
    };
    assert.equal(result.raw_score, 3, "sq1+sq2 correctes (3pt), sq3 jugée incorrecte (0pt) — jamais un 0 ou 4 fabriqué");
    assert.equal(result.grading_state, "COMPLETE");
    // seuil = 50% (voir publishScenario) — 3/4 = 75% >= 50%, donc réussi.
    assert.equal(result.passed, 1);

    const answerRow = getDb().prepare(`SELECT is_correct FROM attempt_answers WHERE attempt_question_id = ?`).get(aq.id) as { is_correct: number };
    assert.equal(answerRow.is_correct, 0, "le scénario n'est PAS 'is_correct=1' puisque toutes ses parties ne sont pas correctes — is_correct reste binaire, points_awarded porte le crédit partiel réel");
  });

  test("J — une fois LA SEULE sous-question manuelle du scénario statuée, la ligne se ferme — un second appel est refusé au niveau du scénario entier", async () => {
    const { submitScenarioSubgrade, ManualGradingError } = await import("../../lib/manual-grading");
    const { t, adminId, candidateId, groupId } = makeFixture();
    const { assessmentId } = publishScenario(t, adminId, groupId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq1", ["A"]);
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq2", ["10"]);
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq3", ["Une réponse."]);
    submitAttempt(attempt.id, candidateId);

    submitScenarioSubgrade(aq.id, "sq3", true, adminId, "administrator");
    // sq3 était la SEULE sous-question manuelle de ce scénario — la ligne
    // s'est donc déjà refermée (is_correct n'est plus NULL) : un second
    // appel doit être refusé par le garde-fou AU NIVEAU DE LA LIGNE
    // ENTIÈRE, jamais silencieusement accepté.
    assert.throws(
      () => submitScenarioSubgrade(aq.id, "sq3", false, adminId, "administrator"),
      (err: unknown) => err instanceof ManualGradingError && /scénario a déjà été entièrement corrigé/.test(err.message)
    );
  });

  test("J2 — avec DEUX sous-questions manuelles, corriger l'une n'empêche pas l'autre, mais un second appel sur LA MÊME est refusé au niveau de la sous-question (garde distinct du test J)", async () => {
    const { submitScenarioSubgrade, ManualGradingError, finalizeManualGradingIfComplete } = await import("../../lib/manual-grading");
    const { t, adminId, candidateId, groupId } = makeFixture();
    const twoManualScenario = {
      mode: "scenario" as const,
      context: "Deux incidents distincts à décrire.",
      subquestions: [
        { id: "sqA", qtype: "short_answer" as const, stem: "Décrivez l'incident A.", points: 1, choices: [], correctAnswer: { mode: "manual" as const } },
        { id: "sqB", qtype: "short_answer" as const, stem: "Décrivez l'incident B.", points: 1, choices: [], correctAnswer: { mode: "manual" as const } },
      ],
    };
    const qid = createQuestion({ kostQuestionId: `TEST-${t}-scn2`, functionCode: "7.1", qtype: "scenario", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Deux incidents", choices: [], correctAnswer: twoManualScenario, createdBy: adminId });
    const assessmentId = publishSingleQuestionExam(t, adminId, groupId, qid, 50);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sqA", ["Réponse A."]);
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sqB", ["Réponse B."]);
    submitAttempt(attempt.id, candidateId);

    const { finalized: firstFinalized } = submitScenarioSubgrade(aq.id, "sqA", true, adminId, "administrator");
    assert.equal(firstFinalized, false, "sqB reste en attente — la ligne scénario ne doit pas encore se fermer");

    // Un second appel sur sqA (déjà statuée) est refusé par le garde
    // SPÉCIFIQUE À LA SOUS-QUESTION (la ligne, elle, est encore ouverte —
    // c'est un garde DIFFÉRENT de celui du test J).
    assert.throws(
      () => submitScenarioSubgrade(aq.id, "sqA", false, adminId, "administrator"),
      (err: unknown) => err instanceof ManualGradingError && /sous-question a déjà été corrigée/.test(err.message)
    );

    const { finalized: secondFinalized } = submitScenarioSubgrade(aq.id, "sqB", true, adminId, "administrator");
    assert.equal(secondFinalized, true, "sqB était la dernière en attente — la ligne se ferme maintenant");
    const { finalized: attemptFinalized } = finalizeManualGradingIfComplete(attempt.id);
    assert.equal(attemptFinalized, true);

    const result = getDb().prepare(`SELECT raw_score, max_raw_score, passed FROM results WHERE attempt_id = ?`).get(attempt.id) as { raw_score: number; max_raw_score: number; passed: number };
    assert.equal(result.raw_score, 2, "les deux sous-questions manuelles jugées correctes");
    assert.equal(result.max_raw_score, 2);
    assert.equal(result.passed, 1);
  });

  test("K — listPendingScenarioSubquestions liste la sous-question manuelle en attente, puis plus rien une fois corrigée", async () => {
    const { listPendingScenarioSubquestions, submitScenarioSubgrade } = await import("../../lib/manual-grading");
    const { t, adminId, candidateId, groupId } = makeFixture();
    const { assessmentId } = publishScenario(t, adminId, groupId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq1", ["A"]);
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq2", ["10"]);
    saveScenarioSubanswer(attempt.id, candidateId, aq.id, "sq3", ["Réponse candidate visible ici."]);
    submitAttempt(attempt.id, candidateId);

    const before = listPendingScenarioSubquestions(null);
    const item = before.find((p) => p.attempt_question_id === aq.id && p.subquestion_id === "sq3");
    assert.ok(item, "la sous-question manuelle doit apparaître dans la file d'attente après soumission");
    assert.equal(item!.candidate_answer, "Réponse candidate visible ici.");

    submitScenarioSubgrade(aq.id, "sq3", true, adminId, "administrator");
    const after = listPendingScenarioSubquestions(null);
    assert.ok(!after.some((p) => p.attempt_question_id === aq.id && p.subquestion_id === "sq3"), "disparaît de la file une fois corrigée");
  });

  test("L — snapshot immuable : éditer la question banque après publication ne modifie JAMAIS le scénario déjà figé dans la tentative", async () => {
    const { addQuestionVersion } = await import("../../lib/questions");
    const { t, adminId, candidateId, groupId } = makeFixture();
    const { qid, assessmentId } = publishScenario(t, adminId, groupId);
    const attempt = startAttempt(assessmentId, candidateId, {});
    const aq = getDb().prepare(`SELECT snapshot_id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { snapshot_id: number };
    const before = getDb().prepare(`SELECT correct_answer_snapshot FROM assessment_question_snapshots WHERE id = ?`).get(aq.snapshot_id) as { correct_answer_snapshot: string };

    // Modifie la question EN BANQUE — contexte et sous-questions complètement différents.
    addQuestionVersion(
      qid,
      {
        stem: "Titre modifié après publication",
        choices: [],
        correctAnswer: { mode: "scenario", context: "Contexte ENTIÈREMENT différent.", subquestions: [{ id: "sqX", qtype: "true_false", stem: "Autre question", points: 1, choices: [{ key: "true", text: "Vrai" }, { key: "false", text: "Faux" }], correctAnswer: ["true"] }] },
      },
      adminId
    );

    const after = getDb().prepare(`SELECT correct_answer_snapshot FROM assessment_question_snapshots WHERE id = ?`).get(aq.snapshot_id) as { correct_answer_snapshot: string };
    assert.equal(after.correct_answer_snapshot, before.correct_answer_snapshot, "le snapshot déjà publié ne doit jamais changer rétroactivement");
    assert.match(after.correct_answer_snapshot, /fuite en zone de tri/, "le contexte ORIGINAL doit rester présent dans le snapshot");
  });
});
