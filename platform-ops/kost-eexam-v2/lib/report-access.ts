export type IndividualReportLevel = "simple" | "detailed";

/**
 * Candidate-facing PDF policy. A detailed report contains the question-by-question
 * answer key, so it requires an explicit answer-key release, a terminal attempt,
 * and fully completed grading. An immediate-feedback setting is not enough:
 * manual grading may still be pending while the attempt is already submitted.
 *
 * Staff/auditor access is checked separately by the route and is not governed by
 * this candidate-only policy.
 */
export function candidateCanDownloadIndividualReport({
  showResult,
  showCorrectAnswers,
  stillDeferred,
  level,
  attemptStatus,
  gradingState,
}: {
  showResult: number | null | undefined;
  showCorrectAnswers: number | null | undefined;
  stillDeferred: boolean;
  level: IndividualReportLevel;
  attemptStatus: string | null | undefined;
  gradingState: string | null | undefined;
}): boolean {
  if (showResult !== 1 || stillDeferred) return false;
  if (level === "simple") return true;
  if (level !== "detailed") return false;

  const terminalAttempt = attemptStatus === "submitted" || attemptStatus === "auto_submitted";
  return showCorrectAnswers === 1 && terminalAttempt && gradingState === "COMPLETE";
}
