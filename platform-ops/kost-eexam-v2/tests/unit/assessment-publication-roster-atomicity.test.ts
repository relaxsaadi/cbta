import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

let fixtureNumber = 0;

async function fixture() {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup, removeCandidateFromGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, listAssignedCandidateIds } = await import("../../lib/assessments");
  const { getDb } = await import("../../lib/db");
  const suffix = `publish-roster-${Date.now()}-${++fixtureNumber}`;
  const admin = createUser({ username: `admin.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "Test Admin", role: "administrator" });
  const allowed = createUser({ username: `allowed.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "Allowed Candidate", role: "candidate" });
  const removed = createUser({ username: `removed.${suffix}`, password: "Synthetic-Test-Password-1!", fullName: "Removed Candidate", role: "candidate" });
  const company = createCompany({ name: `Test Company ${suffix}`, scope: "test", createdBy: admin });
  const group = createGroup({ companyId: company, name: "Test Group", scope: "test", createdBy: admin });
  addCandidateToGroup(group, allowed, admin);
  addCandidateToGroup(group, removed, admin);
  createQuestion({
    kostQuestionId: `TEST-PUBLISH-ROSTER-${suffix}`, functionCode: "7.5", qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Synthetic question",
    choices: [{ key: "A", text: "A" }, { key: "B", text: "B" }],
    correctAnswer: ["A"], createdBy: admin,
  });
  const assessment = createAssessmentDraft({
    type: "examen", name: "Synthetic Publication", functionCode: "7.5", groupId: group,
    questionSource: "random", questionCount: 1, durationMinutes: 30,
    passThresholdPct: 80, scope: "test", createdBy: admin,
  });
  return { admin, allowed, removed, group, assessment, getDb, removeCandidateFromGroup, publishAssessment, listAssignedCandidateIds };
}

test("selected publication refuses the entire batch after membership revocation, with durable denial audit", async () => {
  const f = await fixture();
  const db = f.getDb();
  f.removeCandidateFromGroup(f.group, f.removed);

  assert.throws(
    () => f.publishAssessment(f.assessment, f.admin, { candidateUserIds: [f.allowed, f.removed] }),
    /Ce candidat n'appartient pas au groupe sélectionné/
  );
  const assessment = db.prepare("SELECT status FROM assessments WHERE id = ?").get(f.assessment) as { status: string };
  assert.equal(assessment.status, "draft", "rejected selected batch must not publish");
  assert.deepEqual(f.listAssignedCandidateIds(f.assessment), [], "valid candidate must not be partly assigned");
  const snapshots = db.prepare(
    "SELECT COUNT(*) AS n FROM assessment_question_snapshots WHERE assessment_id = ?"
  ).get(f.assessment) as { n: number };
  assert.equal(snapshots.n, 0, "rejected publication must not freeze question snapshots");
  const audit = db.prepare(
    "SELECT metadata_json FROM audit_logs WHERE target_id = ? AND action = 'assessment_assign_denied' ORDER BY id DESC LIMIT 1"
  ).get(f.assessment) as { metadata_json: string } | undefined;
  assert.ok(audit, "the denial must be audited outside rollback");
  const metadata = JSON.parse(audit.metadata_json) as { invalidCandidateUserIds: number[] };
  assert.deepEqual(metadata.invalidCandidateUserIds, [f.removed]);
});

test("valid selected publication persists only selected members with snapshots and assignment audit", async () => {
  const f = await fixture();
  f.publishAssessment(f.assessment, f.admin, { candidateUserIds: [f.allowed] });
  const db = f.getDb();
  assert.deepEqual(f.listAssignedCandidateIds(f.assessment), [f.allowed]);
  const current = db.prepare("SELECT status FROM assessments WHERE id = ?").get(f.assessment) as { status: string };
  assert.equal(current.status, "published");
  const snapshot = db.prepare(
    "SELECT COUNT(*) AS n FROM assessment_question_snapshots WHERE assessment_id = ?"
  ).get(f.assessment) as { n: number };
  assert.equal(snapshot.n, 1);
  const audit = db.prepare(
    "SELECT metadata_json FROM audit_logs WHERE target_id = ? AND action = 'assessment_assign' ORDER BY id DESC LIMIT 1"
  ).get(f.assessment) as { metadata_json: string };
  const metadata = JSON.parse(audit.metadata_json) as { mode: string; candidateUserIds: number[] };
  assert.equal(metadata.mode, "individual");
  assert.deepEqual(metadata.candidateUserIds, [f.allowed]);
});


test("revocation at the writer-lock boundary is not bypassed by a stale selected-roster check", async () => {
  const f = await fixture();
  const db = f.getDb();
  const originalExec = db.exec.bind(db);
  let revokedAtBoundary = false;

  // Deterministically model an external writer winning between a legacy
  // pre-transaction membership read and BEGIN IMMEDIATE. In the fixed path
  // the membership read occurs AFTER this boundary, under the writer lock.
  db.exec = (sql: string) => {
    if (sql === "BEGIN IMMEDIATE" && !revokedAtBoundary) {
      revokedAtBoundary = true;
      db.prepare("DELETE FROM group_members WHERE group_id = ? AND candidate_user_id = ?")
        .run(f.group, f.removed);
    }
    originalExec(sql);
  };
  try {
    assert.throws(
      () => f.publishAssessment(f.assessment, f.admin, { candidateUserIds: [f.allowed, f.removed] }),
      /Ce candidat n'appartient pas au groupe sélectionné/
    );
  } finally {
    db.exec = originalExec;
  }

  assert.equal(revokedAtBoundary, true, "the synthetic interleaving must actually occur");
  assert.equal(
    (db.prepare("SELECT status FROM assessments WHERE id = ?").get(f.assessment) as { status: string }).status,
    "draft"
  );
  assert.deepEqual(f.listAssignedCandidateIds(f.assessment), []);
  assert.equal(
    (db.prepare("SELECT COUNT(*) AS n FROM assessment_question_snapshots WHERE assessment_id = ?")
      .get(f.assessment) as { n: number }).n,
    0
  );
  assert.ok(
    db.prepare("SELECT 1 FROM audit_logs WHERE target_id = ? AND action = 'assessment_assign_denied'")
      .get(f.assessment),
    "the denial must remain recorded"
  );
});


test("explicitly empty selected roster is rejected without broadening to all candidates", async () => {
  const f = await fixture();
  const db = f.getDb();

  assert.throws(
    () => f.publishAssessment(f.assessment, f.admin, { candidateUserIds: [] }),
    /Sélectionnez au moins un candidat pour une affectation ciblée/
  );
  assert.equal(
    (db.prepare("SELECT status FROM assessments WHERE id = ?").get(f.assessment) as { status: string }).status,
    "draft", "empty selection must not publish an exam"
  );
  assert.deepEqual(f.listAssignedCandidateIds(f.assessment), [], "empty selection must never become whole-group assignment");
  assert.equal(
    (db.prepare("SELECT COUNT(*) AS n FROM assessment_question_snapshots WHERE assessment_id = ?").get(f.assessment) as { n: number }).n,
    0, "empty selection must not freeze any questions"
  );
  const denied = db.prepare(
    "SELECT result, metadata_json FROM audit_logs WHERE target_id = ? AND action = 'assessment_assign_denied' ORDER BY id DESC LIMIT 1"
  ).get(f.assessment) as { result: string; metadata_json: string } | undefined;
  assert.ok(denied, "empty selection refusal must leave durable audit evidence");
  assert.equal(denied.result, "failure");
  const metadata = JSON.parse(denied.metadata_json) as { reason: string; requestedCandidateUserIds: number[] };
  assert.equal(metadata.reason, "explicit_empty_candidate_selection");
  assert.deepEqual(metadata.requestedCandidateUserIds, []);
});

test("omitted candidate roster retains intentional whole-group publication", async () => {
  const f = await fixture();
  f.publishAssessment(f.assessment, f.admin);
  assert.deepEqual(f.listAssignedCandidateIds(f.assessment).sort((a, b) => a - b), [f.allowed, f.removed].sort((a, b) => a - b));
  const db = f.getDb();
  assert.equal(
    (db.prepare("SELECT status FROM assessments WHERE id = ?").get(f.assessment) as { status: string }).status,
    "published"
  );
});
