import { audit } from "./audit";
import { getDb, transaction } from "./db";
import type { AssessmentStatus } from "./assessments";
import { feedbackScheduleWriteError } from "./report-access";
import { validateAssessmentSchedule, type AssessmentScheduleIssue } from "./assessment-schedule";
import type { ConsoleRole } from "./session";

type LifecycleAction = "assessment_suspend" | "assessment_reopen" | "assessment_close";

interface TransitionSpec {
  from: readonly AssessmentStatus[];
  to: AssessmentStatus;
  action: LifecycleAction;
}

interface PersistedTransitionState {
  status: AssessmentStatus;
  open_at: string | null;
  close_at: string | null;
  feedback_mode: string | null;
}

type TransitionPreconditionFailure = {
  reason: string;
  metadata?: Record<string, unknown>;
  message?: string;
};

type TransitionPrecondition = (
  current: PersistedTransitionState
) => TransitionPreconditionFailure | null;

const TRANSITIONS = {
  suspend: {
    from: ["published", "open"],
    to: "suspended",
    action: "assessment_suspend",
  },
  reopen: {
    from: ["suspended"],
    to: "published",
    action: "assessment_reopen",
  },
  close: {
    from: ["published", "open"],
    to: "closed",
    action: "assessment_close",
  },
} as const satisfies Record<string, TransitionSpec>;

const SCHEDULE_ISSUE_LABELS: Record<AssessmentScheduleIssue, string> = {
  invalid_open_at: "date d'ouverture invalide",
  invalid_close_at: "date de fermeture invalide",
  non_increasing_window: "la fermeture doit être strictement postérieure à l'ouverture",
};

/**
 * Resolve the actor role from the same persisted user record used by the
 * authenticated session. Lifecycle callers already pass the authenticated
 * user id; keeping role resolution here prevents these high-value transition
 * events from being written with actor_role=NULL and therefore disappearing
 * from role-filtered audit reviews.
 */
function actorRoleForUser(actorUserId: number): ConsoleRole | null {
  const row = getDb().prepare(`SELECT role FROM users WHERE id = ?`).get(actorUserId) as
    | { role: ConsoleRole }
    | undefined;
  return row?.role ?? null;
}

/**
 * Server-side lifecycle guard for the normal assessment-management actions.
 *
 * The UI already hides invalid actions, but UI visibility is not an
 * authorization or integrity boundary. This helper reads the current row and
 * performs the compare-and-set inside one SQLite write transaction so a
 * forged/stale Server Action call cannot move an assessment through an
 * unsupported transition.
 *
 * A successful governed mutation and its success audit entry are committed
 * in the same transaction. If the audit write fails, the status change is
 * rolled back rather than leaving an unaudited lifecycle change. Denial
 * audits are deliberately written after that transaction has ended so the
 * caller-facing exception cannot roll the denial record back.
 */
function applyTransition(
  assessmentId: number,
  actorUserId: number,
  spec: TransitionSpec,
  metadata?: Record<string, unknown>,
  precondition?: TransitionPrecondition
): void {
  const actorRole = actorRoleForUser(actorUserId);

  const outcome = transaction((db) => {
    const current = db
      .prepare(`SELECT status, open_at, close_at, feedback_mode FROM assessments WHERE id = ?`)
      .get(assessmentId) as PersistedTransitionState | undefined;

    if (!current) return { kind: "missing" as const };

    if (!spec.from.includes(current.status)) {
      return {
        kind: "denied" as const,
        current,
        failure: { reason: "invalid_status" } as TransitionPreconditionFailure,
      };
    }

    const failure = precondition?.(current) ?? null;
    if (failure) return { kind: "denied" as const, current, failure };

    const result = db
      .prepare(`UPDATE assessments SET status = ? WHERE id = ? AND status = ?`)
      .run(spec.to, assessmentId, current.status);

    if (Number(result.changes) !== 1) {
      return {
        kind: "denied" as const,
        current,
        failure: { reason: "stale_status" } as TransitionPreconditionFailure,
      };
    }

    audit({
      actorUserId,
      actorRole,
      action: spec.action,
      targetType: "assessment",
      targetId: assessmentId,
      metadata,
    });
    return { kind: "changed" as const };
  });

  if (outcome.kind === "changed") return;
  if (outcome.kind === "missing") throw new Error("Évaluation introuvable.");

  audit({
    actorUserId,
    actorRole,
    action: "assessment_transition_denied",
    targetType: "assessment",
    targetId: assessmentId,
    result: "failure",
    metadata: {
      fromStatus: outcome.current.status,
      requestedStatus: spec.to,
      requestedAction: spec.action,
      reason: outcome.failure.reason,
      ...(outcome.failure.metadata ?? {}),
    },
  });

  if (outcome.failure.message) throw new Error(outcome.failure.message);

  throw new Error(
    `Transition d'évaluation impossible : statut « ${outcome.current.status} » vers « ${spec.to} ».`
  );
}

function validConfigurationForReopen(
  current: PersistedTransitionState
): TransitionPreconditionFailure | null {
  const schedule = validateAssessmentSchedule({
    openAt: current.open_at,
    closeAt: current.close_at,
  });
  if (!schedule.valid) {
    return {
      reason: "invalid_schedule",
      metadata: { scheduleIssue: schedule.issue },
      message: `Réouverture impossible : planning invalide (${SCHEDULE_ISSUE_LABELS[schedule.issue]}).`,
    };
  }

  // Reopen writes `published` directly, so it must preserve the same deferred
  // feedback invariant enforced by create/publish/reschedule in PR #29. A
  // suspended legacy row with deferred+NULL must not bypass that publication
  // boundary merely because its open/close schedule is otherwise syntactically
  // valid. Do not invent a close_at; require an explicit operator correction.
  const feedbackError = feedbackScheduleWriteError({
    feedbackMode: current.feedback_mode,
    closeAt: current.close_at,
  });
  if (feedbackError) {
    return {
      reason: "invalid_feedback_configuration",
      message: `Réouverture impossible : ${feedbackError}`,
    };
  }

  return null;
}

export function suspendAssessment(
  assessmentId: number,
  actorUserId: number,
  reason?: string
): void {
  applyTransition(assessmentId, actorUserId, TRANSITIONS.suspend, { reason });
}

export function reopenAssessment(assessmentId: number, actorUserId: number): void {
  applyTransition(
    assessmentId,
    actorUserId,
    TRANSITIONS.reopen,
    undefined,
    validConfigurationForReopen
  );
}

export function closeAssessment(assessmentId: number, actorUserId: number): void {
  applyTransition(assessmentId, actorUserId, TRANSITIONS.close);
}
