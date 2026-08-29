// Rappels optionnels d'examen (EXAM_OPENS_SOON / EXAM_NOW_AVAILABLE /
// EXAM_DEADLINE_REMINDER, mission email §22-23) — appelé par un cron
// externe via POST /api/notifications/reminders (voir deploy/reminders.sh
// et crontab.example), jamais depuis une requête utilisateur.
//
// Anti-doublon : reminder_dispatch_log (contrainte UNIQUE sur
// (assessment_id, candidate_user_id, reminder_type)) — le créneau est
// réclamé par un INSERT OR IGNORE AVANT l'envoi ; si le tour de cron
// suivant retombe sur le même couple, l'INSERT échoue silencieusement
// (0 ligne affectée) et le rappel n'est jamais renvoyé. La fiabilité de
// LIVRAISON (retry réseau) reste entièrement la responsabilité de
// notification_log/queueAndSendEmail — reminder_dispatch_log répond
// uniquement à la question "avons-nous déjà décidé d'envoyer CE rappel",
// jamais à "a-t-il été livré".
// Pas de garde "server-only" — voir lib/email/audit.ts pour la
// justification (module de domaine, doit rester testable via node:test).
import { getDb, nowIso } from "../db";
import { functionLabel } from "../questions";
import { notifyExamOpensSoon, notifyExamNowAvailable, notifyExamDeadlineReminder } from "./events";

/** Fenêtre "ouvre bientôt" — un examen dont open_at tombe dans les 24h à
 * venir déclenche le rappel une seule fois (voir claimReminderSlot). */
const OPENS_SOON_WINDOW_HOURS = 24;
/** Fenêtre "vient d'ouvrir" — volontairement un peu plus large que la
 * fréquence de cron recommandée (60 min, voir deploy/crontab.example)
 * pour ne jamais rater une fenêtre en cas de run cron manqué/retardé. */
const NOW_AVAILABLE_WINDOW_MINUTES = 90;
/** Fenêtre "échéance proche" — un examen dont close_at tombe dans les 24h
 * à venir ET que le candidat n'a pas encore composé. */
const DEADLINE_WINDOW_HOURS = 24;

interface AssignedCandidateRow {
  candidate_user_id: number;
  full_name: string;
  email: string | null;
}

interface AssessmentContextRow {
  id: number;
  name: string;
  function_code: string;
  group_id: number;
  company_id: number;
  company_name: string;
  open_at: string | null;
  close_at: string | null;
  duration_minutes: number;
}

function assignedCandidates(assessmentId: number): AssignedCandidateRow[] {
  return getDb()
    .prepare(
      `SELECT u.id AS candidate_user_id, u.full_name, u.email
       FROM assessment_assignments aa JOIN users u ON u.id = aa.candidate_user_id
       WHERE aa.assessment_id = ?`
    )
    .all(assessmentId) as unknown as AssignedCandidateRow[];
}

/** true = créneau réclamé avec succès (première fois pour ce couple) —
 * l'appelant doit alors envoyer ; false = déjà envoyé lors d'un tour
 * précédent, l'appelant ne doit rien faire. */
function claimReminderSlot(assessmentId: number, candidateUserId: number, reminderType: string): boolean {
  const result = getDb()
    .prepare(`INSERT OR IGNORE INTO reminder_dispatch_log (assessment_id, candidate_user_id, reminder_type) VALUES (?, ?, ?)`)
    .run(assessmentId, candidateUserId, reminderType);
  return Number(result.changes) > 0;
}

export interface ReminderDispatchSummary {
  type: "EXAM_OPENS_SOON" | "EXAM_NOW_AVAILABLE" | "EXAM_DEADLINE_REMINDER";
  assessmentsConsidered: number;
  candidatesConsidered: number;
  sent: number;
  skippedAlreadyDispatched: number;
  skippedNoEmail: number;
}

function candidatesWithoutAttempt(assessmentId: number, candidateIds: number[]): Set<number> {
  if (candidateIds.length === 0) return new Set();
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT candidate_user_id FROM attempts WHERE assessment_id = ? AND candidate_user_id IN (${candidateIds.map(() => "?").join(",")})`
    )
    .all(assessmentId, ...candidateIds) as { candidate_user_id: number }[];
  const withAttempt = new Set(rows.map((r) => r.candidate_user_id));
  return new Set(candidateIds.filter((id) => !withAttempt.has(id)));
}

/** EXAM_OPENS_SOON — examens publiés/ouverts dont open_at tombe dans les
 * OPENS_SOON_WINDOW_HOURS heures à venir (jamais un examen déjà ouvert —
 * ce cas relève d'EXAM_NOW_AVAILABLE, pas de ce rappel). */
export async function dispatchExamOpensSoonReminders(): Promise<ReminderDispatchSummary> {
  const now = nowIso();
  const windowEnd = new Date(Date.parse(now) + OPENS_SOON_WINDOW_HOURS * 3600 * 1000).toISOString();
  const assessments = getDb()
    .prepare(
      `SELECT a.id, a.name, a.function_code, a.group_id, g.company_id, c.name AS company_name, a.open_at, a.close_at, a.duration_minutes
       FROM assessments a JOIN groups g ON g.id = a.group_id JOIN companies c ON c.id = g.company_id
       WHERE a.status IN ('published','open') AND a.scope = 'production'
         AND a.open_at IS NOT NULL AND a.open_at > ? AND a.open_at <= ?`
    )
    .all(now, windowEnd) as unknown as AssessmentContextRow[];

  const summary: ReminderDispatchSummary = { type: "EXAM_OPENS_SOON", assessmentsConsidered: assessments.length, candidatesConsidered: 0, sent: 0, skippedAlreadyDispatched: 0, skippedNoEmail: 0 };
  for (const a of assessments) {
    for (const c of assignedCandidates(a.id)) {
      summary.candidatesConsidered++;
      if (!claimReminderSlot(a.id, c.candidate_user_id, "EXAM_OPENS_SOON")) {
        summary.skippedAlreadyDispatched++;
        continue;
      }
      if (!c.email) {
        summary.skippedNoEmail++;
        continue;
      }
      const firstName = c.full_name.split(/\s+/)[0] ?? c.full_name;
      await notifyExamOpensSoon({
        userId: c.candidate_user_id,
        email: c.email,
        firstName,
        assessmentId: a.id,
        examName: a.name,
        functionLabel: functionLabel(a.function_code),
        companyId: a.company_id,
        companyName: a.company_name,
        openAt: a.open_at as string,
        durationMinutes: a.duration_minutes,
      });
      summary.sent++;
    }
  }
  return summary;
}

/** EXAM_NOW_AVAILABLE — examens dont open_at vient de passer (fenêtre
 * glissante NOW_AVAILABLE_WINDOW_MINUTES), déjà à l'état 'open'. */
export async function dispatchExamNowAvailableReminders(): Promise<ReminderDispatchSummary> {
  const now = nowIso();
  const windowStart = new Date(Date.parse(now) - NOW_AVAILABLE_WINDOW_MINUTES * 60 * 1000).toISOString();
  const assessments = getDb()
    .prepare(
      `SELECT a.id, a.name, a.function_code, a.group_id, g.company_id, c.name AS company_name, a.open_at, a.close_at, a.duration_minutes
       FROM assessments a JOIN groups g ON g.id = a.group_id JOIN companies c ON c.id = g.company_id
       WHERE a.status IN ('published','open') AND a.scope = 'production'
         AND a.open_at IS NOT NULL AND a.open_at > ? AND a.open_at <= ?`
    )
    .all(windowStart, now) as unknown as AssessmentContextRow[];

  const summary: ReminderDispatchSummary = { type: "EXAM_NOW_AVAILABLE", assessmentsConsidered: assessments.length, candidatesConsidered: 0, sent: 0, skippedAlreadyDispatched: 0, skippedNoEmail: 0 };
  for (const a of assessments) {
    for (const c of assignedCandidates(a.id)) {
      summary.candidatesConsidered++;
      if (!claimReminderSlot(a.id, c.candidate_user_id, "EXAM_NOW_AVAILABLE")) {
        summary.skippedAlreadyDispatched++;
        continue;
      }
      if (!c.email) {
        summary.skippedNoEmail++;
        continue;
      }
      const firstName = c.full_name.split(/\s+/)[0] ?? c.full_name;
      await notifyExamNowAvailable({
        userId: c.candidate_user_id,
        email: c.email,
        firstName,
        assessmentId: a.id,
        examName: a.name,
        functionLabel: functionLabel(a.function_code),
        companyId: a.company_id,
        companyName: a.company_name,
        closeAt: a.close_at,
        durationMinutes: a.duration_minutes,
      });
      summary.sent++;
    }
  }
  return summary;
}

/** EXAM_DEADLINE_REMINDER — examens ouverts dont close_at tombe dans les
 * DEADLINE_WINDOW_HOURS heures à venir, UNIQUEMENT pour les candidats
 * affectés sans aucune tentative existante (déjà composé = jamais relancé). */
export async function dispatchExamDeadlineReminders(): Promise<ReminderDispatchSummary> {
  const now = nowIso();
  const windowEnd = new Date(Date.parse(now) + DEADLINE_WINDOW_HOURS * 3600 * 1000).toISOString();
  const assessments = getDb()
    .prepare(
      `SELECT a.id, a.name, a.function_code, a.group_id, g.company_id, c.name AS company_name, a.open_at, a.close_at, a.duration_minutes
       FROM assessments a JOIN groups g ON g.id = a.group_id JOIN companies c ON c.id = g.company_id
       WHERE a.status IN ('published','open') AND a.scope = 'production'
         AND a.close_at IS NOT NULL AND a.close_at > ? AND a.close_at <= ?`
    )
    .all(now, windowEnd) as unknown as AssessmentContextRow[];

  const summary: ReminderDispatchSummary = { type: "EXAM_DEADLINE_REMINDER", assessmentsConsidered: assessments.length, candidatesConsidered: 0, sent: 0, skippedAlreadyDispatched: 0, skippedNoEmail: 0 };
  for (const a of assessments) {
    const candidates = assignedCandidates(a.id);
    const noAttempt = candidatesWithoutAttempt(a.id, candidates.map((c) => c.candidate_user_id));
    for (const c of candidates) {
      if (!noAttempt.has(c.candidate_user_id)) continue; // déjà composé — jamais de rappel d'échéance
      summary.candidatesConsidered++;
      if (!claimReminderSlot(a.id, c.candidate_user_id, "EXAM_DEADLINE_REMINDER")) {
        summary.skippedAlreadyDispatched++;
        continue;
      }
      if (!c.email) {
        summary.skippedNoEmail++;
        continue;
      }
      const firstName = c.full_name.split(/\s+/)[0] ?? c.full_name;
      await notifyExamDeadlineReminder({
        userId: c.candidate_user_id,
        email: c.email,
        firstName,
        assessmentId: a.id,
        examName: a.name,
        functionLabel: functionLabel(a.function_code),
        companyId: a.company_id,
        companyName: a.company_name,
        closeAt: a.close_at as string,
      });
      summary.sent++;
    }
  }
  return summary;
}

export async function dispatchAllReminders(): Promise<ReminderDispatchSummary[]> {
  return [await dispatchExamOpensSoonReminders(), await dispatchExamNowAvailableReminders(), await dispatchExamDeadlineReminders()];
}
