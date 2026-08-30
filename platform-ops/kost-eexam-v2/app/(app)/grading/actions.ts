"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteRole } from "@/lib/rbac";
import { submitManualGrade, submitScenarioSubgrade, finalizeManualGradingIfComplete, ManualGradingError } from "@/lib/manual-grading";
import { notifyResultAvailableForAttempt } from "@/lib/email/notify-result";
import { hasAttemptAccess, assertAccess } from "@/lib/tenant-scope";
import { getDb } from "@/lib/db";

export interface GradeAnswerResult {
  error?: string;
}

/** "Correction manuelle" (mission "COMPLETE CANDIDATE EXAM LIFECYCLE",
 * 2026-08-29, §55-57) — statue UNE réponse, puis clôture réellement la
 * notation SEULEMENT si plus rien n'est en attente pour cette tentative
 * (lib/manual-grading.ts::finalizeManualGradingIfComplete, jamais un
 * recalcul via gradeAttempt() qui écraserait une décision humaine). Émet
 * RESULT_AVAILABLE uniquement au moment RÉEL de la clôture — jamais avant. */
export async function gradeAnswerAction(attemptQuestionId: number, _prev: GradeAnswerResult, formData: FormData): Promise<GradeAnswerResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  const isCorrect = String(formData.get("isCorrect") ?? "") === "true";
  const comment = String(formData.get("comment") ?? "").trim() || undefined;

  // Frontière multi-client — un responsable ne peut corriger que les
  // réponses d'une tentative dans son périmètre (même prédicat que la
  // fiche de détail /results/[attemptId], voir lib/tenant-scope.ts).
  const attemptRow = getDb()
    .prepare(`SELECT at.id AS attempt_id FROM attempt_questions aq JOIN attempts at ON at.id = aq.attempt_id WHERE aq.id = ?`)
    .get(attemptQuestionId) as { attempt_id: number } | undefined;
  if (!attemptRow) return { error: "Réponse introuvable." };
  assertAccess(hasAttemptAccess(session, attemptRow.attempt_id));

  let attemptId: number;
  try {
    const result = submitManualGrade(attemptQuestionId, isCorrect, session.userId, session.role, comment);
    attemptId = result.attemptId;
  } catch (err) {
    return { error: err instanceof ManualGradingError ? err.message : "Erreur lors de la correction." };
  }

  const { finalized } = finalizeManualGradingIfComplete(attemptId);
  if (finalized) {
    await notifyResultAvailableForAttempt(attemptId);
  }

  // Bug réel trouvé en E2E (mission "COMPLETE CANDIDATE EXAM LIFECYCLE",
  // 2026-08-29) : renvoyer {success:"..."} depuis une Server Action liée à
  // un <form action=...> ne suffit pas ici — soumettre ce formulaire
  // rafraîchit de toute façon l'arbre Server Component de CETTE MÊME page
  // dans la même transition (comportement standard de l'App Router pour
  // les formulaires liés à une Server Action, indépendamment de tout appel
  // explicite à revalidatePath), donc la ligne concernée (et le message de
  // succès local qu'elle portait) disparaissait AVANT tout affichage — le
  // correcteur voyait la file passer directement de "1 en attente" à "0
  // en attente" sans jamais voir de confirmation. Corrigé en sortant de la
  // transition via une vraie navigation (redirect vers la même page avec
  // un paramètre de confirmation), même convention que le bandeau
  // `justSubmitted` de /mes-resultats — la confirmation vient alors du
  // NOUVEAU rendu de page, jamais d'un état client sur un nœud en train
  // de disparaître.
  revalidatePath("/grading");
  revalidatePath(`/results/${attemptId}`);
  redirect(`/grading?graded=1&finalized=${finalized ? "1" : "0"}`);
}

/** Mission "MISSION FINALE CIBLÉE" (2026-08-30) §5/§9-15 — même
 * composition que gradeAnswerAction ci-dessus (submitX puis
 * finalizeManualGradingIfComplete puis redirect avec confirmation), mais
 * pour UNE sous-question de scénario (voir lib/manual-grading.ts::
 * submitScenarioSubgrade — n'écrit jamais directement is_correct/
 * points_awarded de la ligne scénario tant qu'il reste d'autres
 * sous-questions manuelles en attente pour CE scénario). */
export async function gradeScenarioSubAnswerAction(attemptQuestionId: number, subquestionId: string, _prev: GradeAnswerResult, formData: FormData): Promise<GradeAnswerResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  const isCorrect = String(formData.get("isCorrect") ?? "") === "true";
  const comment = String(formData.get("comment") ?? "").trim() || undefined;

  const attemptRow = getDb()
    .prepare(`SELECT at.id AS attempt_id FROM attempt_questions aq JOIN attempts at ON at.id = aq.attempt_id WHERE aq.id = ?`)
    .get(attemptQuestionId) as { attempt_id: number } | undefined;
  if (!attemptRow) return { error: "Réponse introuvable." };
  assertAccess(hasAttemptAccess(session, attemptRow.attempt_id));

  let attemptId: number;
  try {
    const result = submitScenarioSubgrade(attemptQuestionId, subquestionId, isCorrect, session.userId, session.role, comment);
    attemptId = result.attemptId;
  } catch (err) {
    return { error: err instanceof ManualGradingError ? err.message : "Erreur lors de la correction." };
  }

  const { finalized } = finalizeManualGradingIfComplete(attemptId);
  if (finalized) {
    await notifyResultAvailableForAttempt(attemptId);
  }

  revalidatePath("/grading");
  revalidatePath(`/results/${attemptId}`);
  redirect(`/grading?graded=1&finalized=${finalized ? "1" : "0"}`);
}
