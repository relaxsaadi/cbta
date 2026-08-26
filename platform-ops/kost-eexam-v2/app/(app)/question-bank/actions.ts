"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { createQuestion, addQuestionVersion, type SourceStatus, type QType } from "@/lib/questions";

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

  const choiceTexts = formData.getAll("choiceText").map(String);
  const correctIndexes = formData.getAll("correct").map(String);

  if (!kostQuestionId || !functionCode || !stem) return { error: "ID KOST, fonction et texte de la question sont obligatoires." };
  const choices = choiceTexts.filter((t) => t.trim().length > 0).map((text, i) => ({ key: String.fromCharCode(65 + i), text: text.trim() }));
  if (choices.length < 2) return { error: "Au moins 2 choix de réponse sont requis." };
  const correctKeys = correctIndexes.map((i) => String.fromCharCode(65 + Number(i)));
  if (correctKeys.length === 0) return { error: "Sélectionnez au moins une bonne réponse." };

  try {
    createQuestion({
      kostQuestionId,
      functionCode,
      qtype,
      sourceStatus,
      stem,
      choices,
      correctAnswer: correctKeys,
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

  const stem = String(formData.get("stem") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim() || undefined;
  const choiceTexts = formData.getAll("choiceText").map(String);
  const correctIndexes = formData.getAll("correct").map(String);

  if (!stem) return { error: "Le texte de la question est obligatoire." };
  const choices = choiceTexts.filter((t) => t.trim().length > 0).map((text, i) => ({ key: String.fromCharCode(65 + i), text: text.trim() }));
  if (choices.length < 2) return { error: "Au moins 2 choix de réponse sont requis." };
  const correctKeys = correctIndexes.map((i) => String.fromCharCode(65 + Number(i)));
  if (correctKeys.length === 0) return { error: "Sélectionnez au moins une bonne réponse." };

  addQuestionVersion(questionId, { stem, choices, correctAnswer: correctKeys, explanation }, session.userId);
  revalidatePath("/question-bank");
  redirect("/question-bank");
}
