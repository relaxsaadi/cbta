"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { createQuestion, addQuestionVersion, getQuestionById, parseAuthoringFormData, validateQuestionAuthoring, type SourceStatus, type QType } from "@/lib/questions";

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
