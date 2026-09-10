import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Incident account suspension — atomic lifecycle boundary (#52)", async () => {
  before(() => setupTestDb());

  const { createUser, findUserById } = await import("../../lib/users");
  const { createDbSession, listSessionsForUser } = await import("../../lib/sessions-registry");
  const { declareIncident, actionSuspendAccount, listIncidentActions } = await import("../../lib/incidents");
  const { getDb } = await import("../../lib/db");

  test("commits status, session revocation, incident action and success audit together", () => {
    const actorId = createUser({
      username: "incident.atomic.actor",
      password: "Test123!",
      fullName: "Incident Atomic Actor",
      role: "administrator",
    });
    const userId = createUser({
      username: "incident.atomic.target",
      password: "Test123!",
      fullName: "Incident Atomic Target",
      role: "candidate",
    });
    const dbSession = createDbSession({ userId });
    const incidentId = declareIncident({
      type: "security_test",
      severity: "high",
      description: "Atomic suspension positive-path regression",
      responsibleUserId: userId,
      createdBy: actorId,
      createdByRole: "administrator",
    });

    actionSuspendAccount(incidentId, userId, { id: actorId, role: "administrator" });

    assert.equal(findUserById(userId)?.status, "suspended");
    const session = listSessionsForUser(userId).find((row) => row.id === dbSession.dbSessionId);
    assert.ok(session);
    assert.ok(session.revoked_at);
    assert.equal(session.revoked_by, actorId);

    const actions = listIncidentActions(incidentId) as { action_type: string; target_id: number | null }[];
    assert.equal(actions.filter((row) => row.action_type === "suspend_account" && row.target_id === userId).length, 1);

    const auditRow = getDb()
      .prepare(`SELECT id FROM audit_logs WHERE action = 'incident_action_suspend_account' AND target_type = 'user' AND target_id = ?`)
      .get(userId);
    assert.ok(auditRow);
  });

  test("rolls back status and session revocation if incident-action persistence fails", () => {
    const db = getDb();
    const actorId = createUser({
      username: "incident.rollback.actor",
      password: "Test123!",
      fullName: "Incident Rollback Actor",
      role: "administrator",
    });
    const userId = createUser({
      username: "incident.rollback.target",
      password: "Test123!",
      fullName: "Incident Rollback Target",
      role: "candidate",
    });
    const dbSession = createDbSession({ userId });
    const incidentId = declareIncident({
      type: "security_test",
      severity: "high",
      description: "Injected persistence failure must roll back suspension",
      responsibleUserId: userId,
      createdBy: actorId,
      createdByRole: "administrator",
    });

    db.exec(`
      CREATE TRIGGER fail_incident_suspend_action
      BEFORE INSERT ON incident_actions
      WHEN NEW.action_type = 'suspend_account'
      BEGIN
        SELECT RAISE(ABORT, 'injected incident suspend action failure');
      END;
    `);

    try {
      assert.throws(
        () => actionSuspendAccount(incidentId, userId, { id: actorId, role: "administrator" }),
        /injected incident suspend action failure/
      );

      assert.equal(findUserById(userId)?.status, "active", "status must roll back when action persistence fails");
      const session = listSessionsForUser(userId).find((row) => row.id === dbSession.dbSessionId);
      assert.ok(session);
      assert.equal(session.revoked_at, null, "session revocation must roll back with the suspension");
      assert.equal(session.revoked_by, null);

      const actionCount = getDb()
        .prepare(`SELECT COUNT(*) AS n FROM incident_actions WHERE incident_id = ? AND action_type = 'suspend_account'`)
        .get(incidentId) as { n: number };
      assert.equal(actionCount.n, 0);

      const auditCount = getDb()
        .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'incident_action_suspend_account' AND target_type = 'user' AND target_id = ?`)
        .get(userId) as { n: number };
      assert.equal(auditCount.n, 0, "no success audit may survive a rolled-back suspension");
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_incident_suspend_action`);
    }
  });
});
