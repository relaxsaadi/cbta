import { before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

let serial = 0;
async function fixture(scenario = false) {
  const suffix = `autosave-submit-${++serial}`;
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt } = await import("../../lib/attempts");
  const { getDb } = await import("../../lib/db");

  const adminId = createUser({ username: `${suffix}.admin`, password: "Strong-Test-Password-2026!", fullName: "Admin", role: "administrator" });
  const candidateId = createUser({ username: `${suffix}.cand`, password: "Strong-Test-Password-2026!", fullName: "Candidate", role: "candidate" });
  const companyId = createCompany({ name: suffix, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name: suffix, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);

  const choices = [{ key: "A", text: "Option A" }, { key: "B", text: "Option B" }];
  const authoredQuestionId = createQuestion({
    kostQuestionId: `TEST-${suffix}`,
    functionCode: "7.8",
    qtype: scenario ? "scenario" : "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: "Synthetic exam item",
    choices: scenario ? [] : choices,
    correctAnswer: scenario
      ? { mode: "scenario", context: "Synthetic scenario context", subquestions: [
          { id: "sq1", qtype: "mcq_single", stem: "S1", points: 1, choices, correctAnswer: ["A"] },
          { id: "sq2", qtype: "mcq_single", stem: "S2", points: 1, choices, correctAnswer: ["B"] },
        ] }
      : ["A"],
    createdBy: adminId,
  });
  const assessmentId = createAssessmentDraft({
    type: "examen", name: suffix, functionCode: "7.8", groupId,
    // Select this fixture's authored question deterministically; a random
    // pool can pull another synthetic question from earlier tests.
    questionSource: "manual", manualQuestionIds: [authoredQuestionId], questionCount: 1, durationMinutes: 30,
    passThresholdPct: 80, scope: "test", createdBy: adminId,
  });
  publishAssessment(assessmentId, adminId);
  const attemptId = startAttempt(assessmentId, candidateId, {}).id;
  const question = getDb().prepare("SELECT id FROM attempt_questions WHERE attempt_id = ?").get(attemptId) as { id: number };
  return { candidateId, attemptId, questionId: question.id, db: getDb() };
}

function startIndependentSubmittingWriter(attemptId: number): { ready: Promise<void>; done: Promise<void> } {
  const script = `
    import { DatabaseSync } from "node:sqlite";
    const db = new DatabaseSync(process.env.DB_PATH);
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec("BEGIN IMMEDIATE");
    db.prepare("UPDATE attempts SET status = 'submitted', submitted_at = datetime('now') WHERE id = ?").run(Number(process.env.KOST_TEST_ATTEMPT_ID));
    process.stdout.write("LOCKED\\n");
    await new Promise(resolve => setTimeout(resolve, 350));
    db.exec("COMMIT");
    db.close();
    process.stdout.write("COMMITTED\\n");
  `;
  let readyResolve!: () => void;
  let readyReject!: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });
  const done = new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, ["--input-type=module", "--eval", script], {
      env: { ...process.env, KOST_TEST_ATTEMPT_ID: String(attemptId) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let acknowledged = false;
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (data: string) => {
      stdout += data;
      if (!acknowledged && stdout.includes("LOCKED\n")) {
        acknowledged = true;
        readyResolve();
      }
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (data: string) => { stderr += data; });
    child.on("error", (error) => {
      if (!acknowledged) readyReject(error);
      reject(error);
    });
    child.on("close", (code) => {
      if (code !== 0 || !acknowledged) {
        const error = new Error(`Submitting writer failed ${code}: ${stdout} ${stderr}`);
        if (!acknowledged) readyReject(error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
  return { ready, done };
}

test("a submitted MCQ cannot receive late answer or review-flag updates", async () => {
  const f = await fixture();
  const { saveAnswer, toggleMark, submitAttempt } = await import("../../lib/attempts");
  saveAnswer(f.attemptId, f.candidateId, f.questionId, ["A"]);
  toggleMark(f.attemptId, f.candidateId, f.questionId, true);
  submitAttempt(f.attemptId, f.candidateId);
  const before = f.db.prepare("SELECT answer_json FROM attempt_answers WHERE attempt_question_id = ?").get(f.questionId) as { answer_json: string };
  assert.throws(() => saveAnswer(f.attemptId, f.candidateId, f.questionId, ["B"]), /plus en cours/);
  assert.throws(() => toggleMark(f.attemptId, f.candidateId, f.questionId, false), /plus en cours/);
  const after = f.db.prepare("SELECT answer_json FROM attempt_answers WHERE attempt_question_id = ?").get(f.questionId) as { answer_json: string };
  assert.equal(after.answer_json, before.answer_json);
  assert.equal((f.db.prepare("SELECT marked_for_review AS flag FROM attempt_questions WHERE id = ?").get(f.questionId) as { flag: number }).flag, 1);
});

test("scenario subanswer merging remains intact and closes at submission", async () => {
  const f = await fixture(true);
  const { saveScenarioSubanswer, submitAttempt } = await import("../../lib/attempts");
  saveScenarioSubanswer(f.attemptId, f.candidateId, f.questionId, "sq1", ["A"]);
  saveScenarioSubanswer(f.attemptId, f.candidateId, f.questionId, "sq2", ["B"]);
  const read = () => JSON.parse((f.db.prepare("SELECT answer_json FROM attempt_answers WHERE attempt_question_id = ?").get(f.questionId) as { answer_json: string }).answer_json) as Record<string, string[]>;
  assert.deepEqual(read(), { sq1: ["A"], sq2: ["B"] });
  submitAttempt(f.attemptId, f.candidateId);
  assert.throws(() => saveScenarioSubanswer(f.attemptId, f.candidateId, f.questionId, "sq1", ["B"]), /plus en cours/);
  assert.deepEqual(read(), { sq1: ["A"], sq2: ["B"] });
});

test("expired candidate autosave auto-submits without persisting the answer", async () => {
  const f = await fixture();
  const { saveAnswer } = await import("../../lib/attempts");
  f.db.prepare("UPDATE attempts SET expires_at = ? WHERE id = ?").run("2000-01-01T00:00:00.000Z", f.attemptId);
  assert.throws(() => saveAnswer(f.attemptId, f.candidateId, f.questionId, ["A"]), /soumise automatiquement/);
  assert.equal((f.db.prepare("SELECT status FROM attempts WHERE id = ?").get(f.attemptId) as { status: string }).status, "auto_submitted");
  // The grader may insert an unanswered placeholder row on auto-submission.
  // The invariant is that no candidate answer was persisted, not zero rows.
  const saved = f.db.prepare("SELECT answer_json FROM attempt_answers WHERE attempt_question_id = ?").get(f.questionId) as { answer_json: string | null } | undefined;
  assert.equal(saved?.answer_json ?? null, null);
});

test("a submit transaction winning the SQLite write lock denies the waiting stale autosave", async () => {
  const f = await fixture();
  const { saveAnswer } = await import("../../lib/attempts");
  const writer = startIndependentSubmittingWriter(f.attemptId);
  await writer.ready;
  assert.throws(() => saveAnswer(f.attemptId, f.candidateId, f.questionId, ["A"]), /plus en cours/);
  await writer.done;
  assert.equal((f.db.prepare("SELECT COUNT(*) AS n FROM attempt_answers WHERE attempt_question_id = ?").get(f.questionId) as { n: number }).n, 0);
});


test("legacy prototype-name scenario IDs retain candidate answers through autosave, resume and grading", async () => {
  const f = await fixture(true);
  const { saveScenarioSubanswer, getAttemptQuestions, submitAttempt } = await import("../../lib/attempts");
  const snap = f.db.prepare(
    `SELECT s.id, s.correct_answer_snapshot FROM assessment_question_snapshots s
     JOIN attempt_questions aq ON aq.snapshot_id = s.id WHERE aq.id = ?`
  ).get(f.questionId) as { id: number; correct_answer_snapshot: string };
  const spec = JSON.parse(snap.correct_answer_snapshot);
  // Mutate only a synthetic snapshot to simulate valid old IDs which overlap
  // Object.prototype. No production questions or candidate attempts touched.
  spec.subquestions[0].id = "__proto__";
  spec.subquestions[1].id = "constructor";
  f.db.prepare("UPDATE assessment_question_snapshots SET correct_answer_snapshot = ? WHERE id = ?")
    .run(JSON.stringify(spec), snap.id);

  const initial = getAttemptQuestions(f.attemptId)[0]?.scenario?.subquestions;
  assert.deepEqual(initial?.map((item) => item.answer), [null, null],
    "unanswered prototype-name fields must never inherit Object.prototype values");

  saveScenarioSubanswer(f.attemptId, f.candidateId, f.questionId, "__proto__", ["A"]);
  saveScenarioSubanswer(f.attemptId, f.candidateId, f.questionId, "constructor", ["B"]);
  const saved = f.db.prepare("SELECT answer_json FROM attempt_answers WHERE attempt_question_id = ?")
    .get(f.questionId) as { answer_json: string };
  const actual = JSON.parse(saved.answer_json) as Record<string, string[]>;
  assert.equal(Object.prototype.hasOwnProperty.call(actual, "__proto__"), true);
  assert.equal(Object.prototype.hasOwnProperty.call(actual, "constructor"), true);
  assert.deepEqual(actual["__proto__"], ["A"]);
  assert.deepEqual(actual["constructor"], ["B"]);

  const resumed = getAttemptQuestions(f.attemptId)[0]?.scenario?.subquestions;
  assert.deepEqual(resumed?.map((item) => item.answer), [["A"], ["B"]]);
  submitAttempt(f.attemptId, f.candidateId);
  const result = f.db.prepare("SELECT raw_score, max_raw_score, grading_state FROM results WHERE attempt_id = ?")
    .get(f.attemptId) as { raw_score: number; max_raw_score: number; grading_state: string };
  assert.deepEqual(result, { raw_score: 2, max_raw_score: 2, grading_state: "COMPLETE" });
});

test("corrupt legacy scenario answer map cannot be silently merged into candidate autosave", async () => {
  const f = await fixture(true);
  const { saveScenarioSubanswer } = await import("../../lib/attempts");
  f.db.prepare(
    "INSERT INTO attempt_answers (attempt_id, attempt_question_id, answer_json, answered_at) VALUES (?, ?, ?, ?)"
  ).run(f.attemptId, f.questionId, "[]", "2026-11-06T00:00:00.000Z");
  assert.throws(
    () => saveScenarioSubanswer(f.attemptId, f.candidateId, f.questionId, "sq1", ["A"]),
    /Réponses précédentes du scénario invalides/
  );
  const stored = f.db.prepare("SELECT answer_json FROM attempt_answers WHERE attempt_question_id = ?")
    .get(f.questionId) as { answer_json: string };
  assert.equal(stored.answer_json, "[]", "reject without overwriting historical evidence");
});


test("corrupt persisted scenario answer entries block resume and autosave without changing evidence", async () => {
  const { getAttemptQuestions, saveScenarioSubanswer } = await import("../../lib/attempts");
  const corruptCases = [
    "null", "[]", "42", '"not a map"',
    '{"sq1":42}', '{"sq1":[null]}', '{"sq1":["A",false]}',
    '{"__proto__":{"polluted":true}}', "{broken",
  ];
  for (const corrupt of corruptCases) {
    const f = await fixture(true);
    f.db.prepare(
      "INSERT INTO attempt_answers (attempt_id, attempt_question_id, answer_json, answered_at) VALUES (?, ?, ?, ?)"
    ).run(f.attemptId, f.questionId, corrupt, "2026-11-06T00:00:00.000Z");
    assert.throws(() => getAttemptQuestions(f.attemptId), /Réponses précédentes du scénario invalides/);
    assert.throws(
      () => saveScenarioSubanswer(f.attemptId, f.candidateId, f.questionId, "sq2", ["B"]),
      /Réponses précédentes du scénario invalides/
    );
    const stored = f.db.prepare("SELECT answer_json FROM attempt_answers WHERE attempt_question_id = ?")
      .get(f.questionId) as { answer_json: string };
    assert.equal(stored.answer_json, corrupt, "reject malformed legacy evidence without overwriting it");
  }
});


test("candidate answer actions reject cross-type writes without overwriting saved evidence", async () => {
  const { saveAnswer, saveScenarioSubanswer } = await import("../../lib/attempts");
  const scenario = await fixture(true);
  saveScenarioSubanswer(scenario.attemptId, scenario.candidateId, scenario.questionId, "sq1", ["A"]);
  const readScenario = () => (scenario.db.prepare(
    "SELECT answer_json FROM attempt_answers WHERE attempt_question_id = ?"
  ).get(scenario.questionId) as { answer_json: string }).answer_json;
  const before = readScenario();
  assert.throws(() => saveAnswer(scenario.attemptId, scenario.candidateId, scenario.questionId, ["B"]),
    /scénario exige une réponse par sous-question/);
  assert.equal(readScenario(), before, "regular autosave cannot destroy a submitted scenario map");

  const mcq = await fixture(false);
  assert.throws(() => saveScenarioSubanswer(mcq.attemptId, mcq.candidateId, mcq.questionId, "sq1", ["A"]),
    /n'est pas un scénario/);
  assert.equal((mcq.db.prepare("SELECT COUNT(*) AS n FROM attempt_answers WHERE attempt_question_id = ?")
    .get(mcq.questionId) as { n: number }).n, 0);
  saveAnswer(mcq.attemptId, mcq.candidateId, mcq.questionId, ["A"]);
  assert.equal((mcq.db.prepare("SELECT answer_json FROM attempt_answers WHERE attempt_question_id = ?")
    .get(mcq.questionId) as { answer_json: string }).answer_json, '["A"]');
});

test("scenario subanswer writes reject forged IDs, malformed payloads and duplicate frozen IDs", async () => {
  const { saveScenarioSubanswer } = await import("../../lib/attempts");
  const f = await fixture(true);
  saveScenarioSubanswer(f.attemptId, f.candidateId, f.questionId, "sq1", ["A"]);
  const read = () => (f.db.prepare("SELECT answer_json FROM attempt_answers WHERE attempt_question_id = ?")
    .get(f.questionId) as { answer_json: string }).answer_json;
  const before = read();
  assert.throws(() => saveScenarioSubanswer(f.attemptId, f.candidateId, f.questionId, "forged-id", ["B"]),
    /Sous-question hors de ce scénario/);
  assert.throws(() => saveScenarioSubanswer(f.attemptId, f.candidateId, f.questionId, "sq2",
    ["B", null] as unknown as string[]), /Format de réponse invalide/);
  assert.equal(read(), before, "invalid client arguments must not persist");

  const frozen = f.db.prepare(
    `SELECT s.id, s.correct_answer_snapshot FROM assessment_question_snapshots s
     JOIN attempt_questions aq ON aq.snapshot_id = s.id WHERE aq.id = ?`
  ).get(f.questionId) as { id: number; correct_answer_snapshot: string };
  const corrupted = JSON.parse(frozen.correct_answer_snapshot);
  corrupted.subquestions[1].id = corrupted.subquestions[0].id;
  f.db.prepare("UPDATE assessment_question_snapshots SET correct_answer_snapshot = ? WHERE id = ?")
    .run(JSON.stringify(corrupted), frozen.id);
  assert.throws(() => saveScenarioSubanswer(f.attemptId, f.candidateId, f.questionId, "sq1", ["B"]),
    /Configuration du scénario publiée invalide/);
  assert.equal(read(), before, "ambiguous frozen IDs must not alter existing candidate evidence");
});

test("#40: forged early auto=true is voluntary and idempotent with truthful audit", async () => {
  const f = await fixture();
  const { submitAttempt } = await import("../../lib/attempts");
  const first = submitAttempt(f.attemptId, f.candidateId, { auto: true });
  assert.deepEqual(first, { attemptId: f.attemptId, status: "submitted", transitioned: true });
  const second = submitAttempt(f.attemptId, f.candidateId, { auto: true });
  assert.deepEqual(second, { attemptId: f.attemptId, status: "submitted", transitioned: false });
  const events = f.db.prepare("SELECT action FROM audit_logs WHERE target_id = ? AND action IN ('attempt_submit','attempt_auto_submit')")
    .all(f.attemptId) as { action: string }[];
  assert.deepEqual(events.map((r) => r.action), ["attempt_submit"]);
});

test("#40: a late candidate submit is automatically classified by server expiry", async () => {
  const f = await fixture();
  const { submitAttempt } = await import("../../lib/attempts");
  f.db.prepare("UPDATE attempts SET expires_at = ? WHERE id = ?")
    .run(new Date(Date.now() - 30_000).toISOString(), f.attemptId);
  assert.deepEqual(submitAttempt(f.attemptId, f.candidateId, { auto: false }), {
    attemptId: f.attemptId, status: "auto_submitted", transitioned: true,
  });
  const event = f.db.prepare("SELECT actor_user_id, actor_role, metadata_json FROM audit_logs WHERE target_id = ? AND action = 'attempt_auto_submit'")
    .get(f.attemptId) as { actor_user_id: number | null; actor_role: string | null; metadata_json: string };
  assert.equal(event.actor_user_id, f.candidateId);
  assert.equal(event.actor_role, "candidate");
  assert.equal(JSON.parse(event.metadata_json).trigger, "candidate");
});

test("#40: expiry sweep reports only its own winning transitions", async () => {
  const f = await fixture();
  const { sweepExpiredAttempts } = await import("../../lib/attempts");
  f.db.prepare("UPDATE attempts SET expires_at = ? WHERE id = ?")
    .run(new Date(Date.now() - 30_000).toISOString(), f.attemptId);
  assert.equal(sweepExpiredAttempts().filter((r) => r.attemptId === f.attemptId).length, 1);
  assert.equal(sweepExpiredAttempts().filter((r) => r.attemptId === f.attemptId).length, 0);
  const event = f.db.prepare("SELECT actor_user_id, actor_role, metadata_json FROM audit_logs WHERE target_id = ? AND action = 'attempt_auto_submit'")
    .get(f.attemptId) as { actor_user_id: number | null; actor_role: string | null; metadata_json: string };
  assert.equal(event.actor_user_id, null);
  assert.equal(event.actor_role, null);
  assert.equal(JSON.parse(event.metadata_json).trigger, "expiry_sweep");
});

type TransitionWorkerReport =
  | { ok: true; transitioned?: boolean; status?: string; sweptIds?: number[] }
  | { ok: false; error: string };

function transitionWorker(mode: "manual" | "sweep", attemptId: number, candidateId: number): Promise<TransitionWorkerReport> {
  const moduleUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/attempts.ts")).href;
  const script = [
    "import { submitAttempt, sweepExpiredAttempts } from " + JSON.stringify(moduleUrl) + ";",
    "const [mode, attemptId, candidateId] = JSON.parse(process.env.KOST_TEST_TRANSITION_ARGS);",
    "try {",
    "  const outcome = mode === 'sweep' ? { sweptIds: sweepExpiredAttempts().map(r => r.attemptId) }",
    "    : submitAttempt(attemptId, candidateId, { auto: false });",
    "  process.stdout.write(JSON.stringify({ ok: true, ...outcome }));",
    "} catch (error) {",
    "  process.stdout.write(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));",
    "}",
  ].join("\n");
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: { ...process.env, DB_PATH: process.env.DB_PATH,
        KOST_TEST_TRANSITION_ARGS: JSON.stringify([mode, attemptId, candidateId]) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = ""; let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code !== 0) {
        rejectPromise(new Error("transition worker exited " + code + ": " + stderr));
        return;
      }
      try { resolvePromise(JSON.parse(stdout) as TransitionWorkerReport); }
      catch (error) {
        rejectPromise(new Error("invalid worker output " + stdout + ": " + String(error) + " " + stderr));
      }
    });
  });
}

test("#40: independent candidate processes report exactly one transition winner", async () => {
  const f = await fixture();
  const [a, b] = await Promise.all([
    transitionWorker("manual", f.attemptId, f.candidateId),
    transitionWorker("manual", f.attemptId, f.candidateId),
  ]);
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(b.ok, true, JSON.stringify(b));
  if (!a.ok || !b.ok) return;
  assert.equal(Number(a.transitioned) + Number(b.transitioned), 1);
  assert.equal(a.status, "submitted");
  assert.equal(b.status, "submitted");
  const audit = f.db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = 'attempt_submit'")
    .get(f.attemptId) as { n: number };
  assert.equal(audit.n, 1);
});

test("#40: independent expired candidate/cron processes never double-count a transition", async () => {
  const f = await fixture();
  f.db.prepare("UPDATE attempts SET expires_at = ? WHERE id = ?")
    .run(new Date(Date.now() - 30_000).toISOString(), f.attemptId);
  const [manual, sweep] = await Promise.all([
    transitionWorker("manual", f.attemptId, f.candidateId),
    transitionWorker("sweep", f.attemptId, f.candidateId),
  ]);
  assert.equal(manual.ok, true, JSON.stringify(manual));
  assert.equal(sweep.ok, true, JSON.stringify(sweep));
  if (!manual.ok || !sweep.ok) return;
  const cronWon = sweep.sweptIds?.includes(f.attemptId) ?? false;
  assert.equal(Number(manual.transitioned) + Number(cronWon), 1);
  const row = f.db.prepare("SELECT status FROM attempts WHERE id = ?").get(f.attemptId) as { status: string };
  assert.equal(row.status, "auto_submitted");
  const audit = f.db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = 'attempt_auto_submit'")
    .get(f.attemptId) as { n: number };
  assert.equal(audit.n, 1);
});
