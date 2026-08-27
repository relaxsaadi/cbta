import Link from "next/link";
import { notFound } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { getAssessment, getSessionReport } from "@/lib/assessments";
import { getGroup } from "@/lib/groups";
import { functionLabel } from "@/lib/questions";
import { hasAssessmentAccess } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { AlertTriangle } from "lucide-react";

const ATTEMPT_STATUS_LABEL: Record<string, string> = {
  in_progress: "En cours", submitted: "Terminé", auto_submitted: "Terminé (auto)", abandoned: "Abandonné",
};

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-raised p-3">
      <p className="text-[17px] font-display font-semibold text-text-primary leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-text-tertiary">{label}</p>
    </div>
  );
}

// Addendum §5-6 — rapport global de session/examen : tableau complet des
// résultats + statistiques agrégées (lib/assessments.ts getSessionReport()
// — jamais recalculées séparément à l'écran).
export default async function SessionReportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { id } = await params;
  const assessmentId = Number(id);
  const assessment = getAssessment(assessmentId);
  if (!assessment || !hasAssessmentAccess(session, assessmentId)) notFound();
  const group = getGroup(assessment.group_id);
  const { rows, stats } = getSessionReport(assessmentId);

  function formatDuration(startedAt: string | null, submittedAt: string | null): string {
    if (!startedAt || !submittedAt) return "—";
    const ms = new Date(submittedAt).getTime() - new Date(startedAt).getTime();
    return `${Math.round(ms / 60000)} min`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">Rapport global de session</h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            {group?.company_name} — {group?.name} — {functionLabel(assessment.function_code)} — {assessment.name}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Link href={`/exam-preparation/${assessmentId}`} className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
            Retour à l&apos;évaluation
          </Link>
          <a
            href={`/api/results/export?assessmentId=${assessmentId}`}
            className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong"
          >
            Liste officielle CSV
          </a>
          <a
            href={`/api/reports/results-list/${assessmentId}`}
            className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong"
          >
            Liste officielle PDF
          </a>
          <a
            href={`/api/reports/session/${assessmentId}`}
            className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10"
          >
            Rapport global PDF
          </a>
        </div>
      </div>

      {stats.smallSample && (
        <div className="flex items-center gap-2 rounded-md border border-status-warning-border bg-status-warning-bg px-3 py-2 text-[12.5px] text-status-warning-text">
          <AlertTriangle size={15} />
          Moins de 5 tentatives terminées ({stats.finished}) — moyenne et taux de réussite ci-dessous ne sont pas statistiquement représentatifs.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <Kpi label="Convoqués" value={stats.convened} />
        <Kpi label="Non commencés" value={stats.notStarted} />
        <Kpi label="En cours" value={stats.inProgress} />
        <Kpi label="Terminés" value={stats.finished} />
        <Kpi label="Admis" value={stats.passedCount} />
        <Kpi label="Échecs" value={stats.failedCount} />
        <Kpi label="Taux de réussite" value={stats.passRatePct !== null ? `${stats.passRatePct}%` : "—"} />
        <Kpi label="Moyenne" value={stats.average !== null ? `${stats.average}/100` : "—"} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Meilleur score" value={stats.best !== null ? `${stats.best}/100` : "—"} />
        <Kpi label="Score minimum" value={stats.worst !== null ? `${stats.worst}/100` : "—"} />
        <Kpi label="Seuil" value={`${assessment.pass_threshold_pct}%`} />
        <Kpi label="Durée autorisée" value={`${assessment.duration_minutes} min`} />
      </div>

      <Card>
        <CardHeader title={`${rows.length} candidat(s) convoqué(s)`} />
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border-subtle text-left text-text-tertiary">
                <th className="pb-2 pr-3 font-medium">Candidat</th>
                <th className="pb-2 pr-3 font-medium">Début</th>
                <th className="pb-2 pr-3 font-medium">Fin</th>
                <th className="pb-2 pr-3 font-medium">Durée</th>
                <th className="pb-2 pr-3 font-medium">Bonnes</th>
                <th className="pb-2 pr-3 font-medium">Mauvaises</th>
                <th className="pb-2 pr-3 font-medium">Note /100</th>
                <th className="pb-2 pr-3 font-medium">%</th>
                <th className="pb-2 pr-3 font-medium">Mention</th>
                <th className="pb-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.candidate_user_id} className="border-b border-border-subtle last:border-0">
                  <td className="py-2 pr-3 text-text-primary">{r.full_name}</td>
                  <td className="py-2 pr-3 text-text-secondary">{r.started_at ? new Date(r.started_at).toLocaleTimeString("fr-FR") : "—"}</td>
                  <td className="py-2 pr-3 text-text-secondary">{r.submitted_at ? new Date(r.submitted_at).toLocaleTimeString("fr-FR") : "—"}</td>
                  <td className="py-2 pr-3 text-text-secondary">{formatDuration(r.started_at, r.submitted_at)}</td>
                  <td className="py-2 pr-3 text-status-verified-text">{r.attempt_status ? r.correct_count : "—"}</td>
                  <td className="py-2 pr-3 text-status-critical-text">{r.attempt_status ? r.incorrect_count : "—"}</td>
                  <td className="py-2 pr-3 text-text-secondary">{r.score_100 ?? "—"}</td>
                  <td className="py-2 pr-3 text-text-secondary">{r.percentage !== null ? `${r.percentage}%` : "—"}</td>
                  <td className="py-2 pr-3">
                    {r.passed === null ? <span className="text-text-tertiary">—</span> : <StatusBadge status={r.passed ? "verified" : "critical"}>{r.passed ? "ADMIS" : "ÉCHEC"}</StatusBadge>}
                  </td>
                  <td className="py-2 text-text-secondary">{r.attempt_status ? ATTEMPT_STATUS_LABEL[r.attempt_status] : "Non commencé"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
