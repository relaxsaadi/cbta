import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Admin user provisioning workflow atomicity (#46)", async () => {
  before(() => setupTestDb());

  const { createUser, findUserByUsername, getRoleForUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, isCandidateMemberOfGroup } = await import("../../lib/groups");
  const { listUserFunctions } = await import("../../lib/user-functions");
  const { provisionPendingUserAtomically } = await import("../../lib/user-provisioning");
  const { getDb } = await import("../../lib/db");

  const actorId = createUser({
    username: "atomic.provision.admin",
    password: "Test123!",
    fullName: "Atomic Provision Admin",
    role: "administrator",
  });

  function scalar(sql: string, ...params: unknown[]): number {
    return (getDb().prepare(sql).get(...params) as { n: number }).n;
  }

  function installAbortTrigger(name: string, sql: string): () => void {
    const db = getDb();
    db.exec(sql);
    return () => db.exec(`DROP TRIGGER IF EXISTS ${name}`);
  }

  function assertNoProvisionedUser(username: string): void {
    assert.equal(findUserByUsername(username), undefined);
  }

  test("successful enterprise provisioning commits user, role, group, functions and success audit together", () => {
    const companyId = createCompany({ name: "Atomic Enterprise", scope: "production", createdBy: actorId });
    const groupId = createGroup({ companyId, name: "Atomic Group", scope: "production", createdBy: actorId });

    const userId = provisionPendingUserAtomically({
      username: "atomic.enterprise.candidate",
      fullName: "Atomic Enterprise Candidate",
      role: "candidate",
      email: "atomic.enterprise@example.test",
      candidateType: "entreprise",
      groupId,
      functionCodes: ["7.1", "7.10"],
      actorUserId: actorId,
      actorRole: "administrator",
      particulierScope: "production",
    });

    assert.equal(findUserByUsername("atomic.enterprise.candidate")?.id, userId);
    assert.equal(getRoleForUser(userId), "candidate");
    assert.equal(isCandidateMemberOfGroup(groupId, userId), true);
    assert.deepEqual(listUserFunctions(userId).map((row) => row.function_code).sort(), ["7.1", "7.10"]);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_created' AND target_id = ?`, userId), 1);
  });

  test("enterprise membership failure rolls back the new user and role before any function/audit can survive", () => {
    const companyId = createCompany({ name: "Membership Fail Enterprise", scope: "production", createdBy: actorId });
    const groupId = createGroup({ companyId, name: "Membership Fail Group", scope: "production", createdBy: actorId });
    const username = "atomic.rollback.membership";
    const before = {
      users: scalar(`SELECT COUNT(*) AS n FROM users`),
      roles: scalar(`SELECT COUNT(*) AS n FROM user_roles`),
      members: scalar(`SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?`, groupId),
      functions: scalar(`SELECT COUNT(*) AS n FROM user_functions`),
      audits: scalar(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_created'`),
    };

    const cleanup = installAbortTrigger(
      "fail_enterprise_membership",
      `CREATE TRIGGER fail_enterprise_membership BEFORE INSERT ON group_members
       BEGIN SELECT RAISE(ABORT, 'injected enterprise membership failure'); END;`
    );
    try {
      assert.throws(
        () =>
          provisionPendingUserAtomically({
            username,
            fullName: "Membership Fail Candidate",
            role: "candidate",
            candidateType: "entreprise",
            groupId,
            functionCodes: ["7.1"],
            actorUserId: actorId,
            actorRole: "administrator",
            particulierScope: "production",
          }),
        /injected enterprise membership failure/
      );
    } finally {
      cleanup();
    }

    assertNoProvisionedUser(username);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM users`), before.users);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM user_roles`), before.roles);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?`, groupId), before.members);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM user_functions`), before.functions);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_created'`), before.audits);
  });

  test("Particulier failure after company creation rolls back the auto-created company and user", () => {
    const username = "atomic.rollback.particulier.group";
    const before = {
      users: scalar(`SELECT COUNT(*) AS n FROM users`),
      companies: scalar(`SELECT COUNT(*) AS n FROM companies WHERE client_type = 'particulier'`),
      groups: scalar(`SELECT COUNT(*) AS n FROM groups`),
      members: scalar(`SELECT COUNT(*) AS n FROM group_members`),
    };

    const cleanup = installAbortTrigger(
      "fail_particulier_group_insert",
      `CREATE TRIGGER fail_particulier_group_insert BEFORE INSERT ON groups
       WHEN NEW.name = 'Session individuelle'
       BEGIN SELECT RAISE(ABORT, 'injected particulier group failure'); END;`
    );
    try {
      assert.throws(
        () =>
          provisionPendingUserAtomically({
            username,
            fullName: "Particulier Group Failure",
            role: "candidate",
            candidateType: "particulier",
            functionCodes: ["7.3"],
            actorUserId: actorId,
            actorRole: "administrator",
            particulierScope: "production",
          }),
        /injected particulier group failure/
      );
    } finally {
      cleanup();
    }

    assertNoProvisionedUser(username);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM users`), before.users);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM companies WHERE client_type = 'particulier'`), before.companies);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM groups`), before.groups);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM group_members`), before.members);
  });

  test("Particulier failure after group creation rolls back company, group, membership target and user", () => {
    const username = "atomic.rollback.particulier.member";
    const before = {
      users: scalar(`SELECT COUNT(*) AS n FROM users`),
      companies: scalar(`SELECT COUNT(*) AS n FROM companies WHERE client_type = 'particulier'`),
      groups: scalar(`SELECT COUNT(*) AS n FROM groups`),
      members: scalar(`SELECT COUNT(*) AS n FROM group_members`),
      functions: scalar(`SELECT COUNT(*) AS n FROM user_functions`),
    };

    const cleanup = installAbortTrigger(
      "fail_particulier_membership",
      `CREATE TRIGGER fail_particulier_membership BEFORE INSERT ON group_members
       BEGIN SELECT RAISE(ABORT, 'injected particulier membership failure'); END;`
    );
    try {
      assert.throws(
        () =>
          provisionPendingUserAtomically({
            username,
            fullName: "Particulier Membership Failure",
            role: "candidate",
            candidateType: "particulier",
            functionCodes: ["7.4"],
            actorUserId: actorId,
            actorRole: "administrator",
            particulierScope: "production",
          }),
        /injected particulier membership failure/
      );
    } finally {
      cleanup();
    }

    assertNoProvisionedUser(username);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM users`), before.users);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM companies WHERE client_type = 'particulier'`), before.companies);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM groups`), before.groups);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM group_members`), before.members);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM user_functions`), before.functions);
  });

  test("failure at DGR function k rolls back the already-inserted function prefix, affiliation, role and user", () => {
    const companyId = createCompany({ name: "Function Fail Enterprise", scope: "production", createdBy: actorId });
    const groupId = createGroup({ companyId, name: "Function Fail Group", scope: "production", createdBy: actorId });
    const username = "atomic.rollback.function.k";
    const before = {
      users: scalar(`SELECT COUNT(*) AS n FROM users`),
      roles: scalar(`SELECT COUNT(*) AS n FROM user_roles`),
      members: scalar(`SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?`, groupId),
      functions: scalar(`SELECT COUNT(*) AS n FROM user_functions`),
      audits: scalar(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_created'`),
    };

    const cleanup = installAbortTrigger(
      "fail_function_k",
      `CREATE TRIGGER fail_function_k BEFORE INSERT ON user_functions
       WHEN NEW.function_code = '7.5'
       BEGIN SELECT RAISE(ABORT, 'injected function k failure'); END;`
    );
    try {
      assert.throws(
        () =>
          provisionPendingUserAtomically({
            username,
            fullName: "Function K Failure",
            role: "candidate",
            candidateType: "entreprise",
            groupId,
            functionCodes: ["7.4", "7.5", "7.6"],
            actorUserId: actorId,
            actorRole: "administrator",
            particulierScope: "production",
          }),
        /injected function k failure/
      );
    } finally {
      cleanup();
    }

    assertNoProvisionedUser(username);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM users`), before.users);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM user_roles`), before.roles);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?`, groupId), before.members);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM user_functions`), before.functions);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_created'`), before.audits);
  });

  test("late user_created audit failure rolls back enterprise user, role, membership and all DGR functions", () => {
    const companyId = createCompany({ name: "Audit Fail Enterprise", scope: "production", createdBy: actorId });
    const groupId = createGroup({ companyId, name: "Audit Fail Group", scope: "production", createdBy: actorId });
    const username = "atomic.rollback.audit";
    const before = {
      users: scalar(`SELECT COUNT(*) AS n FROM users`),
      roles: scalar(`SELECT COUNT(*) AS n FROM user_roles`),
      members: scalar(`SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?`, groupId),
      functions: scalar(`SELECT COUNT(*) AS n FROM user_functions`),
      audits: scalar(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_created'`),
    };

    const cleanup = installAbortTrigger(
      "fail_atomic_user_created_audit",
      `CREATE TRIGGER fail_atomic_user_created_audit BEFORE INSERT ON audit_logs
       WHEN NEW.action = 'user_created'
       BEGIN SELECT RAISE(ABORT, 'injected user_created audit failure'); END;`
    );
    try {
      assert.throws(
        () =>
          provisionPendingUserAtomically({
            username,
            fullName: "Audit Failure Candidate",
            role: "candidate",
            candidateType: "entreprise",
            groupId,
            functionCodes: ["7.2", "7.9"],
            actorUserId: actorId,
            actorRole: "administrator",
            particulierScope: "production",
          }),
        /injected user_created audit failure/
      );
    } finally {
      cleanup();
    }

    assertNoProvisionedUser(username);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM users`), before.users);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM user_roles`), before.roles);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?`, groupId), before.members);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM user_functions`), before.functions);
    assert.equal(scalar(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_created'`), before.audits);
  });
});
