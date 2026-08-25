import { SECURITY_PROCEDURE_META, SECURITY_PROCEDURE_SECTIONS } from "@/lib/security-procedure-content";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default function SecurityProcedurePage() {
  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Security Incident Response Procedure
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Real, internal procedure — versioned in the project repository at
          <code className="mx-1 rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[11.5px]">
            docs/SECURITY_INCIDENT_RESPONSE_PROCEDURE.md
          </code>
          and accessible to relevant console roles.
        </p>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-md border border-border-subtle bg-surface-sunken/50 px-3.5 py-2.5 text-[11.5px] text-text-tertiary">
        <span>Version <strong className="text-text-secondary">{SECURITY_PROCEDURE_META.version}</strong></span>
        <span>Effective date <strong className="text-text-secondary">{SECURITY_PROCEDURE_META.effectiveDate}</strong></span>
        <span>Owner <strong className="text-text-secondary">{SECURITY_PROCEDURE_META.owner}</strong></span>
      </div>

      <div className="rounded-md border border-status-warning-border bg-status-warning-bg px-3.5 py-2.5 text-[12px] text-status-warning-text">
        The existence of this procedure does not certify the platform is free of vulnerabilities —
        it defines the response process for when one is found or exploited.
      </div>

      <div className="flex flex-col gap-3">
        {SECURITY_PROCEDURE_SECTIONS.map((s) => (
          <Card key={s.title} padding="sm">
            <p className="font-display text-[13.5px] font-semibold text-text-primary">{s.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{s.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
