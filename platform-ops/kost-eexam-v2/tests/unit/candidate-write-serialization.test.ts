import { before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";

// Synthetic test-only Function 7.2 records. No DGR assertions, bank imports,
// source attestations, regulatory approvals or production records.
before(() => setupTestDb());

let seq = 0;
type Action = "answer" | "subanswer" | "mark" | "submit" | "autosubmit";
type Outcome = { ok: true } | { ok: false; error: string };

async function fixture(kind: "mcq" | "scenario" = "mcq") {
  const n = ++seq;
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt } = await import("../../lib/attempts");
  const { getDb } = await import("../../lib/db");

  const admin = createUser({ username: `writetx.admin.${n}`, password: "x".repeat(12), fullName: "Write Test Admin", role: "administrator" });
  const candidate = createUser({ username: `writetx.candidate.${n}`, password: "x".repeat(12), fullName: "Write Test Candidate", role: "candidate" });
  const company = createCompany({ name: `Write Test Co ${n}`, scope: "test", createdBy: admin });
  const group = createGroup({ companyId: company, name: `Write Test Group ${n}`, scope: "test", createdBy: admin });
  addCandidateToGroup(group, candidate, admin);

  const scenarioSpec = {
    mode: "scenario" as const, context: "Test-only incident; not regulatory guidance.",
    subquestions: [
      { id: "sq1", qtype: "mcq_single" as const, stem: "Synthetic question 1", points: 1, choices: [{ key: "A", text: "Yes" }, { key: "B", text: "No" }], correctAnswer: ["A"] },
      { id: "sq2", qtype: "mcq_single" as const, stem: "Synthetic question 2", points: 1, choices: [{ key: "A", text: "Yes" }, { key: "B", text: "No" }], correctAnswer: ["A"] },
    ],
  };
  const qid = createQuestion({
    kostQuestionId: `TEST-WRITE-TX-${n}`, functionCode: "7.2",
    qtype: kind === "scenario" ? "scenario" : "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: "Synthetic answer transaction fixture",
    choices: kind === "scenario" ? [] : [{ key: "A", text: "Yes" }, { key: "B", text: "No" }],
    correctAnswer: kind === "scenario" ? scenarioSpec : ["A"],
    createdBy: admin,
  });
  const assessment = createAssessmentDraft({
    type: "examen", name: `Write serialization ${n}`, functionCode: "7.2", groupId: group,
    questionSource: "manual", manualQuestionIds: [qid], questionCount: 1,
    durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: admin,
    openAt: new Date(Date.now() - 60_000).toISOString(),
    closeAt: new Date(Date.now() + 3_600_000).toISOString(),
  });
  publishAssessment(assessment, admin);
  const attempt = startAttempt(assessment, candidate, {});
  const db = getDb();
  const aq = db.prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
  return { db, attemptId: attempt.id, candidateId: candidate, questionId: aq.id };
}

function worker(action: Action, attemptId: number, candidateId: number, questionId: number, subquestionId = "sq1"): Promise<Outcome> {
  const moduleUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/attempts.ts")).href;
  const script = `
    import { saveAnswer, saveScenarioSubanswer, toggleMark, submitAttempt } from ${JSON.stringify(moduleUrl)};
    const [action, attemptId, candidateId, questionId, subquestionId] = JSON.parse(process.env.KOST_TEST_WRITE_ARGS);
    try {
      if (action === "answer") saveAnswer(attemptId, candidateId, questionId, ["A"]);
      else if (action === "subanswer") saveScenarioSubanswer(attemptId, candidateId, questionId, subquestionId, ["A"]);
      else if (action === "mark") toggleMark(attemptId, candidateId, questionId, true);
      else if (action === "autosubmit") submitAttempt(attemptId, candidateId, { auto: true });
      else submitAttempt(attemptId, candidateId);
      process.stdout.write(JSON.stringify({ ok: true }));
    } catch (error) {
      process.stdout.write(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    }
  `;
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: { ...process.env, DB_PATH: process.env.DB_PATH,
        KOST_TEST_WRITE_ARGS: JSON.stringify([action, attemptId, candidateId, questionId, subquestionId]) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = ""; let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code !== 0) { rejectPromise(new Error(`write worker failed ${code}: ${stderr}`)); return; }
      try { resolvePromise(JSON.parse(stdout) as Outcome); }
      catch (error) { rejectPromise(new Error(`invalid write worker output ${stdout}: ${String(error)} ${stderr}`)); }
    });
  });
}

function stored(f: Awaited<ReturnType<typeof fixture>>) {
  const attempt = f.db.prepare(`SELECT status FROM attempts WHERE id = ?`).get(f.attemptId) as { status: string };
  const answer = f.db.prepare(`SELECT answer_json, points_awarded FROM attempt_answers WHERE attempt_question_id = ?`).get(f.questionId) as
    | { answer_json: string | null; points_awarded: number | null } | undefined;
  const marked = f.db.prepare(`SELECT marked_for_review FROM attempt_questions WHERE id = ?`).get(f.questionId) as { marked_for_review: number };
  const result = f.db.prepare(`SELECT raw_score FROM results WHERE attempt_id = ?`).get(f.attemptId) as { raw_score: number } | undefined;
  return { attempt, answer, marked, result };
}

test("#38: answer writer wins before independent submit; final grade matches committed answer", async () => {
  const f = await fixture();
  assert.deepEqual(await worker("answer", f.attemptId, f.candidateId, f.questionId), { ok: true });
  assert.deepEqual(await worker("submit", f.attemptId, f.candidateId, f.questionId), { ok: true });
  const rows = stored(f);
  assert.equal(rows.attempt.status, "submitted");
  assert.equal(rows.answer?.answer_json, '["A"]');
  assert.equal(rows.result?.raw_score, 1);
});

test("#38: terminal submit wins; later independent answer/subanswer/mark cannot mutate", async () => {
  const f = await fixture();
  assert.deepEqual(await worker("submit", f.attemptId, f.candidateId, f.questionId), { ok: true });
  const before = stored(f);
  for (const action of ["answer", "subanswer", "mark"] as const) {
    const outcome = await worker(action, f.attemptId, f.candidateId, f.questionId);
    assert.equal(outcome.ok, false, `${action} must fail after terminal commit`);
  }
  assert.deepEqual(stored(f), before, "late candidate writers must not alter frozen answer/mark/result");
});

test("#38: independent concurrent answer and submit workers cannot produce grade/answer divergence", async () => {
  const f = await fixture();
  const outcomes = await Promise.all([
    worker("answer", f.attemptId, f.candidateId, f.questionId),
    worker("submit", f.attemptId, f.candidateId, f.questionId),
  ]);
  assert.equal(outcomes[1]?.ok, true, JSON.stringify(outcomes));
  const rows = stored(f);
  assert.equal(rows.attempt.status, "submitted");
  assert.ok(rows.result, "submitted attempt must contain a result");
  const submittedCorrect = rows.answer?.answer_json === '["A"]';
  assert.equal(rows.result?.raw_score, submittedCorrect ? 1 : 0, "result must grade exactly the final frozen answer");
  assert.equal(outcomes[0]?.ok, submittedCorrect, "candidate write can succeed only when it wins the lock");
});

test("#38: two concurrent independent scenario subquestion writers cannot lose either update", async () => {
  const f = await fixture("scenario");
  const results = await Promise.all([
    worker("subanswer", f.attemptId, f.candidateId, f.questionId, "sq1"),
    worker("subanswer", f.attemptId, f.candidateId, f.questionId, "sq2"),
  ]);
  assert.deepEqual(results, [{ ok: true }, { ok: true }]);
  assert.deepEqual(JSON.parse(stored(f).answer?.answer_json ?? "{}"), { sq1: ["A"], sq2: ["A"] });
});

test("#38: concurrent scenario subanswer and terminal submit preserve historical answer/result alignment", async () => {
  const f = await fixture("scenario");
  const outcomes = await Promise.all([
    worker("subanswer", f.attemptId, f.candidateId, f.questionId, "sq1"),
    worker("submit", f.attemptId, f.candidateId, f.questionId),
  ]);
  assert.equal(outcomes[1]?.ok, true, JSON.stringify(outcomes));
  const rows = stored(f);
  assert.equal(rows.attempt.status, "submitted");
  const hasAnswer = rows.answer?.answer_json !== null && rows.answer?.answer_json !== undefined;
  assert.equal(outcomes[0]?.ok, hasAnswer);
  assert.equal(rows.result?.raw_score, hasAnswer ? 1 : 0);
});

test("#38: concurrent independent mark and submit cannot mark AFTER terminal state", async () => {
  const f = await fixture();
  const outcomes = await Promise.all([
    worker("mark", f.attemptId, f.candidateId, f.questionId),
    worker("submit", f.attemptId, f.candidateId, f.questionId),
  ]);
  assert.equal(outcomes[1]?.ok, true);
  assert.equal(stored(f).marked.marked_for_review, outcomes[0]?.ok ? 1 : 0);
  const after = stored(f);
  assert.equal((await worker("mark", f.attemptId, f.candidateId, f.questionId)).ok, false);
  assert.deepEqual(stored(f), after);
});

test("#38: expired candidate autosave commits automatic submission/grade before reporting expiry", async () => {
  const f = await fixture();
  f.db.prepare(`UPDATE attempts SET expires_at = ? WHERE id = ?`).run(new Date(Date.now() - 30000).toISOString(), f.attemptId);
  const outcome = await worker("answer", f.attemptId, f.candidateId, f.questionId);
  assert.equal(outcome.ok, false);
  if (!outcome.ok) assert.match(outcome.error, /temps imparti/);
  const rows = stored(f);
  assert.equal(rows.attempt.status, "auto_submitted");
  assert.ok(rows.result);
  assert.equal(rows.answer?.answer_json, null);
  const audits = f.db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = 'attempt_auto_submit'`).get(f.attemptId) as { n: number };
  assert.equal(audits.n, 1);
});

 
test("#38: independent answer writer before auto-submit is graded and becomes immutable", async () => {
  const f = await fixture();
  assert.deepEqual(await worker("answer", f.attemptId, f.candidateId, f.questionId), { ok: true });
  // Auto-finalization reason must be justified by the *server* expiry clock.
  f.db.prepare(`UPDATE attempts SET expires_at = ? WHERE id = ?`).run(new Date(Date.now() - 30_000).toISOString(), f.attemptId);
  assert.deepEqual(await worker("autosubmit", f.attemptId, f.candidateId, f.questionId), { ok: true });
  const after = stored(f);
  assert.equal(after.attempt.status, "auto_submitted");
  assert.equal(after.answer?.answer_json, '["A"]');
  assert.equal(after.result?.raw_score, 1);
  assert.equal((await worker("answer", f.attemptId, f.candidateId, f.questionId)).ok, false);
  assert.deepEqual(stored(f), after, "late autosave must not change the auto-submitted result");
});

test("#38: independent expired auto-submit before answer writer leaves no post-submit answer", async () => {
  const f = await fixture();
  f.db.prepare(`UPDATE attempts SET expires_at = ? WHERE id = ?`).run(new Date(Date.now() - 30_000).toISOString(), f.attemptId);
  assert.deepEqual(await worker("autosubmit", f.attemptId, f.candidateId, f.questionId), { ok: true });
  const after = stored(f);
  assert.equal(after.attempt.status, "auto_submitted");
  assert.equal(after.answer?.answer_json, null, "unanswered question must remain unanswered after automatic grading");
  assert.equal(after.result?.raw_score, 0);
  assert.equal((await worker("answer", f.attemptId, f.candidateId, f.questionId)).ok, false);
  assert.deepEqual(stored(f), after);
});

test("#38/#40: concurrently expired autosave and auto-submit never accept a late candidate answer", async () => {
  const f = await fixture();
  f.db.prepare(`UPDATE attempts SET expires_at = ? WHERE id = ?`).run(new Date(Date.now() - 30_000).toISOString(), f.attemptId);
  const outcomes = await Promise.all([
    worker("answer", f.attemptId, f.candidateId, f.questionId),
    worker("autosubmit", f.attemptId, f.candidateId, f.questionId),
  ]);
  assert.equal(outcomes[0]?.ok, false, "expired candidate write must be rejected even if it triggers finalization");
  assert.equal(outcomes[1]?.ok, true);
  const rows = stored(f);
  assert.equal(rows.attempt.status, "auto_submitted");
  assert.equal(rows.answer?.answer_json, null);
  assert.equal(rows.result?.raw_score, 0);
  const audits = f.db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = 'attempt_auto_submit'`).get(f.attemptId) as { n: number };
  assert.equal(audits.n, 1, "only one authoritative auto-submit event");
});

test("#40: forged candidate auto=true before server expiry is a voluntary submit, with a single winner", async () => {
  const f = await fixture();
  const { submitAttempt } = await import("../../lib/attempts");
  const first = submitAttempt(f.attemptId, f.candidateId, { auto: true });
  assert.deepEqual(first, { attemptId: f.attemptId, status: "submitted", transitioned: true });
  const retry = submitAttempt(f.attemptId, f.candidateId, { auto: true });
  assert.deepEqual(retry, { attemptId: f.attemptId, status: "submitted", transitioned: false });
  assert.equal(stored(f).attempt.status, "submitted");
  const manual = f.db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = 'attempt_submit'`).get(f.attemptId) as { n: number };
  const auto = f.db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = 'attempt_auto_submit'`).get(f.attemptId) as { n: number };
  assert.equal(manual.n, 1);
  assert.equal(auto.n, 0);
});

test("#40: manual auto=false submitted after server expiry is authoritatively auto-submitted", async () => {
  const f = await fixture();
  const { submitAttempt } = await import("../../lib/attempts");
  f.db.prepare(`UPDATE attempts SET expires_at = ? WHERE id = ?`).run(new Date(Date.now() - 30_000).toISOString(), f.attemptId);
  const first = submitAttempt(f.attemptId, f.candidateId, { auto: false });
  assert.deepEqual(first, { attemptId: f.attemptId, status: "auto_submitted", transitioned: true });
  assert.equal(stored(f).attempt.status, "auto_submitted");
  const audit = f.db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = 'attempt_auto_submit'`).get(f.attemptId) as { n: number };
  assert.equal(audit.n, 1);
});

test("#40: expiry sweep returns only first-time transitions, never already-finalized rows", async () => {
  const f = await fixture();
  const { sweepExpiredAttempts } = await import("../../lib/attempts");
  f.db.prepare(`UPDATE attempts SET expires_at = ? WHERE id = ?`).run(new Date(Date.now() - 30_000).toISOString(), f.attemptId);
  const first = sweepExpiredAttempts();
  assert.ok(first.some((x) => x.attemptId === f.attemptId && x.candidateUserId === f.candidateId));
  const second = sweepExpiredAttempts();
  assert.equal(second.some((x) => x.attemptId === f.attemptId), false);
  assert.equal(stored(f).attempt.status, "auto_submitted");
});


type SubmissionReport =
  | { ok: true; transitioned?: boolean; status?: string; sweptIds?: number[] }
  | { ok: false; error: string };

function submissionWorker(mode: "manual" | "sweep", attemptId: number, candidateId: number): Promise<SubmissionReport> {
  const moduleUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/attempts.ts")).href;
  const script = `
    import { submitAttempt, sweepExpiredAttempts } from ${JSON.stringify(moduleUrl)};
    const [mode, attemptId, candidateId] = JSON.parse(process.env.KOST_TEST_SUBMISSION_ARGS);
    try {
      const outcome = mode === "sweep"
        ? { sweptIds: sweepExpiredAttempts().map((r) => r.attemptId) }
        : submitAttempt(attemptId, candidateId, { auto: false });
      process.stdout.write(JSON.stringify({ ok: true, ...outcome }));
    } catch (error) {
      process.stdout.write(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    }
  `;
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: { ...process.env, DB_PATH: process.env.DB_PATH,
        KOST_TEST_SUBMISSION_ARGS: JSON.stringify([mode, attemptId, candidateId]) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = ""; let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code !== 0) { rejectPromise(new Error(`submission worker failed ${code}: ${stderr}`)); return; }
      try { resolvePromise(JSON.parse(stdout) as SubmissionReport); }
      catch (error) { rejectPromise(new Error(`invalid submission worker output ${stdout}: ${String(error)} ${stderr}`)); }
    });
  });
}

test("#40: two independent manual submit processes report exactly one transition winner", async () => {
  const f = await fixture();
  const [a, b] = await Promise.all([
    submissionWorker("manual", f.attemptId, f.candidateId),
    submissionWorker("manual", f.attemptId, f.candidateId),
  ]);
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(b.ok, true, JSON.stringify(b));
  if (!a.ok || !b.ok) return;
  assert.equal(Number(a.transitioned) + Number(b.transitioned), 1);
  assert.equal(a.status, "submitted");
  assert.equal(b.status, "submitted");
  const audit = f.db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = 'attempt_submit'`).get(f.attemptId) as { n: number };
  assert.equal(audit.n, 1);
  assert.equal(stored(f).attempt.status, "submitted");
});

test("#40: expired candidate submit racing cron counts only the actual transition winner", async () => {
  const f = await fixture();
  f.db.prepare(`UPDATE attempts SET expires_at = ? WHERE id = ?`).run(new Date(Date.now() - 30_000).toISOString(), f.attemptId);
  const [manual, sweep] = await Promise.all([
    submissionWorker("manual", f.attemptId, f.candidateId),
    submissionWorker("sweep", f.attemptId, f.candidateId),
  ]);
  assert.equal(manual.ok, true, JSON.stringify(manual));
  assert.equal(sweep.ok, true, JSON.stringify(sweep));
  if (!manual.ok || !sweep.ok) return;
  const cronWon = sweep.sweptIds?.includes(f.attemptId) ?? false;
  assert.equal(Number(manual.transitioned) + Number(cronWon), 1,
    "a stale sweep SELECT must never claim another caller's transition");
  assert.equal(stored(f).attempt.status, "auto_submitted");
  const audit = f.db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = 'attempt_auto_submit'`).get(f.attemptId) as { n: number };
  assert.equal(audit.n, 1);
});
