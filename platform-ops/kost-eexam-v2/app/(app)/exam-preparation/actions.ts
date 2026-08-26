"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { createAssessmentDraft, publishAssessment, suspendAssessment, reopenAssessment, closeAssessment, type AssessmentType, type FeedbackMode } from "@/lib/assessments";
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

export async function publishAssessmentAction(assessmentId: number) {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  try {
    publishAssessment(assessmentId, session.userId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
  revalidatePath(`/exam-preparation/${assessmentId}`);
  return {};
}

export async function suspendAssessmentAction(assessmentId: number, reason: string) {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  suspendAssessment(assessmentId, session.userId, reason);
  revalidatePath(`/exam-preparation/${assessmentId}`);
}

export async function reopenAssessmentAction(assessmentId: number) {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  reopenAssessment(assessmentId, session.userId);
  revalidatePath(`/exam-preparation/${assessmentId}`);
}

export async function closeAssessmentAction(assessmentId: number) {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  closeAssessment(assessmentId, session.userId);
  revalidatePath(`/exam-preparation/${assessmentId}`);
}
