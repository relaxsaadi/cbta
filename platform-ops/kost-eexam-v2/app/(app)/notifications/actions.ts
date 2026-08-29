"use server";

import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { hasAssessmentAccess } from "@/lib/tenant-scope";
import { getManagedCandidateUserIds } from "@/lib/tenant-scope";
import { resendInvitation, resendExamNotification, ResendError } from "@/lib/email/resend-actions";

export interface ResendActionResult {
  error?: string;
  success?: boolean;
}

/** §41-42 — "Renvoyer l'invitation" depuis l'historique de notifications.
 * Un responsable pédagogique ne peut renvoyer qu'à un candidat de ses
 * propres groupes (même frontière que lib/tenant-scope.ts partout
 * ailleurs) ; auditor est structurellement exclu par requireWriteRole. */
export async function resendInvitationFromHistoryAction(_prev: ResendActionResult, formData: FormData): Promise<ResendActionResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  const targetUserId = Number(formData.get("userId"));
  if (!targetUserId) return { error: "Compte introuvable." };
  if (session.role === "pedagogical_manager" && !getManagedCandidateUserIds(session.userId).includes(targetUserId)) {
    return { error: "Ce compte n'est pas dans votre périmètre." };
  }
  try {
    await resendInvitation(targetUserId, { id: session.userId, role: session.role as "pedagogical_manager" | "administrator" });
  } catch (e) {
    if (e instanceof ResendError) return { error: e.message };
    throw e;
  }
  revalidatePath("/notifications");
  return { success: true };
}

/** §41-42 — "Renvoyer la notification d'examen" depuis l'historique. */
export async function resendExamFromHistoryAction(_prev: ResendActionResult, formData: FormData): Promise<ResendActionResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  const targetUserId = Number(formData.get("userId"));
  const assessmentId = Number(formData.get("assessmentId"));
  if (!targetUserId || !assessmentId) return { error: "Examen ou compte introuvable." };
  if (!hasAssessmentAccess(session, assessmentId)) return { error: "Cet examen n'est pas dans votre périmètre." };
  try {
    await resendExamNotification(assessmentId, targetUserId, { id: session.userId, role: session.role as "pedagogical_manager" | "administrator" });
  } catch (e) {
    if (e instanceof ResendError) return { error: e.message };
    throw e;
  }
  revalidatePath("/notifications");
  return { success: true };
}
