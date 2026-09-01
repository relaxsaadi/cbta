import assert from "node:assert/strict";
import test from "node:test";
import {
  globalExamDateLabel,
  globalExamMentionLabel,
  globalExamResultLabel,
} from "../../lib/global-exam-report";

test("global exam date never fabricates an exam occurrence before anyone starts", () => {
  assert.equal(globalExamDateLabel([null, null]), "Non commencé");
});

test("global exam date uses the earliest real candidate start", () => {
  assert.equal(
    globalExamDateLabel(["2026-09-03T10:00:00", null, "2026-09-02T10:00:00"]),
    "02/09/2026"
  );
});

test("submitted attempt awaiting manual review is never labelled success or failure", () => {
  const state = { attempt_status: "submitted", passed: null, score_100: 70 };
  assert.equal(globalExamResultLabel(state), "Envoyé — en attente de correction");
  assert.deepEqual(globalExamMentionLabel(state), {
    text: "EN ATTENTE DE CORRECTION",
    kind: "pending",
  });
});

test("only finalized passed values produce success/failure mentions", () => {
  assert.deepEqual(
    globalExamMentionLabel({ attempt_status: "submitted", passed: 1, score_100: 90 }),
    { text: "RÉUSSITE", kind: "success" }
  );
  assert.deepEqual(
    globalExamMentionLabel({ attempt_status: "auto_submitted", passed: 0, score_100: 55 }),
    { text: "ÉCHEC", kind: "fail" }
  );
  assert.deepEqual(
    globalExamMentionLabel({ attempt_status: "in_progress", passed: null, score_100: null }),
    { text: "NON FINALISÉ", kind: "none" }
  );
});
