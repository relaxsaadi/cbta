import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §51-53 —
// parseAuthoringFormData()/validateQuestionAuthoring() sont le point
// d'entrée UNIQUE de création ET d'édition (5 qtypes actuellement
// supportés) : jamais un état d'auteurage invalide ne doit pouvoir être
// enregistré. Fonctions pures — pas de base de données nécessaire.
describe("Auteurage de question — lib/questions.ts (parseAuthoringFormData/validateQuestionAuthoring)", async () => {
  const { parseAuthoringFormData, validateQuestionAuthoring, formatCorrectAnswerForDisplay } = await import("../../lib/questions");

  function fd(entries: Record<string, string | string[]>): FormData {
    const f = new FormData();
    for (const [k, v] of Object.entries(entries)) {
      if (Array.isArray(v)) for (const item of v) f.append(k, item);
      else f.set(k, v);
    }
    return f;
  }

  // ---------- mcq_single ----------
  test("mcq_single — parsing + validation réussissent avec exactement 1 réponse correcte parmi >=2 choix", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("mcq_single", fd({ choiceText: ["Option A", "Option B", "Option C"], correct: ["1"] }));
    assert.deepEqual(choices, [{ key: "A", text: "Option A" }, { key: "B", text: "Option B" }, { key: "C", text: "Option C" }]);
    assert.deepEqual(correctAnswer, ["B"]);
    assert.equal(validateQuestionAuthoring("mcq_single", choices, correctAnswer), null);
  });
  test("mcq_single — 0 réponse correcte est REFUSÉ", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("mcq_single", fd({ choiceText: ["A", "B"], correct: [] }));
    assert.match(validateQuestionAuthoring("mcq_single", choices, correctAnswer) ?? "", /exactement une seule/);
  });
  test("mcq_single — 2+ réponses correctes est REFUSÉ (single = exactement une)", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("mcq_single", fd({ choiceText: ["A", "B", "C"], correct: ["0", "1"] }));
    assert.match(validateQuestionAuthoring("mcq_single", choices, correctAnswer) ?? "", /exactement une seule/);
  });
  test("mcq_single — moins de 2 choix réels (après filtrage des champs vides) est REFUSÉ", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("mcq_single", fd({ choiceText: ["Seul choix", "", "  "], correct: ["0"] }));
    assert.match(validateQuestionAuthoring("mcq_single", choices, correctAnswer) ?? "", /Au moins deux choix/);
  });

  // ---------- mcq_multi ----------
  test("mcq_multi — au moins 1 réponse correcte suffit (plusieurs réponses autorisées)", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("mcq_multi", fd({ choiceText: ["A", "B", "C"], correct: ["0", "2"] }));
    assert.deepEqual(correctAnswer, ["A", "C"]);
    assert.equal(validateQuestionAuthoring("mcq_multi", choices, correctAnswer), null);
  });
  test("mcq_multi — 0 réponse correcte est REFUSÉ", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("mcq_multi", fd({ choiceText: ["A", "B"], correct: [] }));
    assert.match(validateQuestionAuthoring("mcq_multi", choices, correctAnswer) ?? "", /Au moins une réponse correcte/);
  });

  // ---------- true_false ----------
  test("true_false — parsing produit exactement 2 choix fixes (Vrai/Faux), validation réussit avec 1 réponse", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("true_false", fd({ trueFalseCorrect: "true" }));
    assert.deepEqual(choices, [{ key: "true", text: "Vrai" }, { key: "false", text: "Faux" }]);
    assert.deepEqual(correctAnswer, ["true"]);
    assert.equal(validateQuestionAuthoring("true_false", choices, correctAnswer), null);
  });
  test("true_false — aucune réponse choisie est REFUSÉ", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("true_false", fd({}));
    assert.match(validateQuestionAuthoring("true_false", choices, correctAnswer) ?? "", /exactement une seule/);
  });

  // ---------- numeric ----------
  test("numeric — valeur + tolérance valides réussissent, unit optionnel propagé dans choices ET correctAnswer", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("numeric", fd({ numericValue: "42.5", numericTolerance: "0.1", numericUnit: "kg" }));
    assert.deepEqual(correctAnswer, { mode: "numeric", value: 42.5, tolerance: 0.1, unit: "kg" });
    assert.deepEqual(choices, [{ key: "unit", text: "kg" }]);
    assert.equal(validateQuestionAuthoring("numeric", choices, correctAnswer), null);
  });
  test("numeric — sans unit, choices reste vide (jamais un choix fictif)", () => {
    const { choices } = parseAuthoringFormData("numeric", fd({ numericValue: "10", numericTolerance: "0" }));
    assert.deepEqual(choices, []);
  });
  test("numeric — tolérance 0 (correspondance exacte explicite) est VALIDE, jamais un défaut caché", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("numeric", fd({ numericValue: "10", numericTolerance: "0" }));
    assert.equal(validateQuestionAuthoring("numeric", choices, correctAnswer), null);
  });
  test("numeric — valeur manquante/non numérique est REFUSÉ", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("numeric", fd({ numericValue: "pas-un-nombre", numericTolerance: "0" }));
    assert.match(validateQuestionAuthoring("numeric", choices, correctAnswer) ?? "", /valeur numérique correcte est obligatoire/);
  });
  test("numeric — tolérance négative est REFUSÉE", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("numeric", fd({ numericValue: "10", numericTolerance: "-1" }));
    assert.match(validateQuestionAuthoring("numeric", choices, correctAnswer) ?? "", /positif ou nul/);
  });

  // ---------- short_answer ----------
  test("short_answer mode exact — au moins une réponse acceptée réussit ; découpage newline ET virgule", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("short_answer", fd({ shortAnswerMode: "exact", acceptedAnswers: "UN\nUnited Nations, ONU" }));
    assert.deepEqual(correctAnswer, { mode: "exact", acceptedAnswers: ["UN", "United Nations", "ONU"] });
    assert.deepEqual(choices, []);
    assert.equal(validateQuestionAuthoring("short_answer", choices, correctAnswer), null);
  });
  test("short_answer mode exact — aucune réponse acceptée (texte vide) est REFUSÉ, message suggère le mode manuel", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("short_answer", fd({ shortAnswerMode: "exact", acceptedAnswers: "   \n  " }));
    assert.match(validateQuestionAuthoring("short_answer", choices, correctAnswer) ?? "", /mode correction manuelle/);
  });
  test("short_answer mode manual — toujours VALIDE, jamais de réponse acceptée requise", () => {
    const { choices, correctAnswer } = parseAuthoringFormData("short_answer", fd({ shortAnswerMode: "manual" }));
    assert.deepEqual(correctAnswer, { mode: "manual" });
    assert.equal(validateQuestionAuthoring("short_answer", choices, correctAnswer), null);
  });

  // ---------- formatCorrectAnswerForDisplay — cohérence des 4 lieux d'affichage ----------
  test("formatCorrectAnswerForDisplay — mcq affiche le TEXTE des choix quand fourni, les clés sinon", () => {
    const choices = [{ key: "A", text: "Marchandises de classe 1" }, { key: "B", text: "Marchandises de classe 2" }];
    assert.equal(formatCorrectAnswerForDisplay("mcq_single", ["A"], choices), "Marchandises de classe 1");
    assert.equal(formatCorrectAnswerForDisplay("mcq_single", ["A"]), "A");
  });
  test("formatCorrectAnswerForDisplay — numeric inclut l'unité si présente", () => {
    assert.equal(formatCorrectAnswerForDisplay("numeric", { value: 42.5, unit: "kg" }), "42.5 kg");
    assert.equal(formatCorrectAnswerForDisplay("numeric", { value: 42.5 }), "42.5");
    assert.equal(formatCorrectAnswerForDisplay("numeric", null), "—", "jamais une exception sur une valeur absente");
  });
  test("formatCorrectAnswerForDisplay — short_answer manuel n'affiche jamais une fausse clé de correction", () => {
    assert.equal(formatCorrectAnswerForDisplay("short_answer", { mode: "manual" }), "(correction manuelle)");
    assert.equal(formatCorrectAnswerForDisplay("short_answer", { mode: "exact", acceptedAnswers: ["UN", "ONU"] }), "UN / ONU");
  });

  // ---------- type inconnu — jamais un enregistrement silencieux ----------
  test("un qtype inconnu à validateQuestionAuthoring est explicitement refusé, jamais accepté par défaut", () => {
    assert.equal(validateQuestionAuthoring("matching" as never, [], [] as never), "Type de question inconnu.");
  });
});
