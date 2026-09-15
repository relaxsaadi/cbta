import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { candidateCanDownloadIndividualReport } from "../../lib/report-access";

describe("candidateCanDownloadIndividualReport — server-side PDF correction policy", () => {
  test("simple report is allowed when the result is published, even if correct answers are hidden", () => {
    assert.equal(
      candidateCanDownloadIndividualReport({
        showResult: 1,
        showCorrectAnswers: 0,
        stillDeferred: false,
        level: "simple",
      }),
      true
    );
  });

  test("detailed report is denied when show_correct_answers is disabled", () => {
    assert.equal(
      candidateCanDownloadIndividualReport({
        showResult: 1,
        showCorrectAnswers: 0,
        stillDeferred: false,
        level: "detailed",
      }),
      false
    );
  });

  test("detailed report is allowed only when show_correct_answers is explicitly 1", () => {
    assert.equal(
      candidateCanDownloadIndividualReport({
        showResult: 1,
        showCorrectAnswers: 1,
        stillDeferred: false,
        level: "detailed",
      }),
      true
    );
  });

  test("missing or forged answer-key settings fail closed for detailed reports", () => {
    for (const showCorrectAnswers of [undefined, null, -1, 2]) {
      assert.equal(
        candidateCanDownloadIndividualReport({
          showResult: 1,
          showCorrectAnswers,
          stillDeferred: false,
          level: "detailed",
        }),
        false,
        `show_correct_answers=${String(showCorrectAnswers)} must not disclose the answer key`
      );
    }
  });

  test("result visibility and deferred-release controls remain mandatory for every candidate report", () => {
    assert.equal(
      candidateCanDownloadIndividualReport({
        showResult: 0,
        showCorrectAnswers: 1,
        stillDeferred: false,
        level: "detailed",
      }),
      false
    );
    assert.equal(
      candidateCanDownloadIndividualReport({
        showResult: 1,
        showCorrectAnswers: 1,
        stillDeferred: true,
        level: "detailed",
      }),
      false
    );
    assert.equal(
      candidateCanDownloadIndividualReport({
        showResult: 0,
        showCorrectAnswers: 0,
        stillDeferred: false,
        level: "simple",
      }),
      false
    );
  });
});
