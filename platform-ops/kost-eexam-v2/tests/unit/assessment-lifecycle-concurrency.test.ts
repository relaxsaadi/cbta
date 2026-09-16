import { before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

type LifecycleKind = "suspend" | "close" | "reopen";
type WorkerResult = { ok: true } | { ok: false; error: string };
type Worker = { ready: Promise<void>; done: Promise<WorkerResult> };

function runLifecycleWorker(kind: LifecycleKind, assessmentId: number, actorUserId: number, hold = false): Worker {
  const assessmentsUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/assessments.ts")).href;
  const dbUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/db.ts")).href;
  const script = `
    import { writeSync } from "node:fs";
    import { suspendAssessment, closeAssessment, reopenAssessment } from ${JSON.stringify(assessmentsUrl)};
    import { getDb } from ${JSON.stringify(dbUrl)};

    const kind = process.env.KOST_TEST_KIND;
    const assessmentId = Number(process.env.KOST_TEST_ASSESSMENT_ID);
    const actorUserId = Number(process.env.KOST_TEST_ACTOR_ID);
    const hold = process.env.KOST_TEST_HOLD === "1";
    const targetStatus = kind === "suspend" ? "suspended" : kind === "close" ? "closed" : "published";

    if (hold) {
      const db = getDb();
      const waitCell = new Int32Array(new SharedArrayBuffer(4));
      db.function("kost_test_hold_lifecycle_cas", () => {
        writeSync(1, "LOCKED\\n");
        Atomics.wait(waitCell, 0, 0, 400);
        return 0;
      });
      db.exec(\`
        CREATE TEMP TRIGGER hold_lifecycle_cas
        BEFORE UPDATE OF status ON assessments
        WHEN OLD.id = \${assessmentId}
         AND NEW.status = '\${targetStatus}'
        BEGIN
          SELECT kost_test_hold_lifecycle_cas();
        END;
      \`);
    }

    try {
      if (kind === "suspend") suspendAssessment(assessmentId, actorUserId, "concurrency proof");
      else if (kind === "close") closeAssessment(assessmentId, actorUserId);
      else reopenAssessment(assessmentId, actorUserId);
      writeSync(1, "RESULT " + JSON.stringify({ ok: true }) + "\\n");
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
        const error = new Error(`lifecycle worker ${kind} exited ${exitCode}: ${stdout}\n${stderr}`);
        if (!readyResolved) rejectReady(error);
        rejectPromise(error);
        return;
      }
      if (!readyResolved) {
        const error = new Error(`lifecycle worker ${kind} never reached held writer: ${stdout}\n${stderr}`);
        rejectReady(error);
        rejectPromise(error);
        return;
      }
      const line = stdout.split("\n").find((value) => value.startsWith("RESULT "));
      if (!line) {
        rejectPromise(new Error(`lifecycle worker ${kind} returned no result: ${stdout}\n${stderr}`));
        return;
      }
      resolvePromise(JSON.parse(line.slice("RESULT ".length)) as WorkerResult);
    });
  });

  return { ready, done };
}

async function fixture(suffix: string) {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");

  const adminId = createUser({
    username: `admin.lifecycle.concurrent.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Admin ${suffix}`,
    role: "administrator",
  });
  const candidateId = createUser({
    username: `candidate.lifecycle.concurrent.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Candidate ${suffix}`,
    role: "candidate",
  });
  const companyId = createCompany({ name: `Company ${suffix}`, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name: `Group ${suffix}`, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);
  createQuestion({
    kostQuestionId: `TEST-LIFECYCLE-CONCURRENT-${suffix}`,
    functionCode: "7.6",
    qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: "Question de concurrence lifecycle",
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
    feedbackMode: "immediate",
    scope: "test",
    createdBy: adminId,
  });
  publishAssessment(assessmentId, adminId);
  return { adminId, assessmentId };
}

async function lifecycleState(assessmentId: number, actorUserId: number) {
  const { getDb } = await import("../../lib/db");
  const row = getDb().prepare(`SELECT status FROM assessments WHERE id = ?`).get(assessmentId) as { status: string };
  const counts = getDb().prepare(`
    SELECT
      SUM(CASE WHEN action = 'assessment_suspend' THEN 1 ELSE 0 END) AS suspend_count,
      SUM(CASE WHEN action = 'assessment_close' THEN 1 ELSE 0 END) AS close_count,
      SUM(CASE WHEN action = 'assessment_reopen' THEN 1 ELSE 0 END) AS reopen_count,
      SUM(CASE WHEN action = 'assessment_transition_denied' THEN 1 ELSE 0 END) AS denied_count
    FROM audit_logs
    WHERE actor_user_id = ? AND target_id = ?
  `).get(actorUserId, assessmentId) as {
    suspend_count: number | null;
    close_count: number | null;
    reopen_count: number | null;
    denied_count: number | null;
  };
  return {
    status: row.status,
    suspendCount: Number(counts.suspend_count ?? 0),
    closeCount: Number(counts.close_count ?? 0),
    reopenCount: Number(counts.reopen_count ?? 0),
    deniedCount: Number(counts.denied_count ?? 0),
  };
}

for (const winnerKind of ["close", "suspend"] as const) {
  const loserKind = winnerKind === "close" ? "suspend" : "close";
  const finalStatus = winnerKind === "close" ? "closed" : "suspended";

  test(`${winnerKind} wins published lifecycle writer lock: concurrent ${loserKind} fails after re-read`, async () => {
    const { adminId, assessmentId } = await fixture(`${winnerKind}-wins`);
    const winner = runLifecycleWorker(winnerKind, assessmentId, adminId, true);
    await winner.ready;
    const loser = runLifecycleWorker(loserKind, assessmentId, adminId, false);
    const [winnerResult, loserResult] = await Promise.all([winner.done, loser.done]);

    assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
    assert.equal(loserResult.ok, false, JSON.stringify(loserResult));
    assert.deepEqual(await lifecycleState(assessmentId, adminId), {
      status: finalStatus,
      suspendCount: winnerKind === "suspend" ? 1 : 0,
      closeCount: winnerKind === "close" ? 1 : 0,
      reopenCount: 0,
      deniedCount: 1,
    });
  });
}

test("one of two concurrent reopens wins and the stale second reopen is denied", async () => {
  const { adminId, assessmentId } = await fixture("reopen-race");
  const { suspendAssessment } = await import("../../lib/assessments");
  suspendAssessment(assessmentId, adminId, "prepare reopen race");

  const winner = runLifecycleWorker("reopen", assessmentId, adminId, true);
  await winner.ready;
  const loser = runLifecycleWorker("reopen", assessmentId, adminId, false);
  const [winnerResult, loserResult] = await Promise.all([winner.done, loser.done]);

  assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
  assert.equal(loserResult.ok, false, JSON.stringify(loserResult));
  assert.deepEqual(await lifecycleState(assessmentId, adminId), {
    status: "published",
    suspendCount: 1,
    closeCount: 0,
    reopenCount: 1,
    deniedCount: 1,
  });
});
