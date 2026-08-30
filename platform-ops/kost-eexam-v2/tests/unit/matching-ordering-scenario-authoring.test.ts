import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Mission "MISSION FINALE CIBLÉE" (2026-08-30) §7 — validations serveur
// obligatoires pour matching/ordering/scenario. Fonctions pures — pas de
// base de données nécessaire (même style que question-authoring.test.ts).
describe("Auteurage matching/ordering/scenario — lib/questions.ts", async () => {
  const { validateQuestionAuthoring, formatCorrectAnswerForDisplay, formatCandidateAnswerForDisplay } = await import("../../lib/questions");

  // ---------- matching ----------
  test("matching — au moins 2 paires valides réussit", () => {
    const choices = [{ key: "L1", text: "Azote" }, { key: "R1", text: "Gaz inerte" }, { key: "L2", text: "Oxygène" }, { key: "R2", text: "Comburant" }];
    const correctAnswer = { mode: "matching" as const, pairs: [{ left: "L1", right: "R1" }, { left: "L2", right: "R2" }] };
    assert.equal(validateQuestionAuthoring("matching", choices, correctAnswer), null);
  });
  test("matching — moins de 2 paires est REFUSÉ", () => {
    const choices = [{ key: "L1", text: "Azote" }, { key: "R1", text: "Gaz inerte" }];
    const correctAnswer = { mode: "matching" as const, pairs: [{ left: "L1", right: "R1" }] };
    assert.match(validateQuestionAuthoring("matching", choices, correctAnswer) ?? "", /Au moins deux paires/);
  });
  test("matching — un élément vide (côté gauche ou droit) est REFUSÉ", () => {
    const choices = [{ key: "L1", text: "" }, { key: "R1", text: "Gaz inerte" }, { key: "L2", text: "Oxygène" }, { key: "R2", text: "Comburant" }];
    const correctAnswer = { mode: "matching" as const, pairs: [{ left: "L1", right: "R1" }, { left: "L2", right: "R2" }] };
    assert.match(validateQuestionAuthoring("matching", choices, correctAnswer) ?? "", /ne peut être vide/);
  });
  test("matching — une paire en double (même élément de gauche associé deux fois) est REFUSÉE", () => {
    const choices = [{ key: "L1", text: "Azote" }, { key: "R1", text: "Gaz inerte" }, { key: "R2", text: "Comburant" }];
    const correctAnswer = { mode: "matching" as const, pairs: [{ left: "L1", right: "R1" }, { left: "L1", right: "R2" }] };
    assert.match(validateQuestionAuthoring("matching", choices, correctAnswer) ?? "", /qu'une seule fois/);
  });
  test("matching — une paire référençant un élément inexistant est REFUSÉE", () => {
    const choices = [{ key: "L1", text: "Azote" }, { key: "R1", text: "Gaz inerte" }];
    const correctAnswer = { mode: "matching" as const, pairs: [{ left: "L1", right: "R1" }, { left: "L2", right: "R2" }] };
    assert.match(validateQuestionAuthoring("matching", choices, correctAnswer) ?? "", /référence un élément qui n'existe pas/);
  });

  // ---------- ordering ----------
  test("ordering — au moins 2 éléments valides réussit", () => {
    const choices = [{ key: "S1", text: "Identifier" }, { key: "S2", text: "Isoler" }];
    const correctAnswer = { mode: "ordering" as const, sequence: ["S1", "S2"] };
    assert.equal(validateQuestionAuthoring("ordering", choices, correctAnswer), null);
  });
  test("ordering — moins de 2 éléments est REFUSÉ", () => {
    const choices = [{ key: "S1", text: "Identifier" }];
    const correctAnswer = { mode: "ordering" as const, sequence: ["S1"] };
    assert.match(validateQuestionAuthoring("ordering", choices, correctAnswer) ?? "", /Au moins deux éléments/);
  });
  test("ordering — un identifiant en double dans la séquence est REFUSÉ", () => {
    const choices = [{ key: "S1", text: "Identifier" }, { key: "S2", text: "Isoler" }];
    const correctAnswer = { mode: "ordering" as const, sequence: ["S1", "S1"] };
    assert.match(validateQuestionAuthoring("ordering", choices, correctAnswer) ?? "", /en double/);
  });
  test("ordering — un élément vide est REFUSÉ", () => {
    const choices = [{ key: "S1", text: "" }, { key: "S2", text: "Isoler" }];
    const correctAnswer = { mode: "ordering" as const, sequence: ["S1", "S2"] };
    assert.match(validateQuestionAuthoring("ordering", choices, correctAnswer) ?? "", /ne peut être vide/);
  });
  test("ordering — la séquence référence un élément inexistant → REFUSÉ", () => {
    const choices = [{ key: "S1", text: "Identifier" }, { key: "S2", text: "Isoler" }];
    const correctAnswer = { mode: "ordering" as const, sequence: ["S1", "S3"] };
    assert.match(validateQuestionAuthoring("ordering", choices, correctAnswer) ?? "", /référence un élément qui n'existe pas/);
  });

  // ---------- scenario ----------
  function validScenarioSubquestions() {
    return [
      { id: "sq1", qtype: "mcq_single" as const, stem: "Q1", points: 1, choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"] },
      { id: "sq2", qtype: "numeric" as const, stem: "Q2", points: 2, choices: [], correctAnswer: { mode: "numeric" as const, value: 10, tolerance: 0 } },
    ];
  }
  test("scenario — contexte + au moins une sous-question valide réussit", () => {
    const correctAnswer = { mode: "scenario" as const, context: "Un incident se produit.", subquestions: validScenarioSubquestions() };
    assert.equal(validateQuestionAuthoring("scenario", [], correctAnswer), null);
  });
  test("scenario — contexte vide est REFUSÉ", () => {
    const correctAnswer = { mode: "scenario" as const, context: "   ", subquestions: validScenarioSubquestions() };
    assert.match(validateQuestionAuthoring("scenario", [], correctAnswer) ?? "", /contexte du scénario est obligatoire/);
  });
  test("scenario — zéro sous-question est REFUSÉ", () => {
    const correctAnswer = { mode: "scenario" as const, context: "Un incident.", subquestions: [] };
    assert.match(validateQuestionAuthoring("scenario", [], correctAnswer) ?? "", /au moins une sous-question/);
  });
  test("scenario — une sous-question imbriquée 'scenario' est REFUSÉE (jamais de scénario dans un scénario)", () => {
    const correctAnswer = {
      mode: "scenario" as const,
      context: "Un incident.",
      subquestions: [{ id: "sq1", qtype: "scenario" as never, stem: "imbriqué", points: 1, choices: [], correctAnswer: { mode: "scenario", context: "x", subquestions: [] } as never }],
    };
    assert.match(validateQuestionAuthoring("scenario", [], correctAnswer) ?? "", /ne peut pas contenir un autre scénario/);
  });
  test("scenario — une sous-question sans texte est REFUSÉE", () => {
    const correctAnswer = { mode: "scenario" as const, context: "Un incident.", subquestions: [{ id: "sq1", qtype: "mcq_single" as const, stem: "  ", points: 1, choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"] }] };
    assert.match(validateQuestionAuthoring("scenario", [], correctAnswer) ?? "", /texte est obligatoire/);
  });
  test("scenario — une sous-question avec 0 point est REFUSÉE", () => {
    const correctAnswer = { mode: "scenario" as const, context: "Un incident.", subquestions: [{ id: "sq1", qtype: "mcq_single" as const, stem: "Q1", points: 0, choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"] }] };
    assert.match(validateQuestionAuthoring("scenario", [], correctAnswer) ?? "", /points doit être positif/);
  });
  test("scenario — une sous-question intrinsèquement invalide (ex. mcq à 2 bonnes réponses en mode single) est REFUSÉE, l'erreur remonte celle de la sous-question", () => {
    const correctAnswer = {
      mode: "scenario" as const,
      context: "Un incident.",
      subquestions: [{ id: "sq1", qtype: "mcq_single" as const, stem: "Q1", points: 1, choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A", "B"] }],
    };
    assert.match(validateQuestionAuthoring("scenario", [], correctAnswer) ?? "", /exactement une seule réponse correcte/);
  });
  test("scenario — une sous-question de type matching/ordering (les 2 nouveaux types autorisés en sous-question) est acceptée", () => {
    const correctAnswer = {
      mode: "scenario" as const,
      context: "Un incident.",
      subquestions: [
        { id: "sq1", qtype: "matching" as const, stem: "Associez.", points: 1, choices: [{ key: "L1", text: "a" }, { key: "R1", text: "b" }], correctAnswer: { mode: "matching" as const, pairs: [{ left: "L1", right: "R1" }] } },
      ],
    };
    // Une seule paire ici — la sous-question matching hérite quand même de
    // sa PROPRE règle "au moins 2 paires" (jamais assouplie en sous-question).
    assert.match(validateQuestionAuthoring("scenario", [], correctAnswer) ?? "", /Au moins deux paires/);
  });

  // ---------- formatCorrectAnswerForDisplay / formatCandidateAnswerForDisplay ----------
  test("formatCorrectAnswerForDisplay — matching affiche les paires avec le TEXTE des choix", () => {
    const choices = [{ key: "L1", text: "Azote" }, { key: "R1", text: "Gaz inerte" }];
    const text = formatCorrectAnswerForDisplay("matching", { pairs: [{ left: "L1", right: "R1" }] }, choices);
    assert.equal(text, "Azote → Gaz inerte");
  });
  test("formatCorrectAnswerForDisplay — ordering affiche la séquence dans l'ordre avec le TEXTE des choix", () => {
    const choices = [{ key: "S1", text: "Identifier" }, { key: "S2", text: "Isoler" }];
    const text = formatCorrectAnswerForDisplay("ordering", { sequence: ["S1", "S2"] }, choices);
    assert.equal(text, "Identifier → Isoler");
  });
  test("formatCandidateAnswerForDisplay — matching formate la réponse du candidat depuis les paires 'L:R'", () => {
    const choices = [{ key: "L1", text: "Azote" }, { key: "R1", text: "Gaz inerte" }, { key: "R2", text: "Comburant" }];
    const text = formatCandidateAnswerForDisplay("matching", ["L1:R2"], choices);
    assert.equal(text, "Azote → Comburant");
  });
  test("formatCandidateAnswerForDisplay — ordering formate la séquence du candidat", () => {
    const choices = [{ key: "S1", text: "Identifier" }, { key: "S2", text: "Isoler" }];
    const text = formatCandidateAnswerForDisplay("ordering", ["S2", "S1"], choices);
    assert.equal(text, "Isoler → Identifier");
  });
  test("formatCandidateAnswerForDisplay — réponse vide affiche toujours '—', jamais une chaîne vide silencieuse", () => {
    assert.equal(formatCandidateAnswerForDisplay("matching", [], []), "—");
    assert.equal(formatCandidateAnswerForDisplay("ordering", [], []), "—");
    assert.equal(formatCandidateAnswerForDisplay("scenario", {}, []), "—");
  });
});
