"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import {
  createAssessmentDraft,
  publishAssessment,
  suspendAssessment,
  reopenAssessment,
  closeAssessment,
  assignCandidatesToAssessment,
  unassignCandidateFromAssessment,
  type AssessmentType,
  type FeedbackMode,
} from "@/lib/assessments";
import { hasGroupAccess, hasAssessmentAccess, assertAccess } from "@/lib/tenant-scope";
import { audit } from "@/lib/audit";
import type { Scope } from "@/lib/scope";

export interface CreateAssessmentResult {
  error?: string;
}

export async function createAssessmentAction(_prev: CreateAssessmentResult, formData: FormData): Promise<CreateAssessmentResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");

  const type = String(formData.get("type") ?? "test") as AssessmentType;
  const name = String(formData.get("name") ?? "").trim();
  const functionCode = String(formData.get("functionCode") ?? "");
  const groupId = Number(formData.get("groupId"));
  const questionCount = Number(formData.get("questionCount"));
  const durationMinutes = Number(formData.get("durationMinutes"));
  const passThresholdPct = Number(formData.get("passThresholdPct"));
  const attemptsAllowed = Number(formData.get("attemptsAllowed"));
  const openAt = String(formData.get("openAt") ?? "") || undefined;
  const closeAt = String(formData.get("closeAt") ?? "") || undefined;
  const shuffleQuestions = formData.get("shuffleQuestions") === "on";
  const shuffleAnswers = formData.get("shuffleAnswers") === "on";
  const feedbackMode = String(formData.get("feedbackMode") ?? "deferred") as FeedbackMode;
  const showResult = formData.get("showResult") === "on";
  const showCorrectAnswers = formData.get("showCorrectAnswers") === "on";
  const scope = String(formData.get("scope") ?? "production") as Scope;

  if (!name || !functionCode || !groupId || !questionCount || !durationMinutes) {
    return { error: "Merci de compléter tous les champs obligatoires." };
  }
  // Frontière multi-client (lib/tenant-scope.ts) — sans ce contrôle, un
  // responsable pourrait créer une évaluation pour le groupe d'un autre
  // client en forgeant groupId dans la requête.
  if (!hasGroupAccess(session, groupId)) {
    audit({ actorUserId: session.userId, actorRole: session.role, action: "assessment_create_denied", targetType: "group", targetId: groupId, result: "failure", metadata: { name, functionCode } });
    return { error: "Ce groupe n'est pas dans votre périmètre." };
  }

  let assessmentId: number;
  try {
    assessmentId = createAssessmentDraft({
      type,
      name,
      functionCode,
      groupId,
      questionSource: "random",
      questionCount,
      durationMinutes,
      passThresholdPct,
      attemptsAllowed,
      openAt,
      closeAt,
      shuffleQuestions,
      shuffleAnswers,
      feedbackMode,
      showResult,
      showCorrectAnswers,
      scope,
      createdBy: session.userId,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inconnue." };
  }

  revalidatePath("/exam-preparation");
  redirect(`/exam-preparation/${assessmentId}`);
}

export interface PublishAssessmentResult {
  error?: string;
}

export async function publishAssessmentAction(
  assessmentId: number,
  _prev: PublishAssessmentResult,
  formData: FormData
): Promise<PublishAssessmentResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  assertAccess(hasAssessmentAccess(session, assessmentId));
  // Deux modes d'affectation (addendum auditeur) — "group" (défaut,
  // comportement historique) ou une sélection explicite de candidats
  // ("selected_candidates" / "individual", distingués côté lib/assessments.ts
  // uniquement par le nombre d'ids reçus).
  const mode = String(formData.get("mode") ?? "group");
  const candidateUserIds = formData.getAll("candidateUserIds").map(Number).filter((n) => Number.isFinite(n) && n > 0);
  if (mode !== "group" && candidateUserIds.length === 0) {
    return { error: "Sélectionnez au moins un candidat pour ce mode d'affectation." };
  }
  try {
    publishAssessment(assessmentId, session.userId, mode === "group" ? {} : { candidateUserIds });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath(`/exam-preparation/${assessmentId}`);
  return {};
}

export async function suspendAssessmentAction(assessmentId: number, reason: string) {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  assertAccess(hasAssessmentAccess(session, assessmentId));
  suspendAssessment(assessmentId, session.userId, reason);
  revalidatePath(`/exam-preparation/${assessmentId}`);
}

export async function reopenAssessmentAction(assessmentId: number) {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  assertAccess(hasAssessmentAccess(session, assessmentId));
  reopenAssessment(assessmentId, session.userId);
  revalidatePath(`/exam-preparation/${assessmentId}`);
}

export async function closeAssessmentAction(assessmentId: number) {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  assertAccess(hasAssessmentAccess(session, assessmentId));
  closeAssessment(assessmentId, session.userId);
  revalidatePath(`/exam-preparation/${assessmentId}`);
}

// Addendum §1 : « retirer/réaffecter un candidat » — sur une évaluation
// DÉJÀ publiée (au-delà de l'affectation initiale faite à la publication).
export interface AssignMoreResult {
  error?: string;
  success?: string;
}

export async function assignMoreCandidatesAction(assessmentId: number, _prev: AssignMoreResult, formData: FormData): Promise<AssignMoreResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  assertAccess(hasAssessmentAccess(session, assessmentId));
  const candidateUserIds = formData.getAll("candidateUserIds").map(Number).filter((n) => Number.isFinite(n) && n > 0);
  if (candidateUserIds.length === 0) return { error: "Sélectionnez au moins un candidat." };
  try {
    const count = assignCandidatesToAssessment(assessmentId, candidateUserIds, session.userId);
    revalidatePath(`/exam-preparation/${assessmentId}`);
    return { success: count > 0 ? `${count} candidat(s) affecté(s).` : "Déjà affecté(s) — aucun changement." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
}

export async function unassignCandidateAction(assessmentId: number, candidateUserId: number) {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  assertAccess(hasAssessmentAccess(session, assessmentId));
  unassignCandidateFromAssessment(assessmentId, candidateUserId, session.userId);
  revalidatePath(`/exam-preparation/${assessmentId}`);
}
