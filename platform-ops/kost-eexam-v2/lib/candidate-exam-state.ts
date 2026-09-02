// État candidat explicite par examen affecté (mission "COMPLETE CANDIDATE
// EXAM LIFECYCLE", 2026-08-29, §2/§5-7) — root cause du problème réel
// observé ("Brahimi voit un examen affecté sans action utilisable") :
// /mes-examens ne distinguait jusqu'ici que 3 issues (Reprendre/Commencer/
// texte générique "Indisponible"), sans jamais expliquer POURQUOI un
// examen n'était pas actionnable, et n'affichait JAMAIS un examen
// suspendu (filtré en amont par lib/assessments.ts::
// listAssignedAssessmentsForCandidate — un examen suspendu disparaissait
// silencieusement du tableau de bord plutôt que d'afficher un statut
// explicite). Fonction pure, testable indépendamment de la page.
import { getDb } from "./db";
import type { AssessmentRow } from "./assessments";
import { isAssessmentOpenNow } from "./assessments";
import { formatAlgeriaDateTime } from "./timezone";

export type CandidateExamStateKind =
  | "suspended"
  | "not_published"
  | "in_progress"
  | "awaiting_review"
  | "result_available"
  | "finished"
  | "not_yet_open"
  | "window_closed"
  | "available";

export interface CandidateExamState {
  kind: CandidateExamStateKind;
  /** Libellé badge FR — §2 de la mission. */
  label: string;
  /** Message explicatif complet (§5) — null quand le badge seul suffit
   * (ex. "Disponible", pas besoin d'une phrase). */
  reason: string | null;
  /** CTA à afficher — null = aucune action possible actuellement. */
  cta: { label: string; kind: "start" | "resume" | "view_result" } | null;
}

export interface LatestAttemptInfo {
  attemptId: number | null;
  status: string | null;
  gradingState: "COMPLETE" | "AWAITING_MANUAL_REVIEW" | null;
}

/** Dernière tentative (peu importe son statut) pour ce couple — utilisée
 * pour déterminer si un examen déjà "consommé" doit afficher son résultat
 * plutôt qu'un message générique "tentatives épuisées" sans contexte. */
export function getLatestAttemptInfo(assessmentId: number, candidateUserId: number): LatestAttemptInfo {
  const row = getDb()
    .prepare(
      `SELECT at.id AS attempt_id, at.status, r.grading_state
       FROM attempts at
       LEFT JOIN results r ON r.attempt_id = at.id
       WHERE at.assessment_id = ? AND at.candidate_user_id = ?
       ORDER BY at.id DESC LIMIT 1`
    )
    .get(assessmentId, candidateUserId) as { attempt_id: number; status: string; grading_state: "COMPLETE" | "AWAITING_MANUAL_REVIEW" | null } | undefined;
  if (!row) return { attemptId: null, status: null, gradingState: null };
  return { attemptId: row.attempt_id, status: row.status, gradingState: row.grading_state };
}

function formatOpensAt(openAt: string): string {
  return formatAlgeriaDateTime(openAt, { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** État complet — §6 : politique NULL explicite et cohérente (NULL
 * open_at = disponible immédiatement, NULL close_at = pas de date limite),
 * déjà implémentée par isAssessmentOpenNow() (lib/assessments.ts) et
 * réutilisée ici telle quelle — jamais une seconde interprétation
 * divergente de ces deux colonnes. */
export function computeCandidateExamState(
  assessment: Pick<AssessmentRow, "status" | "open_at" | "close_at" | "attempts_allowed">,
  latest: LatestAttemptInfo,
  finishedAttemptsCount: number
): CandidateExamState {
  if (assessment.status === "suspended") {
    return { kind: "suspended", label: "SUSPENDU", reason: "Votre accès à cet examen est actuellement suspendu.", cta: null };
  }
  if (assessment.status === "draft") {
    return { kind: "not_published", label: "NON DISPONIBLE", reason: "Cet examen n'est pas encore publié.", cta: null };
  }
  // status === 'closed' (fermeture ADMINISTRATIVE explicite via
  // lib/assessments.ts::closeAssessment — distincte d'une fenêtre
  // close_at simplement dépassée) — vérifié sur les vraies données de
  // Brahimi/Mohssen en staging (assessment #31 "session septembre 2026",
  // fermée manuellement) : montrait auparavant un badge générique sans
  // explication, jamais l'état "date limite dépassée" implicite qui
  // décrit pourtant correctement la situation côté candidat.
  if (assessment.status === "closed" && latest.status === null) {
    return { kind: "window_closed", label: "DATE LIMITE DÉPASSÉE", reason: "La période de cet examen est terminée.", cta: null };
  }

  if (latest.status === "in_progress") {
    return { kind: "in_progress", label: "EN COURS", reason: null, cta: { label: "Reprendre l'examen", kind: "resume" } };
  }

  if (latest.attemptId !== null) {
    // Une tentative a déjà été menée jusqu'au bout — montrer SON issue
    // réelle plutôt qu'un message générique, qu'il reste ou non des
    // tentatives disponibles pour ce candidat.
    if (latest.gradingState === "AWAITING_MANUAL_REVIEW") {
      return { kind: "awaiting_review", label: "EN ATTENTE DE CORRECTION", reason: "Votre examen a bien été envoyé et nécessite une correction avant la publication du résultat.", cta: null };
    }
    if (latest.gradingState === "COMPLETE") {
      return { kind: "result_available", label: "RÉSULTAT DISPONIBLE", reason: null, cta: { label: "Voir mon résultat", kind: "view_result" } };
    }
    // Repli défensif — ne devrait pas arriver (la notation est synchrone à
    // la soumission), mais jamais un état non couvert silencieusement.
    if (assessment.attempts_allowed === 0 || finishedAttemptsCount < assessment.attempts_allowed) {
      // Il reste des tentatives disponibles malgré cette dernière terminée
      // sans résultat exploitable — tombe dans le cas "disponible" normal
      // ci-dessous plutôt que de bloquer sans explication.
    } else {
      return { kind: "finished", label: "TERMINÉ", reason: "Vous avez déjà terminé cet examen.", cta: null };
    }
  }

  if (assessment.open_at && new Date(assessment.open_at).getTime() > Date.now()) {
    return { kind: "not_yet_open", label: `DISPONIBLE À PARTIR DU ${formatOpensAt(assessment.open_at)}`, reason: `Cet examen sera disponible le ${formatOpensAt(assessment.open_at)}.`, cta: null };
  }
  if (assessment.close_at && new Date(assessment.close_at).getTime() < Date.now()) {
    return { kind: "window_closed", label: "DATE LIMITE DÉPASSÉE", reason: "La période de cet examen est terminée.", cta: null };
  }
  if (assessment.attempts_allowed !== 0 && finishedAttemptsCount >= assessment.attempts_allowed) {
    return { kind: "finished", label: "TERMINÉ", reason: "Vous avez déjà terminé cet examen.", cta: null };
  }
  if (isAssessmentOpenNow(assessment as AssessmentRow)) {
    return { kind: "available", label: "À COMMENCER", reason: null, cta: { label: "Commencer l'examen", kind: "start" } };
  }
  return { kind: "not_published", label: "NON DISPONIBLE", reason: "Cet examen n'est pas actuellement disponible.", cta: null };
}
