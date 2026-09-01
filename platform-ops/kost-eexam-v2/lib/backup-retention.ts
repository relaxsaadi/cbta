import { readdirSync, unlinkSync } from "node:fs";
import { basename, resolve } from "node:path";

export interface BackupRetentionPolicy {
  retentionDailyCopies: number;
  retentionWeeklyCopies: number;
}

interface BackupCandidate {
  name: string;
  timestampMs: number;
  dayKey: string;
  weekKey: string;
}

const BACKUP_NAME_RE = /^kost-eexam-v2_(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z\.db$/;

function isoWeekKey(timestampMs: number): string {
  const source = new Date(timestampMs);
  const date = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth(), source.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const weekYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${weekYear}-W${String(week).padStart(2, "0")}`;
}

export function parseBackupFilename(name: string): BackupCandidate | null {
  const match = BACKUP_NAME_RE.exec(name);
  if (!match) return null;

  const [, dayKey, hour, minute, second, millisecond] = match;
  const canonicalTimestamp = `${dayKey}T${hour}:${minute}:${second}.${millisecond}Z`;
  const parsed = Date.parse(canonicalTimestamp);
  if (!Number.isFinite(parsed)) return null;

  // Destructive retention must only manage filenames that round-trip to a
  // real UTC instant. Date.parse can normalize impossible dates (for example
  // 31 February) on some runtimes; such files must be treated as unmanaged.
  if (new Date(parsed).toISOString() !== canonicalTimestamp) return null;

  return {
    name,
    timestampMs: parsed,
    dayKey,
    weekKey: isoWeekKey(parsed),
  };
}

export function selectBackupFilesToDelete(
  fileNames: string[],
  policy: BackupRetentionPolicy,
  protectedBackupName: string,
): string[] {
  if (!Number.isInteger(policy.retentionDailyCopies) || policy.retentionDailyCopies < 1) {
    throw new Error("retentionDailyCopies doit être un entier >= 1");
  }
  if (!Number.isInteger(policy.retentionWeeklyCopies) || policy.retentionWeeklyCopies < 0) {
    throw new Error("retentionWeeklyCopies doit être un entier >= 0");
  }

  const candidates = fileNames
    .map(parseBackupFilename)
    .filter((candidate): candidate is BackupCandidate => candidate !== null)
    .sort((a, b) => b.timestampMs - a.timestampMs || b.name.localeCompare(a.name));

  if (candidates.length === 0) return [];

  const protectedCandidate = candidates.find((candidate) => candidate.name === protectedBackupName);
  if (!protectedCandidate) {
    throw new Error(`La sauvegarde protégée n'est pas présente dans le répertoire : ${protectedBackupName}`);
  }

  const keep = new Set<string>([protectedBackupName]);
  const dailyDays = new Set<string>();
  const dailyWeeks = new Set<string>();

  for (const candidate of candidates) {
    if (dailyDays.has(candidate.dayKey)) continue;
    if (dailyDays.size >= policy.retentionDailyCopies) break;

    dailyDays.add(candidate.dayKey);
    dailyWeeks.add(candidate.weekKey);
    keep.add(candidate.name);
  }

  const weeklyWeeks = new Set<string>();
  for (const candidate of candidates) {
    // Weekly copies must be additional, older ISO weeks. Do not let an older
    // duplicate from a retained daily day (or another day in a daily-covered
    // ISO week) consume one of the four weekly slots.
    if (dailyDays.has(candidate.dayKey) || dailyWeeks.has(candidate.weekKey)) continue;
    if (weeklyWeeks.has(candidate.weekKey)) continue;
    if (weeklyWeeks.size >= policy.retentionWeeklyCopies) break;

    weeklyWeeks.add(candidate.weekKey);
    keep.add(candidate.name);
  }

  // Safety invariant: even under clock skew or an unusual filename ordering,
  // the backup produced and checksum-verified by the current run is never pruned.
  keep.add(protectedBackupName);

  return candidates.filter((candidate) => !keep.has(candidate.name)).map((candidate) => candidate.name);
}

export function enforceBackupRetention(
  backupDir: string,
  policy: BackupRetentionPolicy,
  protectedBackupPath: string,
): { deleted: string[]; keptCount: number } {
  const protectedBackupName = basename(protectedBackupPath);
  const fileNames = readdirSync(backupDir);
  const toDelete = selectBackupFilesToDelete(fileNames, policy, protectedBackupName);

  for (const name of toDelete) {
    if (name === protectedBackupName) {
      throw new Error("Invariant de sécurité violé : tentative de suppression de la sauvegarde courante");
    }
    unlinkSync(resolve(backupDir, name));
  }

  const managedCount = fileNames.filter((name) => parseBackupFilename(name) !== null).length;
  return { deleted: toDelete, keptCount: managedCount - toDelete.length };
}
