import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Incident account reactivation — effect/evidence atomicity (#226)", async () => {
  before(() => setupTestDb());

  const { createUser, findUserById, setUserStatus } = await import("../../lib/users");
  const { declareIncident, actionReactivateAccount, listIncidentActions } = await import("../../lib/incidents");
  const { getDb } = await import("../../lib/db");

  test("commits reactivation, incident action and audit as one incident operation", () => {
    const actorId = createUser({
      username: "incident.reactivate.atomic.actor",
      password: "Test123!",
      fullName: "Incident Reactivate Atomic Actor",
      role: "administrator",
    });
    const userId = createUser({
      username: "incident.reactivate.atomic.target",
      password: "Test123!",
      fullName: "Incident Reactivate Atomic Target",
      role: "candidate",
    });
    setUserStatus(userId, "suspended");
    const incidentId = declareIncident({
      type: "security_test",
      severity: "high",
      description: "Atomic incident account reactivation positive-path regression",
      responsibleUserId: userId,
      createdBy: actorId,
      createdByRole: "administrator",
    });

    const status = actionReactivateAccount(incidentId, userId, { id: actorId, role: "administrator" });
    assert.equal(status, "active");
    assert.equal(findUserById(userId)?.status, "active");

    const actions = listIncidentActions(incidentId) as { action_type: string; target_id: number | null }[];
    assert.equal(actions.filter((row) => row.action_type === "reactivate_account" && row.target_id === userId).length, 1);

    const auditRow = getDb()
      .prepare(`SELECT metadata_json FROM audit_logs WHERE action = 'incident_action_reactivate_account' AND target_type = 'user' AND target_id = ?`)
      .get(userId) as { metadata_json: string | null } | undefined;
    assert.ok(auditRow);
    assert.equal(JSON.parse(auditRow.metadata_json ?? "{}").incidentId, incidentId);
    assert.doesNotMatch(auditRow.metadata_json ?? "", /token|cookie|hash|secret/i);
  });

  test("rolls back reactivation and incident action when the incident success audit fails", () => {
    const db = getDb();
    const actorId = createUser({
      username: "incident.reactivate.rollback.actor",
      password: "Test123!",
      fullName: "Incident Reactivate Rollback Actor",
      role: "administrator",
    });
    const userId = createUser({
      username: "incident.reactivate.rollback.target",
      password: "Test123!",
      fullName: "Incident Reactivate Rollback Target",
      role: "candidate",
    });
    setUserStatus(userId, "suspended");
    const incidentId = declareIncident({
      type: "security_test",
      severity: "high",
      description: "Injected audit failure must roll back incident account reactivation",
      responsibleUserId: userId,
      createdBy: actorId,
      createdByRole: "administrator",
    });

    db.exec(`
      CREATE TRIGGER fail_incident_reactivate_account_audit
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = 'incident_action_reactivate_account'
      BEGIN
        SELECT RAISE(ABORT, 'injected incident reactivation audit failure');
      END;
    `);

    try {
      assert.throws(
        () => actionReactivateAccount(incidentId, userId, { id: actorId, role: "administrator" }),
        /injected incident reactivation audit failure/
      );

      assert.equal(findUserById(userId)?.status, "suspended");

      const actionCount = db
        .prepare(`SELECT COUNT(*) AS n FROM incident_actions WHERE incident_id = ? AND action_type = 'reactivate_account'`)
        .get(incidentId) as { n: number };
      assert.equal(actionCount.n, 0, "incident action must roll back with the reactivation");

      const auditCount = db
        .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'incident_action_reactivate_account' AND target_type = 'user' AND target_id = ?`)
        .get(userId) as { n: number };
      assert.equal(auditCount.n, 0, "no incident success audit may survive the failed operation");
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_incident_reactivate_account_audit`);
    }
  });

  test("fails closed before changing account state when the incident does not exist", () => {
    const actorId = createUser({
      username: "incident.reactivate.missing.actor",
      password: "Test123!",
      fullName: "Incident Reactivate Missing Actor",
      role: "administrator",
    });
    const userId = createUser({
      username: "incident.reactivate.missing.target",
      password: "Test123!",
      fullName: "Incident Reactivate Missing Target",
      role: "candidate",
    });
    setUserStatus(userId, "suspended");

    assert.throws(
      () => actionReactivateAccount(999999, userId, { id: actorId, role: "administrator" }),
      /Incident introuvable/
    );
    assert.equal(findUserById(userId)?.status, "suspended");
  });

  test("non-suspended target is a no-op with no incident success evidence", () => {
    const actorId = createUser({
      username: "incident.reactivate.noop.actor",
      password: "Test123!",
      fullName: "Incident Reactivate Noop Actor",
      role: "administrator",
    });
    const userId = createUser({
      username: "incident.reactivate.noop.target",
      password: "Test123!",
      fullName: "Incident Reactivate Noop Target",
      role: "candidate",
    });
    const incidentId = declareIncident({
      type: "security_test",
      severity: "medium",
      description: "Already-active target must not fabricate incident reactivation evidence",
      responsibleUserId: userId,
      createdBy: actorId,
      createdByRole: "administrator",
    });

    assert.equal(actionReactivateAccount(incidentId, userId, { id: actorId, role: "administrator" }), null);
    assert.equal(findUserById(userId)?.status, "active");

    const actions = listIncidentActions(incidentId) as { action_type: string }[];
    assert.equal(actions.filter((row) => row.action_type === "reactivate_account").length, 0);
    const auditCount = getDb()
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'incident_action_reactivate_account' AND target_type = 'user' AND target_id = ?`)
      .get(userId) as { n: number };
    assert.equal(auditCount.n, 0);
  });
});
