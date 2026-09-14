import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Group membership — candidate-role invariant (#78/#245)", () => {
  test("the library accepts candidates, rejects staff, and hides poisoned legacy staff rows from the candidate roster", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup, listGroupMembers, isCandidateMemberOfGroup } = await import("../../lib/groups");
    const { getDb } = await import("../../lib/db");

    const managerId = createUser({
      username: "role-invariant-manager",
      password: "x".repeat(10),
      fullName: "Responsable",
      role: "pedagogical_manager",
    });
    const adminId = createUser({
      username: "role-invariant-admin",
      password: "x".repeat(10),
      fullName: "Admin",
      role: "administrator",
    });
    const auditorId = createUser({
      username: "role-invariant-auditor",
      password: "x".repeat(10),
      fullName: "Auditeur",
      role: "auditor",
    });
    const candidateId = createUser({
      username: "role-invariant-candidate",
      password: "x".repeat(10),
      fullName: "Candidat",
      role: "candidate",
    });

    const companyId = createCompany({ name: "Role invariant company", scope: "test", createdBy: managerId });
    const groupId = createGroup({
      companyId,
      name: "Role invariant group",
      scope: "test",
      pedagogicalManagerId: managerId,
      createdBy: managerId,
    });

    addCandidateToGroup(groupId, candidateId, managerId);
    assert.equal(isCandidateMemberOfGroup(groupId, candidateId), true);

    assert.throws(
      () => addCandidateToGroup(groupId, managerId, adminId),
      /Seul un compte candidat/,
      "a pedagogical-manager account must never be persisted as a candidate membership"
    );
    assert.throws(
      () => addCandidateToGroup(groupId, adminId, adminId),
      /Seul un compte candidat/,
      "an administrator account must never be persisted as a candidate membership"
    );
    assert.throws(
      () => addCandidateToGroup(groupId, auditorId, adminId),
      /Seul un compte candidat/,
      "an auditor account must never be persisted as a candidate membership"
    );

    // Historical corruption is not silently deleted, but roster consumers
    // must fail closed and never reinterpret that staff row as a candidate.
    getDb()
      .prepare(`INSERT INTO group_members (group_id, candidate_user_id, added_by) VALUES (?, ?, ?)`) 
      .run(groupId, auditorId, adminId);

    assert.equal(isCandidateMemberOfGroup(groupId, auditorId), false);
    assert.deepEqual(
      listGroupMembers(groupId).map((row) => row.candidate_user_id),
      [candidateId],
      "the candidate roster must exclude a poisoned staff membership"
    );
  });

  test("candidate plus any staff role fails closed without deleting contradictory role evidence (#245)", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup, listGroupMembers, isCandidateMemberOfGroup } = await import("../../lib/groups");
    const { getDb } = await import("../../lib/db");

    const managerId = createUser({
      username: "role-ambiguity-manager",
      password: "x".repeat(10),
      fullName: "Responsable ambiguïté",
      role: "pedagogical_manager",
    });
    const companyId = createCompany({ name: "Role ambiguity company", scope: "test", createdBy: managerId });
    const groupId = createGroup({
      companyId,
      name: "Role ambiguity group",
      scope: "test",
      pedagogicalManagerId: managerId,
      createdBy: managerId,
    });

    const staffRoles = ["administrator", "auditor", "pedagogical_manager"] as const;
    for (const staffRole of staffRoles) {
      const userId = createUser({
        username: `ambiguous-candidate-${staffRole}`,
        password: "x".repeat(10),
        fullName: `Ambiguous ${staffRole}`,
        role: "candidate",
      });
      const roleRow = getDb().prepare(`SELECT id FROM roles WHERE code = ?`).get(staffRole) as { id: number } | undefined;
      assert.ok(roleRow);
      getDb().prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(userId, roleRow.id);

      assert.throws(
        () => addCandidateToGroup(groupId, userId, managerId),
        /Seul un compte candidat/,
        `candidate + ${staffRole} must fail closed at the membership write boundary`
      );
      assert.equal(isCandidateMemberOfGroup(groupId, userId), false);

      // Preserve the contradictory role rows as forensic/remediation evidence.
      const roleCount = getDb().prepare(`SELECT COUNT(*) AS count FROM user_roles WHERE user_id = ?`).get(userId) as { count: number };
      assert.equal(roleCount.count, 2, "the guard must never auto-delete one contradictory role row");

      // Even a pre-existing poisoned group row must remain hidden from roster reads.
      getDb().prepare(`INSERT INTO group_members (group_id, candidate_user_id, added_by) VALUES (?, ?, ?)`).run(groupId, userId, managerId);
      assert.equal(isCandidateMemberOfGroup(groupId, userId), false);
      assert.ok(!listGroupMembers(groupId).some((row) => row.candidate_user_id === userId));
    }
  });

  test("normal multi-group candidate membership remains supported", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup, isCandidateMemberOfGroup } = await import("../../lib/groups");

    const managerId = createUser({
      username: "multi-group-manager",
      password: "x".repeat(10),
      fullName: "Responsable multi",
      role: "pedagogical_manager",
    });
    const candidateId = createUser({
      username: "multi-group-candidate",
      password: "x".repeat(10),
      fullName: "Candidat multi",
      role: "candidate",
    });
    const companyId = createCompany({ name: "Multi group company", scope: "test", createdBy: managerId });
    const groupAId = createGroup({ companyId, name: "Multi A", scope: "test", pedagogicalManagerId: managerId, createdBy: managerId });
    const groupBId = createGroup({ companyId, name: "Multi B", scope: "test", pedagogicalManagerId: managerId, createdBy: managerId });

    addCandidateToGroup(groupAId, candidateId, managerId);
    addCandidateToGroup(groupBId, candidateId, managerId);

    assert.equal(isCandidateMemberOfGroup(groupAId, candidateId), true);
    assert.equal(isCandidateMemberOfGroup(groupBId, candidateId), true);
  });
});
