import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Incident close audit metadata (#222)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { closeIncident, declareIncident, setIncidentStatus } = await import("../../lib/incidents");
  const { getDb } = await import("../../lib/db");

  let counter = 0;

  function makeFixture(label: string) {
    counter += 1;
    const actorId = createUser({
      username: `incident.close.metadata.${label}.${counter}`,
      password: "Test123!",
      fullName: `Incident Close Metadata ${label}`,
      role: "administrator",
    });
    const incidentId = declareIncident({
      type: "security_test",
      severity: "medium",
      description: `Incident close metadata ${label}`,
      createdBy: actorId,
      createdByRole: "administrator",
    });
    return { actorId, incidentId, actor: { id: actorId, role: "administrator" as const } };
  }

  test("records exact actor and before/after status on the common direct-close audit", () => {
    const db = getDb();
    const { incidentId, actor } = makeFixture("direct");

    closeIncident(incidentId, actor);

    const row = db
      .prepare(
        `SELECT actor_user_id, actor_role, metadata_json
         FROM audit_logs
         WHERE action = 'incident_action_close'
           AND target_type = 'incident'
           AND target_id = ?`
      )
      .get(incidentId) as
      | { actor_user_id: number; actor_role: string; metadata_json: string }
      | undefined;

    assert.ok(row);
    assert.equal(row.actor_user_id, actor.id);
    assert.equal(row.actor_role, actor.role);
    assert.deepEqual(JSON.parse(row.metadata_json), {
      incidentId,
      previousStatus: "open",
      status: "closed",
    });
  });

  test("records the actual durable previous status when closing later in the lifecycle", () => {
    const db = getDb();
    const { incidentId, actor } = makeFixture("investigating");

    setIncidentStatus(incidentId, "investigating", actor);
    closeIncident(incidentId, actor);

    const row = db
      .prepare(
        `SELECT metadata_json
         FROM audit_logs
         WHERE action = 'incident_action_close'
           AND target_type = 'incident'
           AND target_id = ?`
      )
      .get(incidentId) as { metadata_json: string } | undefined;

    assert.ok(row);
    assert.deepEqual(JSON.parse(row.metadata_json), {
      incidentId,
      previousStatus: "investigating",
      status: "closed",
    });
  });
});
