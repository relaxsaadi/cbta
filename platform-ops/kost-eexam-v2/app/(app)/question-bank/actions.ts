"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import {
  createQuestion,
  addQuestionVersion,
  getQuestionById,
  parseAuthoringFormData,
  validateQuestionAuthoring,
  isQuestionProtected,
  deleteQuestion,
  setQuestionActive,
  recordAnnualReview,
  QuestionDeleteError,
  type SourceStatus,
  type QType,
  type AnnualReviewDecision,
} from "@/lib/questions";
import { validateAnnualReviewPolicy } from "@/lib/annual-review-policy";
import { audit } from "@/lib/audit";
import type { SimpleActionResult } from "@/components/ui/ActionButton";

export interface CreateQuestionResult {
  error?: string;
  success?: string;
}

/** §3/§4 de la mission : ne jamais inventer de contenu réglementaire — ce
 * formulaire est l'outil de saisie CONTRÔLÉE (un opérateur humain habilité
 * transcrit une question depuis une source déjà vérifiée), pas un
 * générateur. Le statut source doit être choisi explicitement à chaque
 * fois — jamais un défaut silencieux vers FROZEN. */
export async function createQuestionAction(_prev: CreateQuestionResult, formData: FormData): Promise<CreateQuestionResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");

  const kostQuestionId = String(formData.get("kostQuestionId") ?? "").trim();
  const functionCode = String(formData.get("functionCode") ?? "");
  const stem = String(formData.get("stem") ?? "").trim();
  const sourceStatus = String(formData.get("sourceStatus") ?? "NOT_ATTEMPTED") as SourceStatus;
  const qtype = String(formData.get("qtype") ?? "mcq_single") as QType;
  const regulatoryReference = String(formData.get("regulatoryReference") ?? "").trim() || undefined;
  const explanation = String(formData.get("explanation") ?? "").trim() || undefined;

  if (!kostQuestionId || !functionCode || !stem) return { error: "ID KOST, fonction et texte de la question sont obligatoires." };

  // Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §41-53 —
  // parsing + validations d'auteurage désormais partagés par TYPE
  // (lib/questions.ts), jamais une seconde implémentation ici pour les
  // nouveaux types (numeric/short_answer) alors que mcq_single/mcq_multi
  // gardaient l'ancien chemin.
  const { choices, correctAnswer } = parseAuthoringFormData(qtype, formData);
  const validationError = validateQuestionAuthoring(qtype, choices, correctAnswer);
  if (validationError) return { error: validationError };

  try {
    createQuestion({
      kostQuestionId,
      functionCode,
      qtype,
      sourceStatus,
      stem,
      choices,
      correctAnswer,
      regulatoryReference,
      explanation,
      createdBy: session.userId,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur inconnue." };
  }

  revalidatePath("/question-bank");
  return { success: `Question ${kostQuestionId} créée.` };
}

export interface EditQuestionResult {
  error?: string;
}

/** Crée une NOUVELLE version (jamais un UPDATE de l'ancienne, §4) — un
 * examen déjà publié référence le snapshot pris à sa publication, qui
 * pointe vers l'ancien version_id et reste donc inchangé après cet appel.
 * Réservé à l'administrateur (pas le responsable pédagogique) : modifier
 * une question déjà en banque est plus sensible que la simple saisie
 * initiale contrôlée. */
export async function editQuestionAction(questionId: number, _prev: EditQuestionResult, formData: FormData): Promise<EditQuestionResult> {
  const session = await requireWriteRole("administrator");

  const question = getQuestionById(questionId);
  if (!question) return { error: "Question introuvable." };

  const stem = String(formData.get("stem") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim() || undefined;
  if (!stem) return { error: "Le texte de la question est obligatoire." };

  const { choices, correctAnswer } = parseAuthoringFormData(question.qtype, formData);
  const validationError = validateQuestionAuthoring(question.qtype, choices, correctAnswer);
  if (validationError) return { error: validationError };

  addQuestionVersion(questionId, { stem, choices, correctAnswer, explanation }, session.userId);
  revalidatePath("/question-bank");
  redirect("/question-bank");
}

/** §8-10 — suppression DÉFINITIVE, réservée à l'administrateur (même
 * frontière de risque qu'editQuestionAction : plus sensible que la simple
 * saisie initiale, ici irréversible en plus). Revérifie isQuestionProtected
 * ICI (jamais une confiance aveugle dans le bouton UI, qui ne devrait de
 * toute façon jamais s'afficher pour une question protégée — défense en
 * profondeur réelle, pas décorative) ; lib/questions.ts::deleteQuestion
 * revérifie une 3e fois avant le DELETE lui-même. */
export async function deleteQuestionAction(questionId: number, _prev: SimpleActionResult, _formData: FormData): Promise<SimpleActionResult> {
  const session = await requireWriteRole("administrator");
  const question = getQuestionById(questionId);
  if (!question) return { error: "Question introuvable." };
  if (isQuestionProtected(questionId)) {
    return { error: "Cette question a déjà été publiée dans une évaluation — suppression définitive impossible. Utilisez « Désactiver » à la place." };
  }
  try {
    deleteQuestion(questionId);
  } catch (err) {
    return { error: err instanceof QuestionDeleteError ? err.message : "Erreur inconnue." };
  }
  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "question_deleted",
    targetType: "question",
    targetId: questionId,
    metadata: { kostQuestionId: question.kost_question_id, previousSourceStatus: question.source_status },
  });
  revalidatePath("/question-bank");
  redirect("/question-bank");
}

/** §8-10 — archivage/désactivation réversible. Ouvert au responsable
 * pédagogique ET à l'administrateur (même périmètre que createQuestionAction
 * — moins sensible qu'un DELETE ou qu'une nouvelle version, entièrement
 * réversible) — jamais à l'auditeur (lecture seule, déjà appliqué par
 * requireWriteRole). `active` porté en champ caché par le formulaire
 * appelant (ActionButton) : bascule explicite, jamais devinée. */
export async function setQuestionActiveAction(
  questionId: number,
  _prev: SimpleActionResult,
  formData: FormData
): Promise<SimpleActionResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  const question = getQuestionById(questionId);
  if (!question) return { error: "Question introuvable." };
  const nextActive = String(formData.get("active")) === "true";
  try {
    setQuestionActive(questionId, nextActive);
  } catch (err) {
    return { error: err instanceof QuestionDeleteError ? err.message : "Erreur inconnue." };
  }
  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: nextActive ? "question_reactivated" : "question_archived",
    targetType: "question",
    targetId: questionId,
    metadata: { kostQuestionId: question.kost_question_id, previousActive: question.active === 1, wasProtected: isQuestionProtected(questionId) },
  });
  revalidatePath("/question-bank");
  revalidatePath(`/question-bank/${questionId}/edit`);
  return { success: nextActive ? "Question réactivée." : "Question désactivée — conservée pour l'historique, plus disponible pour de nouveaux examens." };
}

export interface RecordAnnualReviewResult {
  error?: string;
  success?: string;
}

/** Mission "CLOSE AUDITOR REMARKS" (2026-08-31) §2-4 — enregistre une revue
 * annuelle RÉELLEMENT menée par un instructeur habilité. Ce formulaire
 * n'invente RIEN : reviewerName/reviewDate doivent décrire un événement
 * humain déjà survenu ; l'opérateur qui saisit ce formulaire (session.userId,
 * created_by) n'est PAS nécessairement le réviseur lui-même — un
 * administrateur/responsable pédagogique transcrit ici la décision d'un
 * instructeur habilité qui a réellement mené la revue, exactement comme
 * createQuestionAction transcrit une question depuis une source déjà
 * vérifiée sans jamais en inventer le contenu. */
export async function recordAnnualReviewAction(questionId: number, _prev: RecordAnnualReviewResult, formData: FormData): Promise<RecordAnnualReviewResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  const question = getQuestionById(questionId);
  if (!question) return { error: "Question introuvable." };

  const reviewYear = Number(formData.get("reviewYear"));
  const applicableEdition = String(formData.get("applicableEdition") ?? "").trim();
  const reviewerName = String(formData.get("reviewerName") ?? "").trim();
  const reviewerQualification = String(formData.get("reviewerQualification") ?? "").trim() || undefined;
  const reviewDate = String(formData.get("reviewDate") ?? "").trim();
  const decision = String(formData.get("decision") ?? "") as AnnualReviewDecision;
  const comment = String(formData.get("comment") ?? "").trim() || undefined;
  const nextReviewDue = String(formData.get("nextReviewDue") ?? "").trim() || undefined;

  if (!reviewYear || !applicableEdition || !reviewerName || !reviewDate) {
    return { error: "Année, édition applicable, nom du réviseur et date de revue sont obligatoires." };
  }
  if (!["A_REVOIR", "REVUE_EN_COURS", "REVUE_TERMINEE"].includes(decision)) {
    return { error: "Décision invalide." };
  }

  // Readiness blocker #16 — une valeur terminale est une preuve d'audit,
  // pas un simple libellé UI. Le serveur refuse donc une revue future,
  // une année incohérente avec la date réelle, ou REVUE_TERMINEE sans
  // qualification/autorité documentée du réviseur. Les états non terminaux
  // restent représentables sans fabriquer une qualification inexistante.
  const policyError = validateAnnualReviewPolicy({ reviewYear, reviewDate, decision, reviewerQualification });
  if (policyError) return { error: policyError };

  const reviewId = recordAnnualReview({
    questionId,
    reviewYear,
    applicableEdition,
    reviewerName,
    reviewerQualification,
    reviewDate,
    decision,
    comment,
    nextReviewDue,
    createdBy: session.userId,
  });

  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "question_annual_review_recorded",
    targetType: "question",
    targetId: questionId,
    metadata: { kostQuestionId: question.kost_question_id, reviewId, reviewYear, decision, reviewerName },
  });

  revalidatePath(`/question-bank/${questionId}/edit`);
  revalidatePath("/question-bank");
  return { success: `Revue annuelle ${reviewYear} enregistrée pour ${reviewerName}.` };
}
