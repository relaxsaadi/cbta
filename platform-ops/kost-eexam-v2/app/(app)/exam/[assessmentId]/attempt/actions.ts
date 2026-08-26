"use server";

import { requireRole } from "@/lib/rbac";
import { saveAnswer, toggleMark, submitAttempt, AttemptError } from "@/lib/attempts";

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

export async function submitAttemptAction(attemptId: number): Promise<ActionResult> {
  const session = await requireRole("candidate");
  try {
    submitAttempt(attemptId, session.userId, { auto: false });
    return { ok: true };
  } catch (err) {
    if (err instanceof AttemptError) return { ok: false, error: err.message };
    throw err;
  }
}
