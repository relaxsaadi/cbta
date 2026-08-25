import { getComplianceData } from "@/lib/compliance-data";
import { ANAC_GAP_NOTES } from "@/lib/anac-gap-notes";
import { StatusPill } from "@/components/compliance/StatusPill";
import { ReportPrintHeader } from "@/components/reports/ReportPrintHeader";
import { PrintButton } from "@/components/reports/PrintButton";

export const dynamic = "force-dynamic";

export default async function AnacChecklistPage() {
  const categories = await getComplianceData();
  const generatedAt = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="print-page mx-auto flex max-w-[1280px] flex-col gap-6">
      <ReportPrintHeader title="Final ANAC Checklist Cross-Reference" generatedAt={generatedAt} />

      <div className="no-print flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
            Final ANAC Checklist Cross-Reference
          </h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            Every one of the 30 controls tracked since Phase 1, mapped to the ANAC audit area it addresses.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="no-print rounded-md border border-status-warning-border bg-status-warning-bg px-3.5 py-2.5 text-[12px] text-status-warning-text">
        No separate physical/paper ANAC checklist document was supplied to this system to cross-check
        line-by-line. This table maps the 30 controls tracked in the console against the general ANAC
        audit categories they were built to address (Security, Accessibility, Question Bank, Exam
        Management, Performance, Reports &amp; Analytics, Regulatory Compliance, Training &amp; Preparation,
        Feedback). If KOST Academy holds an official ANAC checklist document, provide it and this table
        can be re-verified line-by-line against it.
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-sunken/50">
                {["Original ANAC Requirement (audit area)", "Mapped KOST Control", "Status", "Evidence", "Gap"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {categories.flatMap((c) =>
                c.items.map((item, idx) => (
                  <tr key={`${c.name}-${item.requirement}`} className="hover:bg-surface-sunken/40 transition-colors">
                    {idx === 0 && (
                      <td rowSpan={c.items.length} className="px-4 py-2.5 text-[12.5px] font-semibold text-text-primary align-top border-r border-border-subtle whitespace-nowrap">
                        {c.name}
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-[12.5px] text-text-primary max-w-[240px]">{item.requirement}</td>
                    <td className="px-4 py-2.5"><StatusPill status={item.status} /></td>
                    <td className="px-4 py-2.5 text-[11.5px] text-text-secondary max-w-[260px]">{item.evidenceSummary}</td>
                    <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary max-w-[280px]">
                      {ANAC_GAP_NOTES[item.requirement] ?? "None identified within current tracked scope."}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
