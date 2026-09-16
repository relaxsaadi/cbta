import { before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

beforeEach(async () => {
  const { getDb } = await import("../../lib/db");
  getDb().prepare(`DELETE FROM platform_settings WHERE key IN ('maintenance_mode','block_new_attempts')`).run();
});

type StartResult = { ok: true; id: number } | { ok: false; error: string };

function runIndependentStart(assessmentId: number, candidateUserId: number): Promise<StartResult> {
  const moduleUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/attempts.ts")).href;
  const script = `
    import { startAttempt } from ${JSON.stringify(moduleUrl)};
    try {
      const attempt = startAttempt(
        Number(process.env.KOST_TEST_ASSESSMENT_ID),
        Number(process.env.KOST_TEST_CANDIDATE_ID),
        { ip: "127.0.0.1", userAgent: "attempt-race-worker" }
      );
      process.stdout.write(JSON.stringify({ ok: true, id: attempt.id }));
    } catch (error) {
      process.stdout.write(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
    }
  `;

  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: {
        ...process.env,
        DB_PATH: process.env.DB_PATH,
        KOST_TEST_ASSESSMENT_ID: String(assessmentId),
        KOST_TEST_CANDIDATE_ID: String(candidateUserId),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode !== 0) {
        reject(new Error(`independent start worker exited ${exitCode}: ${stderr}`));
        return;
      }
      try {
        resolvePromise(JSON.parse(stdout) as StartResult);
      } catch (error) {
        reject(new Error(`invalid start worker output: ${stdout}\n${stderr}\n${String(error)}`));
      }
    });
  });
}

function startIndependentWriter(sql: string, params: unknown[]): { ready: Promise<void>; done: Promise<void> } {
  const script = `
    import { DatabaseSync } from "node:sqlite";
    const db = new DatabaseSync(process.env.DB_PATH);
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec("PRAGMA foreign_keys = ON");
    db.exec("BEGIN IMMEDIATE");
    db.prepare(process.env.KOST_TEST_SQL).run(...JSON.parse(process.env.KOST_TEST_PARAMS ?? "[]"));
    process.stdout.write("LOCKED\\n");
    await new Promise((resolve) => setTimeout(resolve, 350));
    db.exec("COMMIT");
    db.close();
    process.stdout.write("COMMITTED\\n");
  `;

  let readyResolved = false;
  let resolveReady!: () => void;
  let rejectReady!: (error: Error) => void;
  const ready = new Promise<void>((resolvePromise, rejectPromise) => {
    resolveReady = resolvePromise;
    rejectReady = rejectPromise;
  });

  const done = new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, ["--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: {
        ...process.env,
        DB_PATH: process.env.DB_PATH,
        KOST_TEST_SQL: sql,
        KOST_TEST_PARAMS: JSON.stringify(params),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (!readyResolved && stdout.includes("LOCKED\n")) {
        readyResolved = true;
        resolveReady();
      }
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => {
      if (!readyResolved) rejectReady(error);
      rejectPromise(error);
    });
    child.on("close", (exitCode) => {
      if (exitCode !== 0) {
        const error = new Error(`independent writer exited ${exitCode}: ${stdout}\n${stderr}`);
        if (!readyResolved) rejectReady(error);
        rejectPromise(error);
        return;
      }
      if (!readyResolved) {
        const error = new Error(`independent writer never acquired lock: ${stdout}\n${stderr}`);
        rejectReady(error);
        rejectPromise(error);
        return;
      }
      resolvePromise();
    });
  });

  return { ready, done };
}

async function createFixture(suffix: string) {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");

  const adminId = createUser({
    username: `admin.start.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Admin ${suffix}`,
    role: "administrator",
  });
  const candidateId = createUser({
    username: `candidate.start.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Candidate ${suffix}`,
    role: "candidate",
  });
  const companyId = createCompany({ name: `Company ${suffix}`, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name: `Group ${suffix}`, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);
  createQuestion({
    kostQuestionId: `TEST-START-${suffix}`,
    functionCode: "7.6",
    qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: "Question de concurrence",
    choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }],
    correctAnswer: ["A"],
    createdBy: adminId,
  });
  const assessmentId = createAssessmentDraft({
    type: "examen",
    name: `Assessment ${suffix}`,
    functionCode: "7.6",
    groupId,
    questionSource: "random",
    questionCount: 1,
    durationMinutes: 30,
    passThresholdPct: 80,
    scope: "test",
    createdBy: adminId,
  });
  publishAssessment(assessmentId, adminId);
  return { adminId, candidateId, assessmentId };
}

async function counts(assessmentId: number, candidateUserId: number) {
  const { getDb } = await import("../../lib/db");
  const attempts = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM attempts WHERE assessment_id = ? AND candidate_user_id = ?`)
    .get(assessmentId, candidateUserId) as { n: number };
  const questions = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM attempt_questions aq JOIN attempts at ON at.id = aq.attempt_id WHERE at.assessment_id = ? AND at.candidate_user_id = ?`)
    .get(assessmentId, candidateUserId) as { n: number };
  const starts = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'attempt_start' AND actor_user_id = ? AND metadata_json LIKE ?`)
    .get(candidateUserId, `%\"assessmentId\":${assessmentId}%`) as { n: number };
  return { attempts: Number(attempts.n), questions: Number(questions.n), starts: Number(starts.n) };
}

for (const key of ["block_new_attempts", "maintenance_mode"] as const) {
  test(`${key} writer that owns BEGIN IMMEDIATE first denies a stale new-attempt request`, async () => {
    const { adminId, candidateId, assessmentId } = await createFixture(`stop-${key}`);
    const writer = startIndependentWriter(
      `INSERT INTO platform_settings (key, value, updated_by) VALUES (?, '1', ?) ON CONFLICT(key) DO UPDATE SET value = '1', updated_by = excluded.updated_by`,
      [key, adminId]
    );

    await writer.ready;
    const startPromise = runIndependentStart(assessmentId, candidateId);
    await writer.done;
    const result = await startPromise;

    assert.equal(result.ok, false, JSON.stringify(result));
    if (!result.ok) assert.match(result.error, /temporairement suspendu/);
    assert.deepEqual(await counts(assessmentId, candidateId), { attempts: 0, questions: 0, starts: 0 });
  });
}

test("assessment suspension that owns BEGIN IMMEDIATE first denies the waiting start", async () => {
  const { candidateId, assessmentId } = await createFixture("suspend-wins");
  const writer = startIndependentWriter(`UPDATE assessments SET status = 'suspended' WHERE id = ?`, [assessmentId]);

  await writer.ready;
  const startPromise = runIndependentStart(assessmentId, candidateId);
  await writer.done;
  const result = await startPromise;

  assert.equal(result.ok, false, JSON.stringify(result));
  if (!result.ok) assert.match(result.error, /pas ouverte/);
  assert.deepEqual(await counts(assessmentId, candidateId), { attempts: 0, questions: 0, starts: 0 });
});

test("assignment removal that owns BEGIN IMMEDIATE first denies the waiting start", async () => {
  const { candidateId, assessmentId } = await createFixture("unassign-wins");
  const writer = startIndependentWriter(
    `DELETE FROM assessment_assignments WHERE assessment_id = ? AND candidate_user_id = ?`,
    [assessmentId, candidateId]
  );

  await writer.ready;
  const startPromise = runIndependentStart(assessmentId, candidateId);
  await writer.done;
  const result = await startPromise;

  assert.equal(result.ok, false, JSON.stringify(result));
  if (!result.ok) assert.match(result.error, /pas affecté/);
  assert.deepEqual(await counts(assessmentId, candidateId), { attempts: 0, questions: 0, starts: 0 });
});

test("malformed persisted schedule fails closed at startAttempt without creating rows", async () => {
  const { candidateId, assessmentId } = await createFixture("malformed-schedule");
  const { getDb } = await import("../../lib/db");
  const { startAttempt } = await import("../../lib/attempts");
  getDb().prepare(`UPDATE assessments SET open_at = 'not-a-date' WHERE id = ?`).run(assessmentId);

  assert.throws(() => startAttempt(assessmentId, candidateId, {}), /pas ouverte/);
  assert.deepEqual(await counts(assessmentId, candidateId), { attempts: 0, questions: 0, starts: 0 });
});

test("two independent starts converge on one committed attempt and one start audit", async () => {
  const { candidateId, assessmentId } = await createFixture("two-starts");
  const [left, right] = await Promise.all([
    runIndependentStart(assessmentId, candidateId),
    runIndependentStart(assessmentId, candidateId),
  ]);

  assert.equal(left.ok, true, JSON.stringify(left));
  assert.equal(right.ok, true, JSON.stringify(right));
  if (left.ok && right.ok) assert.equal(left.id, right.id);
  assert.deepEqual(await counts(assessmentId, candidateId), { attempts: 1, questions: 1, starts: 1 });
});

test("a committed in-progress attempt remains resumable after new attempts are blocked", async () => {
  const { adminId, candidateId, assessmentId } = await createFixture("resume-after-stop");
  const { getDb } = await import("../../lib/db");
  const { startAttempt } = await import("../../lib/attempts");
  const first = startAttempt(assessmentId, candidateId, {});
  getDb()
    .prepare(`INSERT INTO platform_settings (key, value, updated_by) VALUES ('block_new_attempts', '1', ?) ON CONFLICT(key) DO UPDATE SET value = '1', updated_by = excluded.updated_by`)
    .run(adminId);

  const resumed = startAttempt(assessmentId, candidateId, {});
  assert.equal(resumed.id, first.id);
  assert.deepEqual(await counts(assessmentId, candidateId), { attempts: 1, questions: 1, starts: 1 });
});
