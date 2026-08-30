import { notFound } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { getAttemptDetail } from "@/lib/results";
import { hasAttemptAccess } from "@/lib/tenant-scope";
import { functionLabel, formatCorrectAnswerForDisplay, formatCandidateAnswerForDisplay, QTYPE_LABELS, type QType } from "@/lib/questions";
import { gradeOneQuestion } from "@/lib/grading";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge, type BadgeStatus } from "@/components/ui/Badge";
import { CheckCircle2, XCircle } from "lucide-react";

function formatDuration(startedAt: string, submittedAt: string | null): string {
  if (!submittedAt) return "—";
  const ms = new Date(submittedAt).getTime() - new Date(startedAt).getTime();
  const minutes = Math.round(ms / 60000);
  return minutes < 1 ? "< 1 min" : `${minutes} min`;
}

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §20-25 — bug réel
// trouvé sur staging (/results/52 pendant que la tentative de Brahimi
// était encore IN_PROGRESS) : cette page montrait "Bonnes réponses : 0",
// "Mauvaises réponses : 0", "Score : —/100" comme si c'était un résultat
// mesuré, alors qu'aucune notation n'avait encore eu lieu. Le statut réel
// de la tentative est maintenant TOUJOURS affiché en premier, et la carte
// "Résultat" ne s'affiche QUE quand grading_state === 'COMPLETE' — jamais
// un zéro fabriqué à la place d'un "pas encore noté".
const STATUS_LABELS: Record<string, string> = {
  in_progress: "EN COURS",
  submitted: "SOUMIS",
  auto_submitted: "AUTO-SOUMIS",
  abandoned: "ABANDONNÉ",
};

/** Mission "MISSION FINALE CIBLÉE" (2026-08-30) — une question 'scenario'
 * n'est "répondue" que si TOUTES ses sous-questions le sont (même
 * définition qu'ExamRunner.tsx::isQuestionAnswered côté candidat). */
function isAnswered(qtype: string, candidateAnswer: unknown): boolean {
  if (qtype === "scenario") {
    const given = (candidateAnswer ?? {}) as Record<string, string[]>;
    const entries = Object.values(given);
    return entries.length > 0 && entries.every((a) => a && a.length > 0 && a[0] !== "");
  }
  return Array.isArray(candidateAnswer) && candidateAnswer.length > 0;
}

function attemptStatusBadge(status: string, gradingState: string | null): { label: string; variant: BadgeStatus } {
  if (status === "in_progress") return { label: "EN COURS", variant: "warning" };
  if (gradingState === "AWAITING_MANUAL_REVIEW") return { label: "EN ATTENTE DE CORRECTION", variant: "warning" };
  if (gradingState === "COMPLETE") return { label: "RÉSULTAT DISPONIBLE", variant: "verified" };
  return { label: STATUS_LABELS[status] ?? status.toUpperCase(), variant: "neutral" };
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

  const inProgress = detail.status === "in_progress";
  const awaitingReview = detail.grading_state === "AWAITING_MANUAL_REVIEW";
  const finalResultAvailable = detail.grading_state === "COMPLETE";
  const badge = attemptStatusBadge(detail.status, detail.grading_state);
  const answeredCount = detail.questions.filter((q) => isAnswered(q.qtype, q.candidateAnswer)).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* §21 — le titre lui-même change selon l'état réel, jamais
              "Résultat final" pour une tentative encore en cours (§22). */}
          <h1 className="font-display text-[20px] font-semibold text-text-primary">
            {inProgress ? "Tentative en cours — Détail" : "Rapport individuel — Détail de la tentative"}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-[13px] text-text-tertiary">
            {detail.candidate_name} — {detail.group_name} — {detail.assessment_name}
            <StatusBadge status={badge.variant}>{badge.label}</StatusBadge>
          </p>
        </div>
        {finalResultAvailable && (
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
        )}
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
          <div><dt className="text-text-tertiary">Questions répondues</dt><dd className="font-medium text-text-primary">{answeredCount} / {detail.question_count}</dd></div>
        </dl>
      </Card>

      {/* RÉSULTAT — uniquement si réellement disponible (§21-23/§30). Pour
          IN_PROGRESS/AWAITING_MANUAL_REVIEW, un message explicite remplace
          la carte — jamais un score/des comptes fabriqués. */}
      {finalResultAvailable ? (
        <Card>
          <CardHeader title="Résultat" />
          <dl className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
            <div><dt className="text-text-tertiary">Bonnes réponses</dt><dd className="font-medium text-status-verified-text">{detail.correct_count}</dd></div>
            <div><dt className="text-text-tertiary">Mauvaises réponses</dt><dd className="font-medium text-status-critical-text">{detail.incorrect_count}</dd></div>
            <div><dt className="text-text-tertiary">Score</dt><dd className="font-medium text-text-primary">{detail.score_100}/100</dd></div>
            <div><dt className="text-text-tertiary">Pourcentage</dt><dd className="font-medium text-text-primary">{detail.percentage}%</dd></div>
            <div><dt className="text-text-tertiary">Seuil</dt><dd className="font-medium text-text-primary">{detail.pass_threshold_pct}%</dd></div>
            <div>
              <dt className="text-text-tertiary">Mention</dt>
              <dd><StatusBadge status={detail.passed ? "verified" : "critical"}>{detail.passed ? "ADMIS" : "ÉCHEC"}</StatusBadge></dd>
            </div>
          </dl>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Résultat" />
          <p className="text-[13px] text-text-secondary">
            {inProgress
              ? "Résultat non disponible — l'examen n'a pas encore été envoyé."
              : awaitingReview
                ? "Examen envoyé — en attente de correction manuelle avant publication du résultat."
                : "Résultat non disponible."}
          </p>
        </Card>
      )}

      <Card>
        <CardHeader title="Questions et réponses" description="Version exacte reçue par le candidat lors de cette tentative" />
        <div className="flex flex-col gap-4">
          {detail.questions.map((q) => {
            const qtype = q.qtype as QType;
            return (
              <div key={q.position} className="rounded-md border border-border-subtle p-3.5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13.5px] font-medium text-text-primary">
                      <span className="text-text-tertiary mr-1.5">Q{q.position}.</span>{q.stem}
                    </p>
                    <p className="text-[11px] text-text-tertiary">{QTYPE_LABELS[qtype] ?? qtype}</p>
                  </div>
                  {/* Bug réel diagnostiqué (2026-08-30, mission "ADMIN/CLIENT/
                      CANDIDATE UX IMPROVEMENTS") : ce libellé se basait
                      uniquement sur q.isCorrect === null, qui est TOUJOURS
                      vrai avant même que le candidat ait répondu (aucune
                      ligne attempt_answers n'existe encore) — une tentative
                      encore in_progress affichait donc "En attente de
                      correction" dès son lancement, avant même que l'examen
                      soit envoyé. inProgress doit être vérifié en premier,
                      jamais après. */}
                  {inProgress ? (
                    <span className="text-[11.5px] text-text-tertiary">Examen en cours</span>
                  ) : q.isCorrect === null ? (
                    <span className="text-[11.5px] text-text-tertiary">{qtype === "short_answer" || qtype === "scenario" ? "En attente de correction" : "Non noté"}</span>
                  ) : q.isCorrect ? (
                    <span className="flex items-center gap-1 text-[11.5px] font-medium text-status-verified-text"><CheckCircle2 size={13} /> Correct</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11.5px] font-medium text-status-critical-text"><XCircle size={13} /> Incorrect</span>
                  )}
                </div>

                {(qtype === "mcq_single" || qtype === "mcq_multi" || qtype === "true_false") && (
                  <ul className="flex flex-col gap-1">
                    {q.choices.map((c) => {
                      const chosen = (q.candidateAnswer as string[]).includes(c.key);
                      const correctKeys = Array.isArray(q.correctAnswer) ? (q.correctAnswer as string[]) : [];
                      const isCorrectChoice = correctKeys.includes(c.key);
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
                )}

                {qtype === "numeric" && (
                  <div className="text-[12.5px] text-text-secondary">
                    <p>Réponse du candidat : <span className="font-medium text-text-primary">{formatCandidateAnswerForDisplay(qtype, q.candidateAnswer, q.choices)}</span></p>
                    <p>Réponse correcte : <span className="font-medium text-status-verified-text">{formatCorrectAnswerForDisplay(qtype, q.correctAnswer)}</span></p>
                  </div>
                )}

                {qtype === "short_answer" && (
                  <div className="text-[12.5px] text-text-secondary">
                    <p>Réponse du candidat : <span className="font-medium text-text-primary">{formatCandidateAnswerForDisplay(qtype, q.candidateAnswer, q.choices)}</span></p>
                    <p>Réponses acceptées : <span className="font-medium text-status-verified-text">{formatCorrectAnswerForDisplay(qtype, q.correctAnswer)}</span></p>
                    {q.graderComment && <p className="mt-1 text-text-tertiary">Commentaire du correcteur : {q.graderComment}</p>}
                  </div>
                )}

                {/* §2/§3 — appariement/ordre : ALL_OR_NOTHING, réponse
                    candidate/correcte formatées par le point d'entrée
                    unique partagé (jamais une 5e implémentation). */}
                {(qtype === "matching" || qtype === "ordering") && (
                  <div className="text-[12.5px] text-text-secondary">
                    <p>Réponse du candidat : <span className="font-medium text-text-primary">{formatCandidateAnswerForDisplay(qtype, q.candidateAnswer, q.choices)}</span></p>
                    <p>Réponse correcte : <span className="font-medium text-status-verified-text">{formatCorrectAnswerForDisplay(qtype, q.correctAnswer, q.choices)}</span></p>
                  </div>
                )}

                {/* §4-5 — scénario : contexte affiché une fois, puis
                    détail par sous-question (candidat/correcte/état). Les
                    sous-questions auto-notées sont recalculées ICI via
                    gradeOneQuestion (jamais une 6e implémentation
                    divergente de la notation elle-même) ; les manuelles
                    lisent scenarioGrading (verdict humain déjà écrit). */}
                {qtype === "scenario" && (() => {
                  const spec = q.correctAnswer as {
                    context: string;
                    documentRef?: string;
                    subquestions: { id: string; qtype: string; stem: string; points: number; choices: { key: string; text: string }[]; correctAnswer: unknown }[];
                  };
                  const given = (q.candidateAnswer ?? {}) as Record<string, string[]>;
                  return (
                    <div className="flex flex-col gap-3">
                      <div className="rounded-md bg-surface-sunken p-2.5">
                        <p className="whitespace-pre-wrap text-[12.5px] text-text-secondary">{spec.context}</p>
                        {spec.documentRef && <p className="mt-1 text-[11px] text-text-tertiary">Document/référence : {spec.documentRef}</p>}
                      </div>
                      {spec.subquestions.map((sq, sqi) => {
                        const manualVerdict = q.scenarioGrading?.[sq.id];
                        const subAnswer = given[sq.id];
                        const auto = manualVerdict ? null : gradeOneQuestion(sq.qtype, JSON.stringify(sq.correctAnswer), subAnswer ? JSON.stringify(subAnswer) : null);
                        const pending = !manualVerdict && auto?.pending;
                        const subIsCorrect = manualVerdict ? manualVerdict.isCorrect : auto?.isCorrect;
                        const subPoints = manualVerdict ? manualVerdict.pointsAwarded : auto?.partialPoints ?? (auto?.isCorrect ? sq.points : 0);
                        return (
                          <div key={sq.id} className="rounded-md border border-border-subtle p-2.5">
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <p className="text-[13px] font-medium text-text-primary">Q{sqi + 1}. {sq.stem}</p>
                              {/* Même correctif qu'au niveau question principale
                                  (2026-08-30) : "pending" reste calculé tel quel
                                  (gradeOneQuestion renvoie pending=true pour toute
                                  sous-question manuelle, y compris jamais répondue)
                                  — mais inProgress est vérifié EN PREMIER, sinon
                                  une sous-question jamais atteinte par le candidat
                                  afficherait "En attente de correction" dès le
                                  démarrage de la tentative, avant tout envoi. */}
                              {inProgress ? (
                                <span className="shrink-0 text-[11px] text-text-tertiary">Examen en cours</span>
                              ) : pending ? (
                                <span className="shrink-0 text-[11px] text-text-tertiary">En attente de correction</span>
                              ) : subIsCorrect ? (
                                <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-status-verified-text"><CheckCircle2 size={12} /> Correct</span>
                              ) : (
                                <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-status-critical-text"><XCircle size={12} /> Incorrect</span>
                              )}
                            </div>
                            <p className="text-[12px] text-text-secondary">Réponse du candidat : <span className="font-medium text-text-primary">{subAnswer ? formatCandidateAnswerForDisplay(sq.qtype, subAnswer, sq.choices) : "Aucune réponse fournie"}</span></p>
                            {!inProgress && !pending && (
                              <p className="text-[12px] text-text-secondary">Réponse correcte : <span className="font-medium text-status-verified-text">{formatCorrectAnswerForDisplay(sq.qtype, sq.correctAnswer, sq.choices)}</span></p>
                            )}
                            {manualVerdict?.comment && <p className="mt-1 text-[11.5px] text-text-tertiary">Commentaire du correcteur : {manualVerdict.comment}</p>}
                            <p className="mt-1 text-[11px] text-text-tertiary">Points : {inProgress || pending ? "—" : subPoints} / {sq.points}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                <p className="mt-1.5 text-[11.5px] text-text-tertiary">Points : {q.pointsAwarded ?? "—"} / {q.points}</p>
                {q.explanation && (
                  <p className="mt-1.5 rounded-md bg-surface-sunken px-2.5 py-1.5 text-[12px] text-text-secondary">
                    <span className="font-medium text-text-tertiary">Explication : </span>{q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
