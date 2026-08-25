import { BarChart3 } from "lucide-react";
import { getReportsData } from "@/lib/reports-data";
import { DGR_FUNCTIONS } from "@/lib/dgr-functions";
import { getExams } from "@/lib/exams-data";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

function fmtDuration(s: number | null): string {
  if (s === null) return "No data";
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}m ${sec}s`;
}
function fmtPercent(n: number | null): string {
  return n !== null ? `${n.toFixed(0)}%` : "No data";
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string; dgrFunction?: string }>;
}) {
  const params = await searchParams;
  const [data, exams] = await Promise.all([
    getReportsData({ examName: params.exam, dgrFunction: params.dgrFunction }),
    getExams(),
  ]);
  const examNames = Array.from(new Set(exams.map((e) => e.name)));

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Reports</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Aggregate statistics computed exclusively from real Moodle results — zero fictitious data.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2.5" method="get">
        <select name="exam" defaultValue={params.exam ?? ""} className="rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px] text-text-secondary">
          <option value="">All exams</option>
          {examNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select name="dgrFunction" defaultValue={params.dgrFunction ?? ""} className="rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px] text-text-secondary">
          <option value="">All DGR functions</option>
          {DGR_FUNCTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10 transition-colors">
          Apply filters
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-5">
        <Stat label="Exams completed" value={String(data.examsCompleted)} />
        <Stat label="Candidates assessed" value={String(data.candidatesAssessed)} />
        <Stat label="Pass rate" value={fmtPercent(data.passRate)} />
        <Stat label="Average score" value={fmtPercent(data.averageScorePercent)} />
        <Stat label="Avg. completion time" value={fmtDuration(data.averageDurationSeconds)} />
      </div>

      {data.byExam.length === 0 ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="No data for this filter"
            description="Reports are built exclusively from real completed Moodle attempts. Adjust filters or wait for real activity."
          />
        </Card>
      ) : (
        <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-sunken/50">
                  {["Exam", "DGR Function", "Attempts", "Pass rate", "Average score"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {data.byExam.map((row) => (
                  <tr key={row.examName} className="hover:bg-surface-sunken/40 transition-colors">
                    <td className="px-4 py-2.5 text-[12.5px] font-medium text-text-primary max-w-[240px] truncate">{row.examName}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-secondary">{row.dgrFunctions.join(", ") || "Not classified"}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-tertiary tabular-nums">{row.attempts}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-primary tabular-nums">{fmtPercent(row.passRate)}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-primary tabular-nums">{fmtPercent(row.averageScorePercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="mt-1 font-display text-[18px] font-semibold text-text-primary tabular-nums">{value}</p>
    </Card>
  );
}
