import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Manager scope — candidate-role revalidation (#78/#245)", () => {
  test("poisoned staff and candidate-plus-staff membership rows cannot widen active-session or user scope", async () => {
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
    const ambiguousCandidateId = createUser({
      username: "scope-role-ambiguous-candidate",
      password: "x".repeat(10),
      fullName: "Candidat Ambigu",
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

    // A candidate row plus a staff role is also contradictory persisted evidence.
    const adminRole = getDb().prepare(`SELECT id FROM roles WHERE code = 'administrator'`).get() as { id: number } | undefined;
    assert.ok(adminRole);
    getDb().prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(ambiguousCandidateId, adminRole.id);
    getDb()
      .prepare(`INSERT INTO group_members (group_id, candidate_user_id, added_by) VALUES (?, ?, ?)`) 
      .run(groupId, ambiguousCandidateId, managerId);

    assert.deepEqual(getManagedCandidateUserIds(managerId), [candidateId]);

    const managerSession = { userId: managerId, role: "pedagogical_manager" as const };
    const scopedIds = scopedUserIdsForSessionsOrNull(managerSession);
    assert.deepEqual([...scopedIds!].sort(), [managerId, candidateId].sort());
    assert.ok(!scopedIds!.includes(auditorId), "staff membership poison must not widen manager-visible users");
    assert.ok(!scopedIds!.includes(ambiguousCandidateId), "candidate+staff ambiguity must not widen manager-visible users");

    createDbSession({ userId: managerId });
    createDbSession({ userId: candidateId });
    createDbSession({ userId: ambiguousCandidateId });
    createDbSession({ userId: auditorId });

    const visibleSessions = listActiveSessions(scopedIds);
    assert.deepEqual(
      visibleSessions.map((session) => session.user_id).sort(),
      [managerId, candidateId].sort(),
      "poisoned staff and ambiguous candidate sessions must remain outside the manager scope"
    );
  });
});
