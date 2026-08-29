import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE USER MANAGEMENT" (2026-08-29) — §26. user_functions est
// purement déclarative côté dossier candidat, distincte de
// assessments.function_code (propriété d'un EXAMEN, jamais modifiée après
// publication) — ne doit JAMAIS altérer un snapshot d'examen déjà publié.
describe("Fonctions DGR affectées à un candidat (mission COMPLETE USER MANAGEMENT §26)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { assignFunctionToUser, removeFunctionFromUser, listUserFunctions } = await import("../../lib/user-functions");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, getSnapshots } = await import("../../lib/assessments");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");

  let counter = 0;
  function tag() {
    counter += 1;
    return `fn${counter}`;
  }

  test("affecter une fonction crée bien la relation, avec assigned_by et le libellé joint", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });

    const { changed } = assignFunctionToUser(candidateId, "7.1", adminId);
    assert.equal(changed, true);

    const rows = listUserFunctions(candidateId);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.function_code, "7.1");
    assert.equal(rows[0]!.assigned_by, adminId);
    assert.equal(rows[0]!.assigned_by_name, "Admin");
    assert.ok(rows[0]!.label);
  });

  test("affecter deux fois la même fonction est idempotent — jamais de doublon, jamais d'erreur", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });

    assignFunctionToUser(candidateId, "7.2", adminId);
    const second = assignFunctionToUser(candidateId, "7.2", adminId);
    assert.equal(second.changed, false, "un second appel identique ne change rien");
    assert.equal(listUserFunctions(candidateId).length, 1);
  });

  test("plusieurs fonctions par candidat sont supportées simultanément", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });

    assignFunctionToUser(candidateId, "7.1", adminId);
    assignFunctionToUser(candidateId, "7.3", adminId);
    assignFunctionToUser(candidateId, "7.5", adminId);

    const codes = listUserFunctions(candidateId).map((f) => f.function_code).sort();
    assert.deepEqual(codes, ["7.1", "7.3", "7.5"]);
  });

  test("retirer une fonction supprime réellement la relation", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    assignFunctionToUser(candidateId, "7.4", adminId);

    const { changed } = removeFunctionFromUser(candidateId, "7.4");
    assert.equal(changed, true);
    assert.equal(listUserFunctions(candidateId).length, 0);
  });

  test("retirer une fonction jamais affectée est un no-op sûr (jamais une erreur)", () => {
    const t = tag();
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const { changed } = removeFunctionFromUser(candidateId, "7.9");
    assert.equal(changed, false);
  });

  test("affecter/retirer une fonction candidat ne touche JAMAIS un examen déjà publié ni ses snapshots figés", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    createQuestion({
      kostQuestionId: `TEST-${t.toUpperCase()}-1`,
      functionCode: "7.1",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Question originale",
      choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }],
      correctAnswer: ["A"],
      createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen",
      name: `Examen ${t}`,
      functionCode: "7.1",
      groupId,
      questionSource: "random",
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 80,
      scope: "test",
      createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      closeAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    const snapshotsBefore = getSnapshots(assessmentId);
    assert.equal(snapshotsBefore.length, 1);
    const stemBefore = snapshotsBefore[0]!.stem_snapshot;

    // Affecter/retirer des fonctions candidat après publication...
    assignFunctionToUser(candidateId, "7.1", adminId);
    assignFunctionToUser(candidateId, "7.2", adminId);
    removeFunctionFromUser(candidateId, "7.2");

    // ...ne doit JAMAIS altérer le snapshot déjà figé.
    const snapshotsAfter = getSnapshots(assessmentId);
    assert.equal(snapshotsAfter.length, 1);
    assert.equal(snapshotsAfter[0]!.stem_snapshot, stemBefore);
  });
});
