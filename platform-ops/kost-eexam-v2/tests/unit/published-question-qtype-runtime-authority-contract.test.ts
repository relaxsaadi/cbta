import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

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
    /\bq\.qtype\b/,
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
  const block = exportedFunctionBlock(GRADING, "gradeAttempt");
  assert.match(block, /const validatedRows = rows\.map/);
  assert.ok(block.indexOf("const validatedRows") < block.indexOf("const upsertGraded"),
    "validate the entire historical batch before creating grade writes");
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

test("#58 manual finalization blocks unknown/invalid historical types and missing answers regardless of grading flag", () => {
  const block = exportedFunctionBlock(MANUAL, "finalizeManualGradingIfComplete");
  const sqlMatch = block.match(/const stillPending = db\s*\.prepare\(\s*`([\s\S]*?)`\s*\)\s*\.get\(attemptId\)/);
  assert.ok(sqlMatch, "manual finalization must contain a prefinalization database gate");
  const sql = sqlMatch[1]!;
  assert.match(sql, /s\.qtype_snapshot IS NULL/);
  assert.match(sql, /s\.qtype_snapshot NOT IN/);
  assert.match(sql, /aa\.id IS NULL/);
  assert.match(sql, /OR aa\.is_correct IS NULL/);
  assert.ok(block.indexOf("const stillPending") < block.indexOf("const result ="),
    "the historical integrity gate must run before any final result is computed");

  // Execute the actual embedded SQL against adversarial legacy snapshots:
  // a previously graded but unproven historical type must never finalize.
  const db = new DatabaseSync(":memory:");
  try {
    db.exec(`
      CREATE TABLE assessment_question_snapshots (id INTEGER PRIMARY KEY, qtype_snapshot TEXT);
      CREATE TABLE attempt_questions (id INTEGER PRIMARY KEY, attempt_id INTEGER NOT NULL, snapshot_id INTEGER NOT NULL);
      CREATE TABLE attempt_answers (id INTEGER PRIMARY KEY, attempt_question_id INTEGER, is_correct INTEGER);
    `);
    const cases: Array<[number, string | null, number | null, boolean]> = [
      [1, null, 1, true],            // old graded row, unknown original qtype
      [2, "wrong_type", 1, true],    // old graded row, invalid original qtype
      [3, "short_answer", null, true], // still needs manual review
      [4, "mcq_single", null, true],   // partially graded automatic row
      [5, "short_answer", 1, false],   // manually graded and valid
      [6, "scenario", 1, false],       // fully manually graded scenario
      [7, "mcq_single", null, true],   // missing answer row, incomplete data
      [8, "mcq_single", 0, false],     // correctly graded wrong answer (zero points)
    ];
    for (const [id, qtype, grade] of cases) {
      db.prepare("INSERT INTO assessment_question_snapshots (id, qtype_snapshot) VALUES (?, ?)").run(id, qtype);
      db.prepare("INSERT INTO attempt_questions (id, attempt_id, snapshot_id) VALUES (?, ?, ?)").run(id, id, id);
      if (id !== 7) {
        db.prepare("INSERT INTO attempt_answers (id, attempt_question_id, is_correct) VALUES (?, ?, ?)").run(id, id, grade);
      }
    }
    for (const [id, , , shouldBlock] of cases) {
      assert.equal(Boolean(db.prepare(sql).get(id)), shouldBlock, `attempt ${id} readiness gate`);
    }
  } finally {
    db.close();
  }
});

test("#58 migration logic must explicitly govern snapshot qtype and preserve unknown legacy state", () => {
  assert.match(QTYPE_INTEGRITY, /qtype_snapshot/);
  assert.match(QTYPE_INTEGRITY, /LEGACY_QTYPE_UNKNOWN/);
});
