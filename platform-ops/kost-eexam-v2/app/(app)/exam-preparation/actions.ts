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
  rescheduleAssessment,
  assignCandidatesToAssessment,
  unassignCandidateFromAssessment,
  getAssessment,
  listAssignedCandidateIds,
  type AssessmentType,
  type FeedbackMode,
} from "@/lib/assessments";
import { hasGroupAccess, hasAssessmentAccess, assertAccess } from "@/lib/tenant-scope";
import { audit } from "@/lib/audit";
import type { Scope } from "@/lib/scope";
import { getGroup } from "@/lib/groups";
import { findUserById } from "@/lib/users";
import { functionLabel } from "@/lib/questions";
import { notifyExamAssigned, notifyExamRescheduled } from "@/lib/email/events";
import { auditExamNotificationSent } from "@/lib/email/audit";
import { feedbackScheduleWriteError } from "@/lib/report-access";

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

  // Issue #27 — le chemin de lecture candidat est fail-closed, mais la
  // création doit également refuser une configuration deferred sans borne
  // explicite. Ne jamais inventer de date pour "réparer" silencieusement un
  // formulaire incomplet ; l'opérateur doit la fournir. La même frontière
  // rejette aussi un feedbackMode forgé et une closeAt mal formée.
  const feedbackError = feedbackScheduleWriteError({ feedbackMode, closeAt });
  if (feedbackError) return { error: feedbackError };

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
  /** §7 de la mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) —
   * confirme au responsable QUAND l'examen sera réellement disponible pour
   * les candidats, évite d'affecter un examen en pensant qu'il est
   * immédiatement disponible alors qu'une fenêtre d'ouverture future est
   * configurée. */
  success?: string;
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

  // Un ancien brouillon créé avant le durcissement de #27 peut encore
  // contenir deferred+NULL. Le read path de #28 empêcherait toute fuite de
  // résultat, mais publier ce brouillon créerait un examen opérationnellement
  // incohérent dont le résultat ne pourrait jamais être libéré. Bloquer ici
  // force une correction explicite de la configuration avant affectation.
  const draft = getAssessment(assessmentId);
  if (!draft) return { error: "Évaluation introuvable." };
  const publishFeedbackError = feedbackScheduleWriteError({
    feedbackMode: draft.feedback_mode,
    closeAt: draft.close_at,
  });
  if (publishFeedbackError) return { error: `Publication impossible : ${publishFeedbackError}` };

  try {
    publishAssessment(assessmentId, session.userId, mode === "group" ? {} : { candidateUserIds });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inconnue." };
  }

  await notifyExamAssignedToCandidates(assessmentId, listAssignedCandidateIds(assessmentId), session.userId, session.role as "pedagogical_manager" | "administrator");

  revalidatePath(`/exam-preparation/${assessmentId}`);

  const published = getAssessment(assessmentId)!;
  const availability = !published.open_at
    ? "Maintenant"
    : new Date(published.open_at).getTime() > Date.now()
      ? `Ouverture : ${new Date(published.open_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
      : "Maintenant";
  const closure = published.close_at
    ? ` — Clôture : ${new Date(published.close_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
    : "";
  return { success: `Examen affecté avec succès. Disponible : ${availability}${closure}` };
}

/** EXAM_ASSIGNED (mission email §17) — factorisé pour être appelé à la
 * fois depuis la publication initiale et depuis une affectation
 * ultérieure (assignMoreCandidatesAction). Délibérément APRÈS l'écriture
 * réelle (lib/assessments.ts est synchrone, hors de toute transaction
 * email) : un échec d'envoi ne doit jamais annuler ni retarder
 * l'affectation elle-même (§35/§39 — outbox). Un candidat sans email au
 * dossier est silencieusement ignoré (pas d'erreur bloquante — l'email
 * reste optionnel au niveau du dossier candidat). */
async function notifyExamAssignedToCandidates(assessmentId: number, candidateIds: number[], actorUserId: number, actorRole: "pedagogical_manager" | "administrator") {
  const assessment = getAssessment(assessmentId);
  if (!assessment) return;
  const group = getGroup(assessment.group_id);
  if (!group) return;
  for (const candidateId of candidateIds) {
    const candidate = findUserById(candidateId);
    if (!candidate?.email) continue;
    const firstName = candidate.full_name.split(/\s+/)[0] ?? candidate.full_name;
    await notifyExamAssigned({
      userId: candidateId,
      email: candidate.email,
      firstName,
      assessmentId,
      examName: assessment.name,
      functionLabel: functionLabel(assessment.function_code),
      companyId: group.company_id,
      companyName: group.company_name,
      groupName: group.name,
      openAt: assessment.open_at,
      closeAt: assessment.close_at,
      durationMinutes: assessment.duration_minutes,
      attemptsAllowed: assessment.attempts_allowed,
    });
    auditExamNotificationSent(actorUserId, actorRole, assessmentId, candidateId);
  }
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

// Mission "COMPLETE REAL EXAM RESCHEDULING WORKFLOW" (2026-08-29) — RBAC
// identique aux autres actions de cette page (administrateur + responsable
// pédagogique DANS son périmètre, jamais auditeur — requireWriteRole
// l'exclut structurellement au niveau du type ; candidat n'est même pas
// dans la liste de rôles possible ici) ; hasAssessmentAccess porte la
// frontière multi-client réelle (§2). Messages d'erreur FR explicites
// renvoyés tels quels depuis lib/assessments.ts::rescheduleAssessment
// (validation dates, tentative en cours, statut non reprogrammable).
export interface RescheduleAssessmentResult {
  error?: string;
  success?: string;
}

export async function rescheduleAssessmentAction(assessmentId: number, _prev: RescheduleAssessmentResult, formData: FormData): Promise<RescheduleAssessmentResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  assertAccess(hasAssessmentAccess(session, assessmentId));

  const openAtRaw = String(formData.get("openAt") ?? "").trim();
  const closeAtRaw = String(formData.get("closeAt") ?? "").trim();
  const newOpenAt = openAtRaw || null;
  const newCloseAt = closeAtRaw || null;

  // Issue #27 — une reprogrammation ne doit pas pouvoir supprimer la borne
  // d'un examen deferred. Les anciennes lignes deferred+NULL restent
  // volontairement non publiées par le read path jusqu'à une correction
  // explicite ; cette action exige donc une vraie close_at au lieu d'en
  // inventer une automatiquement.
  const existingAssessment = getAssessment(assessmentId);
  if (!existingAssessment) return { error: "Évaluation introuvable." };
  const feedbackError = feedbackScheduleWriteError({
    feedbackMode: existingAssessment.feedback_mode,
    closeAt: newCloseAt,
  });
  if (feedbackError) return { error: feedbackError };

  let result;
  try {
    result = rescheduleAssessment(assessmentId, newOpenAt, newCloseAt, session.userId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inconnue." };
  }

  // EXAM_RESCHEDULED (§7) — uniquement aux candidats RÉELLEMENT affectés à
  // CET examen, jamais une diffusion large. Délibérément après l'écriture
  // réelle (même principe que notifyExamAssignedToCandidates ci-dessus) :
  // un échec d'envoi ne doit jamais annuler la reprogrammation elle-même.
  const assessment = getAssessment(assessmentId);
  const group = assessment ? getGroup(assessment.group_id) : undefined;
  if (assessment && group) {
    for (const candidateId of listAssignedCandidateIds(assessmentId)) {
      const candidate = findUserById(candidateId);
      if (!candidate?.email) continue;
      const firstName = candidate.full_name.split(/\s+/)[0] ?? candidate.full_name;
      await notifyExamRescheduled({
        userId: candidateId,
        email: candidate.email,
        firstName,
        assessmentId,
        examName: assessment.name,
        functionLabel: functionLabel(assessment.function_code),
        companyId: group.company_id,
        companyName: group.company_name,
        oldOpenAt: result.oldOpenAt,
        oldCloseAt: result.oldCloseAt,
        newOpenAt: result.newOpenAt,
        newCloseAt: result.newCloseAt,
      });
    }
  }

  revalidatePath(`/exam-preparation/${assessmentId}`);
  return { success: "Examen reprogrammé — les candidats affectés ont été notifiés." };
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
    if (count > 0) {
      await notifyExamAssignedToCandidates(assessmentId, candidateUserIds, session.userId, session.role as "pedagogical_manager" | "administrator");
    }
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
