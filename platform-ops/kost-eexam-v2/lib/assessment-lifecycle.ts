import { audit } from "./audit";
import { getDb } from "./db";
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
  const db = getDb();
  const placeholders = spec.from.map(() => "?").join(",");
  const result = db
    .prepare(`UPDATE assessments SET status = ? WHERE id = ? AND status IN (${placeholders})`)
    .run(spec.to, assessmentId, ...spec.from);

  if (Number(result.changes) === 1) {
    audit({
      actorUserId,
      actorRole: null,
      action: spec.action,
      targetType: "assessment",
      targetId: assessmentId,
      metadata,
    });
    return;
  }

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
