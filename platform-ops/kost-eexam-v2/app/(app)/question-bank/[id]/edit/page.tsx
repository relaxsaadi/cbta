import { notFound } from "next/navigation";
import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import {
  getQuestionById,
  getCurrentVersion,
  QTYPE_LABELS,
  type QType,
  type NumericAnswerSpec,
  type ShortAnswerSpec,
  type MatchingAnswerSpec,
  type OrderingAnswerSpec,
  type ScenarioAnswerSpec,
} from "@/lib/questions";
import { Card, CardHeader } from "@/components/ui/Card";
import { EditQuestionForm } from "./EditQuestionForm";

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  await guardPage("administrator");
  const { id } = await params;
  const question = getQuestionById(Number(id));
  if (!question) notFound();
  const version = getCurrentVersion(question.id);
  if (!version) notFound();

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
    </div>
  );
}
