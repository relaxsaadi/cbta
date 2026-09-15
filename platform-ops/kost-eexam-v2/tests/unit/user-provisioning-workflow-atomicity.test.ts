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

    const auditCount = getDb()
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_created' AND target_id = ?`)
      .get(userId) as { n: number };
    assert.equal(auditCount.n, 1);
  });

  test("late audit failure rolls back enterprise user, role, group membership and DGR functions", () => {
    const db = getDb();
    const companyId = createCompany({ name: "Rollback Enterprise", scope: "production", createdBy: actorId });
    const groupId = createGroup({ companyId, name: "Rollback Group", scope: "production", createdBy: actorId });
    const username = "atomic.rollback.enterprise";

    const before = {
      users: (db.prepare(`SELECT COUNT(*) AS n FROM users`).get() as { n: number }).n,
      roles: (db.prepare(`SELECT COUNT(*) AS n FROM user_roles`).get() as { n: number }).n,
      members: (db.prepare(`SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?`).get(groupId) as { n: number }).n,
      functions: (db.prepare(`SELECT COUNT(*) AS n FROM user_functions`).get() as { n: number }).n,
      audits: (db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_created'`).get() as { n: number }).n,
    };

    db.exec(`
      CREATE TRIGGER fail_atomic_user_created_audit
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = 'user_created'
      BEGIN
        SELECT RAISE(ABORT, 'injected user_created audit failure');
      END;
    `);

    try {
      assert.throws(
        () =>
          provisionPendingUserAtomically({
            username,
            fullName: "Rollback Enterprise Candidate",
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
      db.exec(`DROP TRIGGER IF EXISTS fail_atomic_user_created_audit`);
    }

    assert.equal(findUserByUsername(username), undefined);
    assert.equal((db.prepare(`SELECT COUNT(*) AS n FROM users`).get() as { n: number }).n, before.users);
    assert.equal((db.prepare(`SELECT COUNT(*) AS n FROM user_roles`).get() as { n: number }).n, before.roles);
    assert.equal((db.prepare(`SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?`).get(groupId) as { n: number }).n, before.members);
    assert.equal((db.prepare(`SELECT COUNT(*) AS n FROM user_functions`).get() as { n: number }).n, before.functions);
    assert.equal((db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'user_created'`).get() as { n: number }).n, before.audits);
  });

  test("late audit failure also rolls back Particulier plumbing created in the workflow", () => {
    const db = getDb();
    const username = "atomic.rollback.particulier";
    const before = {
      users: (db.prepare(`SELECT COUNT(*) AS n FROM users`).get() as { n: number }).n,
      companies: (db.prepare(`SELECT COUNT(*) AS n FROM companies WHERE client_type = 'particulier'`).get() as { n: number }).n,
      groups: (db.prepare(`SELECT COUNT(*) AS n FROM groups`).get() as { n: number }).n,
      members: (db.prepare(`SELECT COUNT(*) AS n FROM group_members`).get() as { n: number }).n,
      functions: (db.prepare(`SELECT COUNT(*) AS n FROM user_functions`).get() as { n: number }).n,
    };

    db.exec(`
      CREATE TRIGGER fail_atomic_particulier_audit
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = 'user_created'
      BEGIN
        SELECT RAISE(ABORT, 'injected particulier audit failure');
      END;
    `);

    try {
      assert.throws(
        () =>
          provisionPendingUserAtomically({
            username,
            fullName: "Rollback Particulier Candidate",
            role: "candidate",
            candidateType: "particulier",
            functionCodes: ["7.3"],
            actorUserId: actorId,
            actorRole: "administrator",
            particulierScope: "production",
          }),
        /injected particulier audit failure/
      );
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_atomic_particulier_audit`);
    }

    assert.equal(findUserByUsername(username), undefined);
    assert.equal((db.prepare(`SELECT COUNT(*) AS n FROM users`).get() as { n: number }).n, before.users);
    assert.equal((db.prepare(`SELECT COUNT(*) AS n FROM companies WHERE client_type = 'particulier'`).get() as { n: number }).n, before.companies);
    assert.equal((db.prepare(`SELECT COUNT(*) AS n FROM groups`).get() as { n: number }).n, before.groups);
    assert.equal((db.prepare(`SELECT COUNT(*) AS n FROM group_members`).get() as { n: number }).n, before.members);
    assert.equal((db.prepare(`SELECT COUNT(*) AS n FROM user_functions`).get() as { n: number }).n, before.functions);
  });
});
