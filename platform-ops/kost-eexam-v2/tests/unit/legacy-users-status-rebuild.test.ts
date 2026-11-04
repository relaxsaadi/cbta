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

const CURRENT_STATUS =
  "status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending_activation','active','suspended','archived'))";
const LEGACY_STATUSES = [
  {
    name: "active/suspended-only status",
    ddl: "status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended'))",
  },
  {
    name: "pre-archived status",
    ddl: "status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending_activation','active','suspended'))",
  },
];

function runMigration(path: string): void {
  const result = spawnSync(process.execPath, ["--import", "tsx", MIGRATE], {
    cwd: APP_ROOT,
    env: { ...process.env, DB_PATH: path },
    encoding: "utf8",
    timeout: 60_000,
  });
  assert.equal(result.status, 0, `Migration failed: ${result.error ?? ""}\n${result.stdout}\n${result.stderr}`);
}

for (const legacy of LEGACY_STATUSES) {
  test(`legacy users CHECK rebuild preserves temporary-login and affiliation data: ${legacy.name}`, () => {
    assert.ok(SCHEMA.includes(CURRENT_STATUS), "expected modern users.status CHECK anchor");
    const dir = mkdtempSync(join(tmpdir(), "kost-legacy-users-status-"));
    const path = join(dir, "legacy.sqlite");

    try {
      const seed = new DatabaseSync(path);
      try {
        seed.exec(SCHEMA.replace(CURRENT_STATUS, legacy.ddl));
        seed.prepare(`
          INSERT INTO users
            (username, password_hash, full_name, status, candidate_type,
             must_change_password, temp_password_expires_at)
          VALUES (?, ?, ?, 'suspended', 'particulier', 1, ?)
        `).run(
          "synthetic-legacy-user",
          "not-a-real-password-hash",
          "Synthetic Migration User",
          "2099-01-01T00:00:00Z"
        );
      } finally {
        seed.close();
      }

      runMigration(path);
      runMigration(path); // The upgrade must remain idempotent.

      const db = new DatabaseSync(path);
      try {
        const user = db.prepare(`
          SELECT username, full_name, status, candidate_type,
                 must_change_password, temp_password_expires_at, archived_at
          FROM users WHERE username = ?
        `).get("synthetic-legacy-user") as {
          username: string;
          full_name: string;
          status: string;
          candidate_type: string;
          must_change_password: number;
          temp_password_expires_at: string;
          archived_at: string | null;
        } | undefined;

        assert.ok(user, "historical user must remain present");
        assert.equal(user.full_name, "Synthetic Migration User");
        assert.equal(user.status, "suspended");
        assert.equal(user.candidate_type, "particulier");
        assert.equal(user.must_change_password, 1, "mandatory password change must not disappear");
        assert.equal(user.temp_password_expires_at, "2099-01-01T00:00:00Z");
        assert.equal(user.archived_at, null);

        const statusDDL = (db.prepare(
          "SELECT sql FROM sqlite_master WHERE type='table' AND name='users'"
        ).get() as { sql: string }).sql;
        assert.match(statusDDL, /'pending_activation'/);
        assert.match(statusDDL, /'archived'/);
      } finally {
        db.close();
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}
