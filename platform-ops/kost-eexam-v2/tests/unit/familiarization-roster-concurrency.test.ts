import { before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

type OperationKind = "add" | "remove" | "session";
type OperationResult = { ok: true; id?: number } | { ok: false; error: string };

type IndependentOperation = {
  ready: Promise<void>;
  done: Promise<OperationResult>;
};

function runIndependentOperation(
  kind: OperationKind,
  groupId: number,
  candidateUserId: number,
  actorUserId: number,
  holdInsideWriteTransaction = false
): IndependentOperation {
  const groupsUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/groups.ts")).href;
  const familiarizationUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/familiarization.ts")).href;
  const dbUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/db.ts")).href;
  const script = `
    import { writeSync } from "node:fs";
    import { addCandidateToGroup, removeCandidateFromGroup } from ${JSON.stringify(groupsUrl)};
    import { createFamiliarizationSession } from ${JSON.stringify(familiarizationUrl)};
    import { getDb } from ${JSON.stringify(dbUrl)};

    const kind = process.env.KOST_TEST_OPERATION;
    const groupId = Number(process.env.KOST_TEST_GROUP_ID);
    const candidateUserId = Number(process.env.KOST_TEST_CANDIDATE_ID);
    const actorUserId = Number(process.env.KOST_TEST_ACTOR_ID);
    const hold = process.env.KOST_TEST_HOLD === "1";

    if (hold) {
      const db = getDb();
      const waitCell = new Int32Array(new SharedArrayBuffer(4));
      db.function("kost_test_hold_writer", () => {
        writeSync(1, "LOCKED\\n");
        Atomics.wait(waitCell, 0, 0, 500);
        return 0;
      });

      if (kind === "remove") {
        db.exec(\`
          CREATE TEMP TRIGGER hold_familiarization_member_remove
          BEFORE DELETE ON group_members
          WHEN OLD.group_id = \${groupId}
           AND OLD.candidate_user_id = \${candidateUserId}
          BEGIN
            SELECT kost_test_hold_writer();
          END;
        \`);
      } else if (kind === "add") {
        db.exec(\`
          CREATE TEMP TRIGGER hold_familiarization_member_add
          BEFORE INSERT ON group_members
          WHEN NEW.group_id = \${groupId}
           AND NEW.candidate_user_id = \${candidateUserId}
          BEGIN
            SELECT kost_test_hold_writer();
          END;
        \`);
      } else {
        db.exec(\`
          CREATE TEMP TRIGGER hold_familiarization_session_insert
          BEFORE INSERT ON familiarization_sessions
          WHEN NEW.group_id = \${groupId}
          BEGIN
            SELECT kost_test_hold_writer();
          END;
        \`);
      }
    }

    try {
      if (kind === "remove") {
        removeCandidateFromGroup(groupId, candidateUserId);
        writeSync(1, "RESULT " + JSON.stringify({ ok: true }) + "\\n");
      } else if (kind === "add") {
        addCandidateToGroup(groupId, candidateUserId, actorUserId);
        writeSync(1, "RESULT " + JSON.stringify({ ok: true }) + "\\n");
      } else {
        const sessionId = createFamiliarizationSession({
          groupId,
          functionCode: "7.1",
          heldAt: "2026-09-20T09:30:00.000Z",
          audience: "candidats",
          organizedBy: actorUserId,
          organizerRole: "pedagogical_manager",
        });
        writeSync(1, "RESULT " + JSON.stringify({ ok: true, id: sessionId }) + "\\n");
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
        KOST_TEST_GROUP_ID: String(groupId),
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

let seq = 0;

async function createFixture() {
  seq += 1;
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");

  const managerId = createUser({
    username: `fam.concurrent.manager.${seq}`,
    password: `Strong-Test-Password-${seq}!`,
    fullName: `Fam Concurrent Manager ${seq}`,
    role: "pedagogical_manager",
  });
  const initialCandidateId = createUser({
    username: `fam.concurrent.initial.${seq}`,
    password: `Strong-Test-Password-${seq}!`,
    fullName: `Fam Concurrent Initial ${seq}`,
    role: "candidate",
    email: `fam.concurrent.initial.${seq}@example.test`,
  });
  const addedCandidateId = createUser({
    username: `fam.concurrent.added.${seq}`,
    password: `Strong-Test-Password-${seq}!`,
    fullName: `Fam Concurrent Added ${seq}`,
    role: "candidate",
    email: `fam.concurrent.added.${seq}@example.test`,
  });
  const companyId = createCompany({ name: `Fam Concurrent Company ${seq}`, scope: "test", createdBy: managerId });
  const groupId = createGroup({
    companyId,
    name: `Fam Concurrent Group ${seq}`,
    scope: "test",
    pedagogicalManagerId: managerId,
    createdBy: managerId,
  });
  addCandidateToGroup(groupId, initialCandidateId, managerId);
  return { managerId, initialCandidateId, addedCandidateId, groupId };
}

async function committedRoster(sessionId: number): Promise<number[]> {
  const { getDb } = await import("../../lib/db");
  const rows = getDb()
    .prepare(`SELECT candidate_user_id FROM familiarization_attendance WHERE session_id = ? ORDER BY candidate_user_id`)
    .all(sessionId) as Array<{ candidate_user_id: number }>;
  return rows.map((row) => row.candidate_user_id);
}

async function liveMembers(groupId: number): Promise<number[]> {
  const { getDb } = await import("../../lib/db");
  const rows = getDb()
    .prepare(`SELECT candidate_user_id FROM group_members WHERE group_id = ? ORDER BY candidate_user_id`)
    .all(groupId) as Array<{ candidate_user_id: number }>;
  return rows.map((row) => row.candidate_user_id);
}

test("membership removal wins first: waiting session sees the committed removal", async () => {
  const fixture = await createFixture();
  const winner = runIndependentOperation(
    "remove",
    fixture.groupId,
    fixture.initialCandidateId,
    fixture.managerId,
    true
  );

  await winner.ready;
  const waitingSession = runIndependentOperation(
    "session",
    fixture.groupId,
    fixture.initialCandidateId,
    fixture.managerId,
    false
  );
  const [winnerResult, sessionResult] = await Promise.all([winner.done, waitingSession.done]);

  assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
  assert.equal(sessionResult.ok, true, JSON.stringify(sessionResult));
  assert.ok(sessionResult.ok && sessionResult.id, JSON.stringify(sessionResult));
  assert.deepEqual(await liveMembers(fixture.groupId), []);
  assert.deepEqual(await committedRoster(sessionResult.id!), [], "later session must not roster a member whose removal committed first");
});

test("membership addition wins first: waiting session includes the newly committed candidate", async () => {
  const fixture = await createFixture();
  const winner = runIndependentOperation(
    "add",
    fixture.groupId,
    fixture.addedCandidateId,
    fixture.managerId,
    true
  );

  await winner.ready;
  const waitingSession = runIndependentOperation(
    "session",
    fixture.groupId,
    fixture.addedCandidateId,
    fixture.managerId,
    false
  );
  const [winnerResult, sessionResult] = await Promise.all([winner.done, waitingSession.done]);

  assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
  assert.equal(sessionResult.ok, true, JSON.stringify(sessionResult));
  assert.ok(sessionResult.ok && sessionResult.id, JSON.stringify(sessionResult));

  const expected = [fixture.initialCandidateId, fixture.addedCandidateId].sort((a, b) => a - b);
  assert.deepEqual(await liveMembers(fixture.groupId), expected);
  assert.deepEqual(
    await committedRoster(sessionResult.id!),
    expected,
    "later session must include a candidate whose addition committed first"
  );
});

test("session writer wins first: later membership removal cannot rewrite its historical roster", async () => {
  const fixture = await createFixture();
  const winner = runIndependentOperation(
    "session",
    fixture.groupId,
    fixture.initialCandidateId,
    fixture.managerId,
    true
  );

  await winner.ready;
  const waitingRemoval = runIndependentOperation(
    "remove",
    fixture.groupId,
    fixture.initialCandidateId,
    fixture.managerId,
    false
  );
  const [sessionResult, removalResult] = await Promise.all([winner.done, waitingRemoval.done]);

  assert.equal(sessionResult.ok, true, JSON.stringify(sessionResult));
  assert.ok(sessionResult.ok && sessionResult.id, JSON.stringify(sessionResult));
  assert.equal(removalResult.ok, true, JSON.stringify(removalResult));
  assert.deepEqual(await liveMembers(fixture.groupId), []);
  assert.deepEqual(
    await committedRoster(sessionResult.id!),
    [fixture.initialCandidateId],
    "session roster must stay frozen after a later group-membership removal"
  );
});
