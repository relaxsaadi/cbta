import { GraduationCap } from "lucide-react";
import { getPracticeTest } from "@/lib/practice-test-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function PracticeTestPage() {
  const practiceTest = await getPracticeTest();

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Practice Test
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Live from Moodle Quiz — a real, separate quiz used only for interface familiarization.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-status-warning-border bg-status-warning-bg px-3.5 py-2.5">
        <span className="font-display text-[12.5px] font-semibold text-status-warning-text">
          Practice / Training Only — Not a Certification Examination
        </span>
      </div>

      {!practiceTest ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Practice Test not configured"
            description="No quiz tagged 'practice-test' was found in Moodle. Nothing is shown here until a real practice quiz exists."
          />
        </Card>
      ) : (
        <Card>
          <CardHeader
            title={practiceTest.name}
            description={`Course: ${practiceTest.course} — a dedicated, visible course separate from any regulatory exam.`}
          />
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 border-t border-border-subtle pt-4">
            <Field label="Duration" value={`${practiceTest.durationMinutes} min`} />
            <Field label="Questions" value={String(practiceTest.numQuestions)} />
            <Field label="Question types" value={practiceTest.questionTypes.join(", ") || "—"} />
            <Field
              label="Attempts allowed"
              value={practiceTest.attemptsAllowed === Infinity ? "Unlimited" : String(practiceTest.attemptsAllowed)}
            />
            <Field label="Randomize answers" value={practiceTest.shuffleAnswers ? "Yes" : "No"} />
          </div>

          <div className="mt-4 flex gap-2 border-t border-border-subtle pt-3.5">
            <a
              href={`https://exam.kostacademy.com/mod/quiz/view.php?id=${practiceTest.cmid}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10 transition-colors"
            >
              Start Practice Test
            </a>
          </div>
          <p className="mt-3 text-[11.5px] text-text-tertiary">
            Contains generic questions only (interface navigation, answer selection, timer
            behaviour) — no DGR regulatory content. Question category is kept structurally
            separate from the real exam question categories.
          </p>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-text-primary tabular-nums">{value}</p>
    </div>
  );
}
