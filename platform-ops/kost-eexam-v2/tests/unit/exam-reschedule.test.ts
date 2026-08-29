import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE REAL EXAM RESCHEDULING WORKFLOW" (2026-08-29) —
// couvre les tests A-N demandés qui sont testables au niveau lib/ (voir
// le rapport final pour la correspondance exacte : C/D/E — RBAC/tenant —
// et N — bons destinataires seulement — sont couverts côté E2E, cohérent
// avec la convention déjà établie dans ce projet : lib/rbac.ts porte
// "server-only" et n'est jamais testable directement ici, voir
// pending-activation-login.test.ts pour la même justification).
describe("Reprogrammation d'examen — validation, sécurité tentatives, immutabilité, notification", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, rescheduleAssessment } = await import("../../lib/assessments");
  const { startAttempt, submitAttempt } = await import("../../lib/attempts");
  const { hasAssessmentAccess } = await import("../../lib/tenant-scope");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function nextTag() {
    counter += 1;
    return `resched${counter}`;
  }

  // Fenêtre ACTUELLEMENT ouverte (hier -> dans 30 jours) — nécessaire pour
  // que startAttempt() (test G/H/I/J) accepte de démarrer une tentative ;
  // isAssessmentOpenNow() refuse tout open_at futur. Les nouvelles dates de
  // reprogrammation, elles, sont volontairement dans le futur (peu importe
  // — rescheduleAssessment() ne revalide jamais la fenêtre par rapport à
  // "maintenant", seulement fermeture > ouverture).
  const PAST_OPEN = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const FUTURE_CLOSE = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

  function makeFixture(functionCode: string) {
    const tag = nextTag();
    const adminId = createUser({ username: `admin.${tag}`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const managerId = createUser({ username: `mgr.${tag}`, password: "x".repeat(10), fullName: "Manager", role: "pedagogical_manager" });
    const candidateId = createUser({ username: `cand.${tag}`, password: "x".repeat(10), fullName: "Candidat", role: "candidate", email: `cand.${tag}@example.com` });
    const companyId = createCompany({ name: `Co ${tag}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${tag}`, scope: "test", pedagogicalManagerId: managerId, createdBy: managerId });
    addCandidateToGroup(groupId, candidateId, managerId);
    createQuestion({
      kostQuestionId: `TEST-${tag.toUpperCase()}-1`,
      functionCode,
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q",
      choices: [
        { key: "A", text: "a" },
        { key: "B", text: "b" },
      ],
      correctAnswer: ["A"],
      createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen",
      name: `Examen ${tag}`,
      functionCode,
      groupId,
      questionSource: "random",
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 80,
      scope: "test",
      createdBy: managerId,
      openAt: PAST_OPEN,
      closeAt: FUTURE_CLOSE,
    });
    publishAssessment(assessmentId, managerId);
    return { adminId, managerId, candidateId, companyId, groupId, assessmentId };
  }

  // --- A/B (partie testable ici — la logique métier réussit ; le RBAC
  // admin/responsable lui-même est couvert côté E2E, requireWriteRole
  // porte "server-only") ---
  test("A/B — reprogrammer avec des dates valides sur un examen publié réussit et renvoie old/new", () => {
    const { assessmentId } = makeFixture("7.5");
    const result = rescheduleAssessment(assessmentId, "2026-09-02T08:00", "2026-09-20T18:00", 1);
    assert.equal(result.oldOpenAt, PAST_OPEN);
    assert.equal(result.oldCloseAt, FUTURE_CLOSE);
    assert.equal(result.newOpenAt, "2026-09-02T08:00");
    assert.equal(result.newCloseAt, "2026-09-20T18:00");

    const row = getDb().prepare(`SELECT open_at, close_at FROM assessments WHERE id = ?`).get(assessmentId) as { open_at: string; close_at: string };
    assert.equal(row.open_at, "2026-09-02T08:00");
    assert.equal(row.close_at, "2026-09-20T18:00");
  });

  // --- C — isolation tenant (hasAssessmentAccess, testable directement) ---
  test("C — un responsable pédagogique HORS périmètre n'a pas accès (hasAssessmentAccess), même sur un examen par ailleurs reprogrammable", () => {
    const { assessmentId } = makeFixture("7.6");
    const otherManagerId = createUser({ username: `mgr.other.${nextTag()}`, password: "x".repeat(10), fullName: "Autre Manager", role: "pedagogical_manager" });
    assert.equal(hasAssessmentAccess({ userId: otherManagerId, role: "pedagogical_manager" }, assessmentId), false, "un responsable d'un AUTRE groupe ne doit jamais avoir accès");
  });

  // --- F — dates invalides refusées ---
  test("F — fermeture <= ouverture est refusée avec un message FR explicite", () => {
    const { assessmentId } = makeFixture("7.7");
    assert.throws(() => rescheduleAssessment(assessmentId, "2026-09-10T08:00", "2026-09-10T08:00", 1), /postérieure à la date d'ouverture/);
    assert.throws(() => rescheduleAssessment(assessmentId, "2026-09-10T08:00", "2026-09-05T08:00", 1), /postérieure à la date d'ouverture/);
  });
  test("F — une date invalide (non parseable) est refusée", () => {
    const { assessmentId } = makeFixture("7.8");
    assert.throws(() => rescheduleAssessment(assessmentId, "pas-une-date", null, 1), /Date d'ouverture invalide/);
    assert.throws(() => rescheduleAssessment(assessmentId, null, "pas-une-date-non-plus", 1), /Date de fermeture invalide/);
  });
  test("F — un statut non reprogrammable (draft) est refusé", () => {
    const { managerId, groupId } = makeFixture("7.9");
    const draftId = createAssessmentDraft({
      type: "examen",
      name: "Toujours brouillon",
      functionCode: "7.9",
      groupId,
      questionSource: "random",
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 80,
      scope: "test",
      createdBy: managerId,
    });
    assert.throws(() => rescheduleAssessment(draftId, "2026-09-02T08:00", "2026-09-20T18:00", managerId), /statut « draft »/);
  });

  // --- G/H/I — immutabilité des tentatives terminées, snapshots, résultats ---
  test("G/H/I — une reprogrammation ne modifie JAMAIS une tentative terminée, son snapshot de questions, ni son résultat", () => {
    const { candidateId, assessmentId } = makeFixture("7.1");
    const attempt = startAttempt(assessmentId, candidateId, {});
    submitAttempt(attempt.id, candidateId, {});

    const db = getDb();
    const attemptBefore = db.prepare(`SELECT * FROM attempts WHERE id = ?`).get(attempt.id);
    const resultBefore = db.prepare(`SELECT * FROM results WHERE attempt_id = ?`).get(attempt.id);
    const snapshotsBefore = db.prepare(`SELECT * FROM assessment_question_snapshots WHERE assessment_id = ? ORDER BY position`).all(assessmentId);

    rescheduleAssessment(assessmentId, "2026-10-01T08:00", "2026-10-15T18:00", 1);

    const attemptAfter = db.prepare(`SELECT * FROM attempts WHERE id = ?`).get(attempt.id);
    const resultAfter = db.prepare(`SELECT * FROM results WHERE attempt_id = ?`).get(attempt.id);
    const snapshotsAfter = db.prepare(`SELECT * FROM assessment_question_snapshots WHERE assessment_id = ? ORDER BY position`).all(assessmentId);

    assert.deepEqual(attemptAfter, attemptBefore, "la tentative terminée doit rester strictement identique");
    assert.deepEqual(resultAfter, resultBefore, "le résultat doit rester strictement identique");
    assert.deepEqual(snapshotsAfter, snapshotsBefore, "les snapshots de questions doivent rester strictement identiques");
  });

  // --- J — sécurité tentative en cours ---
  test("J — une tentative EN COURS bloque entièrement la reprogrammation, avec un message explicite", () => {
    const { candidateId, assessmentId } = makeFixture("7.2");
    startAttempt(assessmentId, candidateId, {}); // reste in_progress, jamais soumise

    assert.throws(() => rescheduleAssessment(assessmentId, "2026-10-01T08:00", "2026-10-15T18:00", 1), /tentative est actuellement EN COURS/);

    // Vérifie que rien n'a bougé — le refus est total, pas partiel.
    const row = getDb().prepare(`SELECT open_at, close_at FROM assessments WHERE id = ?`).get(assessmentId) as { open_at: string; close_at: string };
    assert.equal(row.open_at, PAST_OPEN);
    assert.equal(row.close_at, FUTURE_CLOSE);
  });

  // --- K — trace d'audit ---
  test("K — une reprogrammation réussie crée une entrée d'audit complète (acteur, ancien/nouveau, horodatage)", () => {
    const { assessmentId } = makeFixture("7.3");
    const before = (getDb().prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'assessment_reschedule' AND target_id = ?`).get(assessmentId) as { n: number }).n;
    rescheduleAssessment(assessmentId, "2026-10-01T08:00", "2026-10-15T18:00", 1);
    const after = getDb()
      .prepare(`SELECT actor_user_id, metadata_json FROM audit_logs WHERE action = 'assessment_reschedule' AND target_id = ? ORDER BY id DESC LIMIT 1`)
      .get(assessmentId) as { actor_user_id: number; metadata_json: string };
    const afterCount = (getDb().prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'assessment_reschedule' AND target_id = ?`).get(assessmentId) as { n: number }).n;
    assert.equal(afterCount, before + 1);
    assert.equal(after.actor_user_id, 1);
    const meta = JSON.parse(after.metadata_json);
    assert.equal(meta.oldOpenAt, PAST_OPEN);
    assert.equal(meta.newOpenAt, "2026-10-01T08:00");
  });

  // --- L/M — événement EXAM_RESCHEDULED, idempotence par contenu ---
  test("L/M — notifyExamRescheduled crée une ligne par reprogrammation GENUINEMENT différente, jamais de doublon pour la même", async () => {
    process.env.APP_BASE_URL = "https://test.kostacademy.invalid";
    const { notifyExamRescheduled } = await import("../../lib/email/events");
    const { candidateId, assessmentId } = makeFixture("7.4");
    const candidate = getDb().prepare(`SELECT email, full_name FROM users WHERE id = ?`).get(candidateId) as { email: string; full_name: string };

    const params = {
      userId: candidateId,
      email: candidate.email,
      firstName: candidate.full_name,
      assessmentId,
      examName: "Examen Test",
      functionLabel: "Fonction Test",
      companyId: 1,
      companyName: "Co",
      oldOpenAt: "2026-09-01T08:00",
      oldCloseAt: "2026-09-15T18:00",
      newOpenAt: "2026-10-01T08:00",
      newCloseAt: "2026-10-15T18:00",
    };
    await notifyExamRescheduled(params);
    await notifyExamRescheduled(params); // même reprogrammation rejouée — ne doit RIEN ajouter

    const rowsAfterRetry = getDb()
      .prepare(`SELECT id FROM notification_log WHERE event_type = 'EXAM_RESCHEDULED' AND user_id = ?`)
      .all(candidateId);
    assert.equal(rowsAfterRetry.length, 1, "rejouer la MÊME reprogrammation ne doit jamais dupliquer l'email");

    // Une reprogrammation GENUINEMENT différente (nouvelles dates différentes)…
    await notifyExamRescheduled({ ...params, newOpenAt: "2026-11-01T08:00", newCloseAt: "2026-11-15T18:00" });
    const rowsAfterSecondReschedule = getDb()
      .prepare(`SELECT id FROM notification_log WHERE event_type = 'EXAM_RESCHEDULED' AND user_id = ?`)
      .all(candidateId);
    assert.equal(rowsAfterSecondReschedule.length, 2, "une reprogrammation réellement différente doit créer une nouvelle notification");
  });
});
