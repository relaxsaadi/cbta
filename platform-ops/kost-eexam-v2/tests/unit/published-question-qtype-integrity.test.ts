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
  SNAPSHOT_IDENTITY_IMMUTABLE_ERROR,
  SNAPSHOT_PAYLOAD_IMMUTABLE_ERROR,
  SNAPSHOT_DELETE_IMMUTABLE_ERROR,
  SNAPSHOT_APPEND_IMMUTABLE_ERROR,
  ASSESSMENT_PUBLICATION_ROLLBACK_ERROR,
  enforcePublishedQuestionQtypeIntegrity,
  questionQtypeConflict,
  requireSnapshotQtype,
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
    explicitSnapshot?: boolean;
    leaveDraft?: boolean;
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
         VALUES ('examen', ?, '7.1', ?, 'manual', 1, 30, 'draft', 'test')`
      )
      .run(`Assessment ${params.kostId}`, groupId).lastInsertRowid
  );
  const snapshotId = Number(
    db
      .prepare(
        `INSERT INTO assessment_question_snapshots
           (assessment_id, position, question_id, version_id, stem_snapshot,
            choices_snapshot_json, correct_answer_snapshot, qtype_snapshot, points)
         VALUES (?, 1, ?, ?, 'Question de test ?', ?, ?, ?, 1)`
      )
      .run(
        assessmentId,
        questionId,
        versionId,
        JSON.stringify(choices),
        JSON.stringify(correctAnswer),
        params.explicitSnapshot ? qtype : null
      ).lastInsertRowid
  );
  // Mirror publishAssessment's legitimate order: snapshot while draft,
  // then atomically mark published.
  if (!params.leaveDraft) {
    db.prepare(`UPDATE assessments SET status = 'published', published_at = ?
                WHERE id = ?`).run("2026-10-29T12:00:00.000Z", assessmentId);
  }
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

test("#58 migration backfills only a durably provable legacy qtype and then blocks direct drift", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-published-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    const { questionId, snapshotId } = seedQuestion(db, {
      kostId: "QTYPE-PUBLISHED-1",
      qtype: "mcq_multi",
      correctAnswer: ["A", "B"],
    });
    const result = enforcePublishedQuestionQtypeIntegrity(db);

    assert.equal(result.publishedQuestions, 1);
    assert.equal(result.baselinesAdded, 1);
    assert.equal((db.prepare(`SELECT qtype_snapshot FROM assessment_question_snapshots WHERE id = ?`).get(snapshotId) as { qtype_snapshot: string }).qtype_snapshot, "mcq_multi");
    assertBaseline(
      db
        .prepare(`SELECT question_id, qtype, first_snapshot_id FROM published_question_qtype_baselines`)
        .get(),
      { questionId, qtype: "mcq_multi", firstSnapshotId: snapshotId }
    );

    assert.throws(
      () => db.prepare(`UPDATE questions SET qtype = 'mcq_single' WHERE id = ?`).run(questionId),
      new RegExp(PUBLISHED_QTYPE_IMMUTABLE_ERROR, "i")
    );
    assert.equal(qtypeFor(db, questionId), "mcq_multi");

    db.prepare(`UPDATE questions SET qtype = 'mcq_multi' WHERE id = ?`).run(questionId);
    assert.equal(qtypeFor(db, questionId), "mcq_multi");
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
      new RegExp(`${LEGACY_QTYPE_UNKNOWN_CODE}.*compatible with multiple`, "i")
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

test("#58 ambiguous legacy draft qtype is backfilled only if never published and payload matches", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-legacy-draft-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    const { questionId, snapshotId } = seedQuestion(db, {
      kostId: "QTYPE-LEGACY-DRAFT-1",
      qtype: "mcq_single",
      leaveDraft: true,
    });
    assert.ok(snapshotId !== null);
    const assessment = db.prepare(`SELECT a.id, a.status, a.published_at
      FROM assessments a JOIN assessment_question_snapshots s ON s.assessment_id = a.id
      WHERE s.id = ?`).get(snapshotId) as { id: number; status: string; published_at: string | null };
    assert.equal(assessment.status, "draft");
    assert.equal(assessment.published_at, null);

    // One correct option is ambiguous for historical MCQ single/multi.
    // That ambiguity blocks published legacy rows (tested separately), but
    // a never-issued draft can rely on a compatible editable current qtype.
    enforcePublishedQuestionQtypeIntegrity(db);
    const snapshot = db.prepare(`SELECT qtype_snapshot FROM assessment_question_snapshots WHERE id = ?`)
      .get(snapshotId) as { qtype_snapshot: string };
    assert.equal(snapshot.qtype_snapshot, "mcq_single");

    db.prepare(`UPDATE assessments SET status = 'published', published_at = ? WHERE id = ?`)
      .run("2026-10-30T12:00:00.000Z", assessment.id);
    assert.throws(
      () => db.prepare(`UPDATE questions SET qtype = 'mcq_multi' WHERE id = ?`).run(questionId),
      new RegExp(PUBLISHED_QTYPE_IMMUTABLE_ERROR, "i")
    );
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 a legacy assessment with attempts cannot masquerade as an unissued draft", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-legacy-reset-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    const { snapshotId } = seedQuestion(db, {
      kostId: "QTYPE-PUBLISHED-STATUS-RESET-1",
      qtype: "mcq_single",
    });
    assert.ok(snapshotId !== null);
    const assessment = db.prepare(`SELECT assessment_id FROM assessment_question_snapshots WHERE id = ?`)
      .get(snapshotId) as { assessment_id: number };
    const candidateId = Number(db.prepare(
      `INSERT INTO users (username, password_hash, full_name) VALUES ('legacy_candidate', 'synthetic_hash', 'Legacy Candidate')`
    ).run().lastInsertRowid);
    db.prepare(`INSERT INTO attempts (assessment_id, candidate_user_id, attempt_number, status, expires_at)
      VALUES (?, ?, 1, 'submitted', '2026-11-01T00:00:00.000Z')`)
      .run(assessment.assessment_id, candidateId);

    // Reproduce legacy metadata drift before immutability triggers existed:
    // the exam was published and administered, then its mutable state was
    // reverted to draft and its publication timestamp cleared.
    db.prepare(`UPDATE assessments SET status = 'draft', published_at = NULL WHERE id = ?`)
      .run(assessment.assessment_id);
    assert.throws(
      () => enforcePublishedQuestionQtypeIntegrity(db),
      new RegExp(`${LEGACY_QTYPE_UNKNOWN_CODE}.*candidate attempt evidence`, "i")
    );
    assert.equal(
      (db.prepare(`SELECT qtype_snapshot FROM assessment_question_snapshots WHERE id = ?`)
        .get(snapshotId) as { qtype_snapshot: string | null }).qtype_snapshot,
      null,
      "must not manufacture historical type evidence from reverted draft metadata"
    );
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 administered assessment with explicit qtype stays immutable after legacy draft-label rollback", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-administered-reset-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    const { snapshotId } = seedQuestion(db, {
      kostId: "QTYPE-ADMINISTERED-RESET-1",
      explicitSnapshot: true,
    });
    assert.ok(snapshotId !== null);
    const { assessment_id: assessmentId } = db.prepare(
      `SELECT assessment_id FROM assessment_question_snapshots WHERE id = ?`
    ).get(snapshotId) as { assessment_id: number };
    const candidateId = Number(db.prepare(
      `INSERT INTO users (username, password_hash, full_name)
       VALUES ('issued_candidate', 'synthetic_hash', 'Issued Candidate')`
    ).run().lastInsertRowid);
    db.prepare(`INSERT INTO attempts
      (assessment_id, candidate_user_id, attempt_number, status, expires_at)
      VALUES (?, ?, 1, 'submitted', '2026-11-01T00:00:00.000Z')`
    ).run(assessmentId, candidateId);

    // This legacy snapshot already has actual capture-time qtype evidence,
    // so a migration may proceed. Attempt history nonetheless proves the
    // assessment was issued despite corrupted draft/publication metadata.
    db.prepare(`UPDATE assessments SET status = 'draft', published_at = NULL WHERE id = ?`)
      .run(assessmentId);
    enforcePublishedQuestionQtypeIntegrity(db);
    const original = db.prepare(`SELECT * FROM assessment_question_snapshots WHERE id = ?`)
      .get(snapshotId);
    assert.throws(
      () => db.prepare(`UPDATE assessment_question_snapshots
        SET stem_snapshot = 'Tampered issued exam' WHERE id = ?`).run(snapshotId),
      new RegExp(SNAPSHOT_PAYLOAD_IMMUTABLE_ERROR, "i")
    );
    assert.throws(
      () => db.prepare(`DELETE FROM assessment_question_snapshots WHERE id = ?`).run(snapshotId),
      new RegExp(SNAPSHOT_DELETE_IMMUTABLE_ERROR, "i")
    );
    assert.throws(
      () => db.prepare(`INSERT INTO assessment_question_snapshots
        (assessment_id, position, question_id, version_id, stem_snapshot,
         choices_snapshot_json, correct_answer_snapshot, qtype_snapshot, points)
        SELECT assessment_id, position + 1, question_id, version_id,
               stem_snapshot, choices_snapshot_json, correct_answer_snapshot,
               qtype_snapshot, points FROM assessment_question_snapshots
        WHERE id = ?`).run(snapshotId),
      new RegExp(SNAPSHOT_APPEND_IMMUTABLE_ERROR, "i")
    );
    assert.throws(
      () => db.prepare(`DELETE FROM assessments WHERE id = ?`).run(assessmentId),
      new RegExp(SNAPSHOT_DELETE_IMMUTABLE_ERROR, "i")
    );
    assert.deepEqual(
      db.prepare(`SELECT * FROM assessment_question_snapshots WHERE id = ?`).get(snapshotId),
      original,
      "candidate-issued history must remain unchanged"
    );
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 inconsistent never-published legacy draft cannot be silently backfilled", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-invalid-draft-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    const { snapshotId } = seedQuestion(db, {
      kostId: "QTYPE-INVALID-DRAFT-1",
      qtype: "mcq_single",
      correctAnswer: ["Z"],
      leaveDraft: true,
    });
    assert.ok(snapshotId !== null);
    assert.throws(
      () => enforcePublishedQuestionQtypeIntegrity(db),
      new RegExp(`${PUBLISHED_QTYPE_CONFLICT_CODE}.*unissued draft snapshot`, "i")
    );
    const snapshot = db.prepare(`SELECT qtype_snapshot FROM assessment_question_snapshots WHERE id = ?`)
      .get(snapshotId) as { qtype_snapshot: string | null };
    assert.equal(snapshot.qtype_snapshot, null, "failed migration does not assert a qtype");
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
    const { questionId, snapshotId } = seedQuestion(db, { kostId: "QTYPE-FUTURE-1", explicitSnapshot: true });
    // Ambiguous one-answer MCQs are safe once their qtype was actually
    // captured in the original publication transaction, not inferred.
    enforcePublishedQuestionQtypeIntegrity(db);

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
    assert.throws(
      () => db.prepare(`UPDATE assessment_question_snapshots SET qtype_snapshot = 'mcq_multi' WHERE id = ?`).run(snapshotId),
      /published snapshot qtype is immutable/i
    );
    assert.throws(
      () => db.prepare(`INSERT INTO assessment_question_snapshots
         (assessment_id, position, question_id, version_id, stem_snapshot, choices_snapshot_json, correct_answer_snapshot, qtype_snapshot, points)
         SELECT assessment_id, position + 100, question_id, version_id, stem_snapshot, choices_snapshot_json, correct_answer_snapshot, 'mcq_multi', points
         FROM assessment_question_snapshots WHERE id = ?`).run(snapshotId),
      /published snapshot (must persist matching historical qtype|addition is denied)/i
    );
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 a published snapshot cannot be retargeted to a different question or version", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-snapshot-identity-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    const original = seedQuestion(db, {
      kostId: "QTYPE-IDENTITY-ORIGINAL",
      qtype: "mcq_multi",
      correctAnswer: ["A", "B"],
      explicitSnapshot: true,
    });
    const other = seedQuestion(db, {
      kostId: "QTYPE-IDENTITY-OTHER",
      qtype: "mcq_multi",
      correctAnswer: ["A", "B"],
      publish: false,
    });
    enforcePublishedQuestionQtypeIntegrity(db);
    assert.ok(original.snapshotId !== null);
    assert.throws(
      () => db.prepare(`UPDATE assessment_question_snapshots SET question_id = ? WHERE id = ?`)
        .run(other.questionId, original.snapshotId),
      new RegExp(SNAPSHOT_IDENTITY_IMMUTABLE_ERROR, "i")
    );
    assert.throws(
      () => db.prepare(`UPDATE assessment_question_snapshots SET version_id = ? WHERE id = ?`)
        .run(other.versionId, original.snapshotId),
      new RegExp(SNAPSHOT_IDENTITY_IMMUTABLE_ERROR, "i")
    );
    const row = db.prepare(`SELECT question_id, version_id FROM assessment_question_snapshots WHERE id = ?`)
      .get(original.snapshotId) as { question_id: number; version_id: number };
    assert.equal(row.question_id, original.questionId);
    assert.equal(row.version_id, original.versionId);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 published snapshot answer key, candidate text, ordering and scores are immutable", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-snapshot-payload-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    const { snapshotId } = seedQuestion(db, {
      kostId: "QTYPE-SNAPSHOT-PAYLOAD-1",
      qtype: "mcq_multi",
      correctAnswer: ["A", "B"],
      explicitSnapshot: true,
    });
    assert.ok(snapshotId !== null);
    enforcePublishedQuestionQtypeIntegrity(db);
    const original = db.prepare(`SELECT * FROM assessment_question_snapshots WHERE id = ?`)
      .get(snapshotId);

    // Each attempt modifies a different publication-time field. The test
    // deliberately uses only synthetic items and never touches actual banks.
    const edits: Array<[string, string | number]> = [
      ["id", Number(snapshotId) + 100],
      ["assessment_id", 987654],
      ["position", 2],
      ["stem_snapshot", "Altered exam question"],
      ["choices_snapshot_json", JSON.stringify([{ key: "X", text: "X-ray" }])],
      ["correct_answer_snapshot", JSON.stringify(["X"])],
      ["explanation_snapshot", "Altered rationale"],
      ["points", 42],
    ];
    for (const [column, value] of edits) {
      assert.throws(
        () => db.prepare(`UPDATE assessment_question_snapshots SET ${column} = ? WHERE id = ?`).run(value, snapshotId),
        new RegExp(SNAPSHOT_PAYLOAD_IMMUTABLE_ERROR, "i"),
        `published snapshot ${column} must be immutable`
      );
      assert.deepEqual(
        db.prepare(`SELECT * FROM assessment_question_snapshots WHERE id = ?`).get(snapshotId),
        original,
        `mutation of ${column} must not change stored historical evidence`
      );
    }

    // Identical-value updates are harmless and remain permitted.
    db.prepare(`UPDATE assessment_question_snapshots SET stem_snapshot = stem_snapshot WHERE id = ?`).run(snapshotId);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 published snapshots cannot be deleted directly or by parent cascade", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-snapshot-delete-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    const { snapshotId } = seedQuestion(db, {
      kostId: "QTYPE-SNAPSHOT-DELETE-1",
      qtype: "mcq_multi",
      correctAnswer: ["A", "B"],
      explicitSnapshot: true,
    });
    assert.ok(snapshotId !== null);
    enforcePublishedQuestionQtypeIntegrity(db);

    const original = db.prepare(`SELECT * FROM assessment_question_snapshots WHERE id = ?`)
      .get(snapshotId) as { assessment_id: number };
    const assessmentBefore = db.prepare(`SELECT * FROM assessments WHERE id = ?`)
      .get(original.assessment_id);

    // There are no candidate attempts here. Without the delete trigger,
    // both direct delete and ON DELETE CASCADE would destroy publication evidence.
    assert.throws(
      () => db.prepare(`DELETE FROM assessment_question_snapshots WHERE id = ?`).run(snapshotId),
      new RegExp(SNAPSHOT_DELETE_IMMUTABLE_ERROR, "i")
    );
    assert.throws(
      () => db.prepare(`DELETE FROM assessments WHERE id = ?`).run(original.assessment_id),
      new RegExp(SNAPSHOT_DELETE_IMMUTABLE_ERROR, "i")
    );
    assert.deepEqual(
      db.prepare(`SELECT * FROM assessment_question_snapshots WHERE id = ?`).get(snapshotId),
      original
    );
    assert.deepEqual(
      db.prepare(`SELECT * FROM assessments WHERE id = ?`).get(original.assessment_id),
      assessmentBefore
    );
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 forbid post-publication snapshot appends and publication rollback", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-snapshot-append-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    const { snapshotId } = seedQuestion(db, {
      kostId: "QTYPE-SNAPSHOT-APPEND-1",
      qtype: "mcq_multi",
      correctAnswer: ["A", "B"],
      explicitSnapshot: true,
    });
    assert.ok(snapshotId !== null);
    // Simulate a database booted under the old draft-unsafe triggers. A
    // subsequent migration must replace them, not silently preserve them
    // via CREATE TRIGGER IF NOT EXISTS.
    db.exec(`
      CREATE TRIGGER trg_published_snapshot_payload_immutable
      BEFORE UPDATE OF stem_snapshot, points ON assessment_question_snapshots
      FOR EACH ROW BEGIN SELECT RAISE(ABORT, 'stale unconditional payload guard'); END;
      CREATE TRIGGER trg_published_snapshot_no_delete
      BEFORE DELETE ON assessment_question_snapshots
      FOR EACH ROW BEGIN SELECT RAISE(ABORT, 'stale unconditional delete guard'); END;
    `);
    enforcePublishedQuestionQtypeIntegrity(db);
    const original = db.prepare(`SELECT * FROM assessment_question_snapshots WHERE id = ?`)
      .get(snapshotId) as { assessment_id: number };
    const publishedId = original.assessment_id;
    const clone = db.prepare(`
      INSERT INTO assessment_question_snapshots
        (assessment_id, position, question_id, version_id, stem_snapshot,
         choices_snapshot_json, correct_answer_snapshot, qtype_snapshot,
         explanation_snapshot, points)
      SELECT ?, ?, question_id, version_id, stem_snapshot, choices_snapshot_json,
             correct_answer_snapshot, qtype_snapshot, explanation_snapshot, points
      FROM assessment_question_snapshots WHERE id = ?
    `);

    // Correct qtype and unused position must not permit a published append.
    assert.throws(
      () => clone.run(publishedId, 2, snapshotId),
      new RegExp(SNAPSHOT_APPEND_IMMUTABLE_ERROR, "i")
    );
    assert.throws(
      () => db.prepare(`UPDATE assessments SET status = 'draft' WHERE id = ?`).run(publishedId),
      new RegExp(ASSESSMENT_PUBLICATION_ROLLBACK_ERROR, "i")
    );

    // Real publication inserts snapshots in draft state before status update.
    const draftId = Number(db.prepare(`
      INSERT INTO assessments
        (type, name, function_code, group_id, question_source, question_count,
         duration_minutes, status, scope)
      SELECT type, 'Draft snapshot insertion', function_code, group_id,
             question_source, question_count, duration_minutes, 'draft', scope
      FROM assessments WHERE id = ?
    `).run(publishedId).lastInsertRowid);
    clone.run(draftId, 1, snapshotId);
    assert.equal(
      (db.prepare(`SELECT COUNT(*) AS n FROM assessment_question_snapshots
                     WHERE assessment_id = ?`).get(draftId) as { n: number }).n,
      1
    );
    // Existing qtype validation still rejects an invalid draft insert.
    assert.throws(() => db.prepare(`
      INSERT INTO assessment_question_snapshots
        (assessment_id, position, question_id, version_id, stem_snapshot,
         choices_snapshot_json, correct_answer_snapshot, qtype_snapshot, points)
      SELECT ?, 2, question_id, version_id, stem_snapshot,
             choices_snapshot_json, correct_answer_snapshot, 'true_false', points
      FROM assessment_question_snapshots WHERE id = ?
    `).run(draftId, snapshotId), /published snapshot must persist matching historical qtype/i);

    // A legitimate draft snapshot must remain editable and removable until
    // publication. The earlier unconditional triggers accidentally blocked
    // these operations even though the INSERT lifecycle is draft-first.
    db.prepare(`UPDATE assessment_question_snapshots
                SET stem_snapshot = 'Revised draft question', points = 4
                WHERE assessment_id = ?`).run(draftId);
    const editedDraft = db.prepare(`SELECT stem_snapshot, points
                                    FROM assessment_question_snapshots
                                    WHERE assessment_id = ?`).get(draftId) as {
      stem_snapshot: string;
      points: number;
    };
    assert.equal(editedDraft.stem_snapshot, "Revised draft question");
    assert.equal(editedDraft.points, 4);

    // Retargeting a draft row into a published exam must remain prohibited,
    // even with a fresh position that avoids the unique-position constraint.
    assert.throws(
      () => db.prepare(`UPDATE assessment_question_snapshots
                        SET assessment_id = ?, position = 99
                        WHERE assessment_id = ?`).run(publishedId, draftId),
      new RegExp(SNAPSHOT_PAYLOAD_IMMUTABLE_ERROR, "i")
    );
    db.prepare(`DELETE FROM assessment_question_snapshots WHERE assessment_id = ?`).run(draftId);
    assert.equal(
      (db.prepare(`SELECT COUNT(*) AS n FROM assessment_question_snapshots
                   WHERE assessment_id = ?`).get(draftId) as { n: number }).n,
      0
    );
    clone.run(draftId, 1, snapshotId);

    // A never-published draft may be deleted by parent cascade; the
    // separate BEFORE DELETE assessment guard must still reject published
    // parent deletion as asserted in the preceding regression test.
    const throwawayDraftId = Number(db.prepare(`
      INSERT INTO assessments
        (type, name, function_code, group_id, question_source, question_count,
         duration_minutes, status, scope)
      SELECT type, 'Throwaway draft', function_code, group_id,
             question_source, question_count, duration_minutes, 'draft', scope
      FROM assessments WHERE id = ?
    `).run(publishedId).lastInsertRowid);
    clone.run(throwawayDraftId, 1, snapshotId);
    db.prepare(`DELETE FROM assessments WHERE id = ?`).run(throwawayDraftId);
    assert.equal(
      (db.prepare(`SELECT COUNT(*) AS n FROM assessments WHERE id = ?`)
        .get(throwawayDraftId) as { n: number }).n,
      0
    );

    db.prepare(`UPDATE assessments SET status = 'published', published_at = ? WHERE id = ?`)
      .run("2026-10-29T12:00:00.000Z", draftId);
    assert.throws(
      () => clone.run(draftId, 2, snapshotId),
      new RegExp(SNAPSHOT_APPEND_IMMUTABLE_ERROR, "i")
    );
    assert.throws(
      () => db.prepare(`UPDATE assessments SET published_at = NULL WHERE id = ?`).run(draftId),
      new RegExp(ASSESSMENT_PUBLICATION_ROLLBACK_ERROR, "i")
    );
    db.prepare(`UPDATE assessments SET status = 'open' WHERE id = ?`).run(draftId);
    assert.throws(
      () => clone.run(draftId, 2, snapshotId),
      new RegExp(SNAPSHOT_APPEND_IMMUTABLE_ERROR, "i")
    );
    assert.deepEqual(
      db.prepare(`SELECT * FROM assessment_question_snapshots WHERE id = ?`).get(snapshotId),
      original
    );
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("#58 migration fails loud when durable legacy payload contradicts current qtype", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-qtype-conflict-"));
  const db = openFreshDb(join(dir, "db.sqlite"));
  try {
    seedQuestion(db, {
      kostId: "QTYPE-LEGACY-CONFLICT-1",
      qtype: "numeric",
      correctAnswer: ["A", "B"],
    });

    assert.throws(
      () => enforcePublishedQuestionQtypeIntegrity(db),
      new RegExp(`${PUBLISHED_QTYPE_CONFLICT_CODE}.*durably proves qtype 'mcq_multi'`, "i")
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
      qtype: "mcq_multi",
      correctAnswer: ["A", "B"],
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
    assert.equal(qtypeFor(restored, questionId), "mcq_multi");
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

// No silent fallback for genuinely unknown historical type.
test("#58 runtime rejects unknown or invalid published snapshot qtypes", () => {
  assert.equal(requireSnapshotQtype("scenario"), "scenario");
  assert.throws(() => requireSnapshotQtype(null), /LEGACY_QTYPE_UNKNOWN/);
  assert.throws(() => requireSnapshotQtype("not_a_type"), /LEGACY_QTYPE_UNKNOWN/);
});
