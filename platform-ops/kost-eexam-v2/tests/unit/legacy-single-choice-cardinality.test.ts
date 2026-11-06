import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeOneQuestion } from "../../lib/grading";

// Synthetic answer identities only: no real KOST or DGR bank content.
const grade = (qtype: string, key: unknown, supplied: unknown) =>
  gradeOneQuestion(qtype, JSON.stringify(key), JSON.stringify(supplied));

test("valid single-choice and true/false submissions still earn credit", () => {
  assert.deepEqual(grade("mcq_single", ["A"], ["A"]), { pending: false, isCorrect: true });
  assert.deepEqual(grade("true_false", ["T"], ["T"]), { pending: false, isCorrect: true });
  assert.equal(grade("mcq_single", ["A"], ["B"]).isCorrect, false);
});

test("a malformed legacy single-choice key with multiple correct choices never earns marks", () => {
  assert.equal(grade("mcq_single", ["A", "B"], ["A", "B"]).isCorrect, false);
  assert.equal(grade("mcq_single", [], []).isCorrect, false);
});

test("a malformed legacy true/false key with both choices never earns marks", () => {
  assert.equal(grade("true_false", ["T", "F"], ["T", "F"]).isCorrect, false);
});

test("a single-choice candidate cannot submit extra contradictory choices", () => {
  assert.equal(grade("mcq_single", ["A"], ["A", "B"]).isCorrect, false);
  assert.equal(grade("true_false", ["T"], ["T", "F"]).isCorrect, false);
});

test("multi-choice still accepts a complete valid multi-key answer set", () => {
  assert.equal(grade("mcq_multi", ["A", "B"], ["B", "A"]).isCorrect, true);
  assert.equal(grade("mcq_multi", ["A", "B"], ["A"]).isCorrect, false);
});

test("unknown historical/scenario subquestion types are not silently graded as MCQ", () => {
  assert.equal(grade("unsupported_historical_type", ["A"], ["A"]).isCorrect, false);
  const scenario = {
    mode: "scenario",
    subquestions: [
      { id: "sq1", qtype: "unsupported_historical_type", points: 2, correctAnswer: ["A"] },
    ],
  };
  assert.deepEqual(grade("scenario", scenario, { sq1: ["A"] }), {
    pending: false,
    isCorrect: false,
    partialPoints: 0,
  });
});

test("scenario single-choice subquestions inherit the cardinality guard", () => {
  const scenario = {
    mode: "scenario",
    subquestions: [
      { id: "sq1", qtype: "mcq_single", points: 2, correctAnswer: ["A", "B"] },
      { id: "sq2", qtype: "true_false", points: 3, correctAnswer: ["T", "F"] },
    ],
  };
  assert.deepEqual(grade("scenario", scenario, {
    sq1: ["A", "B"],
    sq2: ["T", "F"],
  }), { pending: false, isCorrect: false, partialPoints: 0 });
});
