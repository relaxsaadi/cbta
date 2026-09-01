export type IndividualReportLevel = "simple" | "detailed";

const ALLOWED_FEEDBACK_MODES = new Set(["immediate", "deferred", "none"]);

/**
 * Validate assessment feedback configuration before a write reaches storage.
 *
 * Candidate reads already fail closed, but newly created/rescheduled deferred
 * assessments must not silently enter close_at=NULL and remain indefinitely
 * unpublished. This helper deliberately never invents a closure date: the
 * operator must provide one explicitly. It also rejects forged feedback modes
 * and malformed non-empty close boundaries at the server boundary.
 */
export function feedbackScheduleWriteError({
  feedbackMode,
  closeAt,
}: {
  feedbackMode: string | null | undefined;
  closeAt: string | null | undefined;
}): string | null {
  if (!feedbackMode || !ALLOWED_FEEDBACK_MODES.has(feedbackMode)) {
    return "Mode de feedback invalide.";
  }

  if (closeAt && !Number.isFinite(Date.parse(closeAt))) {
    return "Date de fermeture invalide.";
  }

  if (feedbackMode === "deferred" && !closeAt) {
    return "Le feedback différé requiert une date de fermeture explicite.";
  }

  return null;
}

/**
 * Single fail-closed publication policy for candidate-visible results.
 *
 * `feedback_mode` and `show_result` are independent assessment controls. For
 * deferred feedback, a concrete, parseable close boundary is mandatory before
 * anything is published. A missing/invalid boundary must never collapse into
 * immediate disclosure. `none` and unknown/forged modes also remain hidden.
 */
export function candidateCanSeePublishedResult({
  showResult,
  feedbackMode,
  closeAt,
  nowMs = Date.now(),
}: {
  showResult: number | null | undefined;
  feedbackMode: string | null | undefined;
  closeAt: string | null | undefined;
  nowMs?: number;
}): boolean {
  if (showResult !== 1) return false;

  if (feedbackMode === "immediate") return true;

  if (feedbackMode === "deferred") {
    if (!closeAt) return false;
    const closeAtMs = Date.parse(closeAt);
    if (!Number.isFinite(closeAtMs)) return false;
    return closeAtMs <= nowMs;
  }

  return false;
}

/**
 * Server-side candidate policy for the individual PDF report.
 *
 * A candidate may download the simple report only after the shared result
 * publication policy says the result is visible. The detailed
 * question-by-question correction independently requires
 * `show_correct_answers=1`. Unknown/non-1 values fail closed.
 */
export function candidateCanDownloadIndividualReport({
  showResult,
  showCorrectAnswers,
  feedbackMode,
  closeAt,
  level,
  nowMs,
}: {
  showResult: number | null | undefined;
  showCorrectAnswers: number | null | undefined;
  feedbackMode: string | null | undefined;
  closeAt: string | null | undefined;
  level: IndividualReportLevel;
  nowMs?: number;
}): boolean {
  if (!candidateCanSeePublishedResult({ showResult, feedbackMode, closeAt, nowMs })) return false;
  if (level === "detailed") return showCorrectAnswers === 1;
  return true;
}
