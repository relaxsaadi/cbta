import { notFound } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { getAttemptDetail } from "@/lib/results";
import { hasAttemptAccess } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { CheckCircle2, XCircle } from "lucide-react";

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
      <div>
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Détail de la tentative</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">{detail.candidate_name} — {detail.group_name} — {detail.assessment_name}</p>
      </div>

      <Card>
        <dl className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-5">
          <div><dt className="text-text-tertiary">Début</dt><dd className="font-medium text-text-primary">{new Date(detail.started_at).toLocaleString("fr-FR")}</dd></div>
          <div><dt className="text-text-tertiary">Fin</dt><dd className="font-medium text-text-primary">{detail.submitted_at ? new Date(detail.submitted_at).toLocaleString("fr-FR") : "—"}</dd></div>
          <div><dt className="text-text-tertiary">Score</dt><dd className="font-medium text-text-primary">{detail.score_100 ?? "—"}/100</dd></div>
          <div><dt className="text-text-tertiary">Seuil</dt><dd className="font-medium text-text-primary">{detail.pass_threshold_pct ?? "—"}%</dd></div>
          <div>
            <dt className="text-text-tertiary">Résultat</dt>
            <dd>{detail.passed === null ? "—" : <StatusBadge status={detail.passed ? "verified" : "critical"}>{detail.passed ? "Réussi" : "Échoué"}</StatusBadge>}</dd>
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
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
