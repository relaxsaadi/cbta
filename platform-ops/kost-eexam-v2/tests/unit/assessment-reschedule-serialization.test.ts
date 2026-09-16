import { before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

type WorkerKind = "start" | "reschedule";
type WorkerResult = { ok: true; id?: number } | { ok: false; error: string };

type Worker = { ready: Promise<void>; done: Promise<WorkerResult> };

function runWorker(kind: WorkerKind, assessmentId: number, candidateUserId: number, actorUserId: number, hold = false): Worker {
  const attemptsUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/attempts.ts")).href;
  const assessmentsUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/assessments.ts")).href;
  const dbUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/db.ts")).href;
  const script = `
    import { writeSync } from "node:fs";
    import { startAttempt } from ${JSON.stringify(attemptsUrl)};
    import { rescheduleAssessment } from ${JSON.stringify(assessmentsUrl)};
    import { getDb } from ${JSON.stringify(dbUrl)};

    const kind = process.env.KOST_TEST_KIND;
    const assessmentId = Number(process.env.KOST_TEST_ASSESSMENT_ID);
    const candidateUserId = Number(process.env.KOST_TEST_CANDIDATE_ID);
    const actorUserId = Number(process.env.KOST_TEST_ACTOR_ID);
    const hold = process.env.KOST_TEST_HOLD === "1";
    const futureOpen = "2099-01-01T00:00:00.000Z";
    const futureClose = "2099-01-02T00:00:00.000Z";

    if (hold) {
      const db = getDb();
      const waitCell = new Int32Array(new SharedArrayBuffer(4));
      db.function("kost_test_hold_reschedule_writer", () => {
        writeSync(1, "LOCKED\\n");
        Atomics.wait(waitCell, 0, 0, 400);
        return 0;
      });
      if (kind === "start") {
        db.exec(\`
          CREATE TEMP TRIGGER hold_start_before_attempt_insert
          BEFORE INSERT ON attempts
          WHEN NEW.assessment_id = \${assessmentId}
           AND NEW.candidate_user_id = \${candidateUserId}
          BEGIN
            SELECT kost_test_hold_reschedule_writer();
          END;
        \`);
      } else {
        db.exec(\`
          CREATE TEMP TRIGGER hold_reschedule_before_update
          BEFORE UPDATE OF open_at, close_at ON assessments
          WHEN OLD.id = \${assessmentId}
          BEGIN
            SELECT kost_test_hold_reschedule_writer();
          END;
        \`);
      }
    }

    try {
      if (kind === "start") {
        const attempt = startAttempt(assessmentId, candidateUserId, {
          ip: "127.0.0.1",
          userAgent: "reschedule-race-worker",
        });
        writeSync(1, "RESULT " + JSON.stringify({ ok: true, id: attempt.id }) + "\\n");
      } else {
        rescheduleAssessment(assessmentId, futureOpen, futureClose, actorUserId);
        writeSync(1, "RESULT " + JSON.stringify({ ok: true }) + "\\n");
      }
    } catch (error) {
      writeSync(1, "RESULT " + JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }) + "\\n");
    }
  `;

  let readyResolved = !hold;
  let resolveReady!: () => void;
  let rejectReady!: (error: Error) => void;
  const ready = new Promise<void>((resolvePromise, rejectPromise) => {
    resolveReady = resolvePromise;
    rejectReady = rejectPromise;
    if (readyResolved) resolvePromise();
  });

  const done = new Promise<WorkerResult>((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: {
        ...process.env,
        DB_PATH: process.env.DB_PATH,
        KOST_TEST_KIND: kind,
        KOST_TEST_ASSESSMENT_ID: String(assessmentId),
        KOST_TEST_CANDIDATE_ID: String(candidateUserId),
        KOST_TEST_ACTOR_ID: String(actorUserId),
        KOST_TEST_HOLD: hold ? "1" : "0",
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
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => {
      if (!readyResolved) rejectReady(error);
      rejectPromise(error);
    });
    child.on("close", (exitCode) => {
      if (exitCode !== 0) {
        const error = new Error(`worker ${kind} exited ${exitCode}: ${stdout}\n${stderr}`);
        if (!readyResolved) rejectReady(error);
        rejectPromise(error);
        return;
      }
      if (!readyResolved) {
        const error = new Error(`worker ${kind} never reached held writer: ${stdout}\n${stderr}`);
        rejectReady(error);
        rejectPromise(error);
        return;
      }
      const line = stdout.split("\n").find((value) => value.startsWith("RESULT "));
      if (!line) {
        rejectPromise(new Error(`worker ${kind} returned no result: ${stdout}\n${stderr}`));
        return;
      }
      resolvePromise(JSON.parse(line.slice("RESULT ".length)) as WorkerResult);
    });
  });

  return { ready, done };
}

async function fixture(suffix: string, feedbackMode: "immediate" | "deferred" = "immediate") {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");

  const adminId = createUser({
    username: `admin.reschedule.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Admin ${suffix}`,
    role: "administrator",
  });
  const candidateId = createUser({
    username: `candidate.reschedule.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Candidate ${suffix}`,
    role: "candidate",
  });
  const companyId = createCompany({ name: `Company ${suffix}`, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name: `Group ${suffix}`, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);
  createQuestion({
    kostQuestionId: `TEST-RESCHEDULE-${suffix}`,
    functionCode: "7.6",
    qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: "Question de sérialisation reprogrammation",
    choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }],
    correctAnswer: ["A"],
    createdBy: adminId,
  });
  const closeAt = feedbackMode === "deferred" ? "2098-01-01T00:00:00.000Z" : undefined;
  const assessmentId = createAssessmentDraft({
    type: "examen",
    name: `Assessment ${suffix}`,
    functionCode: "7.6",
    groupId,
    questionSource: "random",
    questionCount: 1,
    durationMinutes: 30,
    passThresholdPct: 80,
    feedbackMode,
    closeAt,
    scope: "test",
    createdBy: adminId,
  });
  publishAssessment(assessmentId, adminId);
  return { adminId, candidateId, assessmentId };
}

async function dbState(assessmentId: number, candidateId: number, actorId: number) {
  const { getDb } = await import("../../lib/db");
  const schedule = getDb().prepare(`SELECT open_at, close_at FROM assessments WHERE id = ?`).get(assessmentId) as { open_at: string | null; close_at: string | null };
  const attempts = getDb().prepare(`SELECT COUNT(*) AS n FROM attempts WHERE assessment_id = ? AND candidate_user_id = ?`).get(assessmentId, candidateId) as { n: number };
  const startAudits = getDb().prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'attempt_start' AND actor_user_id = ? AND target_type = 'attempt'`).get(candidateId) as { n: number };
  const rescheduleAudits = getDb().prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'assessment_reschedule' AND actor_user_id = ? AND target_id = ?`).get(actorId, assessmentId) as { n: number };
  return { schedule, attempts: Number(attempts.n), startAudits: Number(startAudits.n), rescheduleAudits: Number(rescheduleAudits.n) };
}

test("reschedule wins write lock first: later start evaluates committed future window", async () => {
  const { adminId, candidateId, assessmentId } = await fixture("reschedule-wins");
  const winner = runWorker("reschedule", assessmentId, candidateId, adminId, true);
  await winner.ready;
  const loser = runWorker("start", assessmentId, candidateId, adminId, false);
  const [winnerResult, loserResult] = await Promise.all([winner.done, loser.done]);

  assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
  assert.equal(loserResult.ok, false, JSON.stringify(loserResult));
  const state = await dbState(assessmentId, candidateId, adminId);
  assert.deepEqual(state.schedule, {
    open_at: "2099-01-01T00:00:00.000Z",
    close_at: "2099-01-02T00:00:00.000Z",
  });
  assert.equal(state.attempts, 0);
  assert.equal(state.startAudits, 0);
  assert.equal(state.rescheduleAudits, 1);
});

test("start wins write lock first: later reschedule observes in-progress attempt and fails", async () => {
  const { adminId, candidateId, assessmentId } = await fixture("start-wins");
  const winner = runWorker("start", assessmentId, candidateId, adminId, true);
  await winner.ready;
  const loser = runWorker("reschedule", assessmentId, candidateId, adminId, false);
  const [winnerResult, loserResult] = await Promise.all([winner.done, loser.done]);

  assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
  assert.equal(loserResult.ok, false, JSON.stringify(loserResult));
  assert.match(loserResult.ok ? "" : loserResult.error, /tentative est actuellement EN COURS/);
  const state = await dbState(assessmentId, candidateId, adminId);
  assert.deepEqual(state.schedule, { open_at: null, close_at: null });
  assert.equal(state.attempts, 1);
  assert.equal(state.startAudits, 1);
  assert.equal(state.rescheduleAudits, 0);
});

test("reschedule success audit failure rolls schedule mutation back", async () => {
  const { adminId, candidateId, assessmentId } = await fixture("audit-rollback");
  const { getDb } = await import("../../lib/db");
  const { rescheduleAssessment } = await import("../../lib/assessments");
  getDb().exec(`
    CREATE TEMP TRIGGER fail_reschedule_audit
    BEFORE INSERT ON audit_logs
    WHEN NEW.action = 'assessment_reschedule'
    BEGIN
      SELECT RAISE(ABORT, 'injected reschedule audit failure');
    END;
  `);
  try {
    assert.throws(
      () => rescheduleAssessment(assessmentId, "2099-01-01T00:00:00.000Z", "2099-01-02T00:00:00.000Z", adminId),
      /injected reschedule audit failure/
    );
  } finally {
    getDb().exec(`DROP TRIGGER IF EXISTS fail_reschedule_audit`);
  }
  const state = await dbState(assessmentId, candidateId, adminId);
  assert.deepEqual(state.schedule, { open_at: null, close_at: null });
  assert.equal(state.rescheduleAudits, 0);
});

test("deferred feedback cannot be rescheduled to an indefinite close", async () => {
  const { adminId, assessmentId } = await fixture("deferred-close", "deferred");
  const { rescheduleAssessment } = await import("../../lib/assessments");
  assert.throws(
    () => rescheduleAssessment(assessmentId, null, null, adminId),
    /date de fermeture est obligatoire lorsque la restitution est différée/
  );
});
