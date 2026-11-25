import assert from "node:assert/strict";
import { test } from "node:test";
import { candidateCanDownloadIndividualReport } from "../../lib/report-access";

const allowedDetailed = {
  showResult: 1,
  showCorrectAnswers: 1,
  stillDeferred: false,
  level: "detailed" as const,
  attemptStatus: "submitted",
  gradingState: "COMPLETE",
};

test("detailed candidate report requires the explicit answer-key release switch", () => {
  assert.equal(candidateCanDownloadIndividualReport({ ...allowedDetailed, showCorrectAnswers: 0 }), false);
  assert.equal(candidateCanDownloadIndividualReport({ ...allowedDetailed, showCorrectAnswers: undefined }), false);
});

test("detailed candidate report is denied while an attempt is in progress or abandoned", () => {
  assert.equal(candidateCanDownloadIndividualReport({ ...allowedDetailed, attemptStatus: "in_progress" }), false);
  assert.equal(candidateCanDownloadIndividualReport({ ...allowedDetailed, attemptStatus: "abandoned" }), false);
});

test("detailed candidate report is denied until manual grading is complete", () => {
  assert.equal(candidateCanDownloadIndividualReport({ ...allowedDetailed, gradingState: "AWAITING_MANUAL_REVIEW" }), false);
  assert.equal(candidateCanDownloadIndividualReport({ ...allowedDetailed, gradingState: null }), false);
});

test("detailed candidate report is denied while result visibility is disabled or deferred", () => {
  assert.equal(candidateCanDownloadIndividualReport({ ...allowedDetailed, showResult: 0 }), false);
  assert.equal(candidateCanDownloadIndividualReport({ ...allowedDetailed, stillDeferred: true }), false);
});

test("detailed candidate report is allowed only after terminal submission and completed grading", () => {
  assert.equal(candidateCanDownloadIndividualReport(allowedDetailed), true);
  assert.equal(candidateCanDownloadIndividualReport({ ...allowedDetailed, attemptStatus: "auto_submitted" }), true);
});

test("simple candidate report keeps the existing result-visibility policy", () => {
  assert.equal(candidateCanDownloadIndividualReport({
    ...allowedDetailed,
    level: "simple",
    showCorrectAnswers: 0,
    attemptStatus: "in_progress",
    gradingState: null,
  }), true);
});
