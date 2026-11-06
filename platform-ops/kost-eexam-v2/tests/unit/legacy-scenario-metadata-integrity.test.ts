import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeOneQuestion } from "../../lib/grading";

// Synthetic identities only; never production exam content.
const single = (id: string, points: number, correctAnswer: unknown = ["A"]) => ({
  id, qtype: "mcq_single", points, correctAnswer,
});
const scenario = (subquestions: unknown, given: unknown, mode = "scenario") =>
  gradeOneQuestion("scenario", JSON.stringify({ mode, context: "Synthetic exercise", subquestions }),
    given === null ? null : JSON.stringify(given));
const denied = { pending: false, isCorrect: false, partialPoints: 0 };

test("valid scenarios preserve exact and partial auto-grading", () => {
  assert.deepEqual(scenario([single("sq1", 2), single("sq2", 3)], { sq1: ["A"], sq2: ["A"] }),
    { pending: false, isCorrect: true, partialPoints: 5 });
  assert.deepEqual(scenario([single("sq1", 2), single("sq2", 3)], { sq1: ["A"], sq2: ["B"] }),
    { pending: false, isCorrect: false, partialPoints: 2 });
});

test("duplicate historical subquestion identities cannot double-credit one answer", () => {
  assert.deepEqual(scenario([single("sq1", 2), single("sq1", 3)], { sq1: ["A"] }), denied);
});

test("invalid scenario points fail closed before any partial marks", () => {
  for (const badPoints of [-2, 0, null, "2"]) {
    assert.deepEqual(scenario([single("sq1", 3), single("sq2", badPoints as number)], { sq1: ["A"], sq2: ["A"] }), denied);
  }
  assert.deepEqual(scenario([single("sq1", 1e308), single("sq2", 1e308)],
    { sq1: ["A"], sq2: ["A"] }), denied);
});

test("nested and unsupported historical subquestion types never earn scenario credit", () => {
  for (const badType of ["scenario", "unsupported_historical_type"]) {
    assert.deepEqual(scenario([single("sq1", 2), {
      id: "sq2", qtype: badType, points: 3, correctAnswer: ["A"],
    }], { sq1: ["A"], sq2: ["A"] }), denied);
  }
});

test("missing, empty or malformed historical scenario lists fail closed without throwing", () => {
  for (const bad of [null, {}, [], ["invalid"], [null]]) {
    assert.deepEqual(scenario(bad, {}), denied);
  }
  assert.deepEqual(scenario([single("sq1", 1)], { sq1: ["A"] }, "other"), denied);
});

test("missing identity or answer key cannot reach subquestion grading", () => {
  assert.deepEqual(scenario([{ qtype: "mcq_single", points: 2, correctAnswer: ["A"] }],
    { sq1: ["A"] }), denied);
  assert.deepEqual(scenario([{ id: "sq1", qtype: "numeric", points: 2 }], { sq1: ["2"] }), denied);
});

test("valid scenario manual subquestion stays pending", () => {
  const manual = { id: "sq1", qtype: "short_answer", points: 2, correctAnswer: { mode: "manual" } };
  assert.deepEqual(scenario([manual], null), { pending: true, isCorrect: false });
});
