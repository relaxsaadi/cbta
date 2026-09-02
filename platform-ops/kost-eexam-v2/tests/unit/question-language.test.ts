import assert from "node:assert/strict";
import test from "node:test";
import { parseQuestionLanguage, trueFalseChoicesForLanguage } from "../../lib/question-language";

test("question language accepts only the controlled fr/en values", () => {
  assert.equal(parseQuestionLanguage("fr"), "fr");
  assert.equal(parseQuestionLanguage("EN"), "en");
  assert.throws(() => parseQuestionLanguage("de"), /seules les valeurs fr et en/);
  assert.throws(() => parseQuestionLanguage(""), /seules les valeurs fr et en/);
});

test("legacy callers may explicitly fall back to French without accepting forged values", () => {
  assert.equal(parseQuestionLanguage(null, "fr"), "fr");
  assert.equal(parseQuestionLanguage(undefined, "fr"), "fr");
  assert.throws(() => parseQuestionLanguage("xx", "fr"), /seules les valeurs fr et en/);
});

test("true/false labels are language-specific while answer keys remain stable", () => {
  assert.deepEqual(trueFalseChoicesForLanguage("fr"), [
    { key: "true", text: "Vrai" },
    { key: "false", text: "Faux" },
  ]);
  assert.deepEqual(trueFalseChoicesForLanguage("en"), [
    { key: "true", text: "True" },
    { key: "false", text: "False" },
  ]);
});
