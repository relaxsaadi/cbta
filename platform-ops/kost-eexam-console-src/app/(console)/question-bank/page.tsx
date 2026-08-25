import { Library } from "lucide-react";
import { getQuestions } from "@/lib/question-bank-data";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { QuestionBankTable } from "./QuestionBankTable";

export const dynamic = "force-dynamic";

export default async function QuestionBankPage() {
  const questions = await getQuestions();

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Question Bank</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Live from Moodle — {questions.length} question{questions.length !== 1 ? "s" : ""} across all categories
        </p>
      </div>

      {questions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Library}
            title="No questions authored yet"
            description="Sécurité et Sauvetage and Secourisme categories exist as containers. Content authoring is planned for a later phase."
          />
        </Card>
      ) : (
        <QuestionBankTable questions={questions} />
      )}
    </div>
  );
}
