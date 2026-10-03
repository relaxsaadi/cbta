import { getDb } from "./db";

export interface BackupRecord {
  id: number;
  type: "full_db" | "restore_test";
  status: "success" | "failure";
  size_bytes: number | null;
  sha256: string | null;
  duration_seconds: number | null;
  detail: string | null;
  created_at: string;
}

export function listBackupRecords(limit = 30): BackupRecord[] {
  return getDb().prepare(`SELECT * FROM backup_records ORDER BY created_at DESC, id DESC LIMIT ?`).all(limit) as unknown as BackupRecord[];
}

export function latestOfType(type: "full_db" | "restore_test"): BackupRecord | undefined {
  return getDb()
    .prepare(`SELECT * FROM backup_records WHERE type = ? ORDER BY created_at DESC, id DESC LIMIT 1`)
    .get(type) as BackupRecord | undefined;
}

export interface BackupHealthState {
  ageHours: number | null;
  stale: boolean;
  successful: boolean;
}

/**
 * Interprète une preuve backup/restore pour le healthcheck de façon fail-closed.
 * Un événement récent mais en échec ne doit jamais rendre la plateforme saine.
 * Les timestamps durables invalides ou futurs sont également considérés comme
 * périmés plutôt que comme frais par défaut.
 */
export function evaluateBackupRecordHealth(
  record: BackupRecord | undefined,
  maxAgeHours: number,
  nowMs = Date.now(),
): BackupHealthState {
  if (!record) return { ageHours: null, stale: true, successful: false };

  const createdMs = Date.parse(record.created_at);
  if (!Number.isFinite(createdMs)) {
    return {
      ageHours: null,
      stale: true,
      successful: record.status === "success",
    };
  }

  const ageHours = (nowMs - createdMs) / 3_600_000;
  return {
    ageHours,
    stale: !Number.isFinite(ageHours) || ageHours < 0 || ageHours > maxAgeHours,
    successful: record.status === "success",
  };
}

/**
 * Artefact de sauvegarde à utiliser pour un drill de restauration. Un drill ne
 * doit jamais sélectionner un fichier arbitraire par mtime : il doit être lié
 * au dernier événement full_db qui a réellement terminé en succès, possède un
 * nom d'artefact explicitement journalisé et un SHA-256 enregistré.
 */
export function latestSuccessfulFullDb(): BackupRecord | undefined {
  return getDb()
    .prepare(
      `SELECT * FROM backup_records
       WHERE type = 'full_db'
         AND status = 'success'
         AND sha256 IS NOT NULL
         AND detail LIKE 'artifact=%'
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
    )
    .get() as BackupRecord | undefined;
}

export function recordBackupEvent(entry: Omit<BackupRecord, "id" | "created_at">): void {
  getDb()
    .prepare(`INSERT INTO backup_records (type, status, size_bytes, sha256, duration_seconds, detail) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(entry.type, entry.status, entry.size_bytes, entry.sha256, entry.duration_seconds, entry.detail);
}

export const BACKUP_POLICY = {
  rpoHours: 24,
  rtoMinutes: 30,
  retentionDailyCopies: 14,
  retentionWeeklyCopies: 4,
};
