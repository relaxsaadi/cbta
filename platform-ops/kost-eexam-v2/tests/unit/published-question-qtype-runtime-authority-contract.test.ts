import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const SCHEMA = readFileSync(new URL("../../lib/schema.sql", import.meta.url), "utf8");
const MIGRATE = readFileSync(new URL("../../scripts/migrate.ts", import.meta.url), "utf8");
const ASSESSMENTS = readFileSync(new URL("../../lib/assessments.ts", import.meta.url), "utf8");
const ATTEMPTS = readFileSync(new URL("../../lib/attempts.ts", import.meta.url), "utf8");
const GRADING = readFileSync(new URL("../../lib/grading.ts", import.meta.url), "utf8");
const MANUAL = readFileSync(new URL("../../lib/manual-grading.ts", import.meta.url), "utf8");
const QTYPE_INTEGRITY = readFileSync(
  new URL("../../lib/published-question-qtype-integrity.ts", import.meta.url),
  "utf8"
);

function exportedFunctionBlock(source: string, name: string): string {
  const start = source.indexOf(`export function ${name}`);
  assert.notEqual(start, -1, `exported function ${name} must exist`);
  const next = source.indexOf("\nexport function ", start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

function assertPublishedRuntimeUsesSnapshot(source: string, functionName: string): void {
  const block = exportedFunctionBlock(source, functionName);
  assert.match(
    block,
    /qtype_snapshot/,
    `${functionName} must use the immutable published qtype snapshot`
  );
  assert.doesNotMatch(
    block,
    /q\.qtype/,
    `${functionName} must not read mutable questions.qtype for a published assessment`
  );
  assert.doesNotMatch(
    block,
    /JOIN\s+questions\s+q\b/i,
    `${functionName} must not join questions merely to recover qtype for published history`
  );
}

test("#58 published snapshot schema and migration persist qtype_snapshot explicitly", () => {
  const snapshotTable = SCHEMA.slice(
    SCHEMA.indexOf("CREATE TABLE IF NOT EXISTS assessment_question_snapshots"),
    SCHEMA.indexOf("CREATE TABLE IF NOT EXISTS assessment_assignments")
  );
  assert.match(snapshotTable, /qtype_snapshot\s+TEXT/);
  assert.match(
    MIGRATE,
    /table:\s*["']assessment_question_snapshots["'][\s\S]*?column:\s*["']qtype_snapshot["']/,
    "existing databases must receive the additive qtype_snapshot column"
  );

  const publish = exportedFunctionBlock(ASSESSMENTS, "publishAssessment");
  assert.match(
    publish,
    /INSERT INTO assessment_question_snapshots[\s\S]*qtype_snapshot/,
    "publishAssessment must persist qtype_snapshot in the same publication transaction"
  );
});

test("#58 candidate resume/render and published preview use snapshot qtype, not live question metadata", () => {
  assertPublishedRuntimeUsesSnapshot(ATTEMPTS, "getAttemptQuestions");
  assertPublishedRuntimeUsesSnapshot(ATTEMPTS, "getPreviewQuestions");

  // Authoring/test-preview is intentionally current-bank behavior and may
  // continue to read questions.qtype. This contract is only for published
  // historical assessment paths.
  const authoringPreview = exportedFunctionBlock(ATTEMPTS, "getQuestionTestPreview");
  assert.match(authoringPreview, /q\.qtype/);
});

test("#58 automatic grading is bound to the published qtype snapshot", () => {
  assertPublishedRuntimeUsesSnapshot(GRADING, "gradeAttempt");
});

test("#58 all manual-grading routing and finalization paths use published qtype_snapshot", () => {
  for (const name of [
    "listPendingManualGrading",
    "listGradedManually",
    "submitManualGrade",
    "finalizeManualGradingIfComplete",
    "listPendingScenarioSubquestions",
    "listGradedScenarioSubquestions",
    "submitScenarioSubgrade",
  ]) {
    assertPublishedRuntimeUsesSnapshot(MANUAL, name);
  }
});

test("#58 migration logic must explicitly govern snapshot qtype and preserve unknown legacy state", () => {
  assert.match(QTYPE_INTEGRITY, /qtype_snapshot/);
  assert.match(QTYPE_INTEGRITY, /LEGACY_QTYPE_UNKNOWN/);
});
