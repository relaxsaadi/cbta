import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Incident session revocation — effect/evidence atomicity (#226)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createDbSession, listSessionsForUser } = await import("../../lib/sessions-registry");
  const { declareIncident, actionRevokeSessions, listIncidentActions } = await import("../../lib/incidents");
  const { getDb } = await import("../../lib/db");

  test("commits session revocation, incident action and audit as one incident operation", () => {
    const actorId = createUser({
      username: "incident.revoke.atomic.actor",
      password: "Test123!",
      fullName: "Incident Revoke Atomic Actor",
      role: "administrator",
    });
    const userId = createUser({
      username: "incident.revoke.atomic.target",
      password: "Test123!",
      fullName: "Incident Revoke Atomic Target",
      role: "candidate",
    });
    createDbSession({ userId });
    createDbSession({ userId });
    const incidentId = declareIncident({
      type: "security_test",
      severity: "high",
      description: "Atomic incident session revocation positive-path regression",
      responsibleUserId: userId,
      createdBy: actorId,
      createdByRole: "administrator",
    });

    const changed = actionRevokeSessions(incidentId, userId, { id: actorId, role: "administrator" });
    assert.equal(changed, 2);

    const sessions = listSessionsForUser(userId);
    assert.equal(sessions.length, 2);
    assert.ok(sessions.every((row) => row.revoked_at !== null));
    assert.ok(sessions.every((row) => row.revoked_by === actorId));

    const actions = listIncidentActions(incidentId) as { action_type: string; target_id: number | null }[];
    assert.equal(actions.filter((row) => row.action_type === "revoke_sessions" && row.target_id === userId).length, 1);

    const auditRow = getDb()
      .prepare(`SELECT metadata_json FROM audit_logs WHERE action = 'incident_action_revoke_sessions' AND target_type = 'user' AND target_id = ?`)
      .get(userId) as { metadata_json: string | null } | undefined;
    assert.ok(auditRow);
    assert.equal(JSON.parse(auditRow.metadata_json ?? "{}").incidentId, incidentId);
    assert.doesNotMatch(auditRow.metadata_json ?? "", /token|cookie|hash|secret/i);
  });

  test("rolls back revocation and incident action when the incident success audit fails", () => {
    const db = getDb();
    const actorId = createUser({
      username: "incident.revoke.rollback.actor",
      password: "Test123!",
      fullName: "Incident Revoke Rollback Actor",
      role: "administrator",
    });
    const userId = createUser({
      username: "incident.revoke.rollback.target",
      password: "Test123!",
      fullName: "Incident Revoke Rollback Target",
      role: "candidate",
    });
    createDbSession({ userId });
    createDbSession({ userId });
    const incidentId = declareIncident({
      type: "security_test",
      severity: "high",
      description: "Injected audit failure must roll back incident session revocation",
      responsibleUserId: userId,
      createdBy: actorId,
      createdByRole: "administrator",
    });

    db.exec(`
      CREATE TRIGGER fail_incident_revoke_sessions_audit
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = 'incident_action_revoke_sessions'
      BEGIN
        SELECT RAISE(ABORT, 'injected incident revoke audit failure');
      END;
    `);

    try {
      assert.throws(
        () => actionRevokeSessions(incidentId, userId, { id: actorId, role: "administrator" }),
        /injected incident revoke audit failure/
      );

      const sessions = listSessionsForUser(userId);
      assert.equal(sessions.length, 2);
      assert.ok(sessions.every((row) => row.revoked_at === null));
      assert.ok(sessions.every((row) => row.revoked_by === null));

      const actionCount = db
        .prepare(`SELECT COUNT(*) AS n FROM incident_actions WHERE incident_id = ? AND action_type = 'revoke_sessions'`)
        .get(incidentId) as { n: number };
      assert.equal(actionCount.n, 0, "incident action must roll back with the revocation");

      const auditCount = db
        .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'incident_action_revoke_sessions' AND target_type = 'user' AND target_id = ?`)
        .get(userId) as { n: number };
      assert.equal(auditCount.n, 0, "no incident success audit may survive the failed operation");
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_incident_revoke_sessions_audit`);
    }
  });

  test("fails closed before revoking sessions when the incident does not exist", () => {
    const actorId = createUser({
      username: "incident.revoke.missing.actor",
      password: "Test123!",
      fullName: "Incident Revoke Missing Actor",
      role: "administrator",
    });
    const userId = createUser({
      username: "incident.revoke.missing.target",
      password: "Test123!",
      fullName: "Incident Revoke Missing Target",
      role: "candidate",
    });
    createDbSession({ userId });

    assert.throws(
      () => actionRevokeSessions(999999, userId, { id: actorId, role: "administrator" }),
      /Incident introuvable/
    );

    const [session] = listSessionsForUser(userId);
    assert.ok(session);
    assert.equal(session.revoked_at, null);
    assert.equal(session.revoked_by, null);
  });

  test("fails closed without fabricating evidence when the target user does not exist", () => {
    const actorId = createUser({
      username: "incident.revoke.target-missing.actor",
      password: "Test123!",
      fullName: "Incident Revoke Target Missing Actor",
      role: "administrator",
    });
    const incidentId = declareIncident({
      type: "security_test",
      severity: "high",
      description: "Missing revocation target must not fabricate incident evidence",
      createdBy: actorId,
      createdByRole: "administrator",
    });

    assert.throws(
      () => actionRevokeSessions(incidentId, 999999, { id: actorId, role: "administrator" }),
      /Utilisateur introuvable/
    );

    const actions = listIncidentActions(incidentId) as { action_type: string }[];
    assert.equal(actions.filter((row) => row.action_type === "revoke_sessions").length, 0);
    const auditCount = getDb()
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'incident_action_revoke_sessions' AND target_type = 'user' AND target_id = ?`)
      .get(999999) as { n: number };
    assert.equal(auditCount.n, 0);
  });
});
