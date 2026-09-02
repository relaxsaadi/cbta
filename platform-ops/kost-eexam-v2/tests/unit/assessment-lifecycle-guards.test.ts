import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("assessment lifecycle — server-side transition guards", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft } = await import("../../lib/assessments");
  const {
    suspendAssessment,
    reopenAssessment,
    closeAssessment,
  } = await import("../../lib/assessment-lifecycle");
  const { getDb } = await import("../../lib/db");

  let counter = 0;

  function makeAssessment(initialStatus: "draft" | "published" | "open" | "closed" | "suspended" | "archived") {
    counter += 1;
    const tag = `lifecycle${counter}`;
    const adminId = createUser({
      username: `admin.${tag}`,
      password: "x".repeat(10),
      fullName: "Admin",
      role: "administrator",
    });
    const managerId = createUser({
      username: `manager.${tag}`,
      password: "x".repeat(10),
      fullName: "Manager",
      role: "pedagogical_manager",
    });
    const companyId = createCompany({ name: `Company ${tag}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({
      companyId,
      name: `Group ${tag}`,
      scope: "test",
      pedagogicalManagerId: managerId,
      createdBy: managerId,
    });
    createQuestion({
      kostQuestionId: `LIFECYCLE-${counter}`,
      functionCode: "7.1",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Question de test",
      choices: [
        { key: "A", text: "A" },
        { key: "B", text: "B" },
      ],
      correctAnswer: ["A"],
      createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "exercice",
      name: `Assessment ${tag}`,
      functionCode: "7.1",
      groupId,
      questionSource: "random",
      questionCount: 1,
      durationMinutes: 15,
      passThresholdPct: 80,
      scope: "test",
      createdBy: managerId,
    });
    getDb().prepare(`UPDATE assessments SET status = ? WHERE id = ?`).run(initialStatus, assessmentId);
    return { assessmentId, managerId };
  }

  function statusOf(assessmentId: number): string {
    const row = getDb().prepare(`SELECT status FROM assessments WHERE id = ?`).get(assessmentId) as { status: string };
    return row.status;
  }

  function setSchedule(assessmentId: number, openAt: string | null, closeAt: string | null): void {
    getDb()
      .prepare(`UPDATE assessments SET open_at = ?, close_at = ? WHERE id = ?`)
      .run(openAt, closeAt, assessmentId);
  }

  test("published -> suspended is accepted and audited with the acting role", () => {
    const { assessmentId, managerId } = makeAssessment("published");
    suspendAssessment(assessmentId, managerId, "incident test");
    assert.equal(statusOf(assessmentId), "suspended");

    const row = getDb()
      .prepare(`SELECT result, actor_role, metadata_json FROM audit_logs WHERE action = 'assessment_suspend' AND target_id = ? ORDER BY id DESC LIMIT 1`)
      .get(assessmentId) as { result: string; actor_role: string | null; metadata_json: string };
    assert.equal(row.result, "success");
    assert.equal(row.actor_role, "pedagogical_manager");
    assert.equal(JSON.parse(row.metadata_json).reason, "incident test");
  });

  test("open -> suspended is accepted", () => {
    const { assessmentId, managerId } = makeAssessment("open");
    suspendAssessment(assessmentId, managerId);
    assert.equal(statusOf(assessmentId), "suspended");
  });

  test("suspended -> published is the only reopen transition", () => {
    const { assessmentId, managerId } = makeAssessment("suspended");
    reopenAssessment(assessmentId, managerId);
    assert.equal(statusOf(assessmentId), "published");
  });

  test("suspended reopen accepts a valid future schedule without making it immediately open", () => {
    const { assessmentId, managerId } = makeAssessment("suspended");
    setSchedule(assessmentId, "2030-01-01T09:00:00.000Z", "2030-01-01T10:00:00.000Z");
    reopenAssessment(assessmentId, managerId);
    assert.equal(statusOf(assessmentId), "published");
  });

  test("suspended reopen rejects malformed/equal/reversed legacy schedules fail-closed", () => {
    const cases = [
      { openAt: "not-a-date", closeAt: null, issue: "invalid_open_at" },
      { openAt: null, closeAt: "still-not-a-date", issue: "invalid_close_at" },
      {
        openAt: "2030-01-01T09:00:00.000Z",
        closeAt: "2030-01-01T09:00:00.000Z",
        issue: "non_increasing_window",
      },
      {
        openAt: "2030-01-01T10:00:00.000Z",
        closeAt: "2030-01-01T09:00:00.000Z",
        issue: "non_increasing_window",
      },
    ] as const;

    for (const scenario of cases) {
      const { assessmentId, managerId } = makeAssessment("suspended");
      setSchedule(assessmentId, scenario.openAt, scenario.closeAt);

      assert.throws(() => reopenAssessment(assessmentId, managerId), /planning invalide/);
      assert.equal(statusOf(assessmentId), "suspended");

      const denied = getDb()
        .prepare(`SELECT result, actor_role, metadata_json FROM audit_logs WHERE action = 'assessment_transition_denied' AND target_id = ? ORDER BY id DESC LIMIT 1`)
        .get(assessmentId) as { result: string; actor_role: string | null; metadata_json: string };
      assert.equal(denied.result, "failure");
      assert.equal(denied.actor_role, "pedagogical_manager");
      const metadata = JSON.parse(denied.metadata_json);
      assert.equal(metadata.fromStatus, "suspended");
      assert.equal(metadata.requestedAction, "assessment_reopen");
      assert.equal(metadata.reason, "invalid_schedule");
      assert.equal(metadata.scheduleIssue, scenario.issue);
    }
  });

  test("published/open -> closed are accepted", () => {
    const first = makeAssessment("published");
    closeAssessment(first.assessmentId, first.managerId);
    assert.equal(statusOf(first.assessmentId), "closed");

    const second = makeAssessment("open");
    closeAssessment(second.assessmentId, second.managerId);
    assert.equal(statusOf(second.assessmentId), "closed");
  });

  test("a forged reopen from draft is rejected fail-closed and audited with the acting role", () => {
    const { assessmentId, managerId } = makeAssessment("draft");
    assert.throws(
      () => reopenAssessment(assessmentId, managerId),
      /statut « draft » vers « published »/
    );
    assert.equal(statusOf(assessmentId), "draft");

    const denied = getDb()
      .prepare(`SELECT result, actor_role, metadata_json FROM audit_logs WHERE action = 'assessment_transition_denied' AND target_id = ? ORDER BY id DESC LIMIT 1`)
      .get(assessmentId) as { result: string; actor_role: string | null; metadata_json: string };
    assert.equal(denied.result, "failure");
    assert.equal(denied.actor_role, "pedagogical_manager");
    const metadata = JSON.parse(denied.metadata_json);
    assert.equal(metadata.fromStatus, "draft");
    assert.equal(metadata.requestedStatus, "published");
    assert.equal(metadata.requestedAction, "assessment_reopen");
    assert.equal(metadata.reason, "invalid_status");
  });

  test("invalid suspend/close/reopen transitions never mutate status", () => {
    const draft = makeAssessment("draft");
    assert.throws(() => suspendAssessment(draft.assessmentId, draft.managerId));
    assert.equal(statusOf(draft.assessmentId), "draft");
    assert.throws(() => closeAssessment(draft.assessmentId, draft.managerId));
    assert.equal(statusOf(draft.assessmentId), "draft");

    const suspended = makeAssessment("suspended");
    assert.throws(() => closeAssessment(suspended.assessmentId, suspended.managerId));
    assert.equal(statusOf(suspended.assessmentId), "suspended");

    const closed = makeAssessment("closed");
    assert.throws(() => reopenAssessment(closed.assessmentId, closed.managerId));
    assert.equal(statusOf(closed.assessmentId), "closed");

    const archived = makeAssessment("archived");
    assert.throws(() => reopenAssessment(archived.assessmentId, archived.managerId));
    assert.equal(statusOf(archived.assessmentId), "archived");
  });

  test("missing assessment id is rejected without creating a success audit", () => {
    assert.throws(() => suspendAssessment(999_999_999, 1), /Évaluation introuvable/);
    const row = getDb()
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE target_id = ? AND action = 'assessment_suspend'`)
      .get(999_999_999) as { n: number };
    assert.equal(row.n, 0);
  });
});