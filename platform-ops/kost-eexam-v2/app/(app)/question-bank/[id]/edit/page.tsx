import { notFound } from "next/navigation";
import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import {
  getQuestionById,
  getCurrentVersion,
  getAnnualReviewHistory,
  ANNUAL_REVIEW_LABELS,
  QTYPE_LABELS,
  type QType,
  type NumericAnswerSpec,
  type ShortAnswerSpec,
  type MatchingAnswerSpec,
  type OrderingAnswerSpec,
  type ScenarioAnswerSpec,
} from "@/lib/questions";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EditQuestionForm } from "./EditQuestionForm";
import { AnnualReviewForm } from "./AnnualReviewForm";

const ANNUAL_REVIEW_BADGE: Record<string, "verified" | "warning" | "neutral"> = {
  A_REVOIR: "warning",
  REVUE_EN_COURS: "neutral",
  REVUE_TERMINEE: "verified",
};

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  await guardPage("administrator");
  const { id } = await params;
  const question = getQuestionById(Number(id));
  if (!question) notFound();
  const version = getCurrentVersion(question.id);
  if (!version) notFound();
  const annualReviews = getAnnualReviewHistory(question.id);
  const latestAnnualReview = annualReviews[0];

  const choices: { key: string; text: string }[] = JSON.parse(version.choices_json);
  const qtype = question.qtype as QType;
  // Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §60-61 — cette
  // page supposait auparavant correct_answer toujours = string[] (vrai
  // uniquement pour mcq_single/mcq_multi/true_false) ; pour numeric/
  // short_answer c'est un OBJET (voir lib/questions.ts). Le type de la
  // question est FIXE après création (jamais changé ici, cohérent avec
  // §4 — append-only) ; seul le contenu propre à ce type est modifiable.
  const correct: string[] = qtype === "mcq_single" || qtype === "mcq_multi" || qtype === "true_false" ? JSON.parse(version.correct_answer) : [];
  const numericSpec: NumericAnswerSpec | null = qtype === "numeric" ? JSON.parse(version.correct_answer) : null;
  const shortAnswerSpec: ShortAnswerSpec | null = qtype === "short_answer" ? JSON.parse(version.correct_answer) : null;
  // Mission "MISSION FINALE CIBLÉE" (2026-08-30) — mêmes principe : qtype
  // est FIXE après création (§4, append-only), seul le contenu propre au
  // type est modifiable. `choices` (déjà JSON.parse plus haut) porte les
  // deux côtés d'un appariement / les éléments d'un ordre — EditQuestionForm
  // reconstruit les champs bruts d'auteurage à partir de ces deux valeurs.
  const matchingSpec: MatchingAnswerSpec | null = qtype === "matching" ? JSON.parse(version.correct_answer) : null;
  const orderingSpec: OrderingAnswerSpec | null = qtype === "ordering" ? JSON.parse(version.correct_answer) : null;
  const scenarioSpec: ScenarioAnswerSpec | null = qtype === "scenario" ? JSON.parse(version.correct_answer) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">Modifier {question.kost_question_id}</h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            Type : {QTYPE_LABELS[qtype] ?? qtype} — Version actuelle : v{version.version_no}. Enregistrer crée une NOUVELLE version — les examens déjà
            publiés avec la version précédente ne sont jamais modifiés rétroactivement.
          </p>
        </div>
        <Link href={`/question-bank/${question.id}/test`} className="shrink-0 rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
          Tester la question
        </Link>
      </div>
      <Card>
        <CardHeader title="Nouvelle version" />
        <EditQuestionForm
          questionId={question.id}
          qtype={qtype}
          initialStem={version.stem}
          initialChoices={choices}
          initialCorrect={correct}
          initialExplanation={version.explanation ?? ""}
          initialNumeric={numericSpec}
          initialShortAnswer={shortAnswerSpec}
          initialMatching={matchingSpec}
          initialOrdering={orderingSpec}
          initialScenario={scenarioSpec}
        />
      </Card>

      {/* Mission "CLOSE AUDITOR REMARKS" (2026-08-31) §2-4 — revue annuelle
          par un instructeur habilité, DISTINCTE du statut source et du
          statut reviewer déjà affichés ailleurs sur cette fiche (jamais
          confondus, voir lib/questions.ts). Historique en ajout seul —
          jamais une ligne modifiée, toujours une nouvelle. */}
      <Card>
        <CardHeader
          title="Revue annuelle"
          description="Traçabilité de la revue annuelle par un instructeur habilité — distincte du statut source et du statut reviewer ci-dessus."
        />
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[12.5px] text-text-secondary">Statut actuel :</span>
          <StatusBadge status={ANNUAL_REVIEW_BADGE[latestAnnualReview?.decision ?? "A_REVOIR"] ?? "warning"}>
            {ANNUAL_REVIEW_LABELS[latestAnnualReview?.decision ?? "A_REVOIR"]}
          </StatusBadge>
        </div>
        <AnnualReviewForm questionId={question.id} />

        {annualReviews.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-[12px] font-medium text-text-secondary">Historique ({annualReviews.length})</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-text-tertiary">
                    <th className="pb-2 pr-3 font-medium">Année</th>
                    <th className="pb-2 pr-3 font-medium">Édition</th>
                    <th className="pb-2 pr-3 font-medium">Réviseur</th>
                    <th className="pb-2 pr-3 font-medium">Date</th>
                    <th className="pb-2 pr-3 font-medium">Décision</th>
                    <th className="pb-2 pr-3 font-medium">Prochaine échéance</th>
                    <th className="pb-2 font-medium">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {annualReviews.map((r) => (
                    <tr key={r.id} className="border-b border-border-subtle last:border-0">
                      <td className="py-2 pr-3 text-text-secondary">{r.review_year}</td>
                      <td className="py-2 pr-3 text-text-secondary">{r.applicable_edition}</td>
                      <td className="py-2 pr-3 text-text-secondary">
                        {r.reviewer_name}
                        {r.reviewer_qualification ? ` (${r.reviewer_qualification})` : ""}
                      </td>
                      <td className="py-2 pr-3 text-text-secondary">{new Date(r.review_date).toLocaleDateString("fr-FR")}</td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={ANNUAL_REVIEW_BADGE[r.decision] ?? "warning"}>{ANNUAL_REVIEW_LABELS[r.decision]}</StatusBadge>
                      </td>
                      <td className="py-2 pr-3 text-text-secondary">{r.next_review_due ? new Date(r.next_review_due).toLocaleDateString("fr-FR") : "—"}</td>
                      <td className="py-2 text-text-secondary">{r.comment ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
