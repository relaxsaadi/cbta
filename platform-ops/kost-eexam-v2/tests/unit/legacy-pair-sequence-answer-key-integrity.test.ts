import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeOneQuestion } from "../../lib/grading";
import { validateQuestionAuthoring } from "../../lib/questions";

// Synthetic answer identities only: no real KOST/DGR question text or keys.
const correctPairs = {
  mode: "matching" as const,
  pairs: [{ left: "L1", right: "R1" }, { left: "L2", right: "R2" }],
};
const gradeMatching = (key: unknown, given: unknown) =>
  gradeOneQuestion("matching", JSON.stringify(key), JSON.stringify(given));
const gradeOrdering = (key: unknown, given: unknown) =>
  gradeOneQuestion("ordering", JSON.stringify(key), JSON.stringify(given));

test("matching still gives full credit for one-to-one complete correct pairings", () => {
  assert.deepEqual(gradeMatching(correctPairs, ["L2:R2", "L1:R1"]), {
    pending: false, isCorrect: true,
  });
});

test("corrupted matching key with repeated left identity cannot give full marks", () => {
  const repeatedLeft = { mode: "matching", pairs: [
    { left: "L1", right: "R1" }, { left: "L1", right: "R1" },
  ] };
  // Pre-fix grader incorrectly awarded full marks for this contradictory
  // key and an irrelevant second candidate pair.
  assert.equal(gradeMatching(repeatedLeft, ["L1:R1", "L2:R2"]).isCorrect, false);
});

test("corrupted matching key with repeated right identity cannot give full marks", () => {
  const repeatedRight = { mode: "matching", pairs: [
    { left: "L1", right: "R1" }, { left: "L2", right: "R1" },
  ] };
  assert.equal(gradeMatching(repeatedRight, ["L1:R1", "L2:R1"]).isCorrect, false);
});

test("invalid historical matching shapes fail closed", () => {
  const given = ["L1:R1", "L2:R2"];
  for (const key of [
    { mode: "ordering", pairs: correctPairs.pairs },
    { mode: "matching", pairs: "invalid" },
    { mode: "matching", pairs: [{ left: "L1", right: "R1" }] },
    { mode: "matching", pairs: [{ left: "L1", right: "" }, { left: "L2", right: "R2" }] },
    { mode: "matching", pairs: [null, { left: "L2", right: "R2" }] },
  ]) {
    assert.equal(gradeMatching(key, given).isCorrect, false, JSON.stringify(key));
  }
});

test("authoring rejects ambiguous duplicate right identity before persistence", () => {
  const choices = [
    { key: "L1", text: "Left 1" }, { key: "L2", text: "Left 2" },
    { key: "R1", text: "Right 1" }, { key: "R2", text: "Right 2" },
  ];
  assert.equal(validateQuestionAuthoring("matching", choices, correctPairs), null);
  const invalid = { mode: "matching" as const, pairs: [
    { left: "L1", right: "R1" }, { left: "L2", right: "R1" },
  ] };
  assert.match(validateQuestionAuthoring("matching", choices, invalid) ?? "", /droite/);
});

test("ordering still grades valid exact sequence and rejects malformed legacy keys", () => {
  const valid = { mode: "ordering", sequence: ["S1", "S2"] };
  assert.equal(gradeOrdering(valid, ["S1", "S2"]).isCorrect, true);
  assert.equal(gradeOrdering(valid, ["S2", "S1"]).isCorrect, false);
  for (const invalid of [
    { mode: "ordering", sequence: ["S1", "S1"] },
    { mode: "ordering", sequence: ["S1", ""] },
    { mode: "ordering", sequence: ["S1"] },
    { mode: "ordering", sequence: ["S1", 2] },
    { mode: "matching", sequence: ["S1", "S2"] },
    { mode: "ordering", sequence: null },
  ]) {
    const supplied = Array.isArray(invalid.sequence) ? invalid.sequence : ["S1", "S2"];
    assert.equal(gradeOrdering(invalid, supplied).isCorrect, false, JSON.stringify(invalid));
  }
});

test("scenario subquestions inherit fail-closed malformed matching/ordering keys", () => {
  const scenario = {
    mode: "scenario",
    subquestions: [
      { id: "sq1", qtype: "matching", points: 2, correctAnswer: {
        mode: "matching", pairs: [{ left: "L1", right: "R1" }, { left: "L1", right: "R1" }],
      } },
      { id: "sq2", qtype: "ordering", points: 3, correctAnswer: {
        mode: "ordering", sequence: ["S1", "S1"],
      } },
    ],
  };
  assert.deepEqual(
    gradeOneQuestion("scenario", JSON.stringify(scenario), JSON.stringify({
      sq1: ["L1:R1", "L2:R2"], sq2: ["S1", "S1"],
    })),
    { pending: false, isCorrect: false, partialPoints: 0 }
  );
});
