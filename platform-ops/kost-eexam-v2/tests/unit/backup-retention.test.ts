import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  enforceBackupRetention,
  parseBackupFilename,
  selectBackupFilesToDelete,
} from "../../lib/backup-retention";

function backupName(iso: string): string {
  return `kost-eexam-v2_${new Date(iso).toISOString().replace(/[:.]/g, "-")}.db`;
}

describe("Rétention des sauvegardes SQLite", () => {
  test("parse et trie les noms horodatés indépendamment de l'ordre du répertoire", () => {
    const newest = backupName("2026-09-01T00:00:00.000Z");
    const previous = backupName("2026-08-31T00:00:00.000Z");
    const oldest = backupName("2026-08-30T00:00:00.000Z");

    assert.equal(parseBackupFilename(newest)?.dayKey, "2026-09-01");
    assert.equal(parseBackupFilename("notes.txt"), null);
    assert.equal(parseBackupFilename("kost-eexam-v2_2026-02-31T00-00-00-000Z.db"), null);

    const deleted = selectBackupFilesToDelete(
      [oldest, newest, previous],
      { retentionDailyCopies: 2, retentionWeeklyCopies: 0 },
      newest,
    );
    assert.deepEqual(deleted, [oldest]);
  });

  test("conserve une seule copie quotidienne, la plus récente du jour", () => {
    const newest = backupName("2026-09-01T23:00:00.000Z");
    const sameDayOlder = backupName("2026-09-01T01:00:00.000Z");
    const previousDay = backupName("2026-08-31T23:00:00.000Z");

    const deleted = selectBackupFilesToDelete(
      [sameDayOlder, previousDay, newest],
      { retentionDailyCopies: 2, retentionWeeklyCopies: 0 },
      newest,
    );

    assert.deepEqual(deleted, [sameDayOlder]);
  });

  test("applique 14 quotidiennes + 4 hebdomadaires distinctes au-delà de la fenêtre quotidienne", () => {
    const files: string[] = [];
    const start = Date.parse("2026-09-01T02:00:00.000Z");
    for (let day = 0; day < 60; day += 1) {
      files.push(backupName(new Date(start - day * 86_400_000).toISOString()));
    }
    const newest = files[0]!;

    const deleted = selectBackupFilesToDelete(
      [...files].reverse(),
      { retentionDailyCopies: 14, retentionWeeklyCopies: 4 },
      newest,
    );
    const kept = files.filter((name) => !deleted.includes(name));

    assert.equal(kept.length, 18);
    assert.ok(kept.includes(newest));
    for (const daily of files.slice(0, 14)) assert.ok(kept.includes(daily));
  });

  test("une copie plus ancienne d'une journée quotidienne ne consomme pas un slot hebdomadaire", () => {
    const dailyNewest = backupName("2026-09-01T23:00:00.000Z");
    const sameDailyDayOlder = backupName("2026-09-01T01:00:00.000Z");
    const olderSameWeek = backupName("2026-08-31T23:00:00.000Z");
    const olderWeek = backupName("2026-08-23T23:00:00.000Z");

    const deleted = selectBackupFilesToDelete(
      [olderWeek, sameDailyDayOlder, olderSameWeek, dailyNewest],
      { retentionDailyCopies: 1, retentionWeeklyCopies: 1 },
      dailyNewest,
    );
    const kept = [olderWeek, sameDailyDayOlder, olderSameWeek, dailyNewest].filter(
      (name) => !deleted.includes(name),
    );

    assert.deepEqual(kept, [olderWeek, dailyNewest]);
  });

  test("ne supprime jamais la sauvegarde protégée même en cas d'ordre temporel anormal", () => {
    const nominalNewest = backupName("2026-09-01T00:00:00.000Z");
    const middle = backupName("2026-08-31T00:00:00.000Z");
    const protectedOlder = backupName("2026-08-01T00:00:00.000Z");

    const deleted = selectBackupFilesToDelete(
      [middle, protectedOlder, nominalNewest],
      { retentionDailyCopies: 1, retentionWeeklyCopies: 0 },
      protectedOlder,
    );

    assert.ok(!deleted.includes(protectedOlder));
    assert.ok(deleted.includes(middle));
  });

  test("la purge physique ignore les fichiers non gérés et protège la copie courante", () => {
    const dir = mkdtempSync(join(tmpdir(), "kost-backup-retention-"));
    try {
      const newest = backupName("2026-09-01T00:00:00.000Z");
      const old = backupName("2026-08-20T00:00:00.000Z");
      writeFileSync(join(dir, newest), "new");
      writeFileSync(join(dir, old), "old");
      writeFileSync(join(dir, "restore-test.db"), "must stay");
      writeFileSync(join(dir, "README.txt"), "must stay");

      const result = enforceBackupRetention(
        dir,
        { retentionDailyCopies: 1, retentionWeeklyCopies: 0 },
        join(dir, newest),
      );
      const remaining = readdirSync(dir);

      assert.deepEqual(result.deleted, [old]);
      assert.ok(remaining.includes(newest));
      assert.ok(remaining.includes("restore-test.db"));
      assert.ok(remaining.includes("README.txt"));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
