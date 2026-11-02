import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

const SCHEMA = readFileSync(new URL("../../lib/schema.sql", import.meta.url), "utf8");

function openDb(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON");
  // A separate SQLite maintenance client may disable recursive triggers.
  db.exec("PRAGMA recursive_triggers = OFF");
  db.exec(SCHEMA);
  return db;
}

function makeQuestion(db: DatabaseSync, key: string): number {
  db.prepare("INSERT OR IGNORE INTO functions (code, label) VALUES ('7.2', 'Function 7.2')").run();
  return Number(db.prepare(
    "INSERT INTO questions (kost_question_id, function_code, source_status) VALUES (?, '7.2', 'DRAFT')"
  ).run(key).lastInsertRowid);
}

function addReview(db: DatabaseSync, questionId: number): number {
  return Number(db.prepare(`
    INSERT INTO question_annual_reviews
      (question_id, review_year, applicable_edition, reviewer_name, review_date, decision)
    VALUES (?, 2026, 'Synthetic 2026 test source', 'Test Reviewer', '2026-10-01', 'A_REVOIR')
  `).run(questionId).lastInsertRowid);
}

function getReview(db: DatabaseSync, id: number): unknown {
  return db.prepare("SELECT * FROM question_annual_reviews WHERE id = ?").get(id);
}

function assertReviewImmutable(db: DatabaseSync, questionId: number, reviewId: number): void {
  const before = getReview(db, reviewId);
  assert.ok(before);

  assert.throws(
    () => db.prepare("UPDATE question_annual_reviews SET reviewer_name = 'tampered' WHERE id = ?").run(reviewId),
    /question_annual_reviews is append-only: UPDATE denied/
  );
  assert.throws(
    () => db.prepare("DELETE FROM question_annual_reviews WHERE id = ?").run(reviewId),
    /question_annual_reviews is append-only: DELETE denied/
  );
  assert.throws(
    () => db.prepare(`
      INSERT OR REPLACE INTO question_annual_reviews
        (id, question_id, review_year, applicable_edition, reviewer_name, review_date, decision)
      VALUES (?, ?, 2026, 'Synthetic 2026 test source', 'tampered', '2026-10-01', 'REVUE_TERMINEE')
    `).run(reviewId, questionId),
    /question_annual_reviews is append-only: REPLACE denied/
  );
  assert.throws(
    () => db.prepare("UPDATE OR REPLACE question_annual_reviews SET decision = 'REVUE_TERMINEE' WHERE id = ?").run(reviewId),
    /question_annual_reviews is append-only: UPDATE denied/
  );

  // Existing reviews must survive parent deletes, including CASCADE and
  // primary-key/unique-conflict REPLACE on a direct SQL maintenance client.
  assert.throws(
    () => db.prepare("DELETE FROM questions WHERE id = ?").run(questionId),
    /question_annual_reviews is append-only: DELETE denied/
  );
  assert.throws(
    () => db.prepare(`
      INSERT OR REPLACE INTO questions (id, kost_question_id, function_code)
      VALUES (?, ?, '7.2')
    `).run(questionId + 1000, "Q-SYNTH-REVIEWED"),
    /question_annual_reviews is append-only: DELETE denied|UNIQUE constraint failed/
  );
  assert.deepEqual(getReview(db, reviewId), before);
  assert.equal(
    (db.prepare("SELECT COUNT(*) AS n FROM questions WHERE id = ?").get(questionId) as { n: number }).n,
    1
  );
}

test("annual review is append-only, survives parent-deletion attempts, and still permits new rows", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-annual-review-immutable-"));
  const db = openDb(join(dir, "review.sqlite"));
  try {
    const reviewed = makeQuestion(db, "Q-SYNTH-REVIEWED");
    const reviewId = addReview(db, reviewed);
    assertReviewImmutable(db, reviewed, reviewId);

    const secondId = addReview(db, reviewed);
    assert.ok(secondId > reviewId, "correction must append a new review, not mutate the old one");
    assert.equal(
      (db.prepare("SELECT COUNT(*) AS n FROM question_annual_reviews WHERE question_id = ?").get(reviewed) as { n: number }).n,
      2
    );

    const neverReviewed = makeQuestion(db, "Q-SYNTH-UNREVIEWED");
    assert.equal(db.prepare("DELETE FROM questions WHERE id = ?").run(neverReviewed).changes, 1);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("schema reapplication installs guards for legacy annual reviews, and backup retains them", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-annual-review-migrate-"));
  const source = join(dir, "source.sqlite");
  const backup = join(dir, "restored.sqlite");
  const db = openDb(source);
  let reviewed = 0;
  let reviewId = 0;
  try {
    reviewed = makeQuestion(db, "Q-SYNTH-LEGACY");
    reviewId = addReview(db, reviewed);

    db.exec("DROP TRIGGER IF EXISTS question_annual_reviews_no_update");
    db.exec("DROP TRIGGER IF EXISTS question_annual_reviews_no_delete");
    db.exec("DROP TRIGGER IF EXISTS question_annual_reviews_no_replace");
    // Existing rows are never rewritten or silently assigned an approval.
    const before = getReview(db, reviewId);
    db.exec(SCHEMA);
    db.exec(SCHEMA);
    assert.deepEqual(getReview(db, reviewId), before);
    assertReviewImmutable(db, reviewed, reviewId);
    db.exec(`VACUUM INTO '${backup.replaceAll("'", "''")}'`);
  } finally {
    db.close();
  }

  const restored = new DatabaseSync(backup);
  try {
    restored.exec("PRAGMA foreign_keys = ON; PRAGMA recursive_triggers = OFF");
    assertReviewImmutable(restored, reviewed, reviewId);
  } finally {
    restored.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
