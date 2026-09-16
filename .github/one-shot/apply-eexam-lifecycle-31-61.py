from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ASSESSMENTS = ROOT / "platform-ops/kost-eexam-v2/lib/assessments.ts"
TEST = ROOT / "platform-ops/kost-eexam-v2/tests/unit/assessment-lifecycle-serialization.test.ts"

text = ASSESSMENTS.read_text()

old_import = 'import { listGroupMembers } from "./groups";\nimport type { Scope } from "./scope";'
new_import = 'import { listGroupMembers } from "./groups";\nimport { getRoleForUser } from "./users";\nimport type { Scope } from "./scope";'
if text.count(old_import) != 1:
    raise SystemExit(f"expected exactly one import anchor, found {text.count(old_import)}")
text = text.replace(old_import, new_import, 1)

old_block = '''export function suspendAssessment(assessmentId: number, actorUserId: number, reason?: string): void {
  getDb().prepare(`UPDATE assessments SET status = 'suspended' WHERE id = ?`).run(assessmentId);
  audit({ actorUserId, actorRole: null, action: "assessment_suspend", targetType: "assessment", targetId: assessmentId, metadata: { reason } });
}

export function reopenAssessment(assessmentId: number, actorUserId: number): void {
  getDb().prepare(`UPDATE assessments SET status = 'published' WHERE id = ?`).run(assessmentId);
  audit({ actorUserId, actorRole: null, action: "assessment_reopen", targetType: "assessment", targetId: assessmentId });
}

export function closeAssessment(assessmentId: number, actorUserId: number): void {
  getDb().prepare(`UPDATE assessments SET status = 'closed' WHERE id = ?`).run(assessmentId);
  audit({ actorUserId, actorRole: null, action: "assessment_close", targetType: "assessment", targetId: assessmentId });
}
'''

new_block = '''type AssessmentLifecycleOperation = "suspend" | "reopen" | "close";
type AssessmentLifecycleAuditAction = "assessment_suspend" | "assessment_reopen" | "assessment_close";

interface AssessmentLifecycleState {
  status: AssessmentStatus;
  open_at: string | null;
  close_at: string | null;
  feedback_mode: string | null;
}

const ASSESSMENT_LIFECYCLE: Record<AssessmentLifecycleOperation, {
  from: readonly AssessmentStatus[];
  to: AssessmentStatus;
  action: AssessmentLifecycleAuditAction;
}> = {
  suspend: { from: ["published", "open"], to: "suspended", action: "assessment_suspend" },
  reopen: { from: ["suspended"], to: "published", action: "assessment_reopen" },
  close: { from: ["published", "open"], to: "closed", action: "assessment_close" },
};

function persistedScheduleIssue(openAt: string | null, closeAt: string | null): string | null {
  if (openAt !== null && Number.isNaN(Date.parse(openAt))) return "invalid_open_at";
  if (closeAt !== null && Number.isNaN(Date.parse(closeAt))) return "invalid_close_at";
  if (openAt !== null && closeAt !== null && Date.parse(closeAt) <= Date.parse(openAt)) {
    return "non_increasing_window";
  }
  return null;
}

/**
 * #31/#61 — lifecycle status changes use the same BEGIN IMMEDIATE writer
 * discipline as startAttempt(). The winner of the SQLite write lock therefore
 * defines the state observed by the loser: a committed suspend/close blocks a
 * later new attempt, while a committed attempt remains durable if the stop
 * transition wins afterwards.
 *
 * Validity is enforced at this library/data boundary rather than relying on
 * hidden React buttons. Mutation + success audit commit or roll back together.
 */
function applyAssessmentLifecycleTransition(
  assessmentId: number,
  actorUserId: number,
  operation: AssessmentLifecycleOperation,
  metadata?: Record<string, unknown>
): void {
  const spec = ASSESSMENT_LIFECYCLE[operation];
  const actorRole = getRoleForUser(actorUserId);

  const outcome = transaction((db) => {
    const current = db
      .prepare(`SELECT status, open_at, close_at, feedback_mode FROM assessments WHERE id = ?`)
      .get(assessmentId) as AssessmentLifecycleState | undefined;

    if (!current) return { kind: "missing" as const };
    if (!spec.from.includes(current.status)) {
      return { kind: "denied" as const, current, reason: "invalid_status" };
    }

    if (operation === "reopen") {
      const scheduleIssue = persistedScheduleIssue(current.open_at, current.close_at);
      if (scheduleIssue) {
        return { kind: "denied" as const, current, reason: "invalid_schedule", scheduleIssue };
      }
      if (!["immediate", "deferred", "none"].includes(current.feedback_mode ?? "")) {
        return { kind: "denied" as const, current, reason: "invalid_feedback_configuration" };
      }
      if (current.feedback_mode === "deferred" && current.close_at === null) {
        return { kind: "denied" as const, current, reason: "invalid_feedback_configuration" };
      }
    }

    const changed = db
      .prepare(`UPDATE assessments SET status = ? WHERE id = ? AND status = ?`)
      .run(spec.to, assessmentId, current.status);
    if (Number(changed.changes) !== 1) {
      return { kind: "denied" as const, current, reason: "stale_status" };
    }

    audit({
      actorUserId,
      actorRole,
      action: spec.action,
      targetType: "assessment",
      targetId: assessmentId,
      metadata: {
        ...(metadata ?? {}),
        previousStatus: current.status,
        status: spec.to,
      },
    });
    return { kind: "changed" as const };
  });

  if (outcome.kind === "changed") return;
  if (outcome.kind === "missing") throw new Error("Évaluation introuvable.");

  audit({
    actorUserId,
    actorRole,
    action: "assessment_transition_denied",
    targetType: "assessment",
    targetId: assessmentId,
    result: "failure",
    metadata: {
      requestedAction: spec.action,
      requestedStatus: spec.to,
      fromStatus: outcome.current.status,
      reason: outcome.reason,
      ...(outcome.reason === "invalid_schedule" ? { scheduleIssue: outcome.scheduleIssue } : {}),
    },
  });

  if (outcome.reason === "invalid_schedule") {
    throw new Error("Transition impossible : la fenêtre de disponibilité enregistrée est invalide.");
  }
  if (outcome.reason === "invalid_feedback_configuration") {
    throw new Error("Réouverture impossible : la configuration de restitution différée nécessite une date de fermeture valide.");
  }
  throw new Error(`Transition d'évaluation impossible depuis le statut « ${outcome.current.status} ».`);
}

export function suspendAssessment(assessmentId: number, actorUserId: number, reason?: string): void {
  applyAssessmentLifecycleTransition(assessmentId, actorUserId, "suspend", { reason });
}

export function reopenAssessment(assessmentId: number, actorUserId: number): void {
  applyAssessmentLifecycleTransition(assessmentId, actorUserId, "reopen");
}

export function closeAssessment(assessmentId: number, actorUserId: number): void {
  applyAssessmentLifecycleTransition(assessmentId, actorUserId, "close");
}
'''

if text.count(old_block) != 1:
    raise SystemExit(f"expected exactly one lifecycle block, found {text.count(old_block)}")
text = text.replace(old_block, new_block, 1)
ASSESSMENTS.write_text(text)

TEST.write_text(r'''import { before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

type OperationKind = "start" | "suspend" | "close";
type OperationResult = { ok: true; id?: number } | { ok: false; error: string };

type IndependentOperation = { ready: Promise<void>; done: Promise<OperationResult> };

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
    import { suspendAssessment, closeAssessment } from ${JSON.stringify(assessmentsUrl)};
    import { getDb } from ${JSON.stringify(dbUrl)};

    const kind = process.env.KOST_TEST_OPERATION;
    const assessmentId = Number(process.env.KOST_TEST_ASSESSMENT_ID);
    const candidateUserId = Number(process.env.KOST_TEST_CANDIDATE_ID);
    const actorUserId = Number(process.env.KOST_TEST_ACTOR_ID);
    const hold = process.env.KOST_TEST_HOLD === "1";

    if (hold) {
      const db = getDb();
      const waitCell = new Int32Array(new SharedArrayBuffer(4));
      db.function("kost_test_hold_lifecycle_writer", () => {
        writeSync(1, "LOCKED\\n");
        Atomics.wait(waitCell, 0, 0, 400);
        return 0;
      });
      if (kind === "start") {
        db.exec(\`
          CREATE TEMP TRIGGER hold_lifecycle_start
          BEFORE INSERT ON attempts
          WHEN NEW.assessment_id = \${assessmentId}
           AND NEW.candidate_user_id = \${candidateUserId}
          BEGIN
            SELECT kost_test_hold_lifecycle_writer();
          END;
        \`);
      } else {
        const targetStatus = kind === "suspend" ? "suspended" : "closed";
        db.exec(\`
          CREATE TEMP TRIGGER hold_lifecycle_stop
          BEFORE UPDATE OF status ON assessments
          WHEN OLD.id = \${assessmentId}
           AND NEW.status = '\${targetStatus}'
          BEGIN
            SELECT kost_test_hold_lifecycle_writer();
          END;
        \`);
      }
    }

    try {
      if (kind === "start") {
        const attempt = startAttempt(assessmentId, candidateUserId, {
          ip: "127.0.0.1",
          userAgent: "lifecycle-race-worker",
        });
        writeSync(1, "RESULT " + JSON.stringify({ ok: true, id: attempt.id }) + "\\n");
      } else if (kind === "suspend") {
        suspendAssessment(assessmentId, actorUserId, "race regression");
        writeSync(1, "RESULT " + JSON.stringify({ ok: true }) + "\\n");
      } else {
        closeAssessment(assessmentId, actorUserId);
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
        const error = new Error(`independent ${kind} worker never reached held write: ${stdout}\n${stderr}`);
        rejectReady(error);
        rejectPromise(error);
        return;
      }
      const resultLine = stdout.split("\n").find((line) => line.startsWith("RESULT "));
      if (!resultLine) {
        rejectPromise(new Error(`independent ${kind} worker returned no result: ${stdout}\n${stderr}`));
        return;
      }
      resolvePromise(JSON.parse(resultLine.slice("RESULT ".length)) as OperationResult);
    });
  });

  return { ready, done };
}

async function createFixture(suffix: string, feedbackMode: "immediate" | "deferred" = "immediate") {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");

  const adminId = createUser({
    username: `admin.lifecycle.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Admin ${suffix}`,
    role: "administrator",
  });
  const candidateId = createUser({
    username: `candidate.lifecycle.${suffix}`,
    password: `Strong-Test-Password-${suffix}!`,
    fullName: `Candidate ${suffix}`,
    role: "candidate",
  });
  const companyId = createCompany({ name: `Company ${suffix}`, scope: "test", createdBy: adminId });
  const groupId = createGroup({ companyId, name: `Group ${suffix}`, scope: "test", createdBy: adminId });
  addCandidateToGroup(groupId, candidateId, adminId);
  createQuestion({
    kostQuestionId: `TEST-LIFECYCLE-${suffix}`,
    functionCode: "7.6",
    qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: "Question de sérialisation lifecycle",
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
    feedbackMode,
    closeAt: feedbackMode === "deferred" ? undefined : undefined,
    scope: "test",
    createdBy: adminId,
  });
  publishAssessment(assessmentId, adminId);
  return { adminId, candidateId, assessmentId };
}

async function state(assessmentId: number, candidateUserId: number, actorUserId: number, action: string) {
  const { getDb } = await import("../../lib/db");
  const assessment = getDb().prepare(`SELECT status FROM assessments WHERE id = ?`).get(assessmentId) as { status: string };
  const attempts = getDb().prepare(`SELECT COUNT(*) AS n FROM attempts WHERE assessment_id = ? AND candidate_user_id = ?`).get(assessmentId, candidateUserId) as { n: number };
  const startAudits = getDb().prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'attempt_start' AND actor_user_id = ?`).get(candidateUserId) as { n: number };
  const lifecycleAudits = getDb().prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = ? AND actor_user_id = ? AND target_id = ?`).get(action, actorUserId, assessmentId) as { n: number };
  return { status: assessment.status, attempts: Number(attempts.n), startAudits: Number(startAudits.n), lifecycleAudits: Number(lifecycleAudits.n) };
}

for (const stopKind of ["suspend", "close"] as const) {
  const finalStatus = stopKind === "suspend" ? "suspended" : "closed";
  const auditAction = stopKind === "suspend" ? "assessment_suspend" : "assessment_close";

  test(`${stopKind} writer wins first: waiting start fails closed`, async () => {
    const { adminId, candidateId, assessmentId } = await createFixture(`${stopKind}-wins`);
    const winner = runIndependentOperation(stopKind, assessmentId, candidateId, adminId, true);
    await winner.ready;
    const loser = runIndependentOperation("start", assessmentId, candidateId, adminId, false);
    const [winnerResult, loserResult] = await Promise.all([winner.done, loser.done]);

    assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
    assert.equal(loserResult.ok, false, JSON.stringify(loserResult));
    assert.deepEqual(await state(assessmentId, candidateId, adminId, auditAction), {
      status: finalStatus,
      attempts: 0,
      startAudits: 0,
      lifecycleAudits: 1,
    });
  });

  test(`start writer wins first: ${stopKind} commits and existing attempt remains resumable`, async () => {
    const { adminId, candidateId, assessmentId } = await createFixture(`start-before-${stopKind}`);
    const winner = runIndependentOperation("start", assessmentId, candidateId, adminId, true);
    await winner.ready;
    const loser = runIndependentOperation(stopKind, assessmentId, candidateId, adminId, false);
    const [winnerResult, loserResult] = await Promise.all([winner.done, loser.done]);

    assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
    assert.equal(loserResult.ok, true, JSON.stringify(loserResult));
    assert.deepEqual(await state(assessmentId, candidateId, adminId, auditAction), {
      status: finalStatus,
      attempts: 1,
      startAudits: 1,
      lifecycleAudits: 1,
    });

    const { startAttempt } = await import("../../lib/attempts");
    const resumed = startAttempt(assessmentId, candidateId, { ip: "127.0.0.1", userAgent: "resume-after-stop" });
    assert.equal(resumed.id, winnerResult.ok ? winnerResult.id : undefined);
  });
}

test("lifecycle success audit failure rolls status mutation back", async () => {
  const { adminId, candidateId, assessmentId } = await createFixture("audit-rollback");
  const { getDb } = await import("../../lib/db");
  const { suspendAssessment } = await import("../../lib/assessments");

  getDb().exec(`
    CREATE TEMP TRIGGER fail_lifecycle_audit
    BEFORE INSERT ON audit_logs
    WHEN NEW.action = 'assessment_suspend'
    BEGIN
      SELECT RAISE(ABORT, 'injected lifecycle audit failure');
    END;
  `);
  try {
    assert.throws(() => suspendAssessment(assessmentId, adminId, "rollback proof"), /injected lifecycle audit failure/);
  } finally {
    getDb().exec(`DROP TRIGGER IF EXISTS fail_lifecycle_audit`);
  }

  assert.deepEqual(await state(assessmentId, candidateId, adminId, "assessment_suspend"), {
    status: "published",
    attempts: 0,
    startAudits: 0,
    lifecycleAudits: 0,
  });
});

test("forged invalid lifecycle transition fails closed and records denial", async () => {
  const { adminId, assessmentId } = await createFixture("invalid-transition");
  const { getDb } = await import("../../lib/db");
  const { suspendAssessment } = await import("../../lib/assessments");

  getDb().prepare(`UPDATE assessments SET status = 'draft' WHERE id = ?`).run(assessmentId);
  assert.throws(() => suspendAssessment(assessmentId, adminId), /Transition d'évaluation impossible/);
  const row = getDb().prepare(`SELECT status FROM assessments WHERE id = ?`).get(assessmentId) as { status: string };
  assert.equal(row.status, "draft");
  const denied = getDb().prepare(`SELECT result, metadata_json FROM audit_logs WHERE action = 'assessment_transition_denied' AND target_id = ? ORDER BY id DESC LIMIT 1`).get(assessmentId) as { result: string; metadata_json: string };
  assert.equal(denied.result, "failure");
  const metadata = JSON.parse(denied.metadata_json) as Record<string, unknown>;
  assert.equal(metadata.fromStatus, "draft");
  assert.equal(metadata.requestedStatus, "suspended");
  assert.equal(metadata.reason, "invalid_status");
});

test("reopen fails closed for malformed schedule and deferred feedback without close_at", async () => {
  const { adminId, assessmentId } = await createFixture("reopen-guards");
  const { getDb } = await import("../../lib/db");
  const { suspendAssessment, reopenAssessment } = await import("../../lib/assessments");

  suspendAssessment(assessmentId, adminId, "guard test");
  getDb().prepare(`UPDATE assessments SET open_at = ?, close_at = ? WHERE id = ?`).run("2026-09-17T10:00:00.000Z", "2026-09-17T09:00:00.000Z", assessmentId);
  assert.throws(() => reopenAssessment(assessmentId, adminId), /fenêtre de disponibilité enregistrée est invalide/);
  let row = getDb().prepare(`SELECT status FROM assessments WHERE id = ?`).get(assessmentId) as { status: string };
  assert.equal(row.status, "suspended");

  getDb().prepare(`UPDATE assessments SET open_at = NULL, close_at = NULL, feedback_mode = 'deferred' WHERE id = ?`).run(assessmentId);
  assert.throws(() => reopenAssessment(assessmentId, adminId), /restitution différée/);
  row = getDb().prepare(`SELECT status FROM assessments WHERE id = ?`).get(assessmentId) as { status: string };
  assert.equal(row.status, "suspended");
});
''')

print("patched assessments lifecycle and wrote regression suite")
