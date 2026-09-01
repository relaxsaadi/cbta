import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  candidateCanDownloadIndividualReport,
  candidateCanSeePublishedResult,
  feedbackScheduleWriteError,
} from "../../lib/report-access";

const NOW_MS = Date.parse("2026-09-01T20:00:00.000Z");

describe("feedbackScheduleWriteError — server write configuration guard", () => {
  test("deferred feedback requires an explicit parseable close boundary", () => {
    for (const closeAt of [undefined, null, ""]) {
      assert.match(
        feedbackScheduleWriteError({ feedbackMode: "deferred", closeAt }) ?? "",
        /requiert une date de fermeture explicite/
      );
    }
    assert.match(
      feedbackScheduleWriteError({ feedbackMode: "deferred", closeAt: "not-a-date" }) ?? "",
      /Date de fermeture invalide/
    );
    assert.equal(
      feedbackScheduleWriteError({ feedbackMode: "deferred", closeAt: "2026-09-02T18:00:00.000Z" }),
      null
    );
  });

  test("immediate/none may omit close_at, but malformed non-empty dates are rejected", () => {
    assert.equal(feedbackScheduleWriteError({ feedbackMode: "immediate", closeAt: null }), null);
    assert.equal(feedbackScheduleWriteError({ feedbackMode: "none", closeAt: undefined }), null);
    assert.match(
      feedbackScheduleWriteError({ feedbackMode: "immediate", closeAt: "not-a-date" }) ?? "",
      /Date de fermeture invalide/
    );
  });

  test("unknown or forged feedback modes are rejected before persistence", () => {
    for (const feedbackMode of [undefined, null, "", "delayed", "forged"]) {
      assert.match(
        feedbackScheduleWriteError({ feedbackMode, closeAt: "2026-09-02T18:00:00.000Z" }) ?? "",
        /Mode de feedback invalide/
      );
    }
  });
});

describe("candidateCanSeePublishedResult — shared fail-closed feedback policy", () => {
  test("immediate feedback publishes only when show_result is explicitly enabled", () => {
    assert.equal(
      candidateCanSeePublishedResult({ showResult: 1, feedbackMode: "immediate", closeAt: null, nowMs: NOW_MS }),
      true
    );
    for (const showResult of [0, undefined, null, -1, 2]) {
      assert.equal(
        candidateCanSeePublishedResult({ showResult, feedbackMode: "immediate", closeAt: null, nowMs: NOW_MS }),
        false
      );
    }
  });

  test("deferred feedback stays hidden until a real close boundary has passed", () => {
    assert.equal(
      candidateCanSeePublishedResult({
        showResult: 1,
        feedbackMode: "deferred",
        closeAt: "2026-09-01T21:00:00.000Z",
        nowMs: NOW_MS,
      }),
      false
    );
    assert.equal(
      candidateCanSeePublishedResult({
        showResult: 1,
        feedbackMode: "deferred",
        closeAt: "2026-09-01T19:00:00.000Z",
        nowMs: NOW_MS,
      }),
      true
    );
  });

  test("deferred feedback with missing or malformed close_at fails closed", () => {
    for (const closeAt of [undefined, null, "", "not-a-date"]) {
      assert.equal(
        candidateCanSeePublishedResult({ showResult: 1, feedbackMode: "deferred", closeAt, nowMs: NOW_MS }),
        false,
        `close_at=${String(closeAt)} must not collapse deferred feedback into immediate disclosure`
      );
    }
  });

  test("none and forged feedback modes remain unpublished", () => {
    for (const feedbackMode of ["none", "delayed", "forged", "", undefined, null]) {
      assert.equal(
        candidateCanSeePublishedResult({
          showResult: 1,
          feedbackMode,
          closeAt: "2026-08-31T00:00:00.000Z",
          nowMs: NOW_MS,
        }),
        false,
        `feedback_mode=${String(feedbackMode)} must fail closed`
      );
    }
  });
});

describe("candidateCanDownloadIndividualReport — server-side PDF correction policy", () => {
  test("simple report is allowed when an immediate result is published, even if correct answers are hidden", () => {
    assert.equal(
      candidateCanDownloadIndividualReport({
        showResult: 1,
        showCorrectAnswers: 0,
        feedbackMode: "immediate",
        closeAt: null,
        level: "simple",
        nowMs: NOW_MS,
      }),
      true
    );
  });

  test("detailed report is denied when show_correct_answers is disabled", () => {
    assert.equal(
      candidateCanDownloadIndividualReport({
        showResult: 1,
        showCorrectAnswers: 0,
        feedbackMode: "immediate",
        closeAt: null,
        level: "detailed",
        nowMs: NOW_MS,
      }),
      false
    );
  });

  test("detailed report is allowed only when result and answer key are both explicitly publishable", () => {
    assert.equal(
      candidateCanDownloadIndividualReport({
        showResult: 1,
        showCorrectAnswers: 1,
        feedbackMode: "deferred",
        closeAt: "2026-09-01T19:00:00.000Z",
        level: "detailed",
        nowMs: NOW_MS,
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
          feedbackMode: "immediate",
          closeAt: null,
          level: "detailed",
          nowMs: NOW_MS,
        }),
        false,
        `show_correct_answers=${String(showCorrectAnswers)} must not disclose the answer key`
      );
    }
  });

  test("deferred + NULL blocks both simple and detailed PDF access", () => {
    for (const level of ["simple", "detailed"] as const) {
      assert.equal(
        candidateCanDownloadIndividualReport({
          showResult: 1,
          showCorrectAnswers: 1,
          feedbackMode: "deferred",
          closeAt: null,
          level,
          nowMs: NOW_MS,
        }),
        false
      );
    }
  });
});
