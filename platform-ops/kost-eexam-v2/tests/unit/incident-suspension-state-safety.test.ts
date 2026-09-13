import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Incident account suspension — state-safe atomic boundary (#53/#226)", async () => {
  before(() => setupTestDb());

  const { createUser, createUserPendingActivation, findUserById } = await import("../../lib/users");
  const { createDbSession, listSessionsForUser } = await import("../../lib/sessions-registry");
  const { archiveUserAtomically } = await import("../../lib/direct-lifecycle-stop");
  const { declareIncident, actionSuspendAccount } = await import("../../lib/incidents");
  const { getDb } = await import("../../lib/db");

  function createAdmin() {
    const id = createUser({
      username: `incident.suspend.admin.${Math.random().toString(16).slice(2)}`,
      password: "Test123!",
      fullName: "Incident Suspension Admin",
      role: "administrator",
    });
    return { id, role: "administrator" as const };
  }

  function createIncident(admin: { id: number; role: "administrator" }, suffix: string) {
    return declareIncident({
      type: `suspension-${suffix}`,
      severity: "high",
      description: `Incident suspension test ${suffix}`,
      createdBy: admin.id,
      createdByRole: admin.role,
    });
  }

  function countSuspendActions(userId: number) {
    return (getDb()
      .prepare(`SELECT COUNT(*) AS n FROM incident_actions WHERE action_type = 'suspend_account' AND target_type = 'user' AND target_id = ?`)
      .get(userId) as { n: number }).n;
  }

  function countSuspendAudits(userId: number) {
    return (getDb()
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'incident_action_suspend_account' AND target_type = 'user' AND target_id = ?`)
      .get(userId) as { n: number }).n;
  }

  test("active account transitions once, revokes every session and records one incident success", () => {
    const admin = createAdmin();
    const incidentId = createIncident(admin, "active-success");
    const userId = createUser({
      username: "incident.suspend.active.success",
      password: "Test123!",
      fullName: "Incident Active Success",
      role: "candidate",
    });
    const first = createDbSession({ userId });
    const second = createDbSession({ userId });

    const result = actionSuspendAccount(incidentId, userId, admin);
    assert.equal(result.changed, true);
    if (!result.changed) return;
    assert.equal(result.previousStatus, "active");
    assert.equal(result.sessionsRevoked, 2);
    assert.equal(result.user.id, userId);
    assert.equal(findUserById(userId)?.status, "suspended");

    const sessions = listSessionsForUser(userId);
    for (const sessionId of [first.dbSessionId, second.dbSessionId]) {
      const row = sessions.find((candidate) => candidate.id === sessionId);
      assert.ok(row);
      assert.ok(row.revoked_at);
      assert.equal(row.revoked_by, admin.id);
    }
    assert.equal(countSuspendActions(userId), 1);
    assert.equal(countSuspendAudits(userId), 1);
  });

  test("pending-activation account is a legal incident suspension source state", () => {
    const admin = createAdmin();
    const incidentId = createIncident(admin, "pending-success");
    const userId = createUserPendingActivation({
      username: "incident.suspend.pending.success",
      fullName: "Incident Pending Success",
      role: "candidate",
    });

    const result = actionSuspendAccount(incidentId, userId, admin);
    assert.equal(result.changed, true);
    if (!result.changed) return;
    assert.equal(result.previousStatus, "pending_activation");
    assert.equal(result.sessionsRevoked, 0);
    assert.equal(findUserById(userId)?.status, "suspended");
    assert.equal(countSuspendActions(userId), 1);
    assert.equal(countSuspendAudits(userId), 1);
  });

  test("archived account remains archived with archived_at intact and produces no incident success evidence", () => {
    const admin = createAdmin();
    const incidentId = createIncident(admin, "archived-noop");
    const userId = createUser({
      username: "incident.suspend.archived.noop",
      password: "Test123!",
      fullName: "Incident Archived Noop",
      role: "candidate",
    });
    const archived = archiveUserAtomically(userId, admin);
    assert.equal(archived.changed, true);
    const before = findUserById(userId);
    assert.equal(before?.status, "archived");
    assert.ok(before?.archived_at);

    const result = actionSuspendAccount(incidentId, userId, admin);
    assert.deepEqual(result, { changed: false, reason: "invalid_state", currentStatus: "archived" });
    const after = findUserById(userId);
    assert.equal(after?.status, "archived");
    assert.equal(after?.archived_at, before?.archived_at);
    assert.equal(countSuspendActions(userId), 0);
    assert.equal(countSuspendAudits(userId), 0);
  });

  test("already-suspended replay from a distinct incident is a no-op with no duplicate action or audit", () => {
    const admin = createAdmin();
    const firstIncidentId = createIncident(admin, "first");
    const secondIncidentId = createIncident(admin, "replay-distinct-incident");
    const userId = createUser({
      username: "incident.suspend.replay.noop",
      password: "Test123!",
      fullName: "Incident Replay Noop",
      role: "candidate",
    });

    const first = actionSuspendAccount(firstIncidentId, userId, admin);
    assert.equal(first.changed, true);
    const replay = actionSuspendAccount(secondIncidentId, userId, admin);
    assert.deepEqual(replay, { changed: false, reason: "invalid_state", currentStatus: "suspended" });
    assert.equal(findUserById(userId)?.status, "suspended");
    assert.equal(countSuspendActions(userId), 1);
    assert.equal(countSuspendAudits(userId), 1);
  });

  test("missing target is fail-closed and creates no incident action", () => {
    const admin = createAdmin();
    const incidentId = createIncident(admin, "missing-noop");
    const missingId = 987654320;

    const result = actionSuspendAccount(incidentId, missingId, admin);
    assert.deepEqual(result, { changed: false, reason: "user_missing", currentStatus: null });
    assert.equal(countSuspendActions(missingId), 0);
    assert.equal(countSuspendAudits(missingId), 0);
  });

  test("injected incident audit failure rolls status, session revocation and incident_action back together", () => {
    const db = getDb();
    const admin = createAdmin();
    const incidentId = createIncident(admin, "rollback");
    const userId = createUser({
      username: "incident.suspend.rollback",
      password: "Test123!",
      fullName: "Incident Suspension Rollback",
      role: "candidate",
    });
    const activeSession = createDbSession({ userId });

    db.exec(`
      CREATE TRIGGER fail_incident_suspend_audit
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = 'incident_action_suspend_account' AND NEW.target_id = ${userId}
      BEGIN
        SELECT RAISE(ABORT, 'injected incident suspend audit failure');
      END;
    `);

    try {
      assert.throws(
        () => actionSuspendAccount(incidentId, userId, admin),
        /injected incident suspend audit failure/
      );
      assert.equal(findUserById(userId)?.status, "active");
      const row = listSessionsForUser(userId).find((candidate) => candidate.id === activeSession.dbSessionId);
      assert.ok(row);
      assert.equal(row.revoked_at, null);
      assert.equal(row.revoked_by, null);
      assert.equal(countSuspendActions(userId), 0);
      assert.equal(countSuspendAudits(userId), 0);
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_incident_suspend_audit`);
    }
  });
});