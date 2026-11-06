import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeOneQuestion } from "../../lib/grading";

// Synthetic numeric keys only, not live DGR questions or candidate records.
const grade = (spec: unknown, candidate: unknown) =>
  gradeOneQuestion("numeric", JSON.stringify(spec), JSON.stringify(candidate));

test("valid numeric keys preserve exact and explicitly configured tolerance grading", () => {
  assert.equal(grade({ mode: "numeric", value: 0, tolerance: 0 }, [0]).isCorrect, true);
  assert.equal(grade({ mode: "numeric", value: 12.5, tolerance: 0.1 }, ["12.55"]).isCorrect, true);
  assert.equal(grade({ mode: "numeric", value: 12.5, tolerance: 0.1 }, ["12.8"]).isCorrect, false);
});

test("legacy numeric answer values cannot grant marks through JavaScript coercion", () => {
  for (const value of [null, false, true, "0", "1", [], {}]) {
    assert.equal(grade({ mode: "numeric", value, tolerance: 0 }, [0]).isCorrect, false);
  }
  assert.equal(grade({ value: 0, tolerance: 0 }, [0]).isCorrect, false);
});

test("malformed and negative legacy numeric tolerances fail closed", () => {
  for (const tolerance of [null, false, true, "0", "1", -0.01, [], {}]) {
    assert.equal(grade({ mode: "numeric", value: 0, tolerance }, [0]).isCorrect, false);
  }
  assert.equal(grade({ mode: "numeric", value: 0 }, [0]).isCorrect, false);
});

test("scenario numeric subquestions obey the same integrity boundary", () => {
  const scenario = { mode: "scenario", subquestions: [
    { id: "s1", qtype: "numeric", points: 2, correctAnswer: { mode: "numeric", value: false, tolerance: 0 } },
    { id: "s2", qtype: "numeric", points: 3, correctAnswer: { mode: "numeric", value: 7, tolerance: 0 } },
  ] };
  const graded = gradeOneQuestion("scenario", JSON.stringify(scenario), JSON.stringify({ s1: [0], s2: [7] }));
  assert.deepEqual(graded, { pending: false, isCorrect: false, partialPoints: 3 });
});
