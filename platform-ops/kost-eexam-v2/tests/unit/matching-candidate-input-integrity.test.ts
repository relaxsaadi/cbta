import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeOneQuestion } from "../../lib/grading";

// Synthetic keys only; this file contains no production DGR question/answer.
const spec = {
  mode: "matching",
  pairs: [{ left: "L1", right: "R1" }, { left: "L2", right: "R2" }],
};
const grade = (answer: unknown) =>
  gradeOneQuestion("matching", JSON.stringify(spec), JSON.stringify(answer));

test("matching accepts one complete unambiguous correct pair per left key", () => {
  assert.deepEqual(grade(["L2:R2", "L1:R1"]), { pending: false, isCorrect: true });
});

test("matching denies duplicated left keys even when later values overwrite a wrong answer", () => {
  // Old Map-based grader: duplicate L1 was silently overwritten, Map.size
  // matched the two official pairs, and the candidate earned full credit.
  assert.deepEqual(grade(["L1:R2", "L1:R1", "L2:R2"]), { pending: false, isCorrect: false });
  assert.deepEqual(grade(["L1:R1", "L1:R1", "L2:R2"]), { pending: false, isCorrect: false });
});

test("matching denies malformed separators, incomplete sets and conflicting keys", () => {
  for (const answer of [
    ["L1:R1:ignored", "L2:R2"],
    ["L1:R1", "L2:"],
    ["L1:R1"],
    ["L1:R1", "L1:R2"],
    ["L1:R1", null],
  ]) {
    assert.equal(grade(answer).isCorrect, false, JSON.stringify(answer));
  }
});

test("scenario matching subquestions inherit the same fail-closed grading rule", () => {
  const scenario = {
    mode: "scenario",
    subquestions: [{ id: "sq1", qtype: "matching", points: 2, correctAnswer: spec }],
  };
  const wrong = gradeOneQuestion(
    "scenario",
    JSON.stringify(scenario),
    JSON.stringify({ sq1: ["L1:R2", "L1:R1", "L2:R2"] })
  );
  assert.deepEqual(wrong, { pending: false, isCorrect: false, partialPoints: 0 });
  const right = gradeOneQuestion(
    "scenario",
    JSON.stringify(scenario),
    JSON.stringify({ sq1: ["L1:R1", "L2:R2"] })
  );
  assert.deepEqual(right, { pending: false, isCorrect: true, partialPoints: 2 });
});
