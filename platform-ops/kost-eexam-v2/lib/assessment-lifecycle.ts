import { audit } from "./audit";
import { getDb, transaction } from "./db";
import type { AssessmentStatus } from "./assessments";

type LifecycleAction = "assessment_suspend" | "assessment_reopen" | "assessment_close";

interface TransitionSpec {
  from: readonly AssessmentStatus[];
  to: AssessmentStatus;
  action: LifecycleAction;
}

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

/**
 * Server-side lifecycle guard for the normal assessment-management actions.
 *
 * The UI already hides invalid actions, but UI visibility is not an
 * authorization or integrity boundary. This helper performs an atomic
 * compare-and-set against the current persisted status so a forged/stale
 * Server Action call cannot move an assessment through an unsupported
 * transition.
 *
 * A successful governed mutation and its success audit entry are committed
 * in the same SQLite transaction. If the audit write fails, the status
 * change is rolled back rather than leaving an unaudited lifecycle change.
 * Denial audits are deliberately written after the failed compare-and-set
 * transaction has ended so throwing the caller-facing error cannot roll the
 * denial record back.
 *
 * IMPORTANT: reopening deliberately does not attempt to validate the exam
 * schedule here. Issue #30 owns the shared schedule-validation invariant;
 * this guard must be composed with that validation before #31 can be closed.
 */
function applyTransition(
  assessmentId: number,
  actorUserId: number,
  spec: TransitionSpec,
  metadata?: Record<string, unknown>
): void {
  const placeholders = spec.from.map(() => "?").join(",");

  const changed = transaction((db) => {
    const result = db
      .prepare(`UPDATE assessments SET status = ? WHERE id = ? AND status IN (${placeholders})`)
      .run(spec.to, assessmentId, ...spec.from);

    if (Number(result.changes) !== 1) return false;

    audit({
      actorUserId,
      actorRole: null,
      action: spec.action,
      targetType: "assessment",
      targetId: assessmentId,
      metadata,
    });
    return true;
  });

  if (changed) return;

  const db = getDb();
  const current = db.prepare(`SELECT status FROM assessments WHERE id = ?`).get(assessmentId) as
    | { status: AssessmentStatus }
    | undefined;

  if (!current) throw new Error("Évaluation introuvable.");

  audit({
    actorUserId,
    actorRole: null,
    action: "assessment_transition_denied",
    targetType: "assessment",
    targetId: assessmentId,
    result: "failure",
    metadata: {
      fromStatus: current.status,
      requestedStatus: spec.to,
      requestedAction: spec.action,
    },
  });

  throw new Error(
    `Transition d'évaluation impossible : statut « ${current.status} » vers « ${spec.to} ».`
  );
}

export function suspendAssessment(
  assessmentId: number,
  actorUserId: number,
  reason?: string
): void {
  applyTransition(assessmentId, actorUserId, TRANSITIONS.suspend, { reason });
}

export function reopenAssessment(assessmentId: number, actorUserId: number): void {
  applyTransition(assessmentId, actorUserId, TRANSITIONS.reopen);
}

export function closeAssessment(assessmentId: number, actorUserId: number): void {
  applyTransition(assessmentId, actorUserId, TRANSITIONS.close);
}
