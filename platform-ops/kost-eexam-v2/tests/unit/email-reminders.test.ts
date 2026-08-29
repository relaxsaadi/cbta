import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission email §22-23 — rappels optionnels d'examen. Vérifie l'anti-
// doublon structurel (reminder_dispatch_log) et le filtrage "déjà
// composé" du rappel d'échéance, les deux garanties qui comptent le plus
// pour ce sous-système (jamais spammer un candidat, jamais relancer
// quelqu'un qui a déjà composé).
//
// before() une seule fois pour tout le fichier — même piège documenté
// dans tests/unit/email-outbox.test.ts (getDb() singleton par process).
describe("Rappels d'examen — anti-doublon et filtrage (mission email §22-23)", async () => {
  let companyId: number;
  let groupId: number;

  before(async () => {
    delete process.env.EMAIL_MODE;
    // notify*() (lib/email/events.ts) construit toujours un lien via
    // getAppBaseUrl() — jamais optionnel en dehors des tests, voir
    // lib/email/config.ts. Valeur de test, jamais une vraie URL de prod.
    process.env.APP_BASE_URL = "https://test.kostacademy.invalid";
    setupTestDb();
    const { getDb } = await import("../../lib/db");
    const db = getDb();
    companyId = Number(db.prepare(`INSERT INTO companies (name) VALUES ('Client Test Rappels')`).run().lastInsertRowid);
    groupId = Number(db.prepare(`INSERT INTO groups (company_id, name) VALUES (?, 'Groupe Test Rappels')`).run(companyId).lastInsertRowid);
  });

  function makeAssessment(db: ReturnType<typeof import("../../lib/db").getDb>, opts: { openAt: string | null; closeAt: string | null; status?: string }): number {
    const id = db
      .prepare(
        `INSERT INTO assessments (type, name, function_code, group_id, question_count, duration_minutes, open_at, close_at, status)
         VALUES ('examen', 'Examen Test', '7.1', ?, 10, 60, ?, ?, ?)`
      )
      .run(groupId, opts.openAt, opts.closeAt, opts.status ?? "published").lastInsertRowid;
    return Number(id);
  }

  function makeCandidate(db: ReturnType<typeof import("../../lib/db").getDb>, username: string, email: string | null): number {
    const id = db
      .prepare(`INSERT INTO users (username, password_hash, full_name, email, status) VALUES (?, 'h', 'Candidat Test', ?, 'active')`)
      .run(username, email).lastInsertRowid;
    return Number(id);
  }

  test("EXAM_OPENS_SOON — un examen ouvrant dans 12h déclenche le rappel une seule fois, même appelé deux fois", async () => {
    const { getDb, nowIso } = await import("../../lib/db");
    const { dispatchExamOpensSoonReminders } = await import("../../lib/email/reminders");
    const db = getDb();
    const openAt = new Date(Date.parse(nowIso()) + 12 * 3600 * 1000).toISOString();
    const assessmentId = makeAssessment(db, { openAt, closeAt: null });
    const candidateId = makeCandidate(db, "cand-opens-soon", "cand-opens-soon@example.com");
    db.prepare(`INSERT INTO assessment_assignments (assessment_id, candidate_user_id) VALUES (?, ?)`).run(assessmentId, candidateId);

    const first = await dispatchExamOpensSoonReminders();
    const second = await dispatchExamOpensSoonReminders();

    assert.equal(first.sent, 1, "premier passage — un envoi");
    assert.equal(second.sent, 0, "deuxième passage — déjà réclamé, aucun nouvel envoi");
    assert.equal(second.skippedAlreadyDispatched, 1);

    const dispatchRows = db
      .prepare(`SELECT COUNT(*) AS n FROM reminder_dispatch_log WHERE assessment_id = ? AND candidate_user_id = ? AND reminder_type = 'EXAM_OPENS_SOON'`)
      .get(assessmentId, candidateId) as { n: number };
    assert.equal(dispatchRows.n, 1, "une seule ligne d'anti-doublon, jamais deux");

    const notifRows = db
      .prepare(`SELECT COUNT(*) AS n FROM notification_log WHERE event_type = 'EXAM_OPENS_SOON' AND user_id = ?`)
      .get(candidateId) as { n: number };
    assert.equal(notifRows.n, 1, "une seule notification en historique, jamais un doublon réseau");
  });

  test("EXAM_OPENS_SOON — un examen ouvrant dans 48h (hors fenêtre 24h) n'est jamais rappelé", async () => {
    const { getDb, nowIso } = await import("../../lib/db");
    const { dispatchExamOpensSoonReminders } = await import("../../lib/email/reminders");
    const db = getDb();
    const openAt = new Date(Date.parse(nowIso()) + 48 * 3600 * 1000).toISOString();
    const assessmentId = makeAssessment(db, { openAt, closeAt: null });
    const candidateId = makeCandidate(db, "cand-too-early", "cand-too-early@example.com");
    db.prepare(`INSERT INTO assessment_assignments (assessment_id, candidate_user_id) VALUES (?, ?)`).run(assessmentId, candidateId);

    const result = await dispatchExamOpensSoonReminders();
    const consideredThisAssessment = db
      .prepare(`SELECT COUNT(*) AS n FROM reminder_dispatch_log WHERE assessment_id = ?`)
      .get(assessmentId) as { n: number };
    assert.equal(consideredThisAssessment.n, 0, "hors fenêtre — jamais réclamé");
    assert.ok(result.assessmentsConsidered >= 0);
  });

  test("EXAM_DEADLINE_REMINDER — un candidat ayant déjà une tentative n'est jamais relancé", async () => {
    const { getDb, nowIso } = await import("../../lib/db");
    const { dispatchExamDeadlineReminders } = await import("../../lib/email/reminders");
    const db = getDb();
    const closeAt = new Date(Date.parse(nowIso()) + 6 * 3600 * 1000).toISOString();
    const assessmentId = makeAssessment(db, { openAt: null, closeAt, status: "open" });
    const alreadyAttempted = makeCandidate(db, "cand-already-attempted", "already@example.com");
    const neverAttempted = makeCandidate(db, "cand-never-attempted", "never@example.com");
    db.prepare(`INSERT INTO assessment_assignments (assessment_id, candidate_user_id) VALUES (?, ?), (?, ?)`).run(
      assessmentId,
      alreadyAttempted,
      assessmentId,
      neverAttempted
    );
    db.prepare(
      `INSERT INTO attempts (assessment_id, candidate_user_id, attempt_number, status, expires_at, submitted_at)
       VALUES (?, ?, 1, 'submitted', ?, ?)`
    ).run(assessmentId, alreadyAttempted, nowIso(), nowIso());

    const result = await dispatchExamDeadlineReminders();
    assert.equal(result.sent, 1, "un seul candidat éligible (celui sans tentative)");

    const notifiedAlready = db
      .prepare(`SELECT COUNT(*) AS n FROM notification_log WHERE event_type = 'EXAM_DEADLINE_REMINDER' AND user_id = ?`)
      .get(alreadyAttempted) as { n: number };
    assert.equal(notifiedAlready.n, 0, "jamais de rappel d'échéance pour un candidat qui a déjà composé");

    const notifiedNever = db
      .prepare(`SELECT COUNT(*) AS n FROM notification_log WHERE event_type = 'EXAM_DEADLINE_REMINDER' AND user_id = ?`)
      .get(neverAttempted) as { n: number };
    assert.equal(notifiedNever.n, 1, "le candidat sans tentative reçoit bien le rappel");
  });

  test("un candidat affecté sans email n'interrompt jamais le lot — comptabilisé, jamais une exception", async () => {
    const { getDb, nowIso } = await import("../../lib/db");
    const { dispatchExamNowAvailableReminders } = await import("../../lib/email/reminders");
    const db = getDb();
    const openAt = new Date(Date.parse(nowIso()) - 10 * 60 * 1000).toISOString();
    const assessmentId = makeAssessment(db, { openAt, closeAt: null, status: "open" });
    const candidateId = makeCandidate(db, "cand-no-email", null);
    db.prepare(`INSERT INTO assessment_assignments (assessment_id, candidate_user_id) VALUES (?, ?)`).run(assessmentId, candidateId);

    const result = await dispatchExamNowAvailableReminders();
    assert.equal(result.skippedNoEmail, 1);
    assert.equal(result.sent, 0);
  });
});
