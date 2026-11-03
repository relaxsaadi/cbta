import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const APP_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const MIGRATE = fileURLToPath(new URL("../../scripts/migrate.ts", import.meta.url));
const SCHEMA = readFileSync(new URL("../../lib/schema.sql", import.meta.url), "utf8");

const MODERN_QTYPE =
  "qtype TEXT NOT NULL DEFAULT 'mcq_single' CHECK (qtype IN ('mcq_single','mcq_multi','true_false','numeric','short_answer','matching','ordering','scenario'))";
const LEGACY_QTYPE =
  "qtype TEXT NOT NULL DEFAULT 'mcq_single' CHECK (qtype IN ('mcq_single','mcq_multi','true_false'))";

function runMigration(path: string): void {
  const run = spawnSync(process.execPath, ["--import", "tsx", MIGRATE], {
    cwd: APP_ROOT,
    env: { ...process.env, DB_PATH: path },
    encoding: "utf8",
    timeout: 60_000,
  });
  assert.equal(run.status, 0, `Migration failed: ${run.error ?? ""}\n${run.stdout}\n${run.stderr}`);
}

test("legacy qtype table rebuild reinstalls reviewed-question guards without changing evidence", () => {
  assert.ok(SCHEMA.includes(MODERN_QTYPE), "expected current qtype CHECK anchor");
  const dir = mkdtempSync(join(tmpdir(), "kost-legacy-qtype-trigger-"));
  const path = join(dir, "legacy.sqlite");
  try {
    const seed = new DatabaseSync(path);
    let questionId = 0;
    let reviewId = 0;
    try {
      seed.exec("PRAGMA foreign_keys = ON");
      // Same schema except for a historical 3-type questions CHECK; this
      // forces the actual two legacy table-rebuild branches in migrate.ts.
      seed.exec(SCHEMA.replace(MODERN_QTYPE, LEGACY_QTYPE));
      seed.prepare("INSERT INTO functions (code, label) VALUES ('7.2','Synthetic 7.2')").run();
      questionId = Number(seed.prepare(
        "INSERT INTO questions (kost_question_id,function_code,source_status) VALUES ('Q-SYNTH-LEGACY','7.2','DRAFT')"
      ).run().lastInsertRowid);
      reviewId = Number(seed.prepare(`
        INSERT INTO question_annual_reviews
          (question_id,review_year,applicable_edition,reviewer_name,review_date,decision)
        VALUES (?,2026,'Synthetic test edition','Test Reviewer','2026-10-01','A_REVOIR')
      `).run(questionId).lastInsertRowid);
      assert.ok(seed.prepare(
        "SELECT 1 FROM sqlite_master WHERE type='trigger' AND name='questions_reviewed_no_delete'"
      ).get(), "legacy DB starts with the protective trigger");
    } finally {
      seed.close();
    }

    runMigration(path);
    runMigration(path); // Reapplying the entire migration must be safe.

    const db = new DatabaseSync(path);
    try {
      const qtypeSql = (db.prepare(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='questions'"
      ).get() as { sql: string }).sql;
      assert.match(qtypeSql, /'scenario'/, "legacy qtype enum must be upgraded");

      for (const trigger of [
        "questions_reviewed_no_delete",
        "questions_reviewed_no_update_conflict",
        "questions_reviewed_no_insert_conflict",
      ]) {
        assert.ok(db.prepare(
          "SELECT 1 FROM sqlite_master WHERE type='trigger' AND name=?"
        ).get(trigger), `guard ${trigger} missing after table rebuild`);
      }

      const before = db.prepare("SELECT * FROM question_annual_reviews WHERE id=?").get(reviewId);
      assert.ok(before);
      db.exec("PRAGMA foreign_keys = OFF; PRAGMA recursive_triggers = OFF");
      assert.throws(
        () => db.prepare("DELETE FROM questions WHERE id=?").run(questionId),
        /reviewed question: DELETE denied/
      );
      assert.throws(
        () => db.prepare("UPDATE questions SET id=? WHERE id=?").run(questionId + 200, questionId),
        /reviewed question: UPDATE\/REPLACE denied/
      );
      assert.throws(
        () => db.prepare(
          "INSERT OR REPLACE INTO questions (id,kost_question_id,function_code) VALUES (?,?, '7.2')"
        ).run(questionId + 100, "Q-SYNTH-LEGACY"),
        /reviewed question: REPLACE denied/
      );
      assert.deepEqual(db.prepare("SELECT * FROM question_annual_reviews WHERE id=?").get(reviewId), before);
      assert.ok(db.prepare("SELECT id FROM questions WHERE id=?").get(questionId));
    } finally {
      db.close();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
