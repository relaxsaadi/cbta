export type IndividualReportLevel = "simple" | "detailed";

/**
 * Server-side candidate policy for the individual PDF report.
 *
 * `show_result` and `show_correct_answers` are intentionally independent
 * assessment controls. A candidate may download the simple result report once
 * the result is visible, but the detailed question-by-question correction is
 * only available when the answer-key/correction control is explicitly enabled.
 * Unknown or non-1 values fail closed.
 */
export function candidateCanDownloadIndividualReport({
  showResult,
  showCorrectAnswers,
  stillDeferred,
  level,
}: {
  showResult: number | null | undefined;
  showCorrectAnswers: number | null | undefined;
  stillDeferred: boolean;
  level: IndividualReportLevel;
}): boolean {
  if (showResult !== 1 || stillDeferred) return false;
  if (level === "detailed") return showCorrectAnswers === 1;
  return true;
}
