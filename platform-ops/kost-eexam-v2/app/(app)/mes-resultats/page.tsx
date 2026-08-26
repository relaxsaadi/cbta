import { guardPage } from "@/lib/rbac";
import { listResults, getAttemptDetail, type ResultsRow } from "@/lib/results";
import { getAssessmentSettingsForAttempt } from "@/lib/attempts";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileClock, CheckCircle2, XCircle } from "lucide-react";

export default async function MesResultatsPage() {
  const session = await guardPage("candidate");
  const results = listResults({ candidateUserId: session.userId });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Mes résultats</h1>

      <Card>
        {results.length === 0 ? (
          <EmptyState icon={FileClock} title="Aucun résultat" description="Vos résultats apparaîtront ici après vos examens." />
        ) : (
          <div className="flex flex-col gap-3">
            {results.map((r) => (
              <ResultCard key={r.attempt_id} result={r} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ResultCard({ result }: { result: ResultsRow }) {
  const detail = getAttemptDetail(result.attempt_id);
  const settings = getAssessmentSettingsForAttempt(result.attempt_id);
  if (!detail || !settings) return null;

  // Politique A/B/C/D du §11 : selon la config, différer jusqu'à la
  // fermeture, montrer seulement la note, ou la correction complète.
  const stillDeferred = settings.feedback_mode === "deferred" && settings.close_at && new Date(settings.close_at).getTime() > Date.now();
  const showResult = settings.show_result === 1 && !stillDeferred;
  const showCorrection = showResult && settings.show_correct_answers === 1;

  return (
    <div className="rounded-md border border-border-subtle p-3.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13.5px] font-medium text-text-primary">{detail.assessment_name}</p>
          <p className="text-[12px] text-text-tertiary">
            {detail.function_code} — {new Date(detail.started_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
        {!showResult ? (
          <span className="text-[12px] text-text-tertiary">
            {stillDeferred ? "Résultat différé jusqu'à la fermeture de l'examen" : "En attente de notation"}
          </span>
        ) : detail.passed === null ? (
          <span className="text-[12px] text-text-tertiary">En attente de notation</span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-semibold text-text-primary">{detail.score_100}/100</span>
            <StatusBadge status={detail.passed ? "verified" : "critical"}>
              {detail.passed ? (
                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Réussi</span>
              ) : (
                <span className="flex items-center gap-1"><XCircle size={12} /> Échoué</span>
              )}
            </StatusBadge>
          </div>
        )}
      </div>

      {showCorrection && (
        <details className="mt-3">
          <summary className="cursor-pointer text-[12.5px] font-medium text-accent-9">Voir la correction complète</summary>
          <div className="mt-2 flex flex-col gap-2">
            {detail.questions.map((q) => (
              <div key={q.position} className="rounded border border-border-subtle p-2.5 text-[12.5px]">
                <p className="font-medium text-text-primary">Q{q.position}. {q.stem}</p>
                <p className="mt-1 text-text-secondary">
                  Votre réponse : {q.candidateAnswer.join(", ") || "—"} {q.isCorrect ? "✓" : "✗"}
                </p>
                {!q.isCorrect && <p className="text-status-verified-text">Bonne réponse : {q.correctAnswer.join(", ")}</p>}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
