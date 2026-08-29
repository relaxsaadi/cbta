import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { guardPage, requireWriteRole } from "@/lib/rbac";
import { getAssessment, trackingForAssessment, suspendAssessment, reopenAssessment, closeAssessment, listAssignedCandidateIds } from "@/lib/assessments";
import { functionLabel } from "@/lib/questions";
import { getGroup, listGroupMembers } from "@/lib/groups";
import { hasAssessmentAccess, assertAccess } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { PublishAssessmentForm } from "./PublishAssessmentForm";
import { AssignMoreCandidatesForm } from "./AssignMoreCandidatesForm";
import { RescheduleAssessmentForm } from "./RescheduleAssessmentForm";
import { unassignCandidateAction } from "../actions";

// Mission "COMPLETE REAL EXAM RESCHEDULING WORKFLOW" (2026-08-29) — mêmes
// statuts que RESCHEDULABLE_STATUSES côté lib/assessments.ts (jamais
// affiché le formulaire pour un statut que le serveur refuserait de toute
// façon — évite une erreur systématique après un clic).
const RESCHEDULABLE_STATUSES = new Set(["published", "open", "closed"]);

const STATUS_BADGE: Record<string, "verified" | "warning" | "critical" | "neutral"> = {
  draft: "neutral", published: "verified", open: "verified", closed: "neutral", suspended: "critical", archived: "neutral",
};

const ATTEMPT_STATUS_LABEL: Record<string, string> = {
  in_progress: "En cours", submitted: "Terminé", auto_submitted: "Terminé (auto)", abandoned: "Abandonné",
};

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { id } = await params;
  const assessmentId = Number(id);
  const assessment = getAssessment(assessmentId);
  // Voir lib/tenant-scope.ts : introuvable, pas "refusé", pour une
  // évaluation hors périmètre.
  if (!assessment || !hasAssessmentAccess(session, assessmentId)) notFound();
  const group = getGroup(assessment.group_id);
  const canWrite = session.role !== "auditor";
  const tracking = trackingForAssessment(assessmentId) as {
    candidate_user_id: number; full_name: string; username: string; attempt_id: number | null;
    attempt_status: string | null; started_at: string | null; submitted_at: string | null;
    score_100: number | null; percentage: number | null; passed: number | null;
    grading_state: "COMPLETE" | "AWAITING_MANUAL_REVIEW" | null;
  }[];

  const notStarted = tracking.filter((t) => !t.attempt_status).length;
  const inProgress = tracking.filter((t) => t.attempt_status === "in_progress").length;
  const awaitingReview = tracking.filter((t) => t.grading_state === "AWAITING_MANUAL_REVIEW").length;
  const finished = tracking.filter((t) => t.attempt_status && t.attempt_status !== "in_progress" && t.grading_state !== "AWAITING_MANUAL_REVIEW").length;

  const groupMembers = listGroupMembers(assessment.group_id);
  const assignedIds = new Set(listAssignedCandidateIds(assessmentId));
  const unassignedMembers = groupMembers.filter((m) => !assignedIds.has(m.candidate_user_id));

  async function doSuspend() {
    "use server";
    const s = await requireWriteRole("pedagogical_manager", "administrator");
    assertAccess(hasAssessmentAccess(s, assessmentId));
    suspendAssessment(assessmentId, s.userId, "Suspension manuelle depuis la fiche évaluation");
    revalidatePath(`/exam-preparation/${assessmentId}`);
  }
  async function doReopen() {
    "use server";
    const s = await requireWriteRole("pedagogical_manager", "administrator");
    assertAccess(hasAssessmentAccess(s, assessmentId));
    reopenAssessment(assessmentId, s.userId);
    revalidatePath(`/exam-preparation/${assessmentId}`);
  }
  async function doClose() {
    "use server";
    const s = await requireWriteRole("pedagogical_manager", "administrator");
    assertAccess(hasAssessmentAccess(s, assessmentId));
    closeAssessment(assessmentId, s.userId);
    revalidatePath(`/exam-preparation/${assessmentId}`);
  }
  async function doUnassign(formData: FormData) {
    "use server";
    await unassignCandidateAction(assessmentId, Number(formData.get("candidateUserId")));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">{assessment.name}</h1>
          <p className="mt-1 text-[13px] text-text-tertiary capitalize">
            {assessment.type} — {functionLabel(assessment.function_code)} — {group?.company_name} / {group?.name}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {assessment.status !== "draft" && (
            <Link href={`/exam-preparation/${assessmentId}/rapport-global`} className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
              Rapport global
            </Link>
          )}
          <StatusBadge status={STATUS_BADGE[assessment.status] ?? "neutral"}>{assessment.status}</StatusBadge>
        </div>
      </div>

      <Card>
        <CardHeader title="Récapitulatif" />
        <dl className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
          <div><dt className="text-text-tertiary">Questions</dt><dd className="font-medium text-text-primary">{assessment.question_count}</dd></div>
          <div><dt className="text-text-tertiary">Durée</dt><dd className="font-medium text-text-primary">{assessment.duration_minutes} min</dd></div>
          <div><dt className="text-text-tertiary">Seuil</dt><dd className="font-medium text-text-primary">{assessment.pass_threshold_pct}%</dd></div>
          <div><dt className="text-text-tertiary">Tentatives</dt><dd className="font-medium text-text-primary">{assessment.attempts_allowed === 0 ? "Illimité" : assessment.attempts_allowed}</dd></div>
          {/* Revue UX §22 — la fenêtre d'ouverture/fermeture configurée à
              l'étape 10 du formulaire n'était jamais réaffichée nulle part
              ensuite (ni ici, ni côté candidat sur /mes-examens) : un
              responsable n'avait aucun moyen de reconsulter ce qu'il avait
              programmé. Corrigé — seulement affiché si au moins l'une des
              deux dates a été fixée (sinon "Toujours ouvert" serait un
              placeholder inutile pour l'écrasante majorité des examens qui
              n'utilisent pas cette option). */}
          {(assessment.open_at || assessment.close_at) && (
            <div className="col-span-2">
              <dt className="text-text-tertiary">Fenêtre de disponibilité</dt>
              <dd className="font-medium text-text-primary">
                {assessment.open_at ? new Date(assessment.open_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "dès maintenant"}
                {" → "}
                {assessment.close_at ? new Date(assessment.close_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "sans limite"}
              </dd>
            </div>
          )}
        </dl>

        {canWrite && assessment.status === "draft" && (
          <div className="mt-4 border-t border-border-subtle pt-4">
            <PublishAssessmentForm assessmentId={assessmentId} members={groupMembers} />
          </div>
        )}

        {canWrite && assessment.status !== "draft" && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
            {(assessment.status === "published" || assessment.status === "open") && (
              <form action={doSuspend}>
                <button type="submit" className="rounded-md border border-status-critical-border bg-status-critical-bg px-3 py-1.5 text-[13px] font-medium text-status-critical-text">Suspendre</button>
              </form>
            )}
            {assessment.status === "suspended" && (
              <form action={doReopen}>
                <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10">Réouvrir</button>
              </form>
            )}
            {(assessment.status === "published" || assessment.status === "open") && (
              <form action={doClose}>
                <button type="submit" className="rounded-md border border-border-default px-3 py-1.5 text-[13px] font-medium text-text-secondary hover:border-border-strong">Clôturer</button>
              </form>
            )}
          </div>
        )}
      </Card>

      {canWrite && assessment.status !== "draft" && unassignedMembers.length > 0 && (
        <Card>
          <CardHeader title="Affecter d'autres candidats" description="Candidats du groupe pas encore affectés à cette évaluation (addendum §1 — réaffectation)" />
          <AssignMoreCandidatesForm assessmentId={assessmentId} members={unassignedMembers} />
        </Card>
      )}

      {canWrite && RESCHEDULABLE_STATUSES.has(assessment.status) && (
        <Card>
          <CardHeader
            title="Reprogrammer l'examen"
            description="Change la fenêtre d'ouverture/fermeture — les candidats affectés sont notifiés. Bloqué si une tentative est en cours."
          />
          <RescheduleAssessmentForm assessmentId={assessmentId} currentOpenAt={assessment.open_at} currentCloseAt={assessment.close_at} />
        </Card>
      )}

      {assessment.status !== "draft" && (
        <Card>
          <CardHeader
            title="Suivi des candidats"
            description={`${notStarted} non commencé(s) · ${inProgress} en cours · ${finished} terminé(s)${awaitingReview > 0 ? ` · ${awaitingReview} à corriger` : ""}`}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-subtle text-left text-text-tertiary">
                  <th className="pb-2 font-medium">Candidat</th>
                  <th className="pb-2 font-medium">Statut</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Résultat</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {tracking.map((t) => (
                  <tr key={t.candidate_user_id} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 text-text-primary">{t.full_name}</td>
                    <td className="py-2 text-text-secondary">
                      {!t.attempt_status
                        ? "Non commencé"
                        : t.attempt_status === "in_progress"
                          ? "En cours"
                          : t.grading_state === "AWAITING_MANUAL_REVIEW"
                            ? "À corriger"
                            : t.grading_state === "COMPLETE"
                              ? "Résultat disponible"
                              : ATTEMPT_STATUS_LABEL[t.attempt_status]}
                    </td>
                    {/* §30 — jamais un score provisoire présenté comme final tant que la
                        correction manuelle n'est pas terminée. */}
                    <td className="py-2 text-text-secondary">{t.grading_state === "COMPLETE" && t.score_100 !== null ? `${t.score_100}/100` : "—"}</td>
                    <td className="py-2">
                      {t.grading_state !== "COMPLETE" || t.passed === null ? "—" : <StatusBadge status={t.passed ? "verified" : "critical"}>{t.passed ? "Réussi" : "Échoué"}</StatusBadge>}
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {t.attempt_id && (
                          <Link href={`/results/${t.attempt_id}`} className="text-[12.5px] font-medium text-accent-9 hover:underline">
                            Détail
                          </Link>
                        )}
                        {canWrite && !t.attempt_status && (
                          <form action={doUnassign}>
                            <input type="hidden" name="candidateUserId" value={t.candidate_user_id} />
                            <button type="submit" className="text-[12px] text-text-tertiary hover:text-status-critical-text" title="Retirer ce candidat">
                              Retirer
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
