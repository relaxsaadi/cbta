import { FileCheck2 } from "lucide-react";
import { getExams } from "@/lib/exams-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; badge: "verified" | "warning" | "neutral" | "critical" }> = {
  open: { label: "Open", badge: "verified" },
  scheduled: { label: "Scheduled", badge: "warning" },
  closed: { label: "Closed", badge: "neutral" },
  no_window: { label: "No window set", badge: "neutral" },
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function ExamsPage() {
  const exams = await getExams();

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Exams</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Live from Moodle Quiz — {exams.length} exam{exams.length !== 1 ? "s" : ""} configured
        </p>
      </div>

      {exams.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileCheck2}
            title="No exams configured yet"
            description="Exams are created directly in Moodle Quiz. Once configured, they appear here automatically with real settings — nothing is simulated."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {exams.map((exam) => {
            const status = STATUS_LABEL[exam.status];
            return (
              <Card key={exam.id}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-[15px] font-semibold text-text-primary">{exam.name}</h3>
                      <StatusBadge status={status.badge}>{status.label}</StatusBadge>
                    </div>
                    <p className="mt-1 text-[12.5px] text-text-tertiary">{exam.course}</p>
                    {exam.dgrFunctions.length > 0 && (
                      <div className="mt-2 flex gap-1.5 flex-wrap">
                        {exam.dgrFunctions.map((f) => (
                          <span key={f} className="rounded-full bg-accent-soft-bg border border-accent-soft-border px-2 py-0.5 text-[10.5px] font-medium text-accent-11">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 border-t border-border-subtle pt-4">
                  <Field label="Duration" value={`${exam.durationMinutes} min`} />
                  <Field label="Passing score" value={exam.passingScore !== null ? `${exam.passingScore}/${exam.maxGrade}` : "Not set"} />
                  <Field label="Questions" value={String(exam.numQuestions)} />
                  <Field label="Attempts allowed" value={exam.attemptsAllowed === Infinity ? "Unlimited" : String(exam.attemptsAllowed)} />
                  <Field label="Randomize answers" value={exam.shuffleAnswers ? "Yes" : "No"} />
                  <Field label="Overdue handling" value={exam.overdueHandling === "autosubmit" ? "Auto-submit" : exam.overdueHandling} />
                  <Field label="Opens" value={fmtDate(exam.timeOpen)} />
                  <Field label="Closes" value={fmtDate(exam.timeClose)} />
                </div>

                <div className="mt-4 flex gap-2 border-t border-border-subtle pt-3.5">
                  <a
                    href={`https://exam.kostacademy.com/mod/quiz/view.php?id=${exam.cmid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:border-border-strong transition-colors"
                  >
                    Configure in Moodle
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
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
