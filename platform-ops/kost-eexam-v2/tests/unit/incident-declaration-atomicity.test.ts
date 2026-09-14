import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Déclaration d'incident — atomicité preuve/audit (#223)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt } = await import("../../lib/attempts");
  const { declareIncident, declareCandidateIncident, CandidateIncidentError } = await import("../../lib/incidents");
  const { getDb } = await import("../../lib/db");

  let seq = 0;
  function tag(): string {
    seq += 1;
    return `ida${seq}`;
  }

  function count(sql: string, ...params: (string | number)[]): number {
    return (getDb().prepare(sql).get(...params) as { n: number }).n;
  }

  function incidentCount(): number {
    return count(`SELECT COUNT(*) AS n FROM incidents`);
  }

  function auditCount(action: string): number {
    return count(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = ?`, action);
  }

  function installAuditFailure(action: "incident_declare" | "candidate_incident_declared"): () => void {
    const trigger = `test_fail_${action}_${tag()}`;
    getDb().exec(`
      CREATE TRIGGER ${trigger}
      BEFORE INSERT ON audit_logs
      WHEN NEW.action = '${action}'
      BEGIN
        SELECT RAISE(ABORT, 'forced ${action} audit failure');
      END;
    `);
    return () => getDb().exec(`DROP TRIGGER ${trigger}`);
  }

  function makeActors() {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const managerId = createUser({ username: `${t}.mgr`, password: "x".repeat(10), fullName: "Manager", role: "pedagogical_manager" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const otherCandidateId = createUser({ username: `${t}.cand2`, password: "x".repeat(10), fullName: "Autre candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: managerId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    return { t, adminId, managerId, candidateId, otherCandidateId, groupId };
  }

  function makeAssessmentForOtherCandidate() {
    const fixture = makeActors();
    addCandidateToGroup(fixture.groupId, fixture.otherCandidateId, fixture.adminId);
    const questionId = createQuestion({
      kostQuestionId: `TEST-${fixture.t}`,
      functionCode: "7.1",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q1",
      choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }],
      correctAnswer: ["A"],
      createdBy: fixture.adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen",
      name: `Examen ${fixture.t}`,
      functionCode: "7.1",
      groupId: fixture.groupId,
      questionSource: "manual",
      manualQuestionIds: [questionId],
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 50,
      scope: "test",
      createdBy: fixture.adminId,
    });
    publishAssessment(assessmentId, fixture.adminId);
    return { ...fixture, assessmentId };
  }

  test("échec de l'audit générique -> aucune ligne incident ne persiste", () => {
    const { adminId } = makeActors();
    const beforeIncidents = incidentCount();
    const beforeAudits = auditCount("incident_declare");
    const dropTrigger = installAuditFailure("incident_declare");
    try {
      assert.throws(() =>
        declareIncident({
          type: "atomic-admin-failure",
          severity: "medium",
          description: "Doit être annulé avec l'audit",
          createdBy: adminId,
          createdByRole: "administrator",
        })
      );
    } finally {
      dropTrigger();
    }
    assert.equal(incidentCount(), beforeIncidents);
    assert.equal(auditCount("incident_declare"), beforeAudits);
  });

  test("échec de l'audit candidat dédié -> incident et audit générique sont tous deux annulés", () => {
    const { candidateId } = makeActors();
    const beforeIncidents = incidentCount();
    const beforeGeneric = auditCount("incident_declare");
    const beforeCandidate = auditCount("candidate_incident_declared");
    const dropTrigger = installAuditFailure("candidate_incident_declared");
    try {
      assert.throws(() =>
        declareCandidateIncident({
          type: "atomic-candidate-failure",
          description: "Aucun succès partiel ne doit survivre",
          candidateUserId: candidateId,
        })
      );
    } finally {
      dropTrigger();
    }
    assert.equal(incidentCount(), beforeIncidents);
    assert.equal(auditCount("incident_declare"), beforeGeneric);
    assert.equal(auditCount("candidate_incident_declared"), beforeCandidate);
  });

  test("chemins nominaux -> exactement un incident et les audits requis référencent le même id", () => {
    const { adminId, candidateId } = makeActors();

    const adminIncidentId = declareIncident({
      type: "atomic-admin-success",
      severity: "high",
      description: "Incident administrateur valide",
      createdBy: adminId,
      createdByRole: "administrator",
    });
    assert.equal(count(`SELECT COUNT(*) AS n FROM incidents WHERE id = ?`, adminIncidentId), 1);
    assert.equal(count(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'incident_declare' AND target_type = 'incident' AND target_id = ?`, adminIncidentId), 1);

    const candidateIncidentId = declareCandidateIncident({
      type: "atomic-candidate-success",
      description: "Incident candidat valide",
      candidateUserId: candidateId,
    });
    assert.equal(count(`SELECT COUNT(*) AS n FROM incidents WHERE id = ?`, candidateIncidentId), 1);
    assert.equal(count(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'incident_declare' AND target_type = 'incident' AND target_id = ?`, candidateIncidentId), 1);
    assert.equal(count(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'candidate_incident_declared' AND target_type = 'incident' AND target_id = ?`, candidateIncidentId), 1);
  });

  test("tentative usurpée -> zéro incident et zéro audit de succès", () => {
    const { candidateId, otherCandidateId, assessmentId } = makeAssessmentForOtherCandidate();
    const otherAttempt = startAttempt(assessmentId, otherCandidateId, {});
    const beforeIncidents = incidentCount();
    const beforeGeneric = auditCount("incident_declare");
    const beforeCandidate = auditCount("candidate_incident_declared");

    assert.throws(
      () =>
        declareCandidateIncident({
          type: "atomic-spoof-denied",
          description: "Tentative d'un autre candidat",
          attemptId: otherAttempt.id,
          candidateUserId: candidateId,
        }),
      CandidateIncidentError
    );

    assert.equal(incidentCount(), beforeIncidents);
    assert.equal(auditCount("incident_declare"), beforeGeneric);
    assert.equal(auditCount("candidate_incident_declared"), beforeCandidate);
  });

  test("retry après rollback -> seulement l'incident du retry réussi existe", () => {
    const { adminId } = makeActors();
    const type = `atomic-retry-${tag()}`;
    const dropTrigger = installAuditFailure("incident_declare");
    try {
      assert.throws(() =>
        declareIncident({
          type,
          severity: "low",
          description: "Premier essai forcé en échec",
          createdBy: adminId,
          createdByRole: "administrator",
        })
      );
    } finally {
      dropTrigger();
    }

    assert.equal(count(`SELECT COUNT(*) AS n FROM incidents WHERE type = ?`, type), 0);
    const incidentId = declareIncident({
      type,
      severity: "low",
      description: "Retry valide",
      createdBy: adminId,
      createdByRole: "administrator",
    });
    assert.equal(count(`SELECT COUNT(*) AS n FROM incidents WHERE type = ?`, type), 1);
    assert.equal(count(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'incident_declare' AND target_id = ?`, incidentId), 1);
  });
});
