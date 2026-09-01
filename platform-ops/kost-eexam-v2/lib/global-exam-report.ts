export interface GlobalExamResultState {
  attempt_status: string | null;
  passed: number | null;
  score_100: number | null;
}

/**
 * An auditor-facing "exam date" must come from an exam occurrence, never
 * from draft/publication metadata. If nobody has started yet, keep that state
 * explicit rather than manufacturing a date from created_at/published_at.
 */
export function globalExamDateLabel(startedAtValues: Array<string | null>): string {
  const earliestStart = startedAtValues.filter((d): d is string => d !== null).sort()[0];
  return earliestStart ? new Date(earliestStart).toLocaleDateString("fr-FR") : "Non commencé";
}

/** Candidate-facing completion/result column. */
export function globalExamResultLabel(r: GlobalExamResultState): string {
  if (!r.attempt_status) return "Non commencé";
  if (r.attempt_status === "in_progress") return "En cours";
  if (r.attempt_status === "abandoned") return "Abandonné";
  if (r.passed === null) return "Envoyé — en attente de correction";
  return r.score_100 !== null ? `${r.score_100} / 100` : "Terminé";
}

export type GlobalExamMentionKind = "success" | "fail" | "pending" | "none";

/**
 * Never fabricate RÉUSSITE/ÉCHEC while a submitted attempt still requires
 * human grading. `passed` remains the authoritative finalized-result flag.
 */
export function globalExamMentionLabel(r: GlobalExamResultState): {
  text: string;
  kind: GlobalExamMentionKind;
} {
  const isSubmitted = r.attempt_status === "submitted" || r.attempt_status === "auto_submitted";
  if (isSubmitted && r.passed === null) return { text: "EN ATTENTE DE CORRECTION", kind: "pending" };
  if (r.passed === 1) return { text: "RÉUSSITE", kind: "success" };
  if (r.passed === 0) return { text: "ÉCHEC", kind: "fail" };
  return { text: "NON FINALISÉ", kind: "none" };
}
