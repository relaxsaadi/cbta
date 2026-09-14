import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const resendSource = readFileSync(
  fileURLToPath(new URL("../../lib/email/resend-actions.ts", import.meta.url)),
  "utf8"
);

describe("Exam notification resend — canonical candidate authority (#78/#245)", () => {
  test("historical assignment presence alone cannot authorize a resend", () => {
    const start = resendSource.indexOf("export async function resendExamNotification");
    assert.ok(start >= 0, "resendExamNotification must exist");
    const path = resendSource.slice(start);

    assert.match(path, /FROM assessment_assignments aa/);
    assert.match(path, /JOIN user_roles ur ON ur\.user_id = aa\.candidate_user_id/);
    assert.match(path, /JOIN roles r ON r\.id = ur\.role_id AND r\.code = 'candidate'/);
    assert.match(path, /SELECT COUNT\(\*\) FROM user_roles urc WHERE urc\.user_id = aa\.candidate_user_id\) = 1/);
    assert.match(path, /if \(!assigned\) throw new ResendError/);
  });

  test("candidate-role denial happens before email and success audit side effects", () => {
    const start = resendSource.indexOf("export async function resendExamNotification");
    const path = resendSource.slice(start);
    const assignmentGuard = path.indexOf("const assigned =");
    const denial = path.indexOf("if (!assigned)");
    const email = path.indexOf("await notifyExamAssigned");
    const successAudit = path.indexOf("auditExamNotificationResent");

    assert.ok(assignmentGuard >= 0 && denial > assignmentGuard);
    assert.ok(email > denial, "email delivery must remain after canonical candidate authorization");
    assert.ok(successAudit > email, "success audit must remain after the guarded delivery path");
  });

  test("guard preserves historical assignment evidence", () => {
    const start = resendSource.indexOf("export async function resendExamNotification");
    const path = resendSource.slice(start);
    assert.doesNotMatch(path, /DELETE\s+FROM\s+assessment_assignments/i);
    assert.doesNotMatch(path, /UPDATE\s+assessment_assignments/i);
  });
});
