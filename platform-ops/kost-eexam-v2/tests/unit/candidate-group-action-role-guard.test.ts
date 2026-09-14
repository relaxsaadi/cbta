import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

const actionsSource = readFileSync(
  fileURLToPath(new URL("../../app/(app)/groups/actions.ts", import.meta.url)),
  "utf8"
);

describe("Group Server Actions — canonical candidate role guard (#78/#245)", () => {
  test("canonical role resolution fails closed for contradictory candidate + staff evidence", async () => {
    const { createUser, getRoleForUser } = await import("../../lib/users");
    const { getDb } = await import("../../lib/db");

    const candidateId = createUser({
      username: "action-role-candidate",
      password: "x".repeat(10),
      fullName: "Candidate action role",
      role: "candidate",
    });
    assert.equal(getRoleForUser(candidateId), "candidate");

    const staffRole = getDb().prepare(`SELECT id FROM roles WHERE code = 'administrator'`).get() as { id: number } | undefined;
    assert.ok(staffRole);
    getDb().prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(candidateId, staffRole.id);

    assert.equal(getRoleForUser(candidateId), null, "candidate + staff must never resolve to candidate authority");
    const roleCount = getDb().prepare(`SELECT COUNT(*) AS count FROM user_roles WHERE user_id = ?`).get(candidateId) as { count: number };
    assert.equal(roleCount.count, 2, "fail-closed resolution must preserve contradictory role evidence");
  });

  test("addCandidateAction rejects non-candidate or ambiguous existing users before success side effects", () => {
    const actionStart = actionsSource.indexOf("export async function addCandidateAction");
    const existingUserStart = actionsSource.indexOf("if (user) {", actionStart);
    const newUserStart = actionsSource.indexOf("let userId: number;", existingUserStart);
    assert.ok(actionStart >= 0 && existingUserStart > actionStart && newUserStart > existingUserStart);

    const existingUserPath = actionsSource.slice(existingUserStart, newUserStart);
    const roleGuard = existingUserPath.indexOf('getRoleForUser(user.id) !== "candidate"');
    const membershipWrite = existingUserPath.indexOf("addCandidateToGroup(groupId, user.id, session.userId)");
    const successAudit = existingUserPath.indexOf('action: "user_group_assigned"');
    const temporaryAccess = existingUserPath.indexOf("createTemporaryAccess(user.id)");
    const invitation = existingUserPath.indexOf("resendInvitation(user.id");

    assert.ok(roleGuard >= 0, "existing users must be resolved through the fail-closed canonical role primitive");
    assert.ok(membershipWrite > roleGuard, "role rejection must happen before candidate membership write");
    assert.ok(successAudit > membershipWrite, "success audit must occur only after the guarded membership write");
    assert.ok(temporaryAccess > successAudit, "temporary access must remain after role + membership success");
    assert.ok(invitation > successAudit, "candidate invitation resend must remain after role + membership success");
    assert.match(existingUserPath, /candidate_add_denied[\s\S]*role_not_candidate_or_ambiguous/);
    assert.match(existingUserPath, /catch\s*\{[\s\S]*candidate_add_denied[\s\S]*candidate_role_changed_or_invalid/);
  });

  test("editCandidateAction uses the authoritative role-aware membership predicate", () => {
    const editStart = actionsSource.indexOf("export async function editCandidateAction");
    const bulkStart = actionsSource.indexOf("export interface BulkImportResult", editStart);
    assert.ok(editStart >= 0 && bulkStart > editStart);

    const editPath = actionsSource.slice(editStart, bulkStart);
    assert.match(editPath, /isCandidateMemberOfGroup\(groupId, candidateUserId\)/);
    assert.doesNotMatch(editPath, /SELECT 1 FROM group_members WHERE group_id = \? AND candidate_user_id = \?/);
    assert.match(editPath, /candidate_edit_denied[\s\S]*not_unambiguous_candidate_member/);
  });
});
