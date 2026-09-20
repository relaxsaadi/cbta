import type { DatabaseSync } from "node:sqlite";

/**
 * Issue #58 — published question type integrity.
 *
 * Design choice: once a question has been snapshotted by a published
 * assessment, its qtype becomes immutable forever. This is deliberately
 * stricter than versioning qtype metadata: candidate rendering/grading may
 * continue reading questions.qtype only because SQLite now guarantees that
 * value can no longer diverge after first publication.
 *
 * A durable baseline row is captured for every published question. It is
 * both migration evidence and a second fail-closed signal if a trigger is
 * ever removed/recreated. No regulatory/reviewer status is changed here.
 */

export const PUBLISHED_QTYPE_CONFLICT_CODE = "DRIFT_CONFLICT";
export const PUBLISHED_QTYPE_IMMUTABLE_ERROR = "published question qtype is immutable";

export interface PublishedQtypeIntegrityResult {
  publishedQuestions: number;
  baselinesAdded: number;
}

interface SnapshotIntegrityRow {
  snapshot_id: number;
  question_id: number;
  qtype: string;
  choices_snapshot_json: string;
  correct_answer_snapshot: string;
}

interface BaselineConflictRow {
  question_id: number;
  baseline_qtype: string;
  current_qtype: string;
}

function tableExists(db: DatabaseSync, name: string): boolean {
  return Boolean(
    db.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?`).get(name)
  );
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function choiceKeys(choices: unknown): Set<string> | null {
  if (!Array.isArray(choices)) return null;
  const keys: string[] = [];
  for (const choice of choices) {
    const row = objectRecord(choice);
    if (!row || typeof row.key !== "string") return null;
    keys.push(row.key);
  }
  if (new Set(keys).size !== keys.length) return null;
  return new Set(keys);
}

function answerShapeMatches(qtype: string, choices: unknown, correct: unknown): boolean {
  const keys = choiceKeys(choices);
  if (!keys) return false;

  if (qtype === "mcq_single" || qtype === "mcq_multi" || qtype === "true_false") {
    if (!Array.isArray(correct) || !correct.every((k) => typeof k === "string" && keys.has(k))) return false;
    if (qtype === "mcq_single") return keys.size >= 2 && correct.length === 1;
    if (qtype === "mcq_multi") return keys.size >= 2 && correct.length >= 1;
    return (
      keys.size === 2 &&
      keys.has("true") &&
      keys.has("false") &&
      correct.length === 1
    );
  }

  const spec = objectRecord(correct);
  if (!spec) return false;

  if (qtype === "numeric") {
    return (
      spec.mode === "numeric" &&
      typeof spec.value === "number" &&
      Number.isFinite(spec.value) &&
      typeof spec.tolerance === "number" &&
      Number.isFinite(spec.tolerance) &&
      spec.tolerance >= 0
    );
  }

  if (qtype === "short_answer") {
    if (spec.mode === "manual") return true;
    return (
      spec.mode === "exact" &&
      Array.isArray(spec.acceptedAnswers) &&
      spec.acceptedAnswers.length > 0 &&
      spec.acceptedAnswers.every((answer) => typeof answer === "string" && answer.trim().length > 0)
    );
  }

  if (qtype === "matching") {
    if (spec.mode !== "matching" || !Array.isArray(spec.pairs) || spec.pairs.length < 2) return false;
    const leftSeen = new Set<string>();
    for (const pairValue of spec.pairs) {
      const pair = objectRecord(pairValue);
      if (!pair || typeof pair.left !== "string" || typeof pair.right !== "string") return false;
      if (!keys.has(pair.left) || !keys.has(pair.right) || leftSeen.has(pair.left)) return false;
      leftSeen.add(pair.left);
    }
    return true;
  }

  if (qtype === "ordering") {
    return (
      spec.mode === "ordering" &&
      Array.isArray(spec.sequence) &&
      spec.sequence.length >= 2 &&
      new Set(spec.sequence).size === spec.sequence.length &&
      spec.sequence.every((key) => typeof key === "string" && keys.has(key))
    );
  }

  if (qtype === "scenario") {
    if (
      spec.mode !== "scenario" ||
      typeof spec.context !== "string" ||
      !spec.context.trim() ||
      !Array.isArray(spec.subquestions) ||
      spec.subquestions.length === 0
    ) {
      return false;
    }
    for (const rawSubquestion of spec.subquestions) {
      const subquestion = objectRecord(rawSubquestion);
      if (!subquestion || typeof subquestion.qtype !== "string" || subquestion.qtype === "scenario") return false;
      if (typeof subquestion.stem !== "string" || !subquestion.stem.trim()) return false;
      if (typeof subquestion.points !== "number" || !Number.isFinite(subquestion.points) || subquestion.points <= 0) return false;
      if (!answerShapeMatches(subquestion.qtype, subquestion.choices, subquestion.correctAnswer)) return false;
    }
    return true;
  }

  return false;
}

function findSnapshotShapeConflicts(db: DatabaseSync): SnapshotIntegrityRow[] {
  const rows = db
    .prepare(
      `SELECT s.id AS snapshot_id, s.question_id, q.qtype,
              s.choices_snapshot_json, s.correct_answer_snapshot
       FROM assessment_question_snapshots s
       JOIN questions q ON q.id = s.question_id
       ORDER BY s.id`
    )
    .all() as unknown as SnapshotIntegrityRow[];

  return rows.filter((row) => {
    try {
      const choices = JSON.parse(row.choices_snapshot_json) as unknown;
      const correct = JSON.parse(row.correct_answer_snapshot) as unknown;
      return !answerShapeMatches(row.qtype, choices, correct);
    } catch {
      return true;
    }
  });
}

/**
 * Conservative sync/import policy: the stable KOST question identity never
 * silently changes qtype. A mismatch must be reviewed explicitly (normally a
 * new identity or a separately governed migration), even before first publish.
 */
export function questionQtypeConflict(currentQtype: string, incomingQtype: string): string | null {
  if (currentQtype === incomingQtype) return null;
  return `${PUBLISHED_QTYPE_CONFLICT_CODE}: existing qtype '${currentQtype}' differs from incoming qtype '${incomingQtype}'`;
}

/**
 * Installs/refreshes the SQLite boundary used by #58.
 *
 * Migration behavior is intentionally fail-loud:
 *  1. an existing durable baseline that differs from questions.qtype aborts;
 *  2. a legacy published snapshot whose payload is structurally incompatible
 *     with the current qtype aborts;
 *  3. only after those checks pass are missing baselines backfilled and the
 *     immutable/capture triggers installed.
 *
 * Some historical mcq_single vs mcq_multi changes with exactly one correct
 * answer are mathematically indistinguishable from payload alone. The durable
 * baseline created here closes that ambiguity for every subsequent run/change;
 * the migration never invents an older qtype that the database did not store.
 */
export function enforcePublishedQuestionQtypeIntegrity(db: DatabaseSync): PublishedQtypeIntegrityResult {
  if (!tableExists(db, "questions") || !tableExists(db, "assessment_question_snapshots")) {
    return { publishedQuestions: 0, baselinesAdded: 0 };
  }

  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS published_question_qtype_baselines (
        question_id INTEGER PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
        qtype TEXT NOT NULL,
        first_snapshot_id INTEGER NOT NULL,
        captured_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );
    `);

    const baselineConflicts = db
      .prepare(
        `SELECT b.question_id, b.qtype AS baseline_qtype, q.qtype AS current_qtype
         FROM published_question_qtype_baselines b
         JOIN questions q ON q.id = b.question_id
         WHERE b.qtype <> q.qtype
         ORDER BY b.question_id`
      )
      .all() as unknown as BaselineConflictRow[];
    if (baselineConflicts.length > 0) {
      const first = baselineConflicts[0]!;
      throw new Error(
        `${PUBLISHED_QTYPE_CONFLICT_CODE}: question ${first.question_id} baseline qtype '${first.baseline_qtype}' differs from current qtype '${first.current_qtype}'`
      );
    }

    const shapeConflicts = findSnapshotShapeConflicts(db);
    if (shapeConflicts.length > 0) {
      const first = shapeConflicts[0]!;
      throw new Error(
        `${PUBLISHED_QTYPE_CONFLICT_CODE}: snapshot ${first.snapshot_id} for question ${first.question_id} is structurally incompatible with current qtype '${first.qtype}'`
      );
    }

    const before = (
      db.prepare(`SELECT COUNT(*) AS n FROM published_question_qtype_baselines`).get() as { n: number }
    ).n;

    db.exec(`
      INSERT OR IGNORE INTO published_question_qtype_baselines (question_id, qtype, first_snapshot_id)
      SELECT q.id, q.qtype, MIN(s.id)
      FROM questions q
      JOIN assessment_question_snapshots s ON s.question_id = q.id
      GROUP BY q.id, q.qtype;
    `);

    db.exec(`
      CREATE TRIGGER IF NOT EXISTS trg_snapshot_capture_question_qtype
      AFTER INSERT ON assessment_question_snapshots
      BEGIN
        INSERT OR IGNORE INTO published_question_qtype_baselines (question_id, qtype, first_snapshot_id)
        SELECT q.id, q.qtype, NEW.id
        FROM questions q
        WHERE q.id = NEW.question_id;
      END;

      CREATE TRIGGER IF NOT EXISTS trg_questions_qtype_immutable_after_publish
      BEFORE UPDATE OF qtype ON questions
      FOR EACH ROW
      WHEN NEW.qtype <> OLD.qtype
       AND EXISTS (
         SELECT 1
         FROM published_question_qtype_baselines b
         WHERE b.question_id = OLD.id
       )
      BEGIN
        SELECT RAISE(ABORT, '${PUBLISHED_QTYPE_IMMUTABLE_ERROR}');
      END;

      CREATE TRIGGER IF NOT EXISTS trg_published_qtype_baseline_no_update
      BEFORE UPDATE ON published_question_qtype_baselines
      BEGIN
        SELECT RAISE(ABORT, 'published question qtype baseline is append-only');
      END;

      CREATE TRIGGER IF NOT EXISTS trg_published_qtype_baseline_no_delete
      BEFORE DELETE ON published_question_qtype_baselines
      BEGIN
        SELECT RAISE(ABORT, 'published question qtype baseline is append-only');
      END;
    `);

    const after = (
      db.prepare(`SELECT COUNT(*) AS n FROM published_question_qtype_baselines`).get() as { n: number }
    ).n;

    db.exec("COMMIT");
    return { publishedQuestions: after, baselinesAdded: after - before };
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // SQLite may already have rolled back after a hard constraint failure.
    }
    throw error;
  }
}
