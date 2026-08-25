import Link from "next/link";
import { ListChecks } from "lucide-react";
import { getResults, computeResultsSummary } from "@/lib/results-data";
import { isDemoModeActive } from "@/lib/demo-mode-server";
import { redactName } from "@/lib/demo-mode";
import { Card } from "@/components/ui/Card";
import { StatusBadge, type BadgeStatus } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

const STATE_BADGE: Record<string, BadgeStatus> = {
  finished: "verified",
  inprogress: "warning",
  overdue: "critical",
  abandoned: "neutral",
};
const STATE_LABEL: Record<string, string> = {
  finished: "Completed",
  inprogress: "In Progress",
  overdue: "Overdue",
  abandoned: "Abandoned",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtDuration(s: number | null): string {
  if (s === null) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

export default async function ResultsPage() {
  const [results, demoMode] = await Promise.all([getResults(), isDemoModeActive()]);
  const summary = computeResultsSummary(results);
  const displayResults = demoMode ? results.map((r) => ({ ...r, candidateName: redactName(r.candidateName) })) : results;

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Results</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Live from Moodle — official grades only, never recalculated by this console.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <Stat label="Total attempts" value={String(summary.totalAttempts)} />
        <Stat label="Completed" value={String(summary.completedAttempts)} />
        <Stat label="Pass rate" value={summary.passRate !== null ? `${summary.passRate.toFixed(0)}%` : "No data"} />
        <Stat
          label="Avg. completion time"
          value={summary.averageDurationSeconds !== null ? fmtDuration(Math.round(summary.averageDurationSeconds)) : "No data"}
        />
      </div>

      {results.length === 0 ? (
        <Card>
          <EmptyState
            icon={ListChecks}
            title="No attempts recorded yet"
            description="Results appear here automatically once a candidate completes a real Moodle Quiz attempt. Nothing is shown until then."
          />
        </Card>
      ) : (
        <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-sunken/50">
                  {["Candidate", "Exam", "Attempt", "Started", "Finished", "Duration", "Grade", "Result", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {displayResults.map((r) => (
                  <tr key={r.attemptId} className="hover:bg-surface-sunken/40 transition-colors">
                    <td className="px-4 py-2.5 text-[12.5px] font-medium text-text-primary whitespace-nowrap">
                      <Link href={`/results/${r.attemptId}`} className="hover:text-accent-9 hover:underline underline-offset-2">
                        {r.candidateName}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-text-secondary max-w-[220px] truncate">{r.examName}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-tertiary tabular-nums">#{r.attemptNumber}</td>
                    <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary tabular-nums whitespace-nowrap">{fmtDate(r.timeStart)}</td>
                    <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary tabular-nums whitespace-nowrap">{fmtDate(r.timeFinish)}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-tertiary tabular-nums whitespace-nowrap">{fmtDuration(r.durationSeconds)}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-primary tabular-nums whitespace-nowrap">
                      {r.officialGrade !== null ? `${r.officialGrade.toFixed(2)} / ${r.gradeMax.toFixed(0)}` : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {r.passFail === "pass" && <StatusBadge status="verified">Pass</StatusBadge>}
                      {r.passFail === "fail" && <StatusBadge status="critical">Fail</StatusBadge>}
                      {r.passFail === "not_applicable" && <StatusBadge status="neutral">N/A</StatusBadge>}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={STATE_BADGE[r.state]}>{STATE_LABEL[r.state]}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[11.5px] text-text-tertiary">
        Moodle already treats a finished attempt with auto-graded questions (MCQ / True-False) as
        final — no separate "Pending Review / Validated" workflow is applied here, since building
        one would be artificial for content that requires no manual grading. This will be
        revisited if manually-graded question types (e.g. essay) are introduced.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="mt-1 font-display text-[20px] font-semibold text-text-primary tabular-nums">{value}</p>
    </Card>
  );
}
