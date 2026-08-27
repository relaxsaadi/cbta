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
import { unassignCandidateAction } from "../actions";

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
  }[];

  const notStarted = tracking.filter((t) => !t.attempt_status).length;
  const inProgress = tracking.filter((t) => t.attempt_status === "in_progress").length;
  const finished = tracking.filter((t) => t.attempt_status && t.attempt_status !== "in_progress").length;

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
        <StatusBadge status={STATUS_BADGE[assessment.status] ?? "neutral"}>{assessment.status}</StatusBadge>
      </div>

      <Card>
        <CardHeader title="Récapitulatif" />
        <dl className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
          <div><dt className="text-text-tertiary">Questions</dt><dd className="font-medium text-text-primary">{assessment.question_count}</dd></div>
          <div><dt className="text-text-tertiary">Durée</dt><dd className="font-medium text-text-primary">{assessment.duration_minutes} min</dd></div>
          <div><dt className="text-text-tertiary">Seuil</dt><dd className="font-medium text-text-primary">{assessment.pass_threshold_pct}%</dd></div>
          <div><dt className="text-text-tertiary">Tentatives</dt><dd className="font-medium text-text-primary">{assessment.attempts_allowed === 0 ? "Illimité" : assessment.attempts_allowed}</dd></div>
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

      {assessment.status !== "draft" && (
        <Card>
          <CardHeader title="Suivi des candidats" description={`${notStarted} non commencé(s) · ${inProgress} en cours · ${finished} terminé(s)`} />
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
                    <td className="py-2 text-text-secondary">{t.attempt_status ? ATTEMPT_STATUS_LABEL[t.attempt_status] : "Non commencé"}</td>
                    <td className="py-2 text-text-secondary">{t.score_100 !== null ? `${t.score_100}/100` : "—"}</td>
                    <td className="py-2">
                      {t.passed === null ? "—" : <StatusBadge status={t.passed ? "verified" : "critical"}>{t.passed ? "Réussi" : "Échoué"}</StatusBadge>}
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
