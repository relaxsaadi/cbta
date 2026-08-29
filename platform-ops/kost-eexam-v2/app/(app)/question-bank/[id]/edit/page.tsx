import { notFound } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { getQuestionById, getCurrentVersion, QTYPE_LABELS, type QType, type NumericAnswerSpec, type ShortAnswerSpec } from "@/lib/questions";
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Modifier {question.kost_question_id}</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Type : {QTYPE_LABELS[qtype] ?? qtype} — Version actuelle : v{version.version_no}. Enregistrer crée une NOUVELLE version — les examens déjà
          publiés avec la version précédente ne sont jamais modifiés rétroactivement.
        </p>
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
        />
      </Card>
    </div>
  );
}
