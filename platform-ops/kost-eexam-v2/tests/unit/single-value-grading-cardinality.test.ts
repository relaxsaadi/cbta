import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeOneQuestion } from "../../lib/grading";

// All inputs are synthetic. This file contains no actual examination content.
const grade = (qtype: string, spec: unknown, answer: unknown) =>
  gradeOneQuestion(qtype, JSON.stringify(spec), JSON.stringify(answer));

const numeric = { mode: "numeric", value: 0, tolerance: 0 };
const exact = { mode: "exact", acceptedAnswers: ["alpha"] };

test("numeric grants zero only for one explicit correct response", () => {
  assert.deepEqual(grade("numeric", numeric, ["0"]), { pending: false, isCorrect: true });
  assert.deepEqual(grade("numeric", numeric, [0]), { pending: false, isCorrect: true });
  assert.equal(grade("numeric", numeric, []).isCorrect, false);
  assert.equal(grade("numeric", numeric, ["0", "99"]).isCorrect, false);
  assert.equal(grade("numeric", numeric, ["0", "0"]).isCorrect, false);
});

test("exact short answer rejects duplicate or conflicting extra candidate values", () => {
  assert.deepEqual(grade("short_answer", exact, ["alpha"]), { pending: false, isCorrect: true });
  assert.equal(grade("short_answer", exact, []).isCorrect, false);
  assert.equal(grade("short_answer", exact, ["alpha", "beta"]).isCorrect, false);
  assert.equal(grade("short_answer", exact, ["alpha", "alpha"]).isCorrect, false);
});

test("scenario numeric and exact short subquestions inherit single-value cardinality", () => {
  const scenario = {
    mode: "scenario",
    subquestions: [
      { id: "n", qtype: "numeric", points: 1, correctAnswer: numeric },
      { id: "s", qtype: "short_answer", points: 1, correctAnswer: exact },
    ],
  };
  assert.deepEqual(
    grade("scenario", scenario, { n: ["0"], s: ["alpha"] }),
    { pending: false, isCorrect: true, partialPoints: 2 }
  );
  assert.deepEqual(
    grade("scenario", scenario, { n: ["0", "999"], s: ["alpha", "beta"] }),
    { pending: false, isCorrect: false, partialPoints: 0 }
  );
});

test("manual short-answer review remains pending under existing policy", () => {
  const manual = { mode: "manual" };
  assert.deepEqual(grade("short_answer", manual, ["essay"]), { pending: true, isCorrect: false });
});
