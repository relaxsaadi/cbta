import { notFound } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { getAttemptDetail } from "@/lib/results";
import { hasAttemptAccess } from "@/lib/tenant-scope";
import { functionLabel } from "@/lib/questions";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { CheckCircle2, XCircle } from "lucide-react";

function formatDuration(startedAt: string, submittedAt: string | null): string {
  if (!submittedAt) return "—";
  const ms = new Date(submittedAt).getTime() - new Date(startedAt).getTime();
  const minutes = Math.round(ms / 60000);
  return minutes < 1 ? "< 1 min" : `${minutes} min`;
}

export default async function AttemptDetailPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { attemptId } = await params;
  const attemptIdNum = Number(attemptId);
  // Voir lib/tenant-scope.ts : introuvable, pas "refusé", pour une
  // tentative hors périmètre (question par question incluse — même objet).
  if (!hasAttemptAccess(session, attemptIdNum)) notFound();
  const detail = getAttemptDetail(attemptIdNum);
  if (!detail) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">Rapport individuel — Détail de la tentative</h1>
          <p className="mt-1 text-[13px] text-text-tertiary">{detail.candidate_name} — {detail.group_name} — {detail.assessment_name}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a
            href={`/api/reports/individual/${attemptIdNum}?level=simple`}
            className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong"
          >
            PDF simple
          </a>
          <a
            href={`/api/reports/individual/${attemptIdNum}?level=detailed`}
            className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10"
          >
            PDF détaillé
          </a>
        </div>
      </div>

      {/* IDENTITÉ — addendum §3 */}
      <Card>
        <CardHeader title="Identité" />
        <dl className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-5">
          <div><dt className="text-text-tertiary">Candidat</dt><dd className="font-medium text-text-primary">{detail.candidate_name}</dd></div>
          <div><dt className="text-text-tertiary">Entreprise</dt><dd className="font-medium text-text-primary">{detail.company_name}</dd></div>
          <div><dt className="text-text-tertiary">Groupe / session</dt><dd className="font-medium text-text-primary">{detail.group_name}</dd></div>
          <div><dt className="text-text-tertiary">Fonction</dt><dd className="font-medium text-text-primary">{functionLabel(detail.function_code)}</dd></div>
          <div><dt className="text-text-tertiary">Examen</dt><dd className="font-medium text-text-primary capitalize">{detail.assessment_name} ({detail.assessment_type})</dd></div>
        </dl>
      </Card>

      {/* TENTATIVE — addendum §3 */}
      <Card>
        <CardHeader title="Tentative" />
        <dl className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
          <div><dt className="text-text-tertiary">Date</dt><dd className="font-medium text-text-primary">{new Date(detail.started_at).toLocaleDateString("fr-FR")}</dd></div>
          <div><dt className="text-text-tertiary">Heure début</dt><dd className="font-medium text-text-primary">{new Date(detail.started_at).toLocaleTimeString("fr-FR")}</dd></div>
          <div><dt className="text-text-tertiary">Heure fin</dt><dd className="font-medium text-text-primary">{detail.submitted_at ? new Date(detail.submitted_at).toLocaleTimeString("fr-FR") : "—"}</dd></div>
          <div><dt className="text-text-tertiary">Tentative n°</dt><dd className="font-medium text-text-primary">{detail.attempt_number}</dd></div>
          <div><dt className="text-text-tertiary">Durée autorisée</dt><dd className="font-medium text-text-primary">{detail.duration_minutes_allowed} min</dd></div>
          <div><dt className="text-text-tertiary">Durée réelle</dt><dd className="font-medium text-text-primary">{formatDuration(detail.started_at, detail.submitted_at)}</dd></div>
          <div><dt className="text-text-tertiary">Nombre de questions</dt><dd className="font-medium text-text-primary">{detail.question_count}</dd></div>
        </dl>
      </Card>

      {/* RÉSULTAT — addendum §3 */}
      <Card>
        <CardHeader title="Résultat" />
        <dl className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
          <div><dt className="text-text-tertiary">Bonnes réponses</dt><dd className="font-medium text-status-verified-text">{detail.correct_count}</dd></div>
          <div><dt className="text-text-tertiary">Mauvaises réponses</dt><dd className="font-medium text-status-critical-text">{detail.incorrect_count}</dd></div>
          <div><dt className="text-text-tertiary">Score</dt><dd className="font-medium text-text-primary">{detail.score_100 ?? "—"}/100</dd></div>
          <div><dt className="text-text-tertiary">Pourcentage</dt><dd className="font-medium text-text-primary">{detail.percentage !== null ? `${detail.percentage}%` : "—"}</dd></div>
          <div><dt className="text-text-tertiary">Seuil</dt><dd className="font-medium text-text-primary">{detail.pass_threshold_pct ?? "—"}%</dd></div>
          <div>
            <dt className="text-text-tertiary">Mention</dt>
            <dd>{detail.passed === null ? "—" : <StatusBadge status={detail.passed ? "verified" : "critical"}>{detail.passed ? "ADMIS" : "ÉCHEC"}</StatusBadge>}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader title="Questions et réponses" description="Version exacte reçue par le candidat lors de cette tentative" />
        <div className="flex flex-col gap-4">
          {detail.questions.map((q) => (
            <div key={q.position} className="rounded-md border border-border-subtle p-3.5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-[13.5px] font-medium text-text-primary">
                  <span className="text-text-tertiary mr-1.5">Q{q.position}.</span>{q.stem}
                </p>
                {q.isCorrect === null ? (
                  <span className="text-[11.5px] text-text-tertiary">Non noté</span>
                ) : q.isCorrect ? (
                  <span className="flex items-center gap-1 text-[11.5px] font-medium text-status-verified-text"><CheckCircle2 size={13} /> Correct</span>
                ) : (
                  <span className="flex items-center gap-1 text-[11.5px] font-medium text-status-critical-text"><XCircle size={13} /> Incorrect</span>
                )}
              </div>
              <ul className="flex flex-col gap-1">
                {q.choices.map((c) => {
                  const chosen = q.candidateAnswer.includes(c.key);
                  const isCorrectChoice = q.correctAnswer.includes(c.key);
                  return (
                    <li
                      key={c.key}
                      className={`rounded px-2.5 py-1.5 text-[12.5px] ${
                        isCorrectChoice ? "bg-status-verified-bg text-status-verified-text" : chosen ? "bg-status-critical-bg text-status-critical-text" : "text-text-secondary"
                      }`}
                    >
                      <span className="font-mono mr-1.5">{c.key}.</span>{c.text}
                      {chosen && <span className="ml-2 text-[11px] opacity-75">(réponse du candidat)</span>}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-1.5 text-[11.5px] text-text-tertiary">Points : {q.pointsAwarded ?? "—"} / {q.points}</p>
              {q.explanation && (
                <p className="mt-1.5 rounded-md bg-surface-sunken px-2.5 py-1.5 text-[12px] text-text-secondary">
                  <span className="font-medium text-text-tertiary">Explication : </span>{q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
