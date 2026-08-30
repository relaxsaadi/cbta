import { guardPage } from "@/lib/rbac";
import { listResults, getAttemptDetail, type ResultsRow } from "@/lib/results";
import { getAssessmentSettingsForAttempt } from "@/lib/attempts";
import { formatCorrectAnswerForDisplay, formatCandidateAnswerForDisplay } from "@/lib/questions";
import { gradeOneQuestion } from "@/lib/grading";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileClock, CheckCircle2, XCircle } from "lucide-react";

export default async function MesResultatsPage({
  searchParams,
}: {
  searchParams: Promise<{ justSubmitted?: string; auto?: string }>;
}) {
  const session = await guardPage("candidate");
  const { justSubmitted, auto } = await searchParams;
  // §24 de la mission "COMPLETE CANDIDATE EXAM LIFECYCLE" — une tentative
  // encore IN_PROGRESS n'a JAMAIS sa place ici (elle n'a même pas encore
  // été envoyée) : /mes-examens montre déjà "Reprendre" pour ce cas, la
  // lister aussi ici comme "en attente de notation" serait trompeur.
  const results = listResults({ candidateUserId: session.userId, excludeInProgress: true });
  // §17 — confirmation de fin de tentative. `justSubmitted` (l'ID de
  // l'évaluation) était posé par ExamRunner.tsx depuis le tout début de ce
  // sous-système mais jamais lu nulle part (bug réel trouvé en revisitant
  // ce flux pour cette mission) : aucune confirmation "Votre examen a bien
  // été envoyé" ne s'affichait jamais après une soumission, manuelle ou
  // automatique. On retrouve la tentative la plus récente de cette
  // évaluation pour afficher Examen/Date d'envoi/Statut (§17).
  const confirmedRow = justSubmitted ? results.filter((r) => r.submitted_at).sort((a, b) => (b.submitted_at! > a.submitted_at! ? 1 : -1))[0] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Mes résultats</h1>

      {justSubmitted && confirmedRow && (
        <div className="rounded-md border border-status-verified-border bg-status-verified-bg px-4 py-3 text-[13px] text-status-verified-text">
          <p className="font-medium">
            {auto === "1" ? "Temps écoulé — votre examen a été envoyé automatiquement." : "Votre examen a bien été envoyé."}
          </p>
          <p className="mt-1 text-[12.5px]">
            {confirmedRow.assessment_name} — envoyé le {new Date(confirmedRow.submitted_at!).toLocaleString("fr-FR")} —{" "}
            {confirmedRow.grading_state === "AWAITING_MANUAL_REVIEW" ? "en attente de correction" : "résultat disponible ci-dessous"}
          </p>
        </div>
      )}

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

  // §26-29 de la mission "COMPLETE CANDIDATE EXAM LIFECYCLE" — une
  // correction manuelle en attente prime sur tout : jamais un score
  // fabriqué à partir d'une notation partielle, quelle que soit la
  // politique de diffusion différée ci-dessous.
  if (detail.grading_state === "AWAITING_MANUAL_REVIEW") {
    return (
      <div className="rounded-md border border-border-subtle p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13.5px] font-medium text-text-primary">{detail.assessment_name}</p>
            <p className="text-[12px] text-text-tertiary">
              {detail.function_code} — {new Date(detail.started_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <StatusBadge status="warning">En attente de correction</StatusBadge>
        </div>
        <p className="mt-2 text-[12.5px] text-text-secondary">
          Votre examen a bien été envoyé et nécessite une correction avant la publication du résultat.
        </p>
      </div>
    );
  }

  // Politique A/B/C/D du §11 : selon la config, différer jusqu'à la
  // fermeture, montrer seulement la note, ou la correction complète.
  // ResultCard est un Server Component (jamais de re-rendu client,
  // ré-exécuté une fois par requête serveur) : comparer à l'heure serveur
  // courante ici est le comportement voulu, pas une impureté au sens du
  // hook de rendu client que cette règle cible réellement.
  // eslint-disable-next-line react-hooks/purity
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
            <a
              href={`/api/reports/individual/${result.attempt_id}?level=${showCorrection ? "detailed" : "simple"}`}
              className="rounded-md border border-border-default px-2.5 py-1 text-[11.5px] font-medium text-text-secondary hover:border-border-strong"
            >
              PDF
            </a>
          </div>
        )}
      </div>

      {showCorrection && (
        <details className="mt-3">
          <summary className="cursor-pointer text-[12.5px] font-medium text-accent-9">Voir la correction complète</summary>
          <div className="mt-2 flex flex-col gap-2">
            {detail.questions.map((q) => {
              // Mission "MISSION FINALE CIBLÉE" (2026-08-30) — un scénario
              // se déroule par sous-question (jamais une seule ligne
              // "Votre réponse", qui perdrait le détail des 8 types).
              if (q.qtype === "scenario") {
                const spec = q.correctAnswer as { context: string; subquestions: { id: string; qtype: string; stem: string; points: number; choices: { key: string; text: string }[]; correctAnswer: unknown }[] };
                const given = (q.candidateAnswer ?? {}) as Record<string, string[]>;
                return (
                  <div key={q.position} className="rounded border border-border-subtle p-2.5 text-[12.5px]">
                    <p className="font-medium text-text-primary">Q{q.position}. {q.stem}</p>
                    <p className="mb-1.5 mt-1 whitespace-pre-wrap text-text-tertiary">{spec.context}</p>
                    <div className="flex flex-col gap-1.5">
                      {spec.subquestions.map((sq, sqi) => {
                        const manualVerdict = q.scenarioGrading?.[sq.id];
                        const subAnswer = given[sq.id];
                        const auto = manualVerdict ? null : gradeOneQuestion(sq.qtype, JSON.stringify(sq.correctAnswer), subAnswer ? JSON.stringify(subAnswer) : null);
                        const pending = !manualVerdict && auto?.pending;
                        const subIsCorrect = manualVerdict ? manualVerdict.isCorrect : auto?.isCorrect;
                        const subCorrectText = formatCorrectAnswerForDisplay(sq.qtype, sq.correctAnswer, sq.choices);
                        return (
                          <p key={sq.id} className="text-text-secondary">
                            Q{sqi + 1}. Votre réponse : {formatCandidateAnswerForDisplay(sq.qtype, subAnswer ?? null, sq.choices)} {pending ? "(en attente de correction)" : subIsCorrect ? "✓" : "✗"}
                            {!pending && !subIsCorrect && subCorrectText && <span className="text-status-verified-text"> — Bonne réponse : {subCorrectText}</span>}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              const candidateText = formatCandidateAnswerForDisplay(q.qtype, q.candidateAnswer, q.choices);
              const correctText = formatCorrectAnswerForDisplay(q.qtype, q.correctAnswer, q.choices);
              return (
                <div key={q.position} className="rounded border border-border-subtle p-2.5 text-[12.5px]">
                  <p className="font-medium text-text-primary">Q{q.position}. {q.stem}</p>
                  <p className="mt-1 text-text-secondary">
                    Votre réponse : {candidateText} {q.isCorrect ? "✓" : "✗"}
                  </p>
                  {!q.isCorrect && correctText && <p className="text-status-verified-text">Bonne réponse : {correctText}</p>}
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
