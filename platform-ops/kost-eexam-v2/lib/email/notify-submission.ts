// Orchestration EXAM_SUBMITTED / EXAM_SUBMITTED_ADMIN (mission "COMPLETE
// CANDIDATE EXAM LIFECYCLE", 2026-08-29, §31-36) — même principe que
// lib/email/notify-result.ts : appelée APRÈS coup par la Server Action de
// soumission, jamais dans la transaction de soumission/notation elle-même.
// Pas de garde "server-only" — voir lib/email/audit.ts pour la
// justification (module de domaine, doit rester testable via node:test).
import { getDb } from "../db";
import { findUserById } from "../users";
import { getGroup } from "../groups";
import { functionLabel } from "../questions";
import { getAdminAlertRecipient } from "./config";
import { notifyExamSubmitted, notifyExamSubmittedAdmin } from "./events";

/** Libellé FR du statut au moment de l'envoi (§21/§38 — même vocabulaire
 * que les pages admin/candidat) — jamais le code brut de statut. */
function submissionStatusLabel(gradingState: "COMPLETE" | "AWAITING_MANUAL_REVIEW"): string {
  return gradingState === "AWAITING_MANUAL_REVIEW" ? "En attente de correction" : "Résultat disponible";
}

export async function notifySubmissionEvents(attemptId: number): Promise<void> {
  const db = getDb();
  const attempt = db.prepare(`SELECT id, assessment_id, candidate_user_id, submitted_at FROM attempts WHERE id = ?`).get(attemptId) as
    | { id: number; assessment_id: number; candidate_user_id: number; submitted_at: string | null }
    | undefined;
  if (!attempt || !attempt.submitted_at) return;

  const result = db.prepare(`SELECT grading_state FROM results WHERE attempt_id = ?`).get(attemptId) as { grading_state: "COMPLETE" | "AWAITING_MANUAL_REVIEW" } | undefined;
  if (!result) return; // notation pas encore écrite — ne devrait pas arriver, appelée après gradeAttempt()

  const assessment = db.prepare(`SELECT name, function_code, group_id FROM assessments WHERE id = ?`).get(attempt.assessment_id) as
    | { name: string; function_code: string; group_id: number }
    | undefined;
  if (!assessment) return;

  const candidate = findUserById(attempt.candidate_user_id);
  const group = getGroup(assessment.group_id);
  if (!group) return;

  const statusLabel = submissionStatusLabel(result.grading_state);
  const fnLabel = functionLabel(assessment.function_code);

  // Confirmation candidat (§31) — toujours, indépendamment de grading_state.
  if (candidate?.email) {
    const firstName = candidate.full_name.split(/\s+/)[0] ?? candidate.full_name;
    await notifyExamSubmitted({
      userId: candidate.id,
      email: candidate.email,
      firstName,
      username: candidate.username,
      examName: assessment.name,
      functionLabel: fnLabel,
      submittedAt: attempt.submitted_at,
      statusLabel,
      companyId: group.company_id,
      companyName: group.company_name,
    });
  }

  // Notification staff (§34-36) — responsable pédagogique du groupe +
  // alerte admin configurée, dédupliqués par adresse. JAMAIS une seule
  // adresse personnelle codée en dur (§34 dernière ligne).
  const recipients = new Map<string, number | null>();
  if (group.pedagogical_manager_id) {
    const manager = findUserById(group.pedagogical_manager_id);
    if (manager?.email) recipients.set(manager.email.toLowerCase(), manager.id);
  }
  const adminAlert = getAdminAlertRecipient();
  if (adminAlert) recipients.set(adminAlert.toLowerCase(), null);

  if (candidate) {
    for (const [email, recipientUserId] of recipients) {
      await notifyExamSubmittedAdmin({
        recipientUserId,
        recipientEmail: email,
        attemptId,
        candidateName: candidate.full_name,
        candidateUsername: candidate.username,
        companyId: group.company_id,
        companyName: group.company_name,
        groupName: group.name,
        examName: assessment.name,
        functionLabel: fnLabel,
        submittedAt: attempt.submitted_at,
        statusLabel,
      });
    }
  }
}
