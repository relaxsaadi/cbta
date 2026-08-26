import { notFound } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { getQuestionById, getCurrentVersion } from "@/lib/questions";
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
  const correct: string[] = JSON.parse(version.correct_answer);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Modifier {question.kost_question_id}</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Version actuelle : v{version.version_no}. Enregistrer crée une NOUVELLE version — les examens déjà
          publiés avec la version précédente ne sont jamais modifiés rétroactivement.
        </p>
      </div>
      <Card>
        <CardHeader title="Nouvelle version" />
        <EditQuestionForm questionId={question.id} initialStem={version.stem} initialChoices={choices} initialCorrect={correct} initialExplanation={version.explanation ?? ""} />
      </Card>
    </div>
  );
}
