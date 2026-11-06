"use server";

import { requireRole } from "@/lib/rbac";
import { saveAnswer, saveScenarioSubanswer, toggleMark, submitAttempt, AttemptError } from "@/lib/attempts";
import { getDb } from "@/lib/db";
import { notifyResultAvailableForAttempt } from "@/lib/email/notify-result";
import { notifySubmissionEvents } from "@/lib/email/notify-submission";

export interface ActionResult {
  ok: boolean;
  error?: string;
  expired?: boolean;
}

export async function saveAnswerAction(attemptId: number, attemptQuestionId: number, answerKeys: string[]): Promise<ActionResult> {
  const session = await requireRole("candidate");
  try {
    saveAnswer(attemptId, session.userId, attemptQuestionId, answerKeys);
    return { ok: true };
  } catch (err) {
    if (err instanceof AttemptError) return { ok: false, error: err.message, expired: /écoulé/.test(err.message) };
    throw err;
  }
}

/** Autosave d'UNE sous-question de scénario (mission "MISSION FINALE
 * CIBLÉE", 2026-08-30, §9) — jamais saveAnswerAction ci-dessus, qui
 * écraserait tout answer_json du scénario au lieu de fusionner une seule
 * sous-question (voir lib/attempts.ts::saveScenarioSubanswer). */
export async function saveScenarioSubanswerAction(attemptId: number, attemptQuestionId: number, subquestionId: string, answerKeys: string[]): Promise<ActionResult> {
  const session = await requireRole("candidate");
  try {
    saveScenarioSubanswer(attemptId, session.userId, attemptQuestionId, subquestionId, answerKeys);
    return { ok: true };
  } catch (err) {
    if (err instanceof AttemptError) return { ok: false, error: err.message, expired: /écoulé/.test(err.message) };
    throw err;
  }
}

export async function toggleMarkAction(attemptId: number, attemptQuestionId: number, marked: boolean): Promise<ActionResult> {
  const session = await requireRole("candidate");
  try {
    toggleMark(attemptId, session.userId, attemptQuestionId, marked);
    return { ok: true };
  } catch (err) {
    if (err instanceof AttemptError) return { ok: false, error: err.message };
    throw err;
  }
}

/** The client-side timeout hint is only UX state. The SQLite finalizer
 * verifies expiry against the server clock inside the decisive transaction. */
export async function submitAttemptAction(attemptId: number, auto = false): Promise<ActionResult> {
  const session = await requireRole("candidate");
  // #40: only the winning serialized transition may trigger notifications.
  // A pre-transaction SELECT races competing candidate/cron submissions.
  let transitioned = false;
  try {
    transitioned = submitAttempt(attemptId, session.userId, { auto }).transitioned;
  } catch (err) {
    if (err instanceof AttemptError) return { ok: false, error: err.message };
    throw err;
  }

  if (transitioned) {
    // EXAM_SUBMITTED + EXAM_SUBMITTED_ADMIN (§31-36) et RESULT_AVAILABLE
    // (mission email §24, préservé) — après coup, jamais dans la
    // transaction de soumission/notation elle-même (§35 — outbox).
    // RESULT_AVAILABLE uniquement si réellement finalisé (§26-30) —
    // notifyResultAvailableForAttempt() lit déjà `results`, mais une
    // correction manuelle en attente doit RETARDER cette notification
    // jusqu'à finalizeManualGradingIfComplete(), jamais l'envoyer en avance
    // avec un score partiel.
    await notifySubmissionEvents(attemptId);
    const result = getDb().prepare(`SELECT grading_state FROM results WHERE attempt_id = ?`).get(attemptId) as { grading_state: string } | undefined;
    if (result?.grading_state === "COMPLETE") {
      await notifyResultAvailableForAttempt(attemptId);
    }
  }

  return { ok: true };
}
