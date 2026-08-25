import "server-only";
import { readFile } from "fs/promises";

// Monté en lecture seule depuis le VPS (/root/backups/logs) — voir
// docker-compose de la console. Aucune donnée fictive : si le fichier est
// absent ou vide, chaque section retombe explicitement sur "not_available".
const LOG_PATH = process.env.BACKUP_LOG_PATH ?? "/data/backup-logs/backup-log.jsonl";

export interface BackupLogEntry {
  timestamp: string;
  type: string;
  status: string;
  size_bytes?: number;
  sha256?: string;
  duration_seconds?: number;
  detail?: string;
  live_table_count?: number;
  restored_table_count?: number;
  restored_user_count?: number;
  moodledata_archive_ok?: boolean;
}

export type HealthStatus = "verified" | "warning" | "critical" | "not_available";

export interface HealthItem {
  label: string;
  status: HealthStatus;
  detail: string;
  timestamp: string | null;
}

async function readLogEntries(): Promise<BackupLogEntry[]> {
  try {
    const raw = await readFile(/* turbopackIgnore: true */ LOG_PATH, "utf-8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as BackupLogEntry;
        } catch {
          return null;
        }
      })
      .filter((e): e is BackupLogEntry => e !== null);
  } catch {
    return [];
  }
}

function latestOfType(entries: BackupLogEntry[], type: string): BackupLogEntry | null {
  const matches = entries.filter((e) => e.type === type);
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
}

export async function getSystemHealth(): Promise<HealthItem[]> {
  const entries = await readLogEntries();

  if (entries.length === 0) {
    return [
      { label: "Local Backup", status: "not_available", detail: "Aucun journal de sauvegarde trouvé", timestamp: null },
      { label: "Off-site Backup", status: "not_available", detail: "Aucun journal de sauvegarde trouvé", timestamp: null },
      { label: "Restore Test", status: "not_available", detail: "Aucun journal de sauvegarde trouvé", timestamp: null },
    ];
  }

  const db = latestOfType(entries, "database");
  const offsite = latestOfType(entries, "offsite_copy");
  const restore = latestOfType(entries, "restore_test");

  const items: HealthItem[] = [];

  items.push({
    label: "Local Backup",
    status: db ? (db.status === "success" ? "verified" : "critical") : "not_available",
    detail: db
      ? `${db.status === "success" ? "Dernière sauvegarde réussie" : "Dernière tentative échouée"} : ${formatDate(db.timestamp)}`
      : "Aucune sauvegarde locale enregistrée pour l'instant",
    timestamp: db?.timestamp ?? null,
  });

  items.push({
    label: "Off-site Backup",
    status: offsite
      ? offsite.status === "success"
        ? "verified"
        : "warning" // échec off-site n'est jamais "critical" — le backup local reste valide
      : "not_available",
    detail: offsite
      ? offsite.status === "success"
        ? `Copie vérifiée : ${formatDate(offsite.timestamp)}`
        : `Dernière tentative : ${offsite.detail ?? "échec"} (${formatDate(offsite.timestamp)})`
      : "Aucune copie externalisée enregistrée pour l'instant",
    timestamp: offsite?.timestamp ?? null,
  });

  items.push({
    label: "Restore Test",
    status: restore ? (restore.status === "success" ? "verified" : "critical") : "not_available",
    detail: restore
      ? restore.status === "success"
        ? `${restore.restored_table_count}/${restore.live_table_count} tables restaurées — ${formatDate(restore.timestamp)}`
        : `Échec : ${formatDate(restore.timestamp)}`
      : "Aucun test de restauration enregistré pour l'instant",
    timestamp: restore?.timestamp ?? null,
  });

  return items;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
