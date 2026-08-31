import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
// §11-14/§35 — garanties de sécurité du "Mode test" d'une question
// (lib/attempts.ts::getQuestionTestPreview + Server Action
// testGradeQuestionAction, app/(app)/question-bank/[id]/test/actions.ts).
// Mêmes deux garanties que preview-mode.test.ts (mode aperçu candidat,
// dont ce module réutilise directement le même point d'entrée de transform,
// mapSnapshotRowToCandidateView) appliquées ici au test D'UNE SEULE
// question, avant même toute publication :
//   1. AUCUNE ligne attempts/attempt_questions/attempt_answers/results
//      n'est jamais créée, ni par getQuestionTestPreview() ni par un appel
//      de notation via gradeOneQuestion (fonction pure).
//   2. La réponse correcte n'apparaît JAMAIS dans le JSON renvoyé par
//      getQuestionTestPreview() — seule testGradeQuestionAction (côté
//      serveur, jamais côté client) y accède, pour un rôle déjà autorisé
//      à la voir par ailleurs (administrator, même périmètre que l'écran
//      d'édition sur cette même question).
describe("Mode test d'une question — garanties de sécurité (lib/attempts.ts::getQuestionTestPreview)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createQuestion, getCurrentVersion } = await import("../../lib/questions");
  const { getQuestionTestPreview } = await import("../../lib/attempts");
  const { gradeOneQuestion } = await import("../../lib/grading");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `qtm${counter}`;
  }

  function countRows(table: string): number {
    return (getDb().prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
  }

  test("getQuestionTestPreview() ne crée JAMAIS de ligne attempts/attempt_questions/attempt_answers/results, avant même toute publication", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const qId = createQuestion({
      kostQuestionId: `TEST-${t}-mcq`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "DRAFT",
      stem: "Q1", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });

    const before = {
      attempts: countRows("attempts"),
      attempt_questions: countRows("attempt_questions"),
      attempt_answers: countRows("attempt_answers"),
      results: countRows("results"),
    };

    const preview = getQuestionTestPreview(qId);
    getQuestionTestPreview(qId); // deux fois — jamais un effet de bord cumulatif

    assert.ok(preview);
    assert.equal(countRows("attempts"), before.attempts);
    assert.equal(countRows("attempt_questions"), before.attempt_questions);
    assert.equal(countRows("attempt_answers"), before.attempt_answers);
    assert.equal(countRows("results"), before.results);
  });

  test("getQuestionTestPreview() ne renvoie jamais la réponse correcte, pour chaque type de question testé", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const MCQ_MARKER = `SECRET-MCQ-${t}`;
    const NUMERIC_MARKER = "737373";
    const SHORT_MARKER = `SECRET-SHORT-${t}`;

    const mcqId = createQuestion({
      kostQuestionId: `TEST-${t}-mcq`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "DRAFT",
      stem: "Choisissez.", choices: [{ key: "A", text: "Réponse A" }, { key: "B", text: "Réponse B" }],
      correctAnswer: ["A"], explanation: MCQ_MARKER, createdBy: adminId,
    });
    const numId = createQuestion({
      kostQuestionId: `TEST-${t}-num`, functionCode: "7.1", qtype: "numeric", sourceStatus: "DRAFT",
      stem: "Valeur ?", choices: [], correctAnswer: { mode: "numeric", value: Number(NUMERIC_MARKER), tolerance: 0 }, createdBy: adminId,
    });
    const shortId = createQuestion({
      kostQuestionId: `TEST-${t}-short`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "DRAFT",
      stem: "Expliquez.", choices: [], correctAnswer: { mode: "exact", acceptedAnswers: [SHORT_MARKER] }, createdBy: adminId,
    });

    for (const qId of [mcqId, numId, shortId]) {
      const preview = getQuestionTestPreview(qId)!;
      const serialized = JSON.stringify(preview);
      assert.ok(!serialized.includes(MCQ_MARKER));
      assert.ok(!serialized.includes(NUMERIC_MARKER));
      assert.ok(!serialized.includes(SHORT_MARKER));
    }
  });

  test("getQuestionTestPreview() sur une question inexistante renvoie undefined, jamais une erreur", () => {
    assert.equal(getQuestionTestPreview(999999), undefined);
  });

  test("intégration notation (même chemin que testGradeQuestionAction) : gradeOneQuestion() sur la version courante calcule le bon verdict, sans écriture DB", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const qId = createQuestion({
      kostQuestionId: `TEST-${t}-grade`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "DRAFT",
      stem: "Q1", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const version = getCurrentVersion(qId)!;

    const before = countRows("attempt_answers");
    const correct = gradeOneQuestion("mcq_single", version.correct_answer, JSON.stringify(["A"]));
    const incorrect = gradeOneQuestion("mcq_single", version.correct_answer, JSON.stringify(["B"]));
    assert.equal(correct.isCorrect, true);
    assert.equal(incorrect.isCorrect, false);
    assert.equal(countRows("attempt_answers"), before, "tester une réponse ne doit jamais écrire dans attempt_answers");
  });
});
