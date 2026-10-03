import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateBackupRecordHealth,
  type BackupRecord,
} from "../../lib/backup";

const NOW = Date.parse("2026-10-03T19:30:00.000Z");

function record(overrides: Partial<BackupRecord> = {}): BackupRecord {
  return {
    id: 1,
    type: "restore_test",
    status: "success",
    size_bytes: 1024,
    sha256: "a".repeat(64),
    duration_seconds: 1,
    detail: "artifact=kost-eexam-v2_2026-10-03T18-30-00-000Z.db",
    created_at: "2026-10-03T18:30:00.000Z",
    ...overrides,
  };
}

describe("backup/restore health evidence", () => {
  test("a recent successful event is healthy evidence", () => {
    const health = evaluateBackupRecordHealth(record(), 26, NOW);
    assert.equal(health.successful, true);
    assert.equal(health.stale, false);
    assert.equal(health.ageHours, 1);
  });

  test("a recent failed restore remains unsuccessful evidence", () => {
    const health = evaluateBackupRecordHealth(record({ status: "failure" }), 26, NOW);
    assert.equal(health.successful, false);
    assert.equal(health.stale, false);
  });

  test("an invalid durable timestamp fails closed as stale", () => {
    const health = evaluateBackupRecordHealth(record({ created_at: "not-a-date" }), 26, NOW);
    assert.equal(health.successful, true);
    assert.equal(health.stale, true);
    assert.equal(health.ageHours, null);
  });

  test("a future durable timestamp fails closed as stale", () => {
    const health = evaluateBackupRecordHealth(
      record({ created_at: "2026-10-03T20:30:00.000Z" }),
      26,
      NOW,
    );
    assert.equal(health.successful, true);
    assert.equal(health.stale, true);
    assert.equal(health.ageHours, -1);
  });

  test("missing evidence is unsuccessful and stale", () => {
    assert.deepEqual(evaluateBackupRecordHealth(undefined, 26, NOW), {
      ageHours: null,
      stale: true,
      successful: false,
    });
  });
});
