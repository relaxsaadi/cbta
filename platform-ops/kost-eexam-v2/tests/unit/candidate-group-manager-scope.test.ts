import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Manager scope — candidate-role revalidation (#78)", () => {
  test("a poisoned staff group_members row cannot widen active-session or user scope", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { getManagedCandidateUserIds, scopedUserIdsForSessionsOrNull } = await import("../../lib/tenant-scope");
    const { createDbSession, listActiveSessions } = await import("../../lib/sessions-registry");
    const { getDb } = await import("../../lib/db");

    const managerId = createUser({
      username: "scope-role-manager",
      password: "x".repeat(10),
      fullName: "Responsable Scope",
      role: "pedagogical_manager",
    });
    const candidateId = createUser({
      username: "scope-role-candidate",
      password: "x".repeat(10),
      fullName: "Candidat Scope",
      role: "candidate",
    });
    const auditorId = createUser({
      username: "scope-role-auditor",
      password: "x".repeat(10),
      fullName: "Auditeur Scope",
      role: "auditor",
    });

    const companyId = createCompany({ name: "Scope role company", scope: "test", createdBy: managerId });
    const groupId = createGroup({
      companyId,
      name: "Scope role group",
      scope: "test",
      pedagogicalManagerId: managerId,
      createdBy: managerId,
    });
    addCandidateToGroup(groupId, candidateId, managerId);

    // Simulate historical corruption that predates the candidate-only writer guard.
    getDb()
      .prepare(`INSERT INTO group_members (group_id, candidate_user_id, added_by) VALUES (?, ?, ?)`) 
      .run(groupId, auditorId, managerId);

    assert.deepEqual(getManagedCandidateUserIds(managerId), [candidateId]);

    const managerSession = { userId: managerId, role: "pedagogical_manager" as const };
    const scopedIds = scopedUserIdsForSessionsOrNull(managerSession);
    assert.deepEqual([...scopedIds!].sort(), [managerId, candidateId].sort());
    assert.ok(!scopedIds!.includes(auditorId), "staff membership poison must not widen manager-visible users");

    createDbSession({ userId: managerId });
    createDbSession({ userId: candidateId });
    createDbSession({ userId: auditorId });

    const visibleSessions = listActiveSessions(scopedIds);
    assert.deepEqual(
      visibleSessions.map((session) => session.user_id).sort(),
      [managerId, candidateId].sort(),
      "the poisoned staff session must remain outside the manager scope"
    );
  });
});
