import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Incident status lifecycle — atomic mutation/evidence boundary (#222)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { closeIncident, declareIncident, getIncident, setIncidentStatus } = await import("../../lib/incidents");
  const { getDb } = await import("../../lib/db");

  let counter = 0;

  function makeFixture(label: string) {
    counter += 1;
    const actorId = createUser({
      username: `incident.status.${label}.${counter}`,
      password: "Test123!",
      fullName: `Incident Status ${label}`,
      role: "administrator",
    });
    const incidentId = declareIncident({
      type: "security_test",
      severity: "medium",
      description: `Incident lifecycle ${label}`,
      createdBy: actorId,
      createdByRole: "administrator",
    });
    return { actorId, incidentId, actor: { id: actorId, role: "administrator" as const } };
  }

  test("rolls back a status transition when status-change audit persistence fails", () => {
    const db = getDb();
    const { incidentId, actor } = makeFixture("audit-rollback");

    db.exec(`
      CREATE TRIGGER fail_incident_status_audit
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = 'incident_status_change'
      BEGIN
        SELECT RAISE(ABORT, 'injected incident status audit failure');
      END;
    `);

    try {
      assert.throws(
        () => setIncidentStatus(incidentId, "investigating", actor),
        /injected incident status audit failure/
      );
      assert.equal(getIncident(incidentId)?.status, "open", "status must roll back with failed audit evidence");

      const auditCount = db
        .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'incident_status_change' AND target_type = 'incident' AND target_id = ?`)
        .get(incidentId) as { n: number };
      assert.equal(auditCount.n, 0);
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_incident_status_audit`);
    }
  });

  test("rolls back close status and incident action when close audit persistence fails", () => {
    const db = getDb();
    const { incidentId, actor } = makeFixture("close-rollback");

    db.exec(`
      CREATE TRIGGER fail_incident_close_audit
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = 'incident_action_close'
      BEGIN
        SELECT RAISE(ABORT, 'injected incident close audit failure');
      END;
    `);

    try {
      assert.throws(
        () => closeIncident(incidentId, actor),
        /injected incident close audit failure/
      );
      assert.equal(getIncident(incidentId)?.status, "open", "close status must roll back with failed close audit");

      const actionCount = db
        .prepare(`SELECT COUNT(*) AS n FROM incident_actions WHERE incident_id = ? AND action_type = 'close'`)
        .get(incidentId) as { n: number };
      assert.equal(actionCount.n, 0, "incident close action must roll back with its audit");
    } finally {
      db.exec(`DROP TRIGGER IF EXISTS fail_incident_close_audit`);
    }
  });

  test("enforces forward-only transitions, terminal close and same-state idempotence", () => {
    const db = getDb();
    const { incidentId, actor } = makeFixture("state-machine");

    const investigating = setIncidentStatus(incidentId, "investigating", actor);
    assert.deepEqual(investigating, { changed: true, previousStatus: "open", status: "investigating" });
    assert.equal(getIncident(incidentId)?.status, "investigating");

    const repeatedInvestigating = setIncidentStatus(incidentId, "investigating", actor);
    assert.deepEqual(repeatedInvestigating, { changed: false, status: "investigating" });
    const statusAuditCount = db
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'incident_status_change' AND target_type = 'incident' AND target_id = ?`)
      .get(incidentId) as { n: number };
    assert.equal(statusAuditCount.n, 1, "same-state retry must not fabricate duplicate success evidence");

    const resolved = setIncidentStatus(incidentId, "resolved", actor);
    assert.deepEqual(resolved, { changed: true, previousStatus: "investigating", status: "resolved" });
    assert.throws(
      () => setIncidentStatus(incidentId, "investigating", actor),
      /Transition d'incident non autorisée: resolved → investigating/
    );
    assert.equal(getIncident(incidentId)?.status, "resolved");

    const closed = closeIncident(incidentId, actor);
    assert.deepEqual(closed, { changed: true, previousStatus: "resolved", status: "closed" });
    assert.equal(getIncident(incidentId)?.status, "closed");

    const repeatedClose = closeIncident(incidentId, actor);
    assert.deepEqual(repeatedClose, { changed: false, status: "closed" });
    const closeActionCount = db
      .prepare(`SELECT COUNT(*) AS n FROM incident_actions WHERE incident_id = ? AND action_type = 'close'`)
      .get(incidentId) as { n: number };
    assert.equal(closeActionCount.n, 1, "same-state close retry must not duplicate action evidence");

    assert.throws(
      () => setIncidentStatus(incidentId, "resolved", actor),
      /Transition d'incident non autorisée: closed → resolved/
    );
    assert.equal(getIncident(incidentId)?.status, "closed");
  });

  test("preserves the existing direct-close operator path while making it atomic", () => {
    const { incidentId, actor } = makeFixture("direct-close");
    const result = closeIncident(incidentId, actor);
    assert.deepEqual(result, { changed: true, previousStatus: "open", status: "closed" });
    assert.equal(getIncident(incidentId)?.status, "closed");
  });
});
