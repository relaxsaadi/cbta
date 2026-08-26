import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Moteur de notation — source unique de vérité (§10)", () => {
  test("note correctement un mélange de bonnes et mauvaises réponses, non-réponses incluses", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion } = await import("../../lib/questions");
    const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
    const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
    const { getDb } = await import("../../lib/db");

    const adminId = createUser({ username: "admin.grading", password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: "cand.grading", password: "x".repeat(10), fullName: "Candidat Test", role: "candidate" });
    const companyId = createCompany({ name: "Test Co", scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: "Groupe Test", scope: "test", createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);

    // 4 questions, 1 point chacune — on répond correctement à 3, incorrectement
    // à 0, et on laisse la 4e sans réponse (doit compter comme incorrecte, 0
    // point — jamais une exception silencieuse).
    for (let i = 1; i <= 4; i++) {
      createQuestion({
        kostQuestionId: `TEST-Q-${i}`,
        functionCode: "7.1",
        qtype: "mcq_single",
        sourceStatus: "FROZEN_SOURCE_VERIFIED",
        stem: `Question ${i}`,
        choices: [{ key: "A", text: "Bonne" }, { key: "B", text: "Mauvaise" }],
        correctAnswer: ["A"],
        createdBy: adminId,
      });
    }

    const assessmentId = createAssessmentDraft({
      type: "examen",
      name: "Examen test",
      functionCode: "7.1",
      groupId,
      questionSource: "random",
      questionCount: 4,
      durationMinutes: 30,
      passThresholdPct: 80,
      scope: "test",
      createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    const attempt = startAttempt(assessmentId, candidateId, {});
    const questions = getDb()
      .prepare(`SELECT id, position FROM attempt_questions WHERE attempt_id = ? ORDER BY position`)
      .all(attempt.id) as { id: number; position: number }[];
    assert.equal(questions.length, 4);

    // Répondre correctement (A) à Q1-Q3, incorrectement (B) à Q4... en fait
    // on laisse Q4 sans réponse pour tester le cas "non répondue".
    saveAnswer(attempt.id, candidateId, questions[0]!.id, ["A"]);
    saveAnswer(attempt.id, candidateId, questions[1]!.id, ["A"]);
    saveAnswer(attempt.id, candidateId, questions[2]!.id, ["A"]);
    // questions[3] volontairement non répondue.

    submitAttempt(attempt.id, candidateId, { auto: false });

    const result = getDb().prepare(`SELECT * FROM results WHERE attempt_id = ?`).get(attempt.id) as {
      raw_score: number; max_raw_score: number; score_100: number; percentage: number; passed: number; locked: number;
    };

    assert.equal(result.raw_score, 3);
    assert.equal(result.max_raw_score, 4);
    assert.equal(result.score_100, 75); // 3/4 = 75%
    assert.equal(result.percentage, 75);
    assert.equal(result.passed, 0); // seuil 80%, 75% < 80% → échoué
    assert.equal(result.locked, 1); // type examen → verrouillé immédiatement

    // La tentative elle-même doit être marquée soumise.
    const attemptRow = getDb().prepare(`SELECT status FROM attempts WHERE id = ?`).get(attempt.id) as { status: string };
    assert.equal(attemptRow.status, "submitted");
  });

  test("un score parfait au-dessus du seuil est marqué réussi", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion } = await import("../../lib/questions");
    const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
    const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
    const { getDb } = await import("../../lib/db");

    const adminId = createUser({ username: "admin.grading2", password: "x".repeat(10), fullName: "Admin2", role: "administrator" });
    const candidateId = createUser({ username: "cand.grading2", password: "x".repeat(10), fullName: "Candidat2", role: "candidate" });
    const companyId = createCompany({ name: "Test Co 2", scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: "Groupe Test 2", scope: "test", createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);

    createQuestion({
      kostQuestionId: "TEST-Q-PERFECT",
      functionCode: "7.2",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Seule question",
      choices: [{ key: "A", text: "Bonne" }, { key: "B", text: "Mauvaise" }],
      correctAnswer: ["A"],
      createdBy: adminId,
    });

    const assessmentId = createAssessmentDraft({
      type: "test",
      name: "Test parfait",
      functionCode: "7.2",
      groupId,
      questionSource: "random",
      questionCount: 1,
      durationMinutes: 10,
      passThresholdPct: 80,
      scope: "test",
      createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    const attempt = startAttempt(assessmentId, candidateId, {});
    const q = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, q.id, ["A"]);
    submitAttempt(attempt.id, candidateId, { auto: false });

    const result = getDb().prepare(`SELECT * FROM results WHERE attempt_id = ?`).get(attempt.id) as { score_100: number; passed: number };
    assert.equal(result.score_100, 100);
    assert.equal(result.passed, 1);
  });
});
