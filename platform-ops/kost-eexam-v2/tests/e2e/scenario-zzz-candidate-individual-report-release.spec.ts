import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Direct candidate-route regression for issue #68. This uses only the
// disposable Playwright SQLite database and synthetic test-scope content.
process.env.DB_PATH = "./data/e2e-test.db";

function uniqueTag() {
  return `report${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function setupManualAttempt() {
  const { createUser, findUserByUsername } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, getAttemptQuestions, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { getAttemptDetail } = await import("../../lib/results");
  const { getDb } = await import("../../lib/db");

  const t = uniqueTag();
  const admin = findUserByUsername("admin")!;
  const managerUsername = `${t}.mgr`;
  const candidateUsername = `${t}.cand`;
  const password = "x".repeat(10);
  const managerId = createUser({
    username: managerUsername,
    password,
    fullName: `Responsable ${t}`,
    role: "pedagogical_manager",
  });
  const companyId = createCompany({ name: `Report Co ${t}`, scope: "test", createdBy: admin.id });
  const groupId = createGroup({
    companyId,
    name: `Report Group ${t}`,
    scope: "test",
    pedagogicalManagerId: managerId,
    createdBy: admin.id,
  });
  const candidateId = createUser({
    username: candidateUsername,
    password,
    fullName: `Candidat ${t}`,
    role: "candidate",
  });
  addCandidateToGroup(groupId, candidateId, admin.id);

  const questionStem = `[${t}] Question à correction manuelle.`;
  const questionId = createQuestion({
    kostQuestionId: `Q-7.5-${t}-SA`,
    functionCode: "7.5",
    qtype: "short_answer",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: questionStem,
    choices: [],
    correctAnswer: { mode: "manual" },
    createdBy: admin.id,
  });
  const assessmentId = createAssessmentDraft({
    type: "test",
    name: `Report Gate Exam ${t}`,
    functionCode: "7.5",
    groupId,
    questionSource: "manual",
    manualQuestionIds: [questionId],
    questionCount: 1,
    durationMinutes: 30,
    passThresholdPct: 80,
    scope: "test",
    createdBy: admin.id,
  });
  publishAssessment(assessmentId, admin.id, { candidateUserIds: [candidateId] });

  const db = getDb();
  db.prepare(
    "UPDATE assessments SET show_result = 1, show_correct_answers = 1, feedback_mode = 'immediate', close_at = NULL WHERE id = ?"
  ).run(assessmentId);

  const attempt = startAttempt(assessmentId, candidateId, {});
  const question = getAttemptQuestions(attempt.id).find((q) => q.qtype === "short_answer");
  if (!question) throw new Error("Expected one short-answer attempt question");

  return {
    db,
    assessmentId,
    attemptId: attempt.id,
    managerUsername,
    candidateUsername,
    candidateName: `Candidat ${t}`,
    questionStem,
    password,
    submit: () => {
      saveAnswer(attempt.id, candidateId, question.attempt_question_id, [`Réponse candidat ${t}`]);
      submitAttempt(attempt.id, candidateId);
    },
    gradingState: () => getAttemptDetail(attempt.id)?.grading_state ?? null,
  };
}

test("candidate detailed individual PDF is denied live/pending and released only after grading + configured feedback", async ({ page }) => {
  const fixture = await setupManualAttempt();
  const reportUrl = `/api/reports/individual/${fixture.attemptId}?level=detailed`;

  // The same candidate's attempt is still in progress: immediate feedback and
  // both visibility switches must not reveal the keyed detailed PDF.
  await loginAs(page, fixture.candidateUsername, fixture.password);
  const inProgress = await page.request.get(reportUrl);
  expect(inProgress.status()).toBe(403);
  expect(inProgress.headers()["content-type"] ?? "").not.toContain("application/pdf");
  expect((await inProgress.text())).not.toContain(fixture.questionStem);

  // Submission creates AWAITING_MANUAL_REVIEW for this short-answer item.
  // A submitted timestamp alone is still not sufficient to release correction.
  fixture.submit();
  expect(fixture.gradingState()).toBe("AWAITING_MANUAL_REVIEW");
  const awaitingReview = await page.request.get(reportUrl);
  expect(awaitingReview.status()).toBe(403);
  expect(awaitingReview.headers()["content-type"] ?? "").not.toContain("application/pdf");
  expect((await awaitingReview.text())).not.toContain(fixture.questionStem);

  // The authorized manager completes the real UI grading action in its own group.
  await page.context().clearCookies();
  await loginAs(page, fixture.managerUsername, fixture.password);
  await page.goto("/grading");
  const card = page
    .locator("div.rounded-md.border.border-border-subtle.p-3\\.5", { hasText: fixture.candidateName })
    .filter({ hasText: fixture.questionStem })
    .first();
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Correcte", exact: true }).click();
  await page.waitForURL(/\/grading\?graded=1&finalized=1/);
  expect(fixture.gradingState()).toBe("COMPLETE");

  await page.context().clearCookies();
  await loginAs(page, fixture.candidateUsername, fixture.password);

  // Completed grading is still insufficient if the administrator has not
  // enabled the separate answer-key release switch.
  fixture.db.prepare("UPDATE assessments SET show_correct_answers = 0 WHERE id = ?").run(fixture.assessmentId);
  const answerKeyDisabled = await page.request.get(reportUrl);
  expect(answerKeyDisabled.status()).toBe(403);
  expect(answerKeyDisabled.headers()["content-type"] ?? "").not.toContain("application/pdf");

  // Deferred feedback remains authoritative even after grading is complete.
  const future = new Date(Date.now() + 60_000).toISOString();
  fixture.db.prepare(
    "UPDATE assessments SET show_correct_answers = 1, feedback_mode = 'deferred', close_at = ? WHERE id = ?"
  ).run(future, fixture.assessmentId);
  const deferred = await page.request.get(reportUrl);
  expect(deferred.status()).toBe(403);
  expect(deferred.headers()["content-type"] ?? "").not.toContain("application/pdf");

  // After the configured release boundary, every gate is satisfied.
  const past = new Date(Date.now() - 60_000).toISOString();
  fixture.db.prepare("UPDATE assessments SET close_at = ? WHERE id = ?").run(past, fixture.assessmentId);
  const released = await page.request.get(reportUrl);
  expect(released.status()).toBe(200);
  expect(released.headers()["content-type"]).toContain("application/pdf");
  expect(released.headers()["cache-control"]).toContain("private");
  expect(released.headers()["cache-control"]).toContain("no-store");
  const pdf = await released.body();
  expect(pdf.byteLength).toBeGreaterThan(1000);
  expect(pdf.subarray(0, 4).toString("ascii")).toBe("%PDF");
});
