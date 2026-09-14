import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
// §24-33/§37 — garanties de sécurité de la déclaration d'incident candidat
// (lib/incidents.ts::declareCandidateIncident/listMyIncidents).
describe("Déclaration d'incident candidat — garanties de sécurité (lib/incidents.ts)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, assignCandidatesToAssessment } = await import("../../lib/assessments");
  const { startAttempt } = await import("../../lib/attempts");
  const {
    declareCandidateIncident,
    declareIncident,
    listMyIncidents,
    listIncidentsFiltered,
    getIncident,
    CandidateIncidentError,
  } = await import("../../lib/incidents");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `ci${counter}`;
  }

  function countRows(table: string): number {
    return (getDb().prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
  }

  function assertCandidateIncidentRejectedWithoutSuccessWrites(fn: () => unknown) {
    const before = { incidents: countRows("incidents"), audits: countRows("audit_logs") };
    assert.throws(fn, CandidateIncidentError);
    assert.equal(countRows("incidents"), before.incidents, "un contexte invalide ne doit persister aucun incident");
    assert.equal(countRows("audit_logs"), before.audits, "un contexte invalide ne doit persister aucun audit de succès");
  }

  function makeFixture() {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const managerId = createUser({ username: `${t}.mgr`, password: "x".repeat(10), fullName: "Manager", role: "pedagogical_manager" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const otherCandidateId = createUser({ username: `${t}.cand2`, password: "x".repeat(10), fullName: "Autre candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: managerId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    const qId = createQuestion({
      kostQuestionId: `TEST-${t}`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q1", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [qId], questionCount: 1, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);
    return { t, adminId, managerId, candidateId, otherCandidateId, groupId, assessmentId };
  }

  function createAdditionalGroup(params: {
    t: string;
    adminId: number;
    managerId: number;
    candidateId: number;
    scope: "production" | "demo" | "test";
    suffix: string;
    status?: "active" | "closed";
  }): number {
    const companyId = createCompany({ name: `Co ${params.suffix} ${params.t}`, scope: params.scope, createdBy: params.adminId });
    const groupId = createGroup({
      companyId,
      name: `G ${params.suffix} ${params.t}`,
      scope: params.scope,
      pedagogicalManagerId: params.managerId,
      createdBy: params.adminId,
    });
    addCandidateToGroup(groupId, params.candidateId, params.adminId);
    if (params.status === "closed") {
      getDb().prepare(`UPDATE groups SET status = 'closed' WHERE id = ?`).run(groupId);
    }
    return groupId;
  }

  test("déclaration SANS tentative : severity toujours 'low', groupId dérivé de l'unique groupe actif", () => {
    const { candidateId, groupId } = makeFixture();
    const incidentId = declareCandidateIncident({ type: "technical_failure", description: "Écran figé", candidateUserId: candidateId });
    const incident = getIncident(incidentId)!;
    assert.equal(incident.severity, "low");
    assert.equal(incident.group_id, groupId);
    assert.equal(incident.created_by, candidateId);
    assert.equal(incident.attempt_id, null);
    assert.equal(incident.reported_by_candidate, 1, "un incident créé par un compte candidat doit être signalé comme tel");
  });

  test("#224 — zéro affiliation active : échec fermé, aucun incident ni audit de succès", () => {
    const { candidateId } = makeFixture();
    getDb().prepare(`DELETE FROM group_members WHERE candidate_user_id = ?`).run(candidateId);

    assertCandidateIncidentRejectedWithoutSuccessWrites(() =>
      declareCandidateIncident({ type: "technical_failure", description: "Sans contexte", candidateUserId: candidateId })
    );
  });

  test("#224 — plusieurs groupes actifs du même scope : aucun LIMIT 1 arbitraire", () => {
    const { t, adminId, managerId, candidateId } = makeFixture();
    createAdditionalGroup({ t, adminId, managerId, candidateId, scope: "test", suffix: "same-scope" });

    assertCandidateIncidentRejectedWithoutSuccessWrites(() =>
      declareCandidateIncident({ type: "technical_failure", description: "Contexte ambigu", candidateUserId: candidateId })
    );
  });

  test("#224 — plusieurs groupes actifs de scopes différents : aucun ordre implicite production/demo/test", () => {
    const { t, adminId, managerId, candidateId } = makeFixture();
    createAdditionalGroup({ t, adminId, managerId, candidateId, scope: "production", suffix: "production" });

    assertCandidateIncidentRejectedWithoutSuccessWrites(() =>
      declareCandidateIncident({ type: "technical_failure", description: "Scopes ambigus", candidateUserId: candidateId })
    );
  });

  test("#224 — un groupe fermé et un seul groupe actif : seul l'actif peut être dérivé", () => {
    const { t, adminId, managerId, candidateId, groupId } = makeFixture();
    createAdditionalGroup({ t, adminId, managerId, candidateId, scope: "demo", suffix: "closed", status: "closed" });

    const incidentId = declareCandidateIncident({ type: "technical_failure", description: "Contexte actif", candidateUserId: candidateId });
    assert.equal(getIncident(incidentId)!.group_id, groupId);
  });

  test("#224 — affiliations uniquement fermées : échec fermé, jamais group_id NULL", () => {
    const { candidateId, groupId } = makeFixture();
    getDb().prepare(`UPDATE groups SET status = 'closed' WHERE id = ?`).run(groupId);

    assertCandidateIncidentRejectedWithoutSuccessWrites(() =>
      declareCandidateIncident({ type: "technical_failure", description: "Groupe fermé", candidateUserId: candidateId })
    );
  });

  test("déclaration AVEC tentative valide : attempt_id/group_id auto-associés depuis la tentative", () => {
    const { candidateId, assessmentId, groupId } = makeFixture();
    const attempt = startAttempt(assessmentId, candidateId, {});
    const incidentId = declareCandidateIncident({ type: "timer", description: "Chronomètre incohérent", attemptId: attempt.id, candidateUserId: candidateId });
    const incident = getIncident(incidentId)!;
    assert.equal(incident.attempt_id, attempt.id);
    assert.equal(incident.group_id, groupId, "group_id doit venir de l'examen de la tentative, pas d'une affiliation générique");
  });

  test("#224 — une tentative possédée reste autoritaire même avec une autre affiliation active", () => {
    const { t, adminId, managerId, candidateId, assessmentId, groupId } = makeFixture();
    createAdditionalGroup({ t, adminId, managerId, candidateId, scope: "production", suffix: "unrelated" });
    const attempt = startAttempt(assessmentId, candidateId, {});

    const incidentId = declareCandidateIncident({
      type: "timer",
      description: "Incident lié à la tentative",
      attemptId: attempt.id,
      candidateUserId: candidateId,
    });
    assert.equal(getIncident(incidentId)!.group_id, groupId, "la tentative possédée doit rester l'autorité de scope");
  });

  test("§37 anti-usurpation — un candidat ne peut PAS déclarer un incident sur la tentative D'UN AUTRE candidat", () => {
    const { adminId, candidateId, otherCandidateId, assessmentId, groupId } = makeFixture();
    // publishAssessment() (dans makeFixture) a déjà affecté tous les
    // membres du groupe au moment de la publication — otherCandidateId
    // n'en faisait pas encore partie, donc affectation explicite ici
    // (même fonction que la vraie UI, lib/assessments.ts::
    // assignCandidatesToAssessment) avant de pouvoir démarrer sa propre
    // tentative légitime.
    addCandidateToGroup(groupId, otherCandidateId, adminId);
    assignCandidatesToAssessment(assessmentId, [otherCandidateId], adminId);
    const attemptOfOther = startAttempt(assessmentId, otherCandidateId, {});
    assert.throws(
      () => declareCandidateIncident({ type: "timer", description: "Tentative usurpée", attemptId: attemptOfOther.id, candidateUserId: candidateId }),
      CandidateIncidentError
    );
  });

  test("§26/§27 — déclarer un incident ne modifie JAMAIS attempt_answers/results, ni l'expiration de la tentative", () => {
    const { candidateId, assessmentId } = makeFixture();
    const attempt = startAttempt(assessmentId, candidateId, {});
    const before = { attempt_answers: countRows("attempt_answers"), results: countRows("results") };
    const expiresBefore = (getDb().prepare(`SELECT expires_at FROM attempts WHERE id = ?`).get(attempt.id) as { expires_at: string }).expires_at;

    declareCandidateIncident({ type: "answer_save", description: "Ma réponse a disparu", attemptId: attempt.id, candidateUserId: candidateId });

    assert.equal(countRows("attempt_answers"), before.attempt_answers);
    assert.equal(countRows("results"), before.results);
    const expiresAfter = (getDb().prepare(`SELECT expires_at FROM attempts WHERE id = ?`).get(attempt.id) as { expires_at: string }).expires_at;
    assert.equal(expiresAfter, expiresBefore, "le chronomètre officiel (expires_at) ne doit jamais être modifié par une déclaration d'incident");
  });

  test("§28/§37 — un candidat ne voit JAMAIS les incidents d'un autre candidat via listMyIncidents", () => {
    const { adminId, candidateId, otherCandidateId, groupId } = makeFixture();
    addCandidateToGroup(groupId, otherCandidateId, adminId);
    declareCandidateIncident({ type: "other", description: "Incident du candidat A", candidateUserId: candidateId });
    declareCandidateIncident({ type: "other", description: "Incident du candidat B", candidateUserId: otherCandidateId });

    const mine = listMyIncidents(candidateId);
    assert.equal(mine.length, 1);
    assert.equal(mine[0]!.description, "Incident du candidat A");

    const theirs = listMyIncidents(otherCandidateId);
    assert.equal(theirs.length, 1);
    assert.equal(theirs[0]!.description, "Incident du candidat B");
  });

  test("§29/§33 — un incident déclaré par le candidat reste dans le périmètre tenant du responsable pédagogique de son groupe", () => {
    const { t, adminId, candidateId, groupId } = makeFixture();
    const otherManagerId = createUser({ username: `${t}.mgr2`, password: "x".repeat(10), fullName: "Autre manager", role: "pedagogical_manager" });
    const otherCompanyId = createCompany({ name: `Co2 ${t}`, scope: "test", createdBy: adminId });
    const otherGroupId = createGroup({ companyId: otherCompanyId, name: `G2 ${t}`, scope: "test", pedagogicalManagerId: otherManagerId, createdBy: adminId });

    declareCandidateIncident({ type: "other", description: "Visible par le bon manager seulement", candidateUserId: candidateId });

    const forOwnManager = listIncidentsFiltered({ restrictToGroupIdsOrNull: [groupId] });
    assert.ok(forOwnManager.some((i) => i.description === "Visible par le bon manager seulement"));

    const forOtherManager = listIncidentsFiltered({ restrictToGroupIdsOrNull: [otherGroupId] });
    assert.ok(!forOtherManager.some((i) => i.description === "Visible par le bon manager seulement"), "un responsable d'un autre groupe ne doit jamais voir cet incident");
  });

  test("reported_by_candidate distingue correctement un incident déclaré par un admin (déclareIncident direct)", () => {
    const { adminId, groupId } = makeFixture();
    const incidentId = declareIncident({ type: "other", severity: "high", description: "Déclaré par un admin", groupId, createdBy: adminId, createdByRole: "administrator" });
    const incident = getIncident(incidentId)!;
    assert.equal(incident.reported_by_candidate, 0);
  });
});
