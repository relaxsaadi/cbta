import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE MISSING FILTERS + NORMALIZE QUESTION COUNTS"
// (2026-08-30) — verrouille chaque nouvelle fonction de filtrage ajoutée
// pour /question-bank, /groups, /audit-logs, /incidents, /sessions,
// /familiarisation. Même discipline que tests/unit/results-nullable-
// counts.test.ts::status filter : isolation par filtre, ET réel en
// combiné, jamais une exclusion silencieuse en l'absence de filtre.
describe("Filtres — mission COMPLETE MISSING FILTERS (2026-08-30)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, listGroupsFiltered, addCandidateToGroup } = await import("../../lib/groups");
  const {
    createQuestion,
    listQuestions,
    countQuestionsByClassification,
    isDemoQuestionId,
  } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { audit, listAuditLogsFiltered, listDistinctAuditActions, listDistinctAuditActors } = await import("../../lib/audit");
  const { declareIncident, listIncidentsFiltered } = await import("../../lib/incidents");
  const { createDbSession, listActiveSessionsFiltered, revokeDbSession } = await import("../../lib/sessions-registry");
  const { createFamiliarizationSession, listFamiliarizationSessionsFiltered } = await import("../../lib/familiarization");

  let counter = 0;
  function tag() {
    counter += 1;
    return `fm2${counter}`;
  }

  test("isDemoQuestionId() — signal autoritatif = préfixe 'DEMO-', jamais source_status seul", () => {
    assert.equal(isDemoQuestionId("DEMO-TF-01"), true);
    assert.equal(isDemoQuestionId("Q-7.1-020"), false);
    // Une VRAIE question réglementaire en cours de vérification (DRAFT,
    // pas encore FROZEN_SOURCE_VERIFIED) n'est jamais confondue avec un
    // exemple DEMO créé pour tester les types de question.
    assert.equal(isDemoQuestionId("Q-7.3-099-EN-COURS"), false);
  });

  test("listQuestions() / countQuestionsByClassification() — isole réellement réglementaire vs DEMO, function, qtype, source status, reviewer status, recherche, combiné", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });

    // Baseline capturée AVANT toute création — sinon "before" inclurait
    // déjà les fixtures qu'on s'apprête à créer (bug de fixture trouvé et
    // corrigé pendant l'écriture de ce test).
    const baseline = countQuestionsByClassification();

    const qReg71 = createQuestion({
      kostQuestionId: `Q-${t}-REG71`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: `Question lithium ${t}`, choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const qReg72 = createQuestion({
      kostQuestionId: `Q-${t}-REG72`, functionCode: "7.2", qtype: "true_false", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: `Question 72 ${t}`, choices: [{ key: "true", text: "Vrai" }, { key: "false", text: "Faux" }], correctAnswer: ["true"], createdBy: adminId,
    });
    const qDemo = createQuestion({
      kostQuestionId: `DEMO-${t}-01`, functionCode: "7.1", qtype: "numeric", sourceStatus: "DRAFT",
      stem: `Question démo ${t}`, choices: [], correctAnswer: { mode: "numeric", value: 1, tolerance: 0 }, createdBy: adminId,
    });

    const all = listQuestions();
    assert.ok(all.length >= 3);

    const only71 = listQuestions({ functionCode: "7.1" });
    assert.ok(only71.some((q) => q.id === qReg71));
    assert.ok(only71.some((q) => q.id === qDemo));
    assert.ok(!only71.some((q) => q.id === qReg72));

    const onlyTrueFalse = listQuestions({ qtype: "true_false" });
    assert.ok(onlyTrueFalse.some((q) => q.id === qReg72));
    assert.ok(!onlyTrueFalse.some((q) => q.id === qReg71));
    assert.ok(!onlyTrueFalse.some((q) => q.id === qDemo));

    const onlyDraft = listQuestions({ sourceStatus: "DRAFT" });
    assert.ok(onlyDraft.some((q) => q.id === qDemo));
    assert.ok(!onlyDraft.some((q) => q.id === qReg71));

    const onlyPending = listQuestions({ reviewerStatus: "PENDING" });
    assert.ok(onlyPending.some((q) => q.id === qReg71)); // reviewer_status par défaut = PENDING

    const onlyRegulatory = listQuestions({ classification: "regulatory" });
    assert.ok(onlyRegulatory.some((q) => q.id === qReg71));
    assert.ok(!onlyRegulatory.some((q) => q.id === qDemo));

    const onlyDemo = listQuestions({ classification: "demo" });
    assert.ok(onlyDemo.some((q) => q.id === qDemo));
    assert.ok(!onlyDemo.some((q) => q.id === qReg71));

    const search = listQuestions({ search: "lithium" });
    assert.ok(search.some((q) => q.id === qReg71));
    assert.ok(!search.some((q) => q.id === qReg72));

    // Combiné — preuve d'un vrai ET, jamais un OU déguisé.
    const combined = listQuestions({ functionCode: "7.1", classification: "demo" });
    assert.ok(combined.some((q) => q.id === qDemo));
    assert.ok(!combined.some((q) => q.id === qReg71)); // 7.1 mais réglementaire → exclu

    const active0 = listQuestions({ active: false });
    assert.ok(!active0.some((q) => q.id === qReg71)); // actif par défaut

    // countQuestionsByClassification() — les 2 nouvelles questions
    // réglementaires + 1 DEMO se répercutent exactement dans les
    // compteurs globaux, jamais un total qui ignore la classification.
    const afterCounts = countQuestionsByClassification();
    assert.equal(afterCounts.regulatory, baseline.regulatory + 2);
    assert.equal(afterCounts.demo, baseline.demo + 1);
    assert.equal(afterCounts.total, baseline.total + 3);
    assert.equal(afterCounts.regulatory + afterCounts.demo, afterCounts.total);
  });

  test("listGroupsFiltered() — Client, Type client, Statut, Fonction DGR (via examens), recherche, combiné, périmètre responsable", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const managerA = createUser({ username: `${t}.mgra`, password: "x".repeat(10), fullName: "Manager A", role: "pedagogical_manager" });
    const managerB = createUser({ username: `${t}.mgrb`, password: "x".repeat(10), fullName: "Manager B", role: "pedagogical_manager" });

    const companyEnt = createCompany({ name: `Ent ${t}`, scope: "test", createdBy: adminId, clientType: "entreprise" });
    const companyPart = createCompany({ name: `Part ${t}`, scope: "test", createdBy: adminId, clientType: "particulier" });

    const groupA = createGroup({ companyId: companyEnt, name: `Grp Actif ${t}`, scope: "test", pedagogicalManagerId: managerA, createdBy: adminId, dateStart: "2026-06-01" });
    const groupB = createGroup({ companyId: companyPart, name: `Grp Particulier ${t}`, scope: "test", pedagogicalManagerId: managerB, createdBy: adminId, dateStart: "2026-09-01" });

    // groupA obtient une fonction réelle via un examen publié.
    const q = createQuestion({
      kostQuestionId: `Q-${t}-GRPFN`, functionCode: "7.4", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const cand = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Cand", role: "candidate" });
    addCandidateToGroup(groupA, cand, adminId);
    const assessmentId = createAssessmentDraft({
      type: "test", name: `Exam ${t}`, functionCode: "7.4", groupId: groupA, questionSource: "manual",
      manualQuestionIds: [q], questionCount: 1, durationMinutes: 15, passThresholdPct: 80, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    const byCompany = listGroupsFiltered({ companyId: companyEnt });
    assert.ok(byCompany.some((g) => g.id === groupA));
    assert.ok(!byCompany.some((g) => g.id === groupB));

    const byClientType = listGroupsFiltered({ clientType: "particulier" });
    assert.ok(byClientType.some((g) => g.id === groupB));
    assert.ok(!byClientType.some((g) => g.id === groupA));

    const byStatus = listGroupsFiltered({ status: "active" });
    assert.ok(byStatus.some((g) => g.id === groupA));

    const byFunction = listGroupsFiltered({ functionCode: "7.4" });
    assert.ok(byFunction.some((g) => g.id === groupA));
    assert.ok(!byFunction.some((g) => g.id === groupB)); // groupB n'a aucun examen 7.4

    const bySearch = listGroupsFiltered({ search: "Particulier" });
    assert.ok(bySearch.some((g) => g.id === groupB));
    assert.ok(!bySearch.some((g) => g.id === groupA));

    const byDate = listGroupsFiltered({ dateFrom: "2026-08-01" });
    assert.ok(byDate.some((g) => g.id === groupB));
    assert.ok(!byDate.some((g) => g.id === groupA));

    // Combiné.
    const combined = listGroupsFiltered({ clientType: "entreprise", functionCode: "7.4" });
    assert.ok(combined.some((g) => g.id === groupA));
    assert.ok(!combined.some((g) => g.id === groupB));

    // Périmètre responsable — managerA ne voit jamais le groupe de managerB.
    const scopedA = listGroupsFiltered({ restrictToManagerId: managerA });
    assert.ok(scopedA.some((g) => g.id === groupA));
    assert.ok(!scopedA.some((g) => g.id === groupB));
  });

  test("listAuditLogsFiltered() — Date, Acteur, Rôle, Action, recherche, combiné ; listDistinctAuditActions/Actors ne renvoient que des valeurs RÉELLES", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const managerId = createUser({ username: `${t}.mgr`, password: "x".repeat(10), fullName: "Mgr", role: "pedagogical_manager" });

    const uniqueAction = `test_action_${t}`;
    audit({ actorUserId: adminId, actorRole: "administrator", action: uniqueAction, targetType: "user", targetId: adminId });
    audit({ actorUserId: managerId, actorRole: "pedagogical_manager", action: "login" });

    const byAction = listAuditLogsFiltered({ action: uniqueAction });
    assert.ok(byAction.some((l) => l.actor_user_id === adminId));
    assert.ok(!byAction.some((l) => l.actor_user_id === managerId && l.action === uniqueAction));

    const byActor = listAuditLogsFiltered({ actorUserId: managerId });
    assert.ok(byActor.every((l) => l.actor_user_id === managerId));
    assert.ok(byActor.some((l) => l.action === "login"));

    const byRole = listAuditLogsFiltered({ actorRole: "administrator" });
    assert.ok(byRole.every((l) => l.actor_role === "administrator"));

    const bySearch = listAuditLogsFiltered({ search: uniqueAction });
    assert.ok(bySearch.some((l) => l.actor_user_id === adminId));

    // Date future — aucun événement ne peut avoir eu lieu demain.
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const byFutureDate = listAuditLogsFiltered({ dateFrom: tomorrow });
    assert.equal(byFutureDate.length, 0);

    // Combiné — ET réel.
    const combined = listAuditLogsFiltered({ actorRole: "administrator", action: uniqueAction });
    assert.ok(combined.some((l) => l.actor_user_id === adminId));
    const combinedMismatch = listAuditLogsFiltered({ actorRole: "pedagogical_manager", action: uniqueAction });
    assert.equal(combinedMismatch.length, 0);

    // Jamais une liste inventée — uniquement des valeurs réellement
    // présentes dans audit_logs.
    const actions = listDistinctAuditActions();
    assert.ok(actions.includes(uniqueAction));
    assert.ok(actions.includes("login"));
    const actors = listDistinctAuditActors();
    assert.ok(actors.some((a) => a.id === adminId));
  });

  test("listIncidentsFiltered() — Statut, Sévérité, Client, Groupe, Date, recherche, combiné, isolation tenant (jamais les incidents d'un autre client)", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const managerA = createUser({ username: `${t}.mgra`, password: "x".repeat(10), fullName: "Mgr A", role: "pedagogical_manager" });

    const companyA = createCompany({ name: `IncCo A ${t}`, scope: "test", createdBy: adminId });
    const companyB = createCompany({ name: `IncCo B ${t}`, scope: "test", createdBy: adminId });
    const groupA = createGroup({ companyId: companyA, name: `IncGrp A ${t}`, scope: "test", pedagogicalManagerId: managerA, createdBy: adminId });
    const groupB = createGroup({ companyId: companyB, name: `IncGrp B ${t}`, scope: "test", createdBy: adminId });

    const incA = declareIncident({
      type: `type-critique-${t}`, severity: "critical", description: `Incident critique lithium ${t}`,
      groupId: groupA, createdBy: adminId, createdByRole: "administrator",
    });
    const incB = declareIncident({
      type: `type-faible-${t}`, severity: "low", description: `Incident faible ${t}`,
      groupId: groupB, createdBy: adminId, createdByRole: "administrator",
    });

    const bySeverity = listIncidentsFiltered({ severity: "critical" });
    assert.ok(bySeverity.some((i) => i.id === incA));
    assert.ok(!bySeverity.some((i) => i.id === incB));

    const byStatus = listIncidentsFiltered({ status: "open" }); // défaut = open
    assert.ok(byStatus.some((i) => i.id === incA));

    const byCompany = listIncidentsFiltered({ companyId: companyA });
    assert.ok(byCompany.some((i) => i.id === incA));
    assert.ok(!byCompany.some((i) => i.id === incB));

    const byGroup = listIncidentsFiltered({ groupId: groupB });
    assert.ok(byGroup.some((i) => i.id === incB));
    assert.ok(!byGroup.some((i) => i.id === incA));

    const bySearch = listIncidentsFiltered({ search: "lithium" });
    assert.ok(bySearch.some((i) => i.id === incA));
    assert.ok(!bySearch.some((i) => i.id === incB));

    const combined = listIncidentsFiltered({ severity: "critical", companyId: companyA });
    assert.ok(combined.some((i) => i.id === incA));

    // Isolation tenant — managerA (restrictToGroupIdsOrNull = [groupA])
    // ne voit jamais l'incident du groupe B.
    const scopedA = listIncidentsFiltered({ restrictToGroupIdsOrNull: [groupA] });
    assert.ok(scopedA.some((i) => i.id === incA));
    assert.ok(!scopedA.some((i) => i.id === incB));
  });

  test("listActiveSessionsFiltered() — Rôle, recherche, Date d'ouverture, jamais un statut 'révoqué' n'apparaît (par construction, pas de filtre Statut inventé)", () => {
    const t = tag();
    const userA = createUser({ username: `${t}.sessuser`, password: "x".repeat(10), fullName: `Session User ${t}`, role: "administrator" });
    const { dbSessionId } = createDbSession({ userId: userA, ipAddress: "127.0.0.1" });

    const byRole = listActiveSessionsFiltered({ role: "administrator" });
    assert.ok(byRole.some((s) => s.user_id === userA));
    assert.ok(byRole.every((s) => s.role === "administrator"));

    const bySearch = listActiveSessionsFiltered({ search: `Session User ${t}` });
    assert.ok(bySearch.some((s) => s.user_id === userA));

    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const byFutureDate = listActiveSessionsFiltered({ dateFrom: tomorrow });
    assert.ok(!byFutureDate.some((s) => s.user_id === userA));

    const combined = listActiveSessionsFiltered({ role: "administrator", search: `Session User ${t}` });
    assert.ok(combined.some((s) => s.user_id === userA));
    const combinedMismatch = listActiveSessionsFiltered({ role: "candidate", search: `Session User ${t}` });
    assert.ok(!combinedMismatch.some((s) => s.user_id === userA));

    // Une session révoquée ne doit JAMAIS réapparaître, quel que soit le
    // filtre — c'est la vraie garantie "active" de cette liste (raison
    // pour laquelle aucun filtre "Statut" n'a été ajouté : il n'y aurait
    // qu'une seule valeur possible ici). Fait EN DERNIER — révoque la
    // session utilisée par toutes les assertions précédentes.
    revokeDbSession(dbSessionId, userA);
    const afterRevoke = listActiveSessionsFiltered({ role: "administrator" });
    assert.ok(!afterRevoke.some((s) => s.id === dbSessionId));
  });

  test("listFamiliarizationSessionsFiltered() — Client, Groupe, Fonction DGR, Date, recherche, combiné, isolation tenant", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const managerA = createUser({ username: `${t}.mgra`, password: "x".repeat(10), fullName: "Mgr A", role: "pedagogical_manager" });

    const companyA = createCompany({ name: `FamCo A ${t}`, scope: "test", createdBy: adminId });
    const companyB = createCompany({ name: `FamCo B ${t}`, scope: "test", createdBy: adminId });
    const groupA = createGroup({ companyId: companyA, name: `FamGrp A ${t}`, scope: "test", pedagogicalManagerId: managerA, createdBy: adminId });
    const groupB = createGroup({ companyId: companyB, name: `FamGrp B ${t}`, scope: "test", createdBy: adminId });

    const sessA = createFamiliarizationSession({ groupId: groupA, functionCode: "7.5", heldAt: "2026-05-01T10:00:00.000Z", organizedBy: adminId, organizerRole: "administrator" });
    const sessB = createFamiliarizationSession({ groupId: groupB, functionCode: "7.6", heldAt: "2026-09-01T10:00:00.000Z", organizedBy: adminId, organizerRole: "administrator" });

    const byCompany = listFamiliarizationSessionsFiltered({ companyId: companyA });
    assert.ok(byCompany.some((s) => s.id === sessA));
    assert.ok(!byCompany.some((s) => s.id === sessB));

    const byFunction = listFamiliarizationSessionsFiltered({ functionCode: "7.6" });
    assert.ok(byFunction.some((s) => s.id === sessB));
    assert.ok(!byFunction.some((s) => s.id === sessA));

    const byDate = listFamiliarizationSessionsFiltered({ dateFrom: "2026-08-01" });
    assert.ok(byDate.some((s) => s.id === sessB));
    assert.ok(!byDate.some((s) => s.id === sessA));

    const bySearch = listFamiliarizationSessionsFiltered({ search: `FamGrp B ${t}` });
    assert.ok(bySearch.some((s) => s.id === sessB));
    assert.ok(!bySearch.some((s) => s.id === sessA));

    const combined = listFamiliarizationSessionsFiltered({ companyId: companyA, functionCode: "7.5" });
    assert.ok(combined.some((s) => s.id === sessA));
    const combinedMismatch = listFamiliarizationSessionsFiltered({ companyId: companyA, functionCode: "7.6" });
    assert.ok(!combinedMismatch.some((s) => s.id === sessA || s.id === sessB));

    // Isolation tenant.
    const scopedA = listFamiliarizationSessionsFiltered({ restrictToGroupIdsOrNull: [groupA] });
    assert.ok(scopedA.some((s) => s.id === sessA));
    assert.ok(!scopedA.some((s) => s.id === sessB));

    // Reset — sans filtre, les deux réapparaissent (jamais une exclusion
    // silencieuse par défaut).
    const all = listFamiliarizationSessionsFiltered();
    assert.ok(all.some((s) => s.id === sessA));
    assert.ok(all.some((s) => s.id === sessB));
  });
});
