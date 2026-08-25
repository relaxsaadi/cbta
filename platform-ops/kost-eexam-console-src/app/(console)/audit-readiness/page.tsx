import Link from "next/link";
import { getComplianceData, computeSummary } from "@/lib/compliance-data";
import { deriveVerificationMethod, evidenceAnchor } from "@/lib/verification-method";
import { StatusBadge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/compliance/StatusPill";
import { Card } from "@/components/ui/Card";
import { ReportPrintHeader } from "@/components/reports/ReportPrintHeader";
import { PrintButton } from "@/components/reports/PrintButton";

export const dynamic = "force-dynamic";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AuditReadinessPage() {
  const categories = await getComplianceData();
  const summary = computeSummary(categories);
  const generatedAt = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // Readiness is a qualitative statement, deliberately not a percentage —
  // a numeric "compliance score" would misrepresent regulatory compliance,
  // which only ANAC itself can confer.
  const readinessLabel =
    summary.notConfigured === 0
      ? "Technically ready for review — all tracked controls are Verified or Partial with a documented reason"
      : `${summary.notConfigured} control(s) still Not Configured — review before presenting to ANAC`;

  return (
    <div className="print-page mx-auto flex max-w-[1280px] flex-col gap-6">
      <ReportPrintHeader title="Audit Readiness Summary" generatedAt={generatedAt} />

      <div className="no-print flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
            Audit Readiness Summary
          </h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            Technical Audit Readiness — every status below is backed by a live-checked or documented
            real source. Not a regulatory compliance percentage.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/evidence-pack"
            className="no-print rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong transition-colors"
          >
            Evidence Pack →
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Overall readiness statement */}
      <Card className="print-avoid-break">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
          Overall Technical Audit Readiness
        </p>
        <p className="mt-1.5 text-[15px] font-medium text-text-primary leading-relaxed">{readinessLabel}</p>
        <p className="mt-2 text-[12px] text-text-tertiary">
          This statement describes the platform&apos;s technical readiness for an ANAC audit — it is not
          itself an ANAC compliance determination, which only ANAC can issue.
        </p>
      </Card>

      {/* Summary counts */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-5 print-avoid-break">
        <Stat label="Total Requirements" value={String(summary.total)} />
        <Stat label="Verified" value={String(summary.verified)} accent="verified" />
        <Stat label="Partial" value={String(summary.partial)} accent="warning" />
        <Stat label="Not Configured" value={String(summary.notConfigured)} accent="neutral" />
        <Stat label="Not Applicable" value={String(summary.notApplicable)} accent="neutral" />
      </div>

      {/* Category breakdown */}
      <div>
        <h2 className="font-display text-[15px] font-semibold text-text-primary mb-3">By Category</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 print-avoid-break">
          {categories.map((c) => {
            const v = c.items.filter((i) => i.status === "verified").length;
            const p = c.items.filter((i) => i.status === "partial").length;
            const nc = c.items.filter((i) => i.status === "not_configured").length;
            return (
              <Card key={c.name} padding="sm">
                <p className="font-display text-[13px] font-semibold text-text-primary">{c.name}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <StatusBadge status="verified">{v} Verified</StatusBadge>
                  {p > 0 && <StatusBadge status="warning">{p} Partial</StatusBadge>}
                  {nc > 0 && <StatusBadge status="neutral">{nc} Not Configured</StatusBadge>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Requirement -> Evidence mapping table */}
      <div>
        <h2 className="font-display text-[15px] font-semibold text-text-primary mb-3">
          Requirement → Evidence Mapping
        </h2>
        <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-sunken/50">
                  {["Requirement", "Status", "Evidence Source", "Last Verified", "Verification Method", "Owner", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {categories.flatMap((c) =>
                  c.items.map((item) => (
                    <tr key={`${c.name}-${item.requirement}`} className="hover:bg-surface-sunken/40 transition-colors">
                      <td className="px-4 py-2.5 text-[12.5px] font-medium text-text-primary max-w-[260px]">
                        {item.requirement}
                        <span className="block text-[10.5px] font-normal text-text-tertiary">{c.name}</span>
                      </td>
                      <td className="px-4 py-2.5"><StatusPill status={item.status} /></td>
                      <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary max-w-[220px] truncate">{item.evidence?.source ?? "—"}</td>
                      <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary tabular-nums whitespace-nowrap">{fmt(item.lastVerified)}</td>
                      <td className="px-4 py-2.5 text-[11.5px] text-text-secondary whitespace-nowrap">{deriveVerificationMethod(item)}</td>
                      <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary whitespace-nowrap">{item.responsible}</td>
                      <td className="px-4 py-2.5 no-print">
                        <Link
                          href={`/audit-compliance#${evidenceAnchor(item)}`}
                          className="rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:border-border-strong transition-colors whitespace-nowrap"
                        >
                          View Evidence
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "verified" | "warning" | "neutral" }) {
  return (
    <Card padding="sm">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p
        className="mt-1 font-display text-[22px] font-semibold tabular-nums"
        style={{
          color:
            accent === "verified"
              ? "var(--status-verified-text)"
              : accent === "warning"
              ? "var(--status-warning-text)"
              : "var(--text-primary)",
        }}
      >
        {value}
      </p>
    </Card>
  );
}
