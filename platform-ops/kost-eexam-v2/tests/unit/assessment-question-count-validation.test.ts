import { before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

test("forged draft counts cannot create an empty, negative, fractional, or non-finite exam", async () => {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft } = await import("../../lib/assessments");
  const { getDb } = await import("../../lib/db");

  const suffix = `count-integrity-${Date.now()}`;
  const admin = createUser({
    username: `admin.${suffix}`,
    password: "Synthetic-Test-Password-1!",
    fullName: "Synthetic Admin",
    role: "administrator",
  });
  const company = createCompany({ name: `Synthetic Count Company ${suffix}`, scope: "test", createdBy: admin });
  const groupId = createGroup({ companyId: company, name: "Synthetic Count Group", scope: "test", createdBy: admin });
  createQuestion({
    kostQuestionId: `TEST-COUNT-INTEGRITY-${suffix}`,
    functionCode: "7.8",
    qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: "Synthetic count fixture",
    choices: [{ key: "A", text: "A" }, { key: "B", text: "B" }],
    correctAnswer: ["A"],
    createdBy: admin,
  });

  const draft = (questionCount: number) => createAssessmentDraft({
    type: "examen",
    name: "Synthetic Count Validation",
    functionCode: "7.8",
    groupId,
    questionSource: "random",
    questionCount,
    durationMinutes: 30,
    passThresholdPct: 80,
    scope: "test",
    createdBy: admin,
  });

  for (const invalid of [0, -1, -4, 0.5, 1.5, Number.NaN, Infinity, -Infinity]) {
    assert.throws(
      () => draft(invalid),
      /Nombre de questions invalide : entier strictement positif requis/,
      `expected invalid questionCount=${String(invalid)} to fail closed`,
    );
  }
  const db = getDb();
  const beforeCount = (db.prepare("SELECT COUNT(*) AS n FROM assessments WHERE group_id = ?").get(groupId) as { n: number }).n;
  assert.equal(beforeCount, 0, "invalid counts must leave no draft records");
  const goodId = draft(1);
  assert.ok(goodId > 0);
  const row = db.prepare("SELECT question_count, status FROM assessments WHERE id = ?").get(goodId) as {
    question_count: number; status: string;
  };
  assert.equal(row.question_count, 1);
  assert.equal(row.status, "draft");
});
