import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listFunctions } from "@/lib/functions";
import { listQuestionsByFunction, countAdmissibleQuestions } from "@/lib/questions";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { CreateQuestionForm } from "./CreateQuestionForm";

const STATUS_BADGE: Record<string, "verified" | "warning" | "critical" | "neutral"> = {
  FROZEN_SOURCE_VERIFIED: "verified",
  DRAFT: "neutral",
  PARTIAL: "warning",
  STALE: "warning",
  SOURCE_GAP: "critical",
  SOURCE_CONFLICT: "critical",
  NOT_ATTEMPTED: "neutral",
};

export default async function QuestionBankPage() {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const functions = listFunctions();
  const canWrite = session.role === "administrator";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Banque de questions</h1>

      {canWrite && (
        <Card>
          <CardHeader
            title="Ajouter une question"
            description="Saisie contrôlée uniquement — jamais de contenu inventé. Une question non FROZEN_SOURCE_VERIFIED n'entre jamais automatiquement dans un examen de production."
          />
          <CreateQuestionForm functions={functions} />
        </Card>
      )}

      {functions.map((fn) => {
        const questions = listQuestionsByFunction(fn.code);
        const admissible = countAdmissibleQuestions(fn.code);
        return (
          <Card key={fn.code}>
            <CardHeader
              title={fn.label}
              description={`${questions.length} question(s) au total — ${admissible} admissible(s) pour un examen de production`}
            />
            {questions.length === 0 ? (
              <p className="text-[13px] text-text-tertiary">Aucune question pour cette fonction.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {questions.map((q) => (
                  <div key={q.id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] text-text-primary">
                        <span className="font-mono text-[11.5px] text-text-tertiary mr-2">{q.kost_question_id}</span>
                        {q.stem}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={STATUS_BADGE[q.source_status] ?? "neutral"}>{q.source_status}</StatusBadge>
                      {canWrite && (
                        <Link href={`/question-bank/${q.id}/edit`} className="text-[12px] font-medium text-accent-9 hover:underline">
                          Modifier
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
