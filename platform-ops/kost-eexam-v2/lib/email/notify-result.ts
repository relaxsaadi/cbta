// RESULT_AVAILABLE (mission email §24) — orchestration partagée entre la
// soumission manuelle (app/(app)/exam/[assessmentId]/attempt/actions.ts)
// et le balayage cron des tentatives expirées
// (app/api/attempts/sweep/route.ts). lib/attempts.ts::submitAttempt reste
// synchrone (aucune dépendance email dedans, voir son propre commentaire) —
// c'est CET appelant qui lit le résultat déjà écrit par gradeAttempt() et
// déclenche la notification, après coup, jamais dans la transaction de
// notation elle-même.
// Pas de garde "server-only" — voir lib/email/audit.ts pour la
// justification (module de domaine, doit rester testable via node:test).
import { getDb } from "../db";
import { findUserById } from "../users";
import { getGroup } from "../groups";
import { functionLabel } from "../questions";
import { getResultEmailPolicy } from "./result-policy";
import { notifyResultAvailable } from "./events";

interface ResultRow {
  score_100: number;
  percentage: number;
  pass_threshold_pct: number;
  passed: number;
  grading_state: "COMPLETE" | "AWAITING_MANUAL_REVIEW";
}

export async function notifyResultAvailableForAttempt(attemptId: number): Promise<void> {
  const db = getDb();
  const attempt = db.prepare(`SELECT id, assessment_id, candidate_user_id FROM attempts WHERE id = ?`).get(attemptId) as
    | { id: number; assessment_id: number; candidate_user_id: number }
    | undefined;
  if (!attempt) return;

  const result = db.prepare(`SELECT score_100, percentage, pass_threshold_pct, passed, grading_state FROM results WHERE attempt_id = ?`).get(attemptId) as ResultRow | undefined;
  if (!result) return; // notation pas encore écrite (ne devrait pas arriver — appelé après gradeAttempt) — silencieux, rien à notifier
  // Défense en profondeur (mission "COMPLETE CANDIDATE EXAM LIFECYCLE"
  // §26-30) — chaque appelant est déjà censé ne JAMAIS appeler cette
  // fonction tant qu'une correction manuelle est en attente, mais cette
  // garde interne empêche structurellement un futur appelant d'envoyer un
  // "résultat disponible" prématuré même s'il oublie cette vérification.
  if (result.grading_state === "AWAITING_MANUAL_REVIEW") return;

  const assessment = db.prepare(`SELECT name, function_code, group_id FROM assessments WHERE id = ?`).get(attempt.assessment_id) as
    | { name: string; function_code: string; group_id: number }
    | undefined;
  if (!assessment) return;

  const candidate = findUserById(attempt.candidate_user_id);
  if (!candidate?.email) return;

  const group = getGroup(assessment.group_id);
  if (!group) return;

  const policy = getResultEmailPolicy();
  const firstName = candidate.full_name.split(/\s+/)[0] ?? candidate.full_name;

  await notifyResultAvailable({
    userId: candidate.id,
    email: candidate.email,
    firstName,
    attemptId,
    examName: assessment.name,
    functionLabel: functionLabel(assessment.function_code),
    companyId: group.company_id,
    companyName: group.company_name,
    policy,
    passed: result.passed === 1,
    score100: result.score_100,
    percentage: result.percentage,
    passThresholdPct: result.pass_threshold_pct,
  });
}
