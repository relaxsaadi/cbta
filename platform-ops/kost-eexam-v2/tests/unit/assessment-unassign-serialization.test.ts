import { before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

type OperationKind = "start" | "unassign";
type OperationResult = { ok: true; id?: number } | { ok: false; error: string };

type IndependentOperation = {
  ready: Promise<void>;
  done: Promise<OperationResult>;
};

function runIndependentOperation(
  kind: OperationKind,
  assessmentId: number,
  candidateUserId: number,
  actorUserId: number,
  holdInsideWriteTransaction = false
): IndependentOperation {
  const attemptsUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/attempts.ts")).href;
  const assessmentsUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/assessments.ts")).href;
  const dbUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/db.ts")).href;
  const script = `
    import { writeSync } from "node:fs";
    import { startAttempt } from ${JSON.stringify(attemptsUrl)};
    import { unassignCandidateFromAssessment } from ${JSON.stringify(assessmentsUrl)};
    import { getDb } from ${JSON.stringify(dbUrl)};

    const kind = process.env.KOST_TEST_OPERATION;
    const assessmentId = Number(process.env.KOST_TEST_ASSESSMENT_ID);
    const candidateUserId = Number(process.env.KOST_TEST_CANDIDATE_ID);
    const actorUserId = Number(process.env.KOST_TEST_ACTOR_ID);
    const hold = process.env.KOST_TEST_HOLD === "1";

    if (hold) {
      const db = getDb();
      const waitCell = new Int32Array(new SharedArrayBuffer(4));
      db.function("kost_test_hold_writer", () => {
        writeSync(1, "LOCKED\\n");
        Atomics.wait(waitCell, 0, 0, 400);
        return 0;
      });
      if (kind === "start") {
        db.exec(\`
          CREATE TEMP TRIGGER hold_start_writer
          BEFORE INSERT ON attempts
          WHEN NEW.assessment_id = \${assessmentId}
           AND NEW.candidate_user_id = \${candidateUserId}
          BEGIN
            SELECT kost_test_hold_writer();
          END;
        \`);
      } else {
        db.exec(\`
          CREATE TEMP TRIGGER hold_unassign_writer
          BEFORE DELETE ON assessment_assignments
          WHEN OLD.assessment_id = \${assessmentId}
           AND OLD.candidate_user_id = \${candidateUserId}
          BEGIN
            SELECT kost_test_hold_writer();
          END;
        \`);
      }
    }

    try {
      if (kind === "start") {
        const attempt = startAttempt(assessmentId, candidateUserId, {
          ip: "127.0.0.1",
          userAgent: "assignment-race-worker",
        });
        writeSync(1, "RESULT " + JSON.stringify({ ok: true, id: attempt.id }) + "\\n");
      } else {
        unassignCandidateFromAssessment(assessmentId, candidateUserId, actorUserId);
        writeSync(1, "RESULT " + JSON.stringify({ ok: true }) + "\\n");
      }
    } catch (error) {
      writeSync(1, "RESULT " + JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }) + "\\n");
    }
  `;

  let readyResolved = !holdInsideWriteTransaction;
  let resolveReady!: () => void;
  let rejectReady!: (error: Error) => void;
  const ready = new Promise<void>((resolvePromise, rejectPromise) => {
    resolveReady = resolvePromise;
    rejectReady = rejectPromise;
    if (readyResolved) resolvePromise();
  });

  const done = new Promise<OperationResult>((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: {
        ...process.env,
        DB_PATH: process.env.DB_PATH,
        KOST_TEST_OPERATION: kind,
        KOST_TEST_ASSESSMENT_ID: String(assessmentId),
        KOST_TEST_CANDIDATE_ID: String(candidateUserId),
        KOST_TEST_ACTOR_ID: String(actorUserId),
        KOST_TEST_HOLD: holdInsideWriteTransaction ? "1" : "0",
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
        const error = new Error(`independent ${kind} worker exited ${exitCode}: ${stdout}\n${stderr}`);
        if (!readyResolved) rejectReady(error);
        rejectPromise(error);
        return;
      }
      if (!readyResolved) {
        const error = new Error(`independent ${kind} worker never reached its held write: ${stdout}\n${stderr}`);
        rejectReady(error);
        rejectPromise(error);
        return;
      }
      const resultLine = stdout.split("\n").find((line) => line.startsWith("RESULT "));
      if (!resultLine) {
        rejectPromise(new Error(`independent ${kind} worker returned no result: ${stdout}\n${stderr}`));
        return;
      }
      try {
        resolvePromise(JSON.parse(resultLine.slice("RESULT ".length)) as OperationResult);
      } catch (error) {
        rejectPromise(new Error(`invalid independent ${kind} result: ${resultLine}\n${String(error)}`));
      }
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
    username: `admin.unassign.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Admin ${suffix}`,
    role: "administrator",
  });
  const candidateId = createUser({
    username: `candidate.unassign.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Candidate ${suffix}`,
    role: "candidate",
  });
  const companyId = createCompany({ name: `Company ${suffix}`, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name: `Group ${suffix}`, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);
  createQuestion({
    kostQuestionId: `TEST-UNASSIGN-${suffix}`,
    functionCode: "7.6",
    qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: "Question de sérialisation affectation",
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

async function persistedState(assessmentId: number, candidateUserId: number, actorUserId: number) {
  const { getDb } = await import("../../lib/db");
  const assignment = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM assessment_assignments WHERE assessment_id = ? AND candidate_user_id = ?`)
    .get(assessmentId, candidateUserId) as { n: number };
  const attempts = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM attempts WHERE assessment_id = ? AND candidate_user_id = ?`)
    .get(assessmentId, candidateUserId) as { n: number };
  const unassignAudits = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'assessment_unassign' AND actor_user_id = ? AND target_id = ?`)
    .get(actorUserId, assessmentId) as { n: number };
  const startAudits = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'attempt_start' AND actor_user_id = ?`)
    .get(candidateUserId) as { n: number };
  return {
    assignment: Number(assignment.n),
    attempts: Number(attempts.n),
    unassignAudits: Number(unassignAudits.n),
    startAudits: Number(startAudits.n),
  };
}

test("unassign writer wins first: waiting start fails closed with no attempt", async () => {
  const { adminId, candidateId, assessmentId } = await createFixture("unassign-wins");
  const winner = runIndependentOperation("unassign", assessmentId, candidateId, adminId, true);

  await winner.ready;
  const loser = runIndependentOperation("start", assessmentId, candidateId, adminId, false);
  const [winnerResult, loserResult] = await Promise.all([winner.done, loser.done]);

  assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
  assert.equal(loserResult.ok, false, JSON.stringify(loserResult));
  if (!loserResult.ok) assert.match(loserResult.error, /pas affecté/);
  assert.deepEqual(await persistedState(assessmentId, candidateId, adminId), {
    assignment: 0,
    attempts: 0,
    unassignAudits: 1,
    startAudits: 0,
  });
});

test("start writer wins first: waiting unassign observes the attempt and preserves assignment", async () => {
  const { adminId, candidateId, assessmentId } = await createFixture("start-wins");
  const winner = runIndependentOperation("start", assessmentId, candidateId, adminId, true);

  await winner.ready;
  const loser = runIndependentOperation("unassign", assessmentId, candidateId, adminId, false);
  const [winnerResult, loserResult] = await Promise.all([winner.done, loser.done]);

  assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
  assert.equal(loserResult.ok, false, JSON.stringify(loserResult));
  if (!loserResult.ok) assert.match(loserResult.error, /déjà une tentative/);
  assert.deepEqual(await persistedState(assessmentId, candidateId, adminId), {
    assignment: 1,
    attempts: 1,
    unassignAudits: 0,
    startAudits: 1,
  });
});

test("assessment_unassign audit failure rolls the assignment deletion back", async () => {
  const { adminId, candidateId, assessmentId } = await createFixture("audit-rollback");
  const { getDb } = await import("../../lib/db");
  const { unassignCandidateFromAssessment } = await import("../../lib/assessments");

  getDb().exec(`
    CREATE TEMP TRIGGER fail_assessment_unassign_audit
    BEFORE INSERT ON audit_logs
    WHEN NEW.action = 'assessment_unassign'
    BEGIN
      SELECT RAISE(ABORT, 'injected assessment unassign audit failure');
    END;
  `);
  try {
    assert.throws(
      () => unassignCandidateFromAssessment(assessmentId, candidateId, adminId),
      /injected assessment unassign audit failure/
    );
  } finally {
    getDb().exec(`DROP TRIGGER IF EXISTS fail_assessment_unassign_audit`);
  }

  assert.deepEqual(await persistedState(assessmentId, candidateId, adminId), {
    assignment: 1,
    attempts: 0,
    unassignAudits: 0,
    startAudits: 0,
  });
});
