import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeOneQuestion } from "../../lib/grading";

// Synthetic answer keys only: no real DGR exam questions, answers, or evidence.
const grade = (spec: unknown, candidate: unknown) =>
  gradeOneQuestion("short_answer", JSON.stringify(spec), JSON.stringify(candidate));

test("exact short-answer preserves valid normalized text matching", () => {
  assert.equal(grade({ mode: "exact", acceptedAnswers: ["  Correct  "] }, ["correct"]).isCorrect, true);
  assert.equal(grade({ mode: "exact", acceptedAnswers: ["correct"] }, ["incorrect"]).isCorrect, false);
});

test("whitespace-only candidate input never matches a blank legacy key", () => {
  assert.equal(grade({ mode: "exact", acceptedAnswers: [""] }, [" "]).isCorrect, false);
  assert.equal(grade({ mode: "exact", acceptedAnswers: [" \t "] }, ["\n"]).isCorrect, false);
});

test("partially malformed, absent or non-array accepted-answer sets cannot award marks", () => {
  assert.equal(grade({ mode: "exact", acceptedAnswers: ["correct", " "] }, ["correct"]).isCorrect, false);
  assert.equal(grade({ mode: "exact", acceptedAnswers: ["correct", null] }, ["correct"]).isCorrect, false);
  assert.equal(grade({ mode: "exact", acceptedAnswers: "correct" }, ["correct"]).isCorrect, false);
  assert.equal(grade({ mode: "exact" }, ["correct"]).isCorrect, false);
  assert.equal(grade(null, ["correct"]).isCorrect, false);
});

test("manual review remains pending and scenario inherits blank-key fail-closed scoring", () => {
  assert.equal(grade({ mode: "manual" }, ["anything"]).pending, true);
  const scenario = { mode: "scenario", subquestions: [
    { id: "s1", qtype: "short_answer", points: 2, correctAnswer: { mode: "exact", acceptedAnswers: [""] } },
    { id: "s2", qtype: "short_answer", points: 3, correctAnswer: { mode: "exact", acceptedAnswers: ["valid"] } },
  ] };
  const result = gradeOneQuestion("scenario", JSON.stringify(scenario), JSON.stringify({ s1: [" "], s2: ["valid"] }));
  assert.deepEqual(result, { pending: false, isCorrect: false, partialPoints: 3 });
});
