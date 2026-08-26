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
  return getDb().prepare(`SELECT * FROM backup_records ORDER BY created_at DESC LIMIT ?`).all(limit) as unknown as BackupRecord[];
}

export function latestOfType(type: "full_db" | "restore_test"): BackupRecord | undefined {
  return getDb().prepare(`SELECT * FROM backup_records WHERE type = ? ORDER BY created_at DESC LIMIT 1`).get(type) as BackupRecord | undefined;
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
