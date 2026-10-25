/**
 * #225 — deterministic reconciliation of missing EXAM_SUBMITTED,
 * EXAM_SUBMITTED_ADMIN and RESULT_AVAILABLE logical events.
 *
 * A successfully committed terminal attempt is the source of truth. The
 * existing notification_log.idempotency_key UNIQUE constraint prevents
 * duplicate logical intents when a crashed process resumes. No email is sent
 * inside the submission/grading SQLite transaction.
 *
 * Fail-closed cutover: operators MUST supply an ISO-8601 UTC
 * EXAM_NOTIFICATION_RECONCILE_SINCE_UTC after reviewing the historical
 * backlog and EMAIL_MODE. Earlier attempts require controlled reconciliation,
 * not surprise bulk mail from a newly deployed cron.
 *
 * This does not repair stranded SENDING provider deliveries and does not
 * prove an external cron is installed: both remain separate release gates.
 */
import { getDb } from "../db";
import { getAdminAlertRecipient } from "./config";
import { getResultEmailPolicy } from "./result-policy";
import { notifySubmissionEvents } from "./notify-submission";
import { notifyResultAvailableForAttempt } from "./notify-result";

const CURSOR_KEY = "exam_notification_reconcile_cursor";
const CEILING_KEY = "exam_notification_reconcile_ceiling";
const CUTOVER_KEY = "exam_notification_reconcile_cutover";

interface MissingEventRow {
  attempt_id: number;
  missing_candidate: number;
  missing_manager: number;
  missing_admin: number;
  missing_result: number;
}

export interface TerminalNotificationReconcileReport {
  enabled: boolean;
  candidates: number;
  submissionDispatches: number;
  resultDispatches: number;
  orchestrationFailures: number;
  /** Missing keys among THIS invocation's selected attempts, not the total backlog. */
  unresolved: number;
  /** Any eligible absent logical key found across the full configured cutover scope at report time.
   * Does NOT cover stranded QUEUED/SENDING outbox rows or attempts lacking a result. */
  backlogMissing: boolean | null;
  wrapped: boolean;
}

function configuredCutover(): string | null {
  const raw = process.env.EXAM_NOTIFICATION_RECONCILE_SINCE_UTC?.trim();
  if (!raw) return null;
  // Only absolute UTC timestamps. Never silently treat a local date as UTC.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(raw) || !Number.isFinite(Date.parse(raw))) {
    throw new Error("EXAM_NOTIFICATION_RECONCILE_SINCE_UTC must be a valid UTC ISO-8601 timestamp.");
  }
  return new Date(Date.parse(raw)).toISOString();
}

function readSetting(key: string): string | null {
  const row = getDb().prepare(`SELECT value FROM platform_settings WHERE key = ?`).get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

function readNonnegativeId(key: string): number | null {
  const raw = readSetting(key);
  if (raw === null || !/^(0|[1-9][0-9]*)$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}

function storeSetting(key: string, value: string): void {
  getDb().prepare(
    `INSERT INTO platform_settings (key, value, updated_at, updated_by)
     VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'), NULL)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(key, value);
}

/** node:sqlite DatabaseSync has no better-sqlite3 transaction() method.
 * Persist scan metadata atomically with the project's native SQLite API. */
function storeScanState(cursor: number, ceiling: number, since?: string): void {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    storeSetting(CURSOR_KEY, String(cursor));
    storeSetting(CEILING_KEY, String(ceiling));
    if (since !== undefined) storeSetting(CUTOVER_KEY, since);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function latestEligibleId(since: string): number {
  const row = getDb().prepare(
    `SELECT COALESCE(MAX(id), 0) AS id FROM attempts
     WHERE status IN ('submitted','auto_submitted')
       AND submitted_at IS NOT NULL AND submitted_at >= ?`
  ).get(since) as { id: number };
  if (!Number.isSafeInteger(row.id) || row.id < 0) throw new Error("Invalid notification reconciliation ceiling.");
  return row.id;
}

/** Freeze an upper ID for each bounded scan pass. Without this snapshot,
 * continuous new submissions can keep the cursor ahead of old failed events
 * forever. Changing the deliberate UTC cutover resets the prior scan. */
function scanState(since: string): { cursor: number; ceiling: number } {
  if (readSetting(CUTOVER_KEY) !== since || readNonnegativeId(CEILING_KEY) === null) {
    storeScanState(0, latestEligibleId(since), since);
  }
  return {
    cursor: readNonnegativeId(CURSOR_KEY) ?? 0,
    ceiling: readNonnegativeId(CEILING_KEY) ?? 0,
  };
}

/** Return only provably missing logical outbox keys for committed terminal
 * records. Current manager/admin routing is resolved by the existing
 * notification orchestrator; no cross-tenant address guesses or hardcoding. */
function missingAfter(cursor: number, ceiling: number, since: string, adminEmail: string | null, resultEnabled: boolean, limit: number): MissingEventRow[] {
  return getDb().prepare(
    `WITH eligible AS (
       SELECT at.id AS attempt_id,
         CASE WHEN u.email IS NOT NULL AND TRIM(u.email) <> ''
              AND NOT EXISTS (SELECT 1 FROM notification_log nl
                WHERE nl.idempotency_key = 'exam-submitted/' || at.candidate_user_id || '/' || at.submitted_at)
              THEN 1 ELSE 0 END AS missing_candidate,
         CASE WHEN manager.email IS NOT NULL AND TRIM(manager.email) <> ''
              AND NOT EXISTS (SELECT 1 FROM notification_log nl
                WHERE nl.idempotency_key = 'exam-submitted-admin/' || at.id || '/' || LOWER(manager.email))
              THEN 1 ELSE 0 END AS missing_manager,
         CASE WHEN ? IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM notification_log nl
                WHERE nl.idempotency_key = 'exam-submitted-admin/' || at.id || '/' || ?)
              THEN 1 ELSE 0 END AS missing_admin,
         CASE WHEN ? = 1 AND r.grading_state = 'COMPLETE'
                   AND u.email IS NOT NULL AND TRIM(u.email) <> ''
              AND NOT EXISTS (SELECT 1 FROM notification_log nl
                WHERE nl.idempotency_key = 'result-available/' || at.id)
              THEN 1 ELSE 0 END AS missing_result
       FROM attempts at
       JOIN results r ON r.attempt_id = at.id
       JOIN assessments a ON a.id = at.assessment_id
       JOIN groups g ON g.id = a.group_id
       LEFT JOIN users u ON u.id = at.candidate_user_id
       LEFT JOIN users manager ON manager.id = g.pedagogical_manager_id
       WHERE at.id > ? AND at.id <= ? AND at.status IN ('submitted','auto_submitted')
         AND at.submitted_at IS NOT NULL AND at.submitted_at >= ?
     )
     SELECT * FROM eligible
     WHERE missing_candidate = 1 OR missing_manager = 1 OR missing_admin = 1 OR missing_result = 1
     ORDER BY attempt_id ASC LIMIT ?`
  ).all(adminEmail, adminEmail, resultEnabled ? 1 : 0, cursor, ceiling, since, limit) as unknown as MissingEventRow[];
}

export async function reconcileTerminalNotifications(limit = 25): Promise<TerminalNotificationReconcileReport> {
  const empty = { enabled: false, candidates: 0, submissionDispatches: 0, resultDispatches: 0, orchestrationFailures: 0, unresolved: 0, backlogMissing: null, wrapped: false };
  const since = configuredCutover();
  if (since === null) return empty;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error("Invalid bounded reconciliation limit.");

  const adminEmail = getAdminAlertRecipient()?.trim().toLowerCase() || null;
  const resultEnabled = getResultEmailPolicy() !== "NO_EMAIL";
  const { cursor, ceiling } = scanState(since);
  let rows = missingAfter(cursor, ceiling, since, adminEmail, resultEnabled, limit);
  let wrapped = false;
  if (rows.length === 0) {
    // One scan pass has a finite upper boundary. Even a continuous stream of
    // newly submitted attempts cannot prevent this wrap and old-key retry.
    // The next pass includes attempts that arrived after the prior ceiling.
    const nextCeiling = latestEligibleId(since);
    storeScanState(0, nextCeiling);
    wrapped = cursor !== 0;
    rows = missingAfter(0, nextCeiling, since, adminEmail, resultEnabled, limit);
  }

  let submissionDispatches = 0;
  let resultDispatches = 0;
  let orchestrationFailures = 0;
  let unresolved = 0;
  for (const row of rows) {
    if (row.missing_candidate || row.missing_manager || row.missing_admin) {
      try {
        await notifySubmissionEvents(row.attempt_id);
        submissionDispatches++;
      } catch {
        // Per-event template failures are also caught by events.ts::safe().
        // The absent idempotency key remains discoverable on the next scan.
        orchestrationFailures++;
      }
    }
    if (row.missing_result) {
      try {
        await notifyResultAvailableForAttempt(row.attempt_id);
        resultDispatches++;
      } catch {
        orchestrationFailures++;
      }
    }
    // The notification functions intentionally swallow pre-outbox failures.
    // Re-read the authoritative keys rather than misreporting dispatch calls
    // as successfully queued/delivered email.
    const stillMissing = missingAfter(row.attempt_id - 1, row.attempt_id, since, adminEmail, resultEnabled, 1)
      .some((candidate) => candidate.attempt_id === row.attempt_id);
    if (stillMissing) unresolved++;
    storeSetting(CURSOR_KEY, String(row.attempt_id));
  }
  // Authoritative missing-key existence for this cutover, not merely the last
  // selected batch; positive does NOT imply email delivery failure by itself.
  const backlogMissing = missingAfter(0, latestEligibleId(since), since, adminEmail, resultEnabled, 1).length > 0;
  return { enabled: true, candidates: rows.length, submissionDispatches, resultDispatches, orchestrationFailures, unresolved, backlogMissing, wrapped };
}
