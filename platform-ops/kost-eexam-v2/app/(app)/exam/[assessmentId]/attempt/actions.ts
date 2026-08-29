"use server";

import { requireRole } from "@/lib/rbac";
import { saveAnswer, toggleMark, submitAttempt, AttemptError } from "@/lib/attempts";
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

/** `auto` (mission "COMPLETE CANDIDATE EXAM LIFECYCLE" §16/§20) — distingue
 * une vraie soumission manuelle (clic "Terminer et envoyer l'examen") d'une
 * auto-soumission déclenchée par l'expiration du chronomètre CÔTÉ CLIENT
 * (ExamRunner.tsx, temps écoulé pendant que le navigateur reste ouvert) —
 * jusqu'ici toujours enregistrée comme 'submitted' même dans ce second cas,
 * ce qui masquait la vraie raison de fin de tentative dans
 * attempts.status/l'audit. La revérification serveur de l'expiration
 * (assertNotExpiredOrAutoSubmit, lib/attempts.ts) reste de toute façon
 * l'autorité finale, indépendamment de ce que le client déclare ici. */
export async function submitAttemptAction(attemptId: number, auto = false): Promise<ActionResult> {
  const session = await requireRole("candidate");
  // Bug réel identifié en concevant EXAM_SUBMITTED (mission "COMPLETE
  // CANDIDATE EXAM LIFECYCLE" §17/§31) : submitAttempt() est idempotente
  // par conception (un second appel sur une tentative déjà soumise ne
  // change rien, voir lib/attempts.ts) — sans cette vérification AVANT
  // l'appel, une resoumission (double-clic, retry réseau) redéclencherait
  // quand même les notifications ci-dessous à chaque appel. `alreadySubmitted`
  // capture l'état AVANT, pour ne notifier que sur la vraie première
  // transition — jamais une confirmation/alerte staff en double.
  const before = getDb().prepare(`SELECT status FROM attempts WHERE id = ?`).get(attemptId) as { status: string } | undefined;
  const alreadySubmitted = !before || before.status !== "in_progress";

  try {
    submitAttempt(attemptId, session.userId, { auto });
  } catch (err) {
    if (err instanceof AttemptError) return { ok: false, error: err.message };
    throw err;
  }

  if (!alreadySubmitted) {
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
