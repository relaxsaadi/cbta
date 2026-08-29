import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §2/§5-7 —
// computeCandidateExamState() est une fonction pure : couverture
// exhaustive des 9 états possibles + la politique NULL open_at/close_at,
// sans dépendre de la page /mes-examens elle-même.
describe("État candidat explicite par examen — lib/candidate-exam-state.ts", async () => {
  before(() => setupTestDb());

  const { computeCandidateExamState, getLatestAttemptInfo } = await import("../../lib/candidate-exam-state");
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { getDb } = await import("../../lib/db");

  const NO_ATTEMPT = { attemptId: null, status: null, gradingState: null };
  function base(overrides: Partial<{ status: string; open_at: string | null; close_at: string | null; attempts_allowed: number }> = {}) {
    return { status: "published", open_at: null, close_at: null, attempts_allowed: 1, ...overrides } as never;
  }

  test("suspended — jamais silencieusement filtré, badge SUSPENDU sans CTA", () => {
    const s = computeCandidateExamState(base({ status: "suspended" }), NO_ATTEMPT, 0);
    assert.equal(s.kind, "suspended");
    assert.equal(s.label, "SUSPENDU");
    assert.equal(s.cta, null);
  });

  test("draft (jamais publié) — NON DISPONIBLE, sans CTA", () => {
    const s = computeCandidateExamState(base({ status: "draft" }), NO_ATTEMPT, 0);
    assert.equal(s.kind, "not_published");
    assert.equal(s.cta, null);
  });

  test("closed administrativement, jamais tenté — DATE LIMITE DÉPASSÉE (cas réel Brahimi #31, jamais un badge générique)", () => {
    const s = computeCandidateExamState(base({ status: "closed" }), NO_ATTEMPT, 0);
    assert.equal(s.kind, "window_closed");
    assert.equal(s.label, "DATE LIMITE DÉPASSÉE");
  });

  test("tentative in_progress — EN COURS, CTA Reprendre l'examen (jamais Commencer, jamais une nouvelle tentative)", () => {
    const s = computeCandidateExamState(base(), { attemptId: 42, status: "in_progress", gradingState: null }, 0);
    assert.equal(s.kind, "in_progress");
    assert.equal(s.label, "EN COURS");
    assert.deepEqual(s.cta, { label: "Reprendre l'examen", kind: "resume" });
  });

  test("dernière tentative soumise, correction manuelle en attente — EN ATTENTE DE CORRECTION, sans CTA (jamais un résultat prématuré)", () => {
    const s = computeCandidateExamState(base(), { attemptId: 42, status: "submitted", gradingState: "AWAITING_MANUAL_REVIEW" }, 1);
    assert.equal(s.kind, "awaiting_review");
    assert.equal(s.cta, null);
    assert.match(s.reason ?? "", /nécessite une correction/);
  });

  test("dernière tentative soumise, notation complète — RÉSULTAT DISPONIBLE, CTA Voir mon résultat", () => {
    const s = computeCandidateExamState(base(), { attemptId: 42, status: "submitted", gradingState: "COMPLETE" }, 1);
    assert.equal(s.kind, "result_available");
    assert.deepEqual(s.cta, { label: "Voir mon résultat", kind: "view_result" });
  });

  test("tentatives épuisées (attempts_allowed=1, 1 terminée sans résultat exploitable) — TERMINÉ", () => {
    const s = computeCandidateExamState(base({ attempts_allowed: 1 }), { attemptId: 42, status: "abandoned", gradingState: null }, 1);
    assert.equal(s.kind, "finished");
  });

  test("attempts_allowed=0 (illimité) — jamais TERMINÉ même avec des tentatives précédentes non exploitables", () => {
    const s = computeCandidateExamState(base({ attempts_allowed: 0 }), { attemptId: 42, status: "abandoned", gradingState: null }, 5);
    assert.notEqual(s.kind, "finished");
  });

  test("politique NULL open_at explicite — NULL = disponible immédiatement (jamais NOT_YET_OPEN)", () => {
    const s = computeCandidateExamState(base({ open_at: null }), NO_ATTEMPT, 0);
    assert.equal(s.kind, "available");
    assert.deepEqual(s.cta, { label: "Commencer l'examen", kind: "start" });
  });

  test("politique NULL close_at explicite — NULL = pas de date limite (jamais WINDOW_CLOSED)", () => {
    const s = computeCandidateExamState(base({ close_at: null }), NO_ATTEMPT, 0);
    assert.equal(s.kind, "available");
  });

  test("open_at futur — DISPONIBLE À PARTIR DU..., sans CTA", () => {
    const future = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const s = computeCandidateExamState(base({ open_at: future }), NO_ATTEMPT, 0);
    assert.equal(s.kind, "not_yet_open");
    assert.match(s.label, /^DISPONIBLE À PARTIR DU /);
    assert.equal(s.cta, null);
  });

  test("close_at passé, jamais tenté — DATE LIMITE DÉPASSÉE", () => {
    const past = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const s = computeCandidateExamState(base({ close_at: past }), NO_ATTEMPT, 0);
    assert.equal(s.kind, "window_closed");
  });

  test("fenêtre ouverte, jamais tenté, tentatives restantes — À COMMENCER, CTA Commencer l'examen", () => {
    const s = computeCandidateExamState(base(), NO_ATTEMPT, 0);
    assert.equal(s.kind, "available");
    assert.equal(s.label, "À COMMENCER");
    assert.deepEqual(s.cta, { label: "Commencer l'examen", kind: "start" });
  });

  test("status='open' (variante explicite de published) est également considéré ouvert", () => {
    const s = computeCandidateExamState(base({ status: "open" }), NO_ATTEMPT, 0);
    assert.equal(s.kind, "available");
  });

  test("getLatestAttemptInfo — lit réellement la dernière tentative (statut + grading_state) depuis la base", async () => {
    let ctr = 0;
    const t = () => `ces${++ctr}`;
    const tag = t();
    const adminId = createUser({ username: `${tag}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${tag}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${tag}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${tag}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    const qid = createQuestion({
      kostQuestionId: `TEST-${tag}-1`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${tag}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [qid], questionCount: 1, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), closeAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);

    assert.deepEqual(getLatestAttemptInfo(assessmentId, candidateId), NO_ATTEMPT, "aucune tentative encore — jamais une valeur fabriquée");

    const attempt = startAttempt(assessmentId, candidateId, {});
    const inProgress = getLatestAttemptInfo(assessmentId, candidateId);
    assert.equal(inProgress.attemptId, attempt.id);
    assert.equal(inProgress.status, "in_progress");

    const aq = getDb().prepare(`SELECT id FROM attempt_questions WHERE attempt_id = ?`).get(attempt.id) as { id: number };
    saveAnswer(attempt.id, candidateId, aq.id, ["A"]);
    submitAttempt(attempt.id, candidateId);
    const done = getLatestAttemptInfo(assessmentId, candidateId);
    assert.equal(done.status, "submitted");
    assert.equal(done.gradingState, "COMPLETE");
  });
});
