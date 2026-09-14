import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Group membership — candidate-role invariant (#78)", () => {
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
      /Seul un compte candidat peut être ajouté à un groupe/,
      "a pedagogical-manager account must never be persisted as a candidate membership"
    );
    assert.throws(
      () => addCandidateToGroup(groupId, adminId, adminId),
      /Seul un compte candidat peut être ajouté à un groupe/,
      "an administrator account must never be persisted as a candidate membership"
    );
    assert.throws(
      () => addCandidateToGroup(groupId, auditorId, adminId),
      /Seul un compte candidat peut être ajouté à un groupe/,
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
