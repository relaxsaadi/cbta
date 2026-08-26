import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Garantie anti-double-tentative (§9 — une seule tentative)", () => {
  test("l'index unique partiel SQLite rejette une 2e ligne 'in_progress' même si le code applicatif tente de la créer", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion } = await import("../../lib/questions");
    const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
    const { getDb } = await import("../../lib/db");

    const adminId = createUser({ username: "admin.conc", password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: "cand.conc", password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: "Co", scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: "G", scope: "test", createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    createQuestion({
      kostQuestionId: "TEST-CONC-1", functionCode: "7.3", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: "Examen unique", functionCode: "7.3", groupId, questionSource: "random",
      questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    const db = getDb();
    // Simule deux requêtes concurrentes essayant chacune d'insérer une
    // tentative 'in_progress' pour le même (assessment, candidat) — exactement
    // le scénario "double clic / deux onglets" du §9. La 1ère réussit, la 2e
    // DOIT échouer sur la contrainte, pas silencieusement réussir.
    const insert = db.prepare(
      `INSERT INTO attempts (assessment_id, candidate_user_id, attempt_number, status, expires_at) VALUES (?, ?, ?, 'in_progress', ?)`
    );
    const future = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    insert.run(assessmentId, candidateId, 1, future);

    assert.throws(
      () => insert.run(assessmentId, candidateId, 2, future),
      /UNIQUE constraint failed/,
      "une deuxième tentative in_progress concurrente doit être rejetée par la contrainte DB, pas seulement par le code applicatif"
    );

    const count = db.prepare(`SELECT COUNT(*) AS n FROM attempts WHERE assessment_id = ? AND candidate_user_id = ? AND status = 'in_progress'`).get(assessmentId, candidateId) as { n: number };
    assert.equal(count.n, 1, "il ne doit jamais exister plus d'une tentative in_progress pour ce couple");
  });

  test("startAttempt() rattrape la violation de contrainte et renvoie la tentative existante (pas une erreur brute)", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion } = await import("../../lib/questions");
    const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
    const { startAttempt } = await import("../../lib/attempts");

    const adminId = createUser({ username: "admin.conc2", password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: "cand.conc2", password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: "Co2", scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: "G2", scope: "test", createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    createQuestion({
      kostQuestionId: "TEST-CONC-2", functionCode: "7.4", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: "Examen resume", functionCode: "7.4", groupId, questionSource: "random",
      questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    // Deux appels "simultanés" (séquentiels ici, Node est mono-thread — mais
    // startAttempt() lui-même revérifie via getActiveAttempt() avant chaque
    // tentative d'écriture, donc le 2e appel prend le chemin "déjà active").
    const first = startAttempt(assessmentId, candidateId, {});
    const second = startAttempt(assessmentId, candidateId, {});
    assert.equal(first.id, second.id, "le deuxième appel doit renvoyer EXACTEMENT la même tentative, pas en créer une nouvelle");
  });
});
