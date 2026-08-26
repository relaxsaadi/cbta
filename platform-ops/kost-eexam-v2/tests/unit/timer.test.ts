import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Chronomètre serveur (§8 — indépendant du navigateur)", () => {
  test("une tentative dont expires_at est déjà dépassé est auto-soumise par sweepExpiredAttempts(), même sans action candidat", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion } = await import("../../lib/questions");
    const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
    const { getDb } = await import("../../lib/db");
    const { sweepExpiredAttempts } = await import("../../lib/attempts");

    const adminId = createUser({ username: "admin.timer", password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: "cand.timer", password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: "CoT", scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: "GT", scope: "test", createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    createQuestion({
      kostQuestionId: "TEST-TIMER-1", functionCode: "7.5", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: "Examen expire", functionCode: "7.5", groupId, questionSource: "random",
      questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    const db = getDb();
    // Simule une tentative démarrée il y a longtemps, dont le temps est
    // écoulé — exactement le cas "fermeture navigateur / perte réseau,
    // candidat ne revient jamais sur la page" du §8.
    const past = new Date(Date.now() - 60_000).toISOString();
    const startedLongAgo = new Date(Date.now() - 30 * 60_000 - 60_000).toISOString();
    db.prepare(`INSERT INTO attempts (assessment_id, candidate_user_id, attempt_number, status, started_at, expires_at) VALUES (?, ?, 1, 'in_progress', ?, ?)`)
      .run(assessmentId, candidateId, startedLongAgo, past);

    const swept = sweepExpiredAttempts();
    assert.equal(swept, 1, "exactement une tentative expirée doit être balayée");

    const attempt = db.prepare(`SELECT status FROM attempts WHERE assessment_id = ? AND candidate_user_id = ?`).get(assessmentId, candidateId) as { status: string };
    assert.equal(attempt.status, "auto_submitted");

    const result = db.prepare(`SELECT * FROM results r JOIN attempts a ON a.id = r.attempt_id WHERE a.assessment_id = ?`).get(assessmentId);
    assert.ok(result, "la tentative auto-soumise doit avoir été notée (source unique de vérité, §10) — pas seulement marquée soumise sans score");
  });

  test("sauvegarder une réponse sur une tentative déjà expirée déclenche l'auto-soumission au lieu d'accepter la réponse", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion } = await import("../../lib/questions");
    const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
    const { getDb } = await import("../../lib/db");
    const { startAttempt, saveAnswer, AttemptError } = await import("../../lib/attempts");

    const adminId = createUser({ username: "admin.timer2", password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: "cand.timer2", password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: "CoT2", scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: "GT2", scope: "test", createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    createQuestion({
      kostQuestionId: "TEST-TIMER-2", functionCode: "7.6", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: "Examen expire 2", functionCode: "7.6", groupId, questionSource: "random",
      questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    // Démarre une VRAIE tentative via le code de production (crée bien les
    // attempt_questions), puis on retarde artificiellement expires_at dans
    // le passé pour simuler "le temps s'est écoulé pendant que le candidat
    // était sur la page" — sans dupliquer la logique de démarrage.
    const attempt = startAttempt(assessmentId, candidateId, {});
    const db = getDb();
    const past = new Date(Date.now() - 5_000).toISOString();
    db.prepare(`UPDATE attempts SET expires_at = ? WHERE id = ?`).run(past, attempt.id);
    const aq = db.prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };

    assert.throws(() => saveAnswer(attempt.id, candidateId, aq.id, ["A"]), AttemptError);

    const attemptRow = db.prepare(`SELECT status FROM attempts WHERE id = ?`).get(attempt.id) as { status: string };
    assert.equal(attemptRow.status, "auto_submitted", "le serveur doit auto-soumettre au lieu d'accepter silencieusement une réponse hors délai");
  });
});
