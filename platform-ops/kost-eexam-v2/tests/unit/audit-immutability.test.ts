import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

const SCHEMA = readFileSync(new URL("../../lib/schema.sql", import.meta.url), "utf8");

function openFreshDb(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  return db;
}

function insertAudit(db: DatabaseSync, action: string): number {
  const result = db
    .prepare(
      `INSERT INTO audit_logs (action, result, metadata_json)
       VALUES (?, 'success', ?)`
    )
    .run(action, JSON.stringify({ source: "audit-immutability-test" }));
  return Number(result.lastInsertRowid);
}

function auditRow(db: DatabaseSync, id: number): { id: number; action: string } {
  return db.prepare("SELECT id, action FROM audit_logs WHERE id = ?").get(id) as {
    id: number;
    action: string;
  };
}

function assertAppendOnly(db: DatabaseSync, id: number, originalAction: string): void {
  assert.throws(
    () => db.prepare("UPDATE audit_logs SET action = 'tampered' WHERE id = ?").run(id),
    /audit_logs is append-only/i
  );
  assert.deepEqual(auditRow(db, id), { id, action: originalAction });

  assert.throws(
    () => db.prepare("DELETE FROM audit_logs WHERE id = ?").run(id),
    /audit_logs is append-only/i
  );
  assert.deepEqual(auditRow(db, id), { id, action: originalAction });
}

test("audit_logs accepts inserts but rejects direct update/delete at SQLite boundary", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-audit-immutability-"));
  const dbPath = join(dir, "fresh.sqlite");
  const db = openFreshDb(dbPath);

  try {
    const firstId = insertAudit(db, "candidate_login");
    assertAppendOnly(db, firstId, "candidate_login");

    const secondId = insertAudit(db, "candidate_logout");
    assert.equal(auditRow(db, secondId).action, "candidate_logout");

    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("INSERT INTO companies (name) VALUES (?)").run("Atomic test company");
      insertAudit(db, "company_created");
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }

    assert.equal(
      (db.prepare("SELECT COUNT(*) AS n FROM companies WHERE name = ?").get("Atomic test company") as { n: number }).n,
      1
    );
    assert.equal(
      (db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE action = ?").get("company_created") as { n: number }).n,
      1
    );
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("schema migration is idempotent and preserves pre-existing audit rows", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-audit-migration-"));
  const dbPath = join(dir, "migration.sqlite");
  const db = openFreshDb(dbPath);

  try {
    const id = insertAudit(db, "before_migration");
    const before = auditRow(db, id);

    db.exec(SCHEMA);
    db.exec(SCHEMA);

    assert.deepEqual(auditRow(db, id), before);
    assertAppendOnly(db, id, "before_migration");
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("SQLite backup/restore preserves audit immutability triggers", () => {
  const dir = mkdtempSync(join(tmpdir(), "kost-audit-restore-"));
  const sourcePath = join(dir, "source.sqlite");
  const restoredPath = join(dir, "restored.sqlite");
  const db = openFreshDb(sourcePath);

  try {
    const id = insertAudit(db, "before_backup");
    const escapedPath = restoredPath.replaceAll("'", "''");
    db.exec(`VACUUM INTO '${escapedPath}'`);
    assert.equal(auditRow(db, id).action, "before_backup");
  } finally {
    db.close();
  }

  const restored = new DatabaseSync(restoredPath);
  try {
    assertAppendOnly(restored, 1, "before_backup");
    const newId = insertAudit(restored, "after_restore");
    assert.equal(auditRow(restored, newId).action, "after_restore");
  } finally {
    restored.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
