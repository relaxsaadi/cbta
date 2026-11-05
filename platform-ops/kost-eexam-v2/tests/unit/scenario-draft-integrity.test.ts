import { describe, test } from "node:test";
import assert from "node:assert/strict";

// Regression guard for the CLIENT -> hidden scenario JSON -> SERVER pathway.
// The top-level MCQ, matching and numeric parsers have their own guards;
// scenario subquestions must obey the SAME rules before persistence.
describe("Scenario subquestion draft-to-server integrity", async () => {
  const { emptyDraft, draftToPayload } = await import("../../app/(app)/question-bank/scenario-authoring");
  const { parseAuthoringFormData, validateQuestionAuthoring } = await import("../../lib/questions");

  function serverError(draft: ReturnType<typeof emptyDraft>): string | null {
    const form = new FormData();
    form.set("scenarioContext", "Grounded test scenario");
    form.set("scenarioSubquestionsJson", JSON.stringify([draftToPayload(draft)]));
    const { choices, correctAnswer } = parseAuthoringFormData("scenario", form);
    return validateQuestionAuthoring("scenario", choices, correctAnswer);
  }

  test("MCQ single retains correct-answer identity past an empty earlier choice", () => {
    const d = emptyDraft("mcq_single");
    d.stem = "Choose the correct item";
    d.choiceTexts = ["", "Correct B", "Incorrect C", ""];
    d.correctIndexes = [1];

    const payload = draftToPayload(d);
    assert.deepEqual(payload.choices, [
      { key: "A", text: "Correct B" },
      { key: "B", text: "Incorrect C" },
    ]);
    assert.deepEqual(payload.correctAnswer, ["A"]);
    assert.equal(serverError(d), null);
  });

  test("MCQ multi preserves multiple correct answers across empty slots", () => {
    const d = emptyDraft("mcq_multi");
    d.stem = "Pick two correct items";
    d.choiceTexts = ["Correct A", "", "Distractor", "Correct D"];
    d.correctIndexes = [0, 3];

    const payload = draftToPayload(d);
    assert.deepEqual(payload.correctAnswer, ["A", "C"]);
    assert.equal(serverError(d), null);
  });

  test("selected empty MCQ slot fails closed instead of switching answers", () => {
    const d = emptyDraft("mcq_single");
    d.stem = "Pick one";
    d.choiceTexts = ["First", "", "Third"];
    d.correctIndexes = [1];

    assert.match(serverError(d) ?? "", /référence un choix qui n'existe pas/);
  });

  test("blank or whitespace-only scenario numeric keys cannot become zero", () => {
    for (const value of ["", "   "]) {
      const d = emptyDraft("numeric");
      d.stem = "Numeric key";
      d.numericValue = value;
      d.numericTolerance = "0";
      assert.match(serverError(d) ?? "", /valeur numérique correcte est obligatoire/i);
    }
  });

  test("explicit zero numeric key is retained; erased tolerance is rejected", () => {
    const d = emptyDraft("numeric");
    d.stem = "Numeric key";
    d.numericValue = "0";
    d.numericTolerance = "0";
    assert.equal(serverError(d), null);
    d.numericTolerance = "   ";
    assert.match(serverError(d) ?? "", /tolérance doit être un nombre/i);
  });

  test("half-filled scenario matching pair is rejected even with two complete pairs", () => {
    for (const half of [
      { left: "Incomplete", right: "" },
      { left: "", right: "Incomplete" },
      { left: "   ", right: "Incomplete" },
    ]) {
      const d = emptyDraft("matching");
      d.stem = "Match";
      d.matchingLeftTexts = ["Left A", "Left B", half.left];
      d.matchingRightTexts = ["Right A", "Right B", half.right];
      assert.match(serverError(d) ?? "", /ne peut être vide/i);
    }
  });

  test("fully empty optional scenario matching pair remains safely omitted", () => {
    const d = emptyDraft("matching");
    d.stem = "Match";
    d.matchingLeftTexts = ["Left A", "  ", "Left B"];
    d.matchingRightTexts = ["Right A", "", "Right B"];
    const payload = draftToPayload(d);
    assert.equal(payload.choices.length, 4);
    assert.equal(serverError(d), null);
  });
});
