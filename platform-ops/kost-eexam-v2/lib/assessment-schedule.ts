export type AssessmentScheduleIssue =
  | "invalid_open_at"
  | "invalid_close_at"
  | "non_increasing_window";

export type AssessmentScheduleValidation =
  | { valid: true; openAtMs: number | null; closeAtMs: number | null }
  | { valid: false; issue: AssessmentScheduleIssue };

function parseOptionalTimestamp(
  value: string | null | undefined
): { present: false; ms: null } | { present: true; ms: number } | { present: true; ms: null } {
  if (value == null || value.trim() === "") return { present: false, ms: null };
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? { present: true, ms } : { present: true, ms: null };
}

/**
 * Shared fail-closed validator for persisted assessment availability windows.
 *
 * Empty bounds remain optional. Any non-empty bound must parse to a finite
 * timestamp, and when both are present the close boundary must be strictly
 * later than the open boundary. This helper never invents or rewrites dates.
 *
 * Issue #30 should reuse this same predicate across create/publish/reschedule,
 * candidate-state computation and startAttempt() so legacy/direct-write rows
 * cannot become actionable through inconsistent date handling.
 */
export function validateAssessmentSchedule(input: {
  openAt: string | null | undefined;
  closeAt: string | null | undefined;
}): AssessmentScheduleValidation {
  const open = parseOptionalTimestamp(input.openAt);
  if (open.present && open.ms === null) return { valid: false, issue: "invalid_open_at" };

  const close = parseOptionalTimestamp(input.closeAt);
  if (close.present && close.ms === null) return { valid: false, issue: "invalid_close_at" };

  const openAtMs = open.ms;
  const closeAtMs = close.ms;
  if (openAtMs !== null && closeAtMs !== null && closeAtMs <= openAtMs) {
    return { valid: false, issue: "non_increasing_window" };
  }

  return { valid: true, openAtMs, closeAtMs };
}
