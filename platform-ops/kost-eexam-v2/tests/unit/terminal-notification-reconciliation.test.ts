import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";

// Synthetic Function 7.2 exam ONLY. These tests never import or approve
// actual DGR questions and always run with EMAIL_MODE=log (no live email).
before(() => {
  process.env.EMAIL_MODE = "log";
  delete process.env.RESEND_API_KEY;
  process.env.APP_BASE_URL = "https://test.kostacademy.invalid";
  process.env.ADMIN_ALERT_RECIPIENT = "exam-alert@kost-test.invalid";
  process.env.EXAM_NOTIFICATION_RECONCILE_SINCE_UTC = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
  setupTestDb();
});

after(() => {
  delete process.env.EXAM_NOTIFICATION_RECONCILE_SINCE_UTC;
  delete process.env.ADMIN_ALERT_RECIPIENT;
  delete process.env.APP_BASE_URL;
});

let seq = 0;

async function submittedFixture(mode: "manual" | "expired_sweep" = "manual") {
  const n = ++seq;
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, submitAttempt, sweepExpiredAttempts } = await import("../../lib/attempts");
  const { getDb } = await import("../../lib/db");

  const admin = createUser({ username: `recon.admin.${n}`, password: "x".repeat(12), fullName: "Recovery Test Admin", role: "administrator" });
  const managerEmail = `manager.recon.${n}@kost-test.invalid`;
  const candidateEmail = `candidate.recon.${n}@kost-test.invalid`;
  const manager = createUser({ username: `recon.manager.${n}`, password: "x".repeat(12), fullName: "Recovery Test Manager", role: "pedagogical_manager", email: managerEmail });
  const candidate = createUser({ username: `recon.candidate.${n}`, password: "x".repeat(12), fullName: "Recovery Test Candidate", role: "candidate", email: candidateEmail });
  const companyId = createCompany({ name: `Recovery Test Co ${n}`, scope: "test", createdBy: admin });
  const groupId = createGroup({ companyId, name: `Recovery Test Group ${n}`, scope: "test", createdBy: admin, pedagogicalManagerId: manager });
  addCandidateToGroup(groupId, candidate, admin);
  const questionId = createQuestion({
    kostQuestionId: `TEST-EMAIL-RECOVERY-${n}`, functionCode: "7.2",
    qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: "Synthetic recovery test; not regulatory guidance.",
    choices: [{ key: "A", text: "Yes" }, { key: "B", text: "No" }],
    correctAnswer: ["A"], createdBy: admin,
  });
  const assessmentId = createAssessmentDraft({
    type: "examen", name: `Recovery Test Exam ${n}`, functionCode: "7.2", groupId,
    questionSource: "manual", manualQuestionIds: [questionId], questionCount: 1,
    durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: admin,
    openAt: new Date(Date.now() - 60_000).toISOString(),
    closeAt: new Date(Date.now() + 3_600_000).toISOString(),
  });
  publishAssessment(assessmentId, admin);
  const attempt = startAttempt(assessmentId, candidate, {});
  if (mode === "expired_sweep") {
    getDb().prepare("UPDATE attempts SET expires_at = ? WHERE id = ?")
      .run(new Date(Date.now() - 30_000).toISOString(), attempt.id);
    assert.ok(sweepExpiredAttempts().some((row) => row.attemptId === attempt.id),
      "expired cron must commit terminal grading before notification is attempted");
  } else {
    const first = submitAttempt(attempt.id, candidate);
    assert.equal(first.transitioned, true, "the exam transition committed without calling email orchestration");
  }
  return { db: getDb(), attemptId: attempt.id, candidateId: candidate, companyId, managerEmail, candidateEmail };
}

function notificationRows(f: Awaited<ReturnType<typeof submittedFixture>>) {
  return f.db.prepare(
    `SELECT event_type, idempotency_key, recipient_email, tenant_company_id, status
     FROM notification_log WHERE idempotency_key = ?
       OR idempotency_key = ?
       OR idempotency_key LIKE ?
     ORDER BY id`
  ).all(
    `result-available/${f.attemptId}`,
    `exam-submitted/${f.candidateId}/${(f.db.prepare("SELECT submitted_at FROM attempts WHERE id = ?").get(f.attemptId) as { submitted_at: string }).submitted_at}`,
    `exam-submitted-admin/${f.attemptId}/%`,
  ) as { event_type: string; idempotency_key: string; recipient_email: string; tenant_company_id: number; status: string }[];
}

async function independentRecovery() {
  const moduleUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/email/reconcile-terminal.ts")).href;
  const script = `
    import { reconcileTerminalNotifications } from ${JSON.stringify(moduleUrl)};
    const report = await reconcileTerminalNotifications(25);
    process.stdout.write(JSON.stringify(report));
  `;
  return new Promise<{ enabled: boolean; candidates: number }>((done, fail) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: { ...process.env, DB_PATH: process.env.DB_PATH },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "", stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (s) => { stdout += s; });
    child.stderr.on("data", (s) => { stderr += s; });
    child.on("error", fail);
    child.on("close", (code) => {
      if (code !== 0) return fail(new Error(`recovery worker exited ${code}: ${stderr}`));
      try { done(JSON.parse(stdout)); } catch { fail(new Error(`invalid recovery report: ${stdout}, ${stderr}`)); }
    });
  });
}

test("#225: disabled by default, no historical or live mail replay without reviewed cutover", async () => {
  const f = await submittedFixture();
  const { reconcileTerminalNotifications } = await import("../../lib/email/reconcile-terminal");
  const since = process.env.EXAM_NOTIFICATION_RECONCILE_SINCE_UTC;
  delete process.env.EXAM_NOTIFICATION_RECONCILE_SINCE_UTC;
  try {
    const report = await reconcileTerminalNotifications();
    assert.equal(report.enabled, false);
    assert.equal(notificationRows(f).length, 0);
  } finally {
    process.env.EXAM_NOTIFICATION_RECONCILE_SINCE_UTC = since;
  }
});

test("#225: committed submission without any initial event is recovered with tenant-safe deduplicated keys", async () => {
  const f = await submittedFixture();
  const { reconcileTerminalNotifications } = await import("../../lib/email/reconcile-terminal");
  assert.equal(notificationRows(f).length, 0);
  const report = await reconcileTerminalNotifications(25);
  assert.equal(report.enabled, true);
  assert.ok(report.submissionDispatches >= 1);
  assert.ok(report.resultDispatches >= 1);
  assert.equal(report.unresolved, 0);
  const rows = notificationRows(f);
  assert.equal(rows.length, 4, JSON.stringify(rows));
  assert.deepEqual(rows.map((r) => r.event_type).sort(), ["EXAM_SUBMITTED", "EXAM_SUBMITTED_ADMIN", "EXAM_SUBMITTED_ADMIN", "RESULT_AVAILABLE"]);
  assert.ok(rows.every((r) => r.tenant_company_id === f.companyId));
  assert.ok(rows.every((r) => r.status === "SUPPRESSED"), "EMAIL_MODE=log must never send a real message");
  assert.ok(rows.some((r) => r.recipient_email === f.candidateEmail));
  assert.ok(rows.some((r) => r.recipient_email === f.managerEmail));
  assert.ok(rows.some((r) => r.recipient_email === "exam-alert@kost-test.invalid"));
  await reconcileTerminalNotifications(25);
  assert.equal(notificationRows(f).length, 4, "later cron and retry must not duplicate any logical event");
});

test("#225: no RESULT_AVAILABLE for AWAITING_MANUAL_REVIEW; later COMPLETE becomes eligible", async () => {
  const f = await submittedFixture();
  const { reconcileTerminalNotifications } = await import("../../lib/email/reconcile-terminal");
  f.db.prepare(`UPDATE results SET grading_state = 'AWAITING_MANUAL_REVIEW', passed = NULL WHERE attempt_id = ?`).run(f.attemptId);
  await reconcileTerminalNotifications(25);
  assert.equal(notificationRows(f).filter((r) => r.event_type === "RESULT_AVAILABLE").length, 0);
  f.db.prepare(`UPDATE results SET grading_state = 'COMPLETE', passed = 0 WHERE attempt_id = ?`).run(f.attemptId);
  await reconcileTerminalNotifications(25);
  assert.equal(notificationRows(f).filter((r) => r.event_type === "RESULT_AVAILABLE").length, 1);
});

test("#225: pre-outbox template/config failure leaves gap discoverable and a new process can recover it", async () => {
  const f = await submittedFixture();
  const { reconcileTerminalNotifications } = await import("../../lib/email/reconcile-terminal");
  delete process.env.APP_BASE_URL;
  try {
    const failed = await reconcileTerminalNotifications(25);
    assert.equal(failed.unresolved >= 1, true, "pre-outbox failure must remain visibly unresolved");
    assert.equal(notificationRows(f).length, 0, "no phantom notification should be recorded before rendering");
  } finally {
    process.env.APP_BASE_URL = "https://test.kostacademy.invalid";
  }
  const resumed = await independentRecovery();
  assert.equal(resumed.enabled, true);
  assert.equal(notificationRows(f).length, 4, "committed state must be recoverable after worker restart");
  await independentRecovery();
  assert.equal(notificationRows(f).length, 4, "second restart remains idempotent");
});

test("#225: expired cron commit without follow-up notification is recovered after restart", async () => {
  const f = await submittedFixture("expired_sweep");
  assert.equal(notificationRows(f).length, 0);
  const recovered = await independentRecovery();
  assert.equal(recovered.enabled, true);
  assert.equal(notificationRows(f).length, 4, "previously auto-submitted attempt must be reconciled");
  assert.equal((f.db.prepare("SELECT status FROM attempts WHERE id = ?").get(f.attemptId) as { status: string }).status, "auto_submitted");
});

test("#225: partially queued notification set is completed, never duplicated", async () => {
  const f = await submittedFixture();
  const { notifyResultAvailableForAttempt } = await import("../../lib/email/notify-result");
  const { reconcileTerminalNotifications } = await import("../../lib/email/reconcile-terminal");
  await notifyResultAvailableForAttempt(f.attemptId);
  assert.deepEqual(notificationRows(f).map((row) => row.event_type), ["RESULT_AVAILABLE"]);
  await reconcileTerminalNotifications(25);
  const rows = notificationRows(f);
  assert.equal(rows.length, 4);
  assert.equal(rows.filter((row) => row.event_type === "RESULT_AVAILABLE").length, 1);
  await reconcileTerminalNotifications(25);
  assert.equal(notificationRows(f).length, 4);
});

test("#225: NO_EMAIL result policy is honored, but submission/staff events still recover", async () => {
  const f = await submittedFixture();
  const { reconcileTerminalNotifications } = await import("../../lib/email/reconcile-terminal");
  f.db.prepare(`INSERT INTO platform_settings (key, value) VALUES ('result_email_policy', 'NO_EMAIL')
    ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run();
  try {
    await reconcileTerminalNotifications(25);
    assert.deepEqual(notificationRows(f).map((r) => r.event_type).sort(), ["EXAM_SUBMITTED", "EXAM_SUBMITTED_ADMIN", "EXAM_SUBMITTED_ADMIN"]);
  } finally {
    f.db.prepare(`UPDATE platform_settings SET value = 'RESULT_AVAILABLE_ONLY' WHERE key = 'result_email_policy'`).run();
  }
});

test("#225: invalid cutover timestamps fail closed without emitting any message", async () => {
  const f = await submittedFixture();
  const { reconcileTerminalNotifications } = await import("../../lib/email/reconcile-terminal");
  const prior = process.env.EXAM_NOTIFICATION_RECONCILE_SINCE_UTC;
  process.env.EXAM_NOTIFICATION_RECONCILE_SINCE_UTC = "2026-10-25 00:00 local";
  try {
    await assert.rejects(reconcileTerminalNotifications(), /valid UTC/);
    assert.equal(notificationRows(f).length, 0);
  } finally {
    process.env.EXAM_NOTIFICATION_RECONCILE_SINCE_UTC = prior;
  }
});

test("#225: a failed old pre-outbox event is revisited despite continuous newer terminal arrivals", async () => {
  const { reconcileTerminalNotifications } = await import("../../lib/email/reconcile-terminal");
  // Clear earlier independent test cases before exercising a one-item scan.
  for (let i = 0; i < 3; i++) await reconcileTerminalNotifications(100);
  const old = await submittedFixture();
  delete process.env.APP_BASE_URL;
  try {
    const failed = await reconcileTerminalNotifications(1);
    assert.equal(failed.unresolved, 1, "the first missing-key dispatch must fail before outbox");
    assert.equal(failed.backlogMissing, true, "an authoritative full-scope backlog flag remains set");
    assert.equal(notificationRows(old).length, 0);
  } finally {
    process.env.APP_BASE_URL = "https://test.kostacademy.invalid";
  }

  // Every invocation is preceded by a NEWER committed terminal attempt.
  // The earlier unbounded forward cursor would always find the new attempt
  // and could skip the old failed notification forever.
  let retriedOld = false;
  let processedNew = false;
  const arrivals: Array<Awaited<ReturnType<typeof submittedFixture>>> = [];
  for (let i = 0; i < 8; i++) {
    arrivals.push(await submittedFixture());
    await reconcileTerminalNotifications(1);
    retriedOld ||= notificationRows(old).length === 4;
    // A frozen pass defers this invocation's newest arrival by design;
    // check progress of any earlier new arrival rather than requiring
    // a just-created attempt to be handled immediately in the same pass.
    processedNew ||= arrivals.some((attempt) => notificationRows(attempt).length === 4);
  }
  assert.equal(retriedOld, true, "fixed high-water pass must revisit the old failed event");
  assert.equal(processedNew, true, "rechecking old gaps must not halt work on newer attempts");
  assert.equal(notificationRows(old).length, 4, "logical event keys are never duplicated");

  // After draining the bounded backlog, the distinct global missing-key flag
  // must be false; per-pass unresolved=0 alone would not prove this.
  for (let i = 0; i < 3; i++) await reconcileTerminalNotifications(100);
  const verified = await reconcileTerminalNotifications(100);
  assert.equal(verified.backlogMissing, false);
});
