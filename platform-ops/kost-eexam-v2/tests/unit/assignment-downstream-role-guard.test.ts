import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const actionsSource = readFileSync(
  fileURLToPath(new URL("../../app/(app)/exam-preparation/actions.ts", import.meta.url)),
  "utf8"
);

describe("Assessment assignment downstream actions — canonical candidate authority (#78/#245)", () => {
  test("EXAM_ASSIGNED helper rejects ambiguous historical assignment identities before delivery and success audit", () => {
    const start = actionsSource.indexOf("async function notifyExamAssignedToCandidates");
    const end = actionsSource.indexOf("export async function suspendAssessmentAction", start);
    assert.ok(start >= 0 && end > start, "notification helper must exist");
    const path = actionsSource.slice(start, end);

    const guard = path.indexOf('if (getRoleForUser(candidateId) !== "candidate") continue;');
    const email = path.indexOf("await notifyExamAssigned(");
    const successAudit = path.indexOf("auditExamNotificationSent(");

    assert.ok(guard >= 0, "assigned notification must require canonical candidate role");
    assert.ok(email > guard, "email must happen only after canonical candidate guard");
    assert.ok(successAudit > email, "success audit must remain after guarded delivery");
  });

  test("EXAM_RESCHEDULED ignores staff, zero-role and multi-role historical assignments before delivery", () => {
    const start = actionsSource.indexOf("export async function rescheduleAssessmentAction");
    const end = actionsSource.indexOf("export interface AssignMoreResult", start);
    assert.ok(start >= 0 && end > start, "reschedule action must exist");
    const path = actionsSource.slice(start, end);

    const assignmentIds = path.indexOf("listAssignedCandidateIds(assessmentId)");
    const guard = path.indexOf('if (getRoleForUser(candidateId) !== "candidate") continue;');
    const email = path.indexOf("await notifyExamRescheduled(");

    assert.ok(assignmentIds >= 0, "reschedule still reads persisted assignment evidence");
    assert.ok(guard > assignmentIds, "historical assignment presence must not itself authorize candidate notification");
    assert.ok(email > guard, "reschedule email must happen only after canonical candidate guard");
  });

  test("unassignment preserves poisoned historical assignment evidence by denying before DELETE-capable helper", () => {
    const start = actionsSource.indexOf("export async function unassignCandidateAction");
    assert.ok(start >= 0, "unassign action must exist");
    const path = actionsSource.slice(start);

    const guard = path.indexOf('if (getRoleForUser(candidateUserId) !== "candidate")');
    const mutation = path.indexOf("unassignCandidateFromAssessment(");

    assert.ok(guard >= 0, "unassignment must require canonical candidate authority");
    assert.ok(mutation > guard, "role denial must happen before the assignment deletion helper");
  });
});
