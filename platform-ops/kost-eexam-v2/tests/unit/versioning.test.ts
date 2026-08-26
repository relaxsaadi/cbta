import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Versionnage des questions (§4 — critique pour l'audit)", () => {
  test("éditer une question après publication ne modifie jamais rétroactivement un examen déjà publié", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion, addQuestionVersion, getCurrentVersion } = await import("../../lib/questions");
    const { createAssessmentDraft, publishAssessment, getSnapshots } = await import("../../lib/assessments");

    const adminId = createUser({ username: "admin.version", password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: "cand.version", password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: "Co V", scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: "G V", scope: "test", createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);

    const questionId = createQuestion({
      kostQuestionId: "TEST-VERSION-1",
      functionCode: "7.1",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Texte original — version 1",
      choices: [{ key: "A", text: "Bonne (v1)" }, { key: "B", text: "Mauvaise" }],
      correctAnswer: ["A"],
      createdBy: adminId,
    });

    const assessmentId = createAssessmentDraft({
      type: "examen", name: "Examen versionné", functionCode: "7.1", groupId, questionSource: "random",
      questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    // Snapshot figé au moment de la publication.
    const snapshotBefore = getSnapshots(assessmentId)[0]!;
    assert.equal(snapshotBefore.stem_snapshot, "Texte original — version 1");

    // Le responsable édite la question APRÈS publication — ceci crée une
    // NOUVELLE version (jamais un UPDATE de l'ancienne).
    const newVersionId = addQuestionVersion(
      questionId,
      { stem: "Texte corrigé — version 2 (édité après publication)", choices: [{ key: "A", text: "Bonne (v2, corrigée)" }, { key: "B", text: "Mauvaise" }], correctAnswer: ["A"] },
      adminId
    );

    // La question elle-même pointe maintenant vers la nouvelle version.
    const current = getCurrentVersion(questionId);
    assert.equal(current!.id, newVersionId);
    assert.equal(current!.version_no, 2);
    assert.equal(current!.stem, "Texte corrigé — version 2 (édité après publication)");

    // MAIS le snapshot de l'examen déjà publié reste EXACTEMENT inchangé —
    // c'est la garantie centrale du §4 : « voici exactement la question
    // reçue par ce candidat, à cette date ».
    const snapshotAfter = getSnapshots(assessmentId)[0]!;
    assert.equal(snapshotAfter.id, snapshotBefore.id);
    assert.equal(snapshotAfter.version_id, snapshotBefore.version_id, "le snapshot doit continuer à référencer l'ANCIENNE version");
    assert.notEqual(snapshotAfter.version_id, newVersionId, "le snapshot ne doit jamais pointer vers la nouvelle version");
    assert.equal(snapshotAfter.stem_snapshot, "Texte original — version 1", "le texte figé dans le snapshot ne doit jamais changer");
    assert.equal(snapshotAfter.choices_snapshot_json, snapshotBefore.choices_snapshot_json);
  });
});
