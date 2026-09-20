import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  LEGACY_QTYPE_UNKNOWN_CODE,
  PUBLISHED_QTYPE_CONFLICT_CODE,
  PUBLISHED_QTYPE_IMMUTABLE_ERROR,
  enforcePublishedQuestionQtypeIntegrity,
  questionQtypeConflict,
} from "../../lib/published-question-qtype-integrity";

const SCHEMA = readFileSync(new URL("../../lib/schema.sql", import.meta.url), "utf8");
const ACTION_SOURCE = readFileSync(
  new URL("../../app/(app)/question-bank/actions.ts", import.meta.url),
  "utf8"
);
const SYNC_SOURCE = readFileSync(
  new URL("../../scripts/sync-tier-a-questions.ts", import.meta.url),
  "utf8"
);

function openFreshDb(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  db.prepare(`INSERT INTO functions (code, label) VALUES ('7.1', 'Fonction 7.1')`).run();
  return db;
}

function seedQuestion(
  db: DatabaseSync,
  params: {
    kostId: string;
    qtype?: string;
    choices?: unknown[];
    correctAnswer?: unknown;
    publish?: boolean;
  }
): { questionId: number; versionId: number; snapshotId: number | null } {
  const qtype = params.qtype ?? "mcq_single";
  const choices = params.choices ?? [
    { key: "A", text: "Alpha" },
    { key: "B", text: "Bravo" },
  ];
  const correctAnswer = params.correctAnswer ?? ["A"];

  const questionId = Number(
    db
      .prepare(
        `INSERT INTO questions (kost_question_id, function_code, qtype, source_status)
         VALUES (?, '7.1', ?, 'FROZEN_SOURCE_VERIFIED')`
      )
      .run(params.kostId, qtype).lastInsertRowid
  );
  const versionId = Number(
    db
      .prepare(
        `INSERT INTO question_versions
           (question_id, version_no, stem, choices_json, correct_answer)
         VALUES (?, 1, 'Question de test ?', ?, ?)`
      )
      .run(questionId, JSON.stringify(choices), JSON.stringify(correctAnswer)).lastInsertRowid
  );
  db.prepare(`UPDATE questions SET current_version_id = ? WHERE id = ?`).run(versionId, questionId);

  if (params.publish === false) {
    return { questionId, versionId, snapshotId: null };
  }

  const companyId = Number(
    db.prepare(`INSERT INTO companies (name, scope) VALUES (?, 'test')`).run(`Company ${params.kostId}`).lastInsertRowid
  );
  const groupId = Number(
    db
      .prepare(`INSERT INTO groups (company_id, name, scope) VALUES (?, ?, 'test')`)
      .run(companyId, `Group ${params.kostId}`).lastInsertRowid
  );
  const assessmentId = Number(
    db
      .prepare(
        `INSERT INTO assessments
           (type, name, function_code, group_id, question_source, question_count, duration_minutes, status, scope)
         VALUES ('examen', ?, '7.1', ?, 'manual', 1, 30, 'published', 'test')`
      )
      .run(`Assessment ${params.kostId}`, groupId).lastInsertRowid
  );
  const snapshotId = Number(
    db
      .prepare(
        `INSERT INTO assessment_question_snapshots
           (assessment_id, position, question_id, version_id, stem_snapshot,
            choices_snapshot_json, correct_answer_snapshot, points)
         VALUES (?, 1, ?, ?, 'Question de test ?', ?, ?, 1)`
      )
      .run(
        assessmentId,
        questionId,
        versionId,
        JSON.stringify(choices),
        JSON.stringify(correctAnswer)
      ).lastInsertRowid
  );
  return { questionId, versionId, snapshotId };
}

function qtypeFor(db: DatabaseSync, questionId: number): string {
  return (db.prepare(`SELECT qtype FROM questions WHERE id = ?`).get(questionId) as { qtype: string }).qtype;
}

function assertBaseline(
  row: unknown,
  expected: { questionId: number; qtype: string; firstSnapshotId: number | null }
): void {
  const baseline = row as { question_id: number; qtype: string; first_snapshot_id: number | null };
  assert.equal(baseline.question_id, expected.questionId);
  assert.equal(baseline.qtype, expected.qtype);
  assert.equal(baseline.first_snapshot_id, expected.firstSnapshotId);
}

const TRUE_FALSE_CHOICES = [
  { key: "true", text: "Vrai" },
  { key: "false", text: "Faux" },
];

test("#58 migration backfills only a durably provable legacy qtype and then blocks direct drift", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-published-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    const { questionId, snapshotId } = seedQuestion(db, {
      kostId: "QTYPE-PUBLISHED-1",
      qtype: "true_false",
      choices: TRUE_FALSE_CHOICES,
      correctAnswer: ["true"],
    });
    const result = enforcePublishedQuestionQtypeIntegrity(db);

    assert.equal(result.publishedQuestions, 1);
    assert.equal(result.baselinesAdded, 1);
    assertBaseline(
      db
        .prepare(`SELECT question_id, qtype, first_snapshot_id FROM published_question_qtype_baselines`)
        .get(),
      { questionId, qtype: "true_false", firstSnapshotId: snapshotId }
    );

    assert.throws(
      () => db.prepare(`UPDATE questions SET qtype = 'mcq_single' WHERE id = ?`).run(questionId),
      new RegExp(PUBLISHED_QTYPE_IMMUTABLE_ERROR, "i")
    );
    assert.equal(qtypeFor(db, questionId), "true_false");

    db.prepare(`UPDATE questions SET qtype = 'true_false' WHERE id = ?`).run(questionId);
    assert.equal(qtypeFor(db, questionId), "true_false");
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 ambiguous legacy one-answer MCQ is never silently backfilled from today's qtype", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-legacy-unknown-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    seedQuestion(db, { kostId: "QTYPE-LEGACY-UNKNOWN-1", qtype: "mcq_single" });

    assert.throws(
      () => enforcePublishedQuestionQtypeIntegrity(db),
      new RegExp(`${LEGACY_QTYPE_UNKNOWN_CODE}.*does not durably prove`, "i")
    );
    assert.equal(
      (db.prepare(`SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = 'published_question_qtype_baselines'`).get() as { n: number }).n,
      0,
      "unknown legacy history leaves no silently asserted baseline behind"
    );
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 unpublished qtype is not frozen by the database trigger", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-unpublished-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    const { questionId } = seedQuestion(db, { kostId: "QTYPE-DRAFT-1", publish: false });
    enforcePublishedQuestionQtypeIntegrity(db);
    db.prepare(`UPDATE questions SET qtype = 'mcq_multi' WHERE id = ?`).run(questionId);
    assert.equal(qtypeFor(db, questionId), "mcq_multi");
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 a snapshot inserted after migration captures the qtype baseline before any later mutation", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-future-publish-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    enforcePublishedQuestionQtypeIntegrity(db);
    const { questionId, snapshotId } = seedQuestion(db, { kostId: "QTYPE-FUTURE-1" });

    assertBaseline(
      db
        .prepare(`SELECT question_id, qtype, first_snapshot_id FROM published_question_qtype_baselines WHERE question_id = ?`)
        .get(questionId),
      { questionId, qtype: "mcq_single", firstSnapshotId: snapshotId }
    );
    assert.throws(
      () => db.prepare(`UPDATE questions SET qtype = 'true_false' WHERE id = ?`).run(questionId),
      /published question qtype is immutable/i
    );
    assert.equal(qtypeFor(db, questionId), "mcq_single");
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 migration fails loud on a legacy snapshot structurally incompatible with current qtype", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-conflict-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    seedQuestion(db, {
      kostId: "QTYPE-LEGACY-CONFLICT-1",
      qtype: "numeric",
      choices: [
        { key: "A", text: "Alpha" },
        { key: "B", text: "Bravo" },
      ],
      correctAnswer: ["A"],
    });

    assert.throws(
      () => enforcePublishedQuestionQtypeIntegrity(db),
      new RegExp(`${PUBLISHED_QTYPE_CONFLICT_CODE}.*structurally incompatible`, "i")
    );
    assert.equal(
      (db.prepare(`SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = 'published_question_qtype_baselines'`).get() as { n: number }).n,
      0,
      "failed preflight rolls back the baseline table/trigger installation"
    );
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 baseline itself is append-only and survives SQLite backup/restore", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-backup-"));
  const sourcePath = join(dir, "source.sqlite");
  const restoredPath = join(dir, "restored.sqlite");
  const db = openFreshDb(sourcePath);
  let questionId = 0;
  try {
    ({ questionId } = seedQuestion(db, {
      kostId: "QTYPE-BACKUP-1",
      qtype: "true_false",
      choices: TRUE_FALSE_CHOICES,
      correctAnswer: ["false"],
    }));
    enforcePublishedQuestionQtypeIntegrity(db);

    assert.throws(
      () => db.prepare(`UPDATE published_question_qtype_baselines SET qtype = 'mcq_single' WHERE question_id = ?`).run(questionId),
      /append-only/i
    );
    assert.throws(
      () => db.prepare(`DELETE FROM published_question_qtype_baselines WHERE question_id = ?`).run(questionId),
      /append-only/i
    );

    const escaped = restoredPath.replaceAll("'", "''");
    db.exec(`VACUUM INTO '${escaped}'`);
  } finally {
    db.close();
  }

  const restored = new DatabaseSync(restoredPath);
  restored.exec("PRAGMA foreign_keys = ON;");
  try {
    assert.throws(
      () => restored.prepare(`UPDATE questions SET qtype = 'mcq_single' WHERE id = ?`).run(questionId),
      /published question qtype is immutable/i
    );
    assert.equal(qtypeFor(restored, questionId), "true_false");
  } finally {
    restored.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 sync/import and edit Server Action both fail closed on qtype mismatch", () => {
  assert.equal(questionQtypeConflict("mcq_single", "mcq_single"), null);
  assert.match(questionQtypeConflict("mcq_single", "mcq_multi") ?? "", /^DRIFT_CONFLICT:/);

  assert.match(SYNC_SOURCE, /SELECT id, current_version_id, qtype FROM questions/);
  assert.match(SYNC_SOURCE, /questionQtypeConflict\(existing\.qtype, c\.qtype\)/);
  assert.match(SYNC_SOURCE, /BLOCKED \(\$\{qtypeConflict\}\)/);

  assert.match(ACTION_SOURCE, /const requestedQtype = formData\.get\("qtype"\)/);
  assert.match(ACTION_SOURCE, /questionQtypeConflict\(question\.qtype, String\(requestedQtype\)\)/);
  assert.match(ACTION_SOURCE, /Le type d’une question existante ne peut pas être modifié/);
});
