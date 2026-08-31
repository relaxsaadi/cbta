import { notFound } from "next/navigation";
import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { getQuestionById, QTYPE_LABELS, type QType } from "@/lib/questions";
import { getQuestionTestPreview } from "@/lib/attempts";
import type { PreviewQuestion } from "../../../apercu-candidat/[assessmentId]/PreviewRunner";
import { TestQuestionRunner } from "./TestQuestionRunner";

// Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
// §11-14 — "Tester la question" depuis la banque de questions. Même
// périmètre que /question-bank/[id]/edit (administrateur uniquement) :
// tester une question implique de voir sa réponse correcte non masquée
// (§14 "admin/pédagogique permissions follow existing policy"), la même
// visibilité que l'écran d'édition sur cette MÊME question — jamais une
// exposition nouvelle.
export default async function TestQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  await guardPage("administrator");
  const { id } = await params;
  const questionId = Number(id);
  const question = getQuestionById(questionId);
  if (!question) notFound();
  const preview = getQuestionTestPreview(questionId);
  if (!preview) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">Tester {question.kost_question_id}</h1>
          <p className="text-[12.5px] text-text-tertiary">Type : {QTYPE_LABELS[question.qtype as QType] ?? question.qtype} — rendu identique à l&apos;écran candidat réel.</p>
        </div>
        <Link href="/question-bank" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">
          ← Retour à la banque de questions
        </Link>
      </div>
      <TestQuestionRunner question={preview as unknown as PreviewQuestion} questionId={questionId} kostQuestionId={question.kost_question_id} />
    </div>
  );
}
