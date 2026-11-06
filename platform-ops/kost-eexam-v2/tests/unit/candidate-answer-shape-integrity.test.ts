import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeOneQuestion } from "../../lib/grading";

// All content is synthetic; no operational or regulatory exam keys.
const grade = (qtype: string, expected: unknown, given: unknown) =>
  gradeOneQuestion(qtype, JSON.stringify(expected), JSON.stringify(given));

test("true/false grades only the literal string key, not a JSON boolean", () => {
  assert.equal(grade("true_false", ["false"], ["false"]).isCorrect, true);
  assert.equal(grade("true_false", ["false"], [false]).isCorrect, false);
  assert.equal(grade("true_false", ["true"], [true]).isCorrect, false);
});

test("MCQ preserves valid string-key sets but rejects type coercion and duplicates", () => {
  assert.equal(grade("mcq_single", ["A"], ["A"]).isCorrect, true);
  assert.equal(grade("mcq_multi", ["A", "B"], ["B", "A"]).isCorrect, true);
  assert.equal(grade("mcq_single", ["null"], [null]).isCorrect, false);
  assert.equal(grade("mcq_single", ["[object Object]"], [{}]).isCorrect, false);
  assert.equal(grade("mcq_multi", ["A", "A"], ["A", "A"]).isCorrect, false);
  assert.equal(grade("mcq_multi", ["A", "B"], ["A", "B", "B"]).isCorrect, false);
});

test("unanswered malformed legacy answer keys never receive full marks", () => {
  assert.equal(grade("mcq_single", [], []).isCorrect, false);
  assert.equal(grade("mcq_single", null, null).isCorrect, false);
});

test("exact short answer requires one actual candidate text value", () => {
  const literal = { mode: "exact", acceptedAnswers: ["null", "false", "[object Object]"] };
  assert.equal(grade("short_answer", literal, ["null"]).isCorrect, true);
  assert.equal(grade("short_answer", literal, [null]).isCorrect, false);
  assert.equal(grade("short_answer", literal, [false]).isCorrect, false);
  assert.equal(grade("short_answer", literal, [{}]).isCorrect, false);
});

test("ordering compares literal string keys without coercion", () => {
  const spec = { mode: "ordering", sequence: ["1", "2"] };
  assert.equal(grade("ordering", spec, ["1", "2"]).isCorrect, true);
  assert.equal(grade("ordering", spec, [1, 2]).isCorrect, false);
  assert.equal(grade("ordering", { mode: "ordering", sequence: [] }, []).isCorrect, false);
});

test("scenario subquestions inherit fail-closed candidate JSON shapes", () => {
  const scenario = {
    mode: "scenario",
    subquestions: [
      { id: "tf", qtype: "true_false", points: 1, correctAnswer: ["false"] },
      { id: "sa", qtype: "short_answer", points: 1, correctAnswer: { mode: "exact", acceptedAnswers: ["null"] } },
    ],
  };
  assert.deepEqual(
    grade("scenario", scenario, { tf: ["false"], sa: ["null"] }),
    { pending: false, isCorrect: true, partialPoints: 2 }
  );
  assert.deepEqual(
    grade("scenario", scenario, { tf: [false], sa: [null] }),
    { pending: false, isCorrect: false, partialPoints: 0 }
  );
});
