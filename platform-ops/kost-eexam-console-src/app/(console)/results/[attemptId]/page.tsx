import Link from "next/link";
import { notFound } from "next/navigation";
import { getResultById } from "@/lib/results-data";
import { isDemoModeActive } from "@/lib/demo-mode-server";
import { redactName } from "@/lib/demo-mode";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { SCOPE_LABELS, SCOPE_BADGE } from "@/lib/data-scope";

export const dynamic = "force-dynamic";

const STATE_LABEL: Record<string, string> = {
  finished: "Terminée",
  inprogress: "En cours",
  overdue: "Hors délai",
  abandoned: "Abandonnée",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtDuration(s: number | null): string {
  if (s === null) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

export default async function ResultDetailPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const [result, demoMode] = await Promise.all([getResultById(Number(attemptId)), isDemoModeActive()]);
  if (!result) notFound();
  const displayName = demoMode ? redactName(result.candidateName) : result.candidateName;

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6">
      <div>
        <Link href="/results" className="text-[12.5px] text-text-tertiary hover:text-text-secondary">
          ← Retour aux résultats
        </Link>
        <h1 className="mt-2 font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Détail du résultat
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Tentative n°{result.attemptNumber} — {result.examName}
        </p>
      </div>

      <Card>
        <CardHeader
          title={displayName}
          description={demoMode ? "@•••" : `@${result.candidateUsername}`}
          action={
            <div className="flex items-center gap-2">
              <StatusBadge status={SCOPE_BADGE[result.scope]}>{SCOPE_LABELS[result.scope]}</StatusBadge>
              {result.passFail === "pass" ? (
                <StatusBadge status="verified">Réussi</StatusBadge>
              ) : result.passFail === "fail" ? (
                <StatusBadge status="critical">Échoué</StatusBadge>
              ) : (
                <StatusBadge status="neutral">N/A</StatusBadge>
              )}
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 border-t border-border-subtle pt-4">
          <Field label="Examen" value={result.examName} />
          <Field label="Tentative" value={`#${result.attemptNumber}`} />
          <Field label="Statut" value={STATE_LABEL[result.state]} />
          <Field label="Note officielle" value={result.officialGrade !== null ? `${result.officialGrade.toFixed(2)} / ${result.gradeMax.toFixed(0)}` : "—"} />
          <Field label="Seuil de réussite" value={result.passingGrade !== null ? `${result.passingGrade.toFixed(0)} / ${result.gradeMax.toFixed(0)}` : "Non défini"} />
          <Field label="Pourcentage" value={result.percentage !== null ? `${result.percentage.toFixed(1)}%` : "—"} />
          <Field label="Début" value={fmtDate(result.timeStart)} />
          <Field label="Soumise le" value={fmtDate(result.timeFinish)} />
          <Field label="Durée" value={fmtDuration(result.durationSeconds)} />
          <Field label="Questions répondues" value={String(result.answeredCount)} />
          <Field label="Questions sans réponse" value={String(result.unansweredCount)} />
        </div>

        <div className="mt-4 border-t border-border-subtle pt-3.5 flex flex-col gap-2">
          <p className="text-[11.5px] text-text-tertiary">
            Note officielle directement issue du carnet de notes Moodle (mdl_grade_grades) — jamais
            recalculée par cette console. Les bonnes réponses et le contenu des questions ne sont pas
            affichés ici, conformément aux options de relecture Moodle de ce quiz (aucune divulgation
            des réponses configurée).
          </p>
          <a
            href={`https://exam.kostacademy.com/mod/quiz/view.php?id=${result.examCmid}`}
            target="_blank"
            rel="noreferrer"
            className="w-fit rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:border-border-strong transition-colors"
          >
            Voir l&apos;examen dans Moodle
          </a>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-text-primary tabular-nums">{value}</p>
    </div>
  );
}
