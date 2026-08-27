import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

// Trois périmètres trouvés ouverts lors de la seconde revue pré-auditeur
// (incidents, overview, sessions actives) — non couverts par
// tests/unit/tenant-scope.test.ts, qui ne portait que sur
// entreprise/groupe/évaluation/tentative. Même scénario à deux
// responsables/deux clients pour rester cohérent avec ce premier test.
describe("Isolation multi-client — incidents et sessions actives", () => {
  test("un incident propre à un groupe n'est visible que du responsable de ce groupe (+ admin/auditeur) ; un incident plateforme (group_id NULL) reste visible de tous", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { declareIncident, listIncidents } = await import("../../lib/incidents");
    const { hasIncidentAccess, scopedGroupIdsOrNull } = await import("../../lib/tenant-scope");

    const adminId = createUser({ username: "admin.inc", password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const managerAId = createUser({ username: "resp.inc.a", password: "x".repeat(10), fullName: "Responsable A", role: "pedagogical_manager" });
    const managerBId = createUser({ username: "resp.inc.b", password: "x".repeat(10), fullName: "Responsable B", role: "pedagogical_manager" });
    const companyAId = createCompany({ name: "Company Inc A", scope: "test", createdBy: managerAId });
    const companyBId = createCompany({ name: "Company Inc B", scope: "test", createdBy: managerBId });
    const groupAId = createGroup({ companyId: companyAId, name: "Groupe A", scope: "test", pedagogicalManagerId: managerAId, createdBy: managerAId });
    const groupBId = createGroup({ companyId: companyBId, name: "Groupe B", scope: "test", pedagogicalManagerId: managerBId, createdBy: managerBId });

    const incidentAId = declareIncident({ type: "security", severity: "high", description: "Incident client A", groupId: groupAId, createdBy: managerAId, createdByRole: "pedagogical_manager" });
    const incidentBId = declareIncident({ type: "security", severity: "high", description: "Incident client B", groupId: groupBId, createdBy: managerBId, createdByRole: "pedagogical_manager" });
    const platformIncidentId = declareIncident({ type: "outage", severity: "critical", description: "Panne serveur globale", createdBy: adminId, createdByRole: "administrator" });

    const sessA = { userId: managerAId, role: "pedagogical_manager" as const };
    const sessB = { userId: managerBId, role: "pedagogical_manager" as const };
    const sessAdmin = { userId: adminId, role: "administrator" as const };
    const sessAuditor = { userId: adminId, role: "auditor" as const };

    // Accès direct par id.
    assert.equal(hasIncidentAccess(sessA, incidentAId), true, "A accède à son propre incident");
    assert.equal(hasIncidentAccess(sessA, incidentBId), false, "A n'accède PAS à l'incident de B");
    assert.equal(hasIncidentAccess(sessB, incidentAId), false, "B n'accède PAS à l'incident de A");
    assert.equal(hasIncidentAccess(sessA, platformIncidentId), true, "l'incident plateforme reste visible de A");
    assert.equal(hasIncidentAccess(sessB, platformIncidentId), true, "l'incident plateforme reste visible de B");
    assert.equal(hasIncidentAccess(sessAdmin, incidentBId), true, "administrateur : accès global");
    assert.equal(hasIncidentAccess(sessAuditor, incidentBId), true, "auditeur : lecture globale");

    // Listes filtrées (scopedGroupIdsOrNull -> listIncidents).
    const listForA = listIncidents(scopedGroupIdsOrNull(sessA));
    const idsForA = listForA.map((i) => i.id).sort();
    assert.deepEqual(idsForA, [incidentAId, platformIncidentId].sort(), "A voit son incident + le platform, jamais celui de B");

    const listForAdmin = listIncidents(scopedGroupIdsOrNull(sessAdmin));
    assert.equal(listForAdmin.length, 3, "administrateur voit les 3 (A, B, plateforme)");
  });

  test("les sessions actives d'un responsable ne montrent que lui-même et les candidats de ses groupes", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createDbSession } = await import("../../lib/sessions-registry");
    const { listActiveSessions } = await import("../../lib/sessions-registry");
    const { scopedUserIdsForSessionsOrNull, getManagedCandidateUserIds } = await import("../../lib/tenant-scope");

    const managerAId = createUser({ username: "resp.sess.a", password: "x".repeat(10), fullName: "Responsable Sess A", role: "pedagogical_manager" });
    const managerBId = createUser({ username: "resp.sess.b", password: "x".repeat(10), fullName: "Responsable Sess B", role: "pedagogical_manager" });
    const companyAId = createCompany({ name: "Company Sess A", scope: "test", createdBy: managerAId });
    const companyBId = createCompany({ name: "Company Sess B", scope: "test", createdBy: managerBId });
    const groupAId = createGroup({ companyId: companyAId, name: "Groupe Sess A", scope: "test", pedagogicalManagerId: managerAId, createdBy: managerAId });
    const groupBId = createGroup({ companyId: companyBId, name: "Groupe Sess B", scope: "test", pedagogicalManagerId: managerBId, createdBy: managerBId });
    const candidateAId = createUser({ username: "cand.sess.a", password: "x".repeat(10), fullName: "Candidat Sess A", role: "candidate" });
    const candidateBId = createUser({ username: "cand.sess.b", password: "x".repeat(10), fullName: "Candidat Sess B", role: "candidate" });
    addCandidateToGroup(groupAId, candidateAId, managerAId);
    addCandidateToGroup(groupBId, candidateBId, managerBId);

    createDbSession({ userId: managerAId });
    createDbSession({ userId: managerBId });
    createDbSession({ userId: candidateAId });
    createDbSession({ userId: candidateBId });

    assert.deepEqual(getManagedCandidateUserIds(managerAId), [candidateAId]);

    const sessA = { userId: managerAId, role: "pedagogical_manager" as const };
    const scopeA = scopedUserIdsForSessionsOrNull(sessA);
    assert.deepEqual([...scopeA!].sort(), [managerAId, candidateAId].sort());

    const sessionsForA = listActiveSessions(scopeA);
    const userIdsForA = sessionsForA.map((s) => s.user_id).sort();
    assert.deepEqual(userIdsForA, [managerAId, candidateAId].sort(), "A voit sa propre session + celle de son candidat, jamais celles de B");
    assert.ok(!userIdsForA.includes(managerBId), "la session du responsable B ne doit jamais apparaître");
    assert.ok(!userIdsForA.includes(candidateBId), "la session du candidat de B ne doit jamais apparaître");

    const sessAdmin = { userId: managerAId, role: "administrator" as const };
    const sessionsForAdmin = listActiveSessions(scopedUserIdsForSessionsOrNull(sessAdmin));
    assert.equal(sessionsForAdmin.length, 4, "administrateur voit les 4 sessions actives");
  });
});
