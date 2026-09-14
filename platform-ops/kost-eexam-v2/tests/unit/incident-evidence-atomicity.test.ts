import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Standalone incident evidence — atomic action/audit boundary (#226)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const {
    declareIncident,
    actionAddNote,
    actionCorrectiveMeasure,
    actionAttachEvidence,
    listIncidentActions,
  } = await import("../../lib/incidents");
  const { getDb } = await import("../../lib/db");

  let counter = 0;

  function makeFixture(label: string) {
    counter += 1;
    const actorId = createUser({
      username: `incident.evidence.${label}.${counter}`,
      password: "Test123!",
      fullName: `Incident Evidence ${label}`,
      role: "administrator",
    });
    const incidentId = declareIncident({
      type: "security_test",
      severity: "medium",
      description: `Standalone evidence atomicity ${label}`,
      createdBy: actorId,
      createdByRole: "administrator",
    });
    return { actorId, incidentId };
  }

  const failureCases = [
    {
      actionType: "note",
      auditAction: "incident_action_note",
      invoke: (incidentId: number, actorId: number) =>
        actionAddNote(incidentId, "Atomic note", { id: actorId, role: "administrator" }),
    },
    {
      actionType: "corrective_measure",
      auditAction: "incident_action_corrective_measure",
      invoke: (incidentId: number, actorId: number) =>
        actionCorrectiveMeasure(incidentId, "Atomic corrective measure", { id: actorId, role: "administrator" }),
    },
    {
      actionType: "attach_evidence",
      auditAction: "incident_action_attach_evidence",
      invoke: (incidentId: number, actorId: number) =>
        actionAttachEvidence(incidentId, "Atomic evidence reference", { id: actorId, role: "administrator" }),
    },
  ] as const;

  for (const failureCase of failureCases) {
    test(`${failureCase.actionType}: injected audit failure rolls back incident_actions`, () => {
      const db = getDb();
      const { actorId, incidentId } = makeFixture(failureCase.actionType);
      const triggerName = `fail_${failureCase.actionType}_audit`;

      db.exec(`
        CREATE TRIGGER ${triggerName}
        BEFORE INSERT ON audit_logs
        WHEN NEW.action = '${failureCase.auditAction}'
        BEGIN
          SELECT RAISE(ABORT, 'injected standalone incident evidence audit failure');
        END;
      `);

      try {
        assert.throws(
          () => failureCase.invoke(incidentId, actorId),
          /injected standalone incident evidence audit failure/
        );

        const actionCount = db
          .prepare(`SELECT COUNT(*) AS n FROM incident_actions WHERE incident_id = ? AND action_type = ?`)
          .get(incidentId, failureCase.actionType) as { n: number };
        assert.equal(actionCount.n, 0, "incident action must roll back when its matching audit fails");

        const auditCount = db
          .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = ? AND target_type = 'incident' AND target_id = ?`)
          .get(failureCase.auditAction, incidentId) as { n: number };
        assert.equal(auditCount.n, 0, "failed atomic evidence write must leave no success audit");
      } finally {
        db.exec(`DROP TRIGGER IF EXISTS ${triggerName}`);
      }
    });
  }

  test("valid standalone evidence actions each commit one incident action and one matching audit", () => {
    const { actorId, incidentId } = makeFixture("success");

    actionAddNote(incidentId, "Valid note", { id: actorId, role: "administrator" });
    actionCorrectiveMeasure(incidentId, "Valid corrective measure", { id: actorId, role: "administrator" });
    actionAttachEvidence(incidentId, "Valid evidence reference", { id: actorId, role: "administrator" });

    const actions = listIncidentActions(incidentId) as { action_type: string }[];
    for (const actionType of ["note", "corrective_measure", "attach_evidence"] as const) {
      assert.equal(
        actions.filter((row) => row.action_type === actionType).length,
        1,
        `${actionType} should persist exactly once`
      );
    }

    const auditRows = getDb()
      .prepare(
        `SELECT action, COUNT(*) AS n
         FROM audit_logs
         WHERE target_type = 'incident' AND target_id = ?
           AND action IN ('incident_action_note', 'incident_action_corrective_measure', 'incident_action_attach_evidence')
         GROUP BY action`
      )
      .all(incidentId) as { action: string; n: number }[];

    const counts = new Map(auditRows.map((row) => [row.action, row.n]));
    assert.equal(counts.get("incident_action_note"), 1);
    assert.equal(counts.get("incident_action_corrective_measure"), 1);
    assert.equal(counts.get("incident_action_attach_evidence"), 1);
  });
});
