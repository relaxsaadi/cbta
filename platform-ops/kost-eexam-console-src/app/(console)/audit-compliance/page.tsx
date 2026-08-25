import { ShieldCheck, Database, RotateCcw, Cloud, Gauge, Users, Library, ScrollText, LifeBuoy, GraduationCap, MessageSquareHeart, ListChecks, BookMarked, Globe, BadgeCheck, FileWarning } from "lucide-react";
import { getComplianceData, computeSummary } from "@/lib/compliance-data";
import { EvidenceCard } from "@/components/compliance/EvidenceCard";
import { ComplianceCategoryCard } from "@/components/compliance/ComplianceCategoryCard";
import { StatusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AuditCompliancePage() {
  const categories = await getComplianceData();
  const summary = computeSummary(categories);

  const findItem = (category: string, requirement: string) =>
    categories.find((c) => c.name === category)?.items.find((i) => i.requirement === requirement);

  const httpsItem = findItem("Accessibility", "Secure access to the platform (HTTPS)");
  const backupItem = findItem("Security", "Automated, verified backups");
  const qbankItem = findItem(
    "Question Bank",
    "Module-separated question categories (Sécurité et Sauvetage / Secourisme)"
  );
  const loadTestItem = findItem("Performance", "Concurrent user load testing");
  const rolesItem = findItem("Accessibility", "Account and role management");
  const logsItem = findItem("Reports & Analytics", "Audit trail / activity logs");
  const supportItem = findItem("Accessibility", "Online help / support resources");
  const practiceItem = findItem("Training & Preparation", "Practice test availability");
  const feedbackItem = findItem("Feedback", "Feedback collection mechanism");
  const resultsItem = findItem("Reports & Analytics", "Exam results reporting");
  const docsItem = findItem("Training & Preparation", "Instructor and candidate documentation");
  const browserItem = findItem("Accessibility", "Cross-browser compatibility");
  const identityItem = findItem("Security", "Candidate identity verification");
  const breachItem = findItem("Security", "Security incident / breach protocol");

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Audit &amp; Compliance
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          ANAC readiness checklist, backed exclusively by verifiable technical evidence.
        </p>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border-subtle bg-surface-raised px-5 py-3.5 shadow-sm">
        <span className="text-[12.5px] font-medium text-text-secondary mr-1">
          {summary.total} requirements tracked
        </span>
        <StatusBadge status="verified">{summary.verified} Verified</StatusBadge>
        <StatusBadge status="warning">{summary.partial} Partial</StatusBadge>
        <StatusBadge status="neutral">{summary.notConfigured} Not Configured</StatusBadge>
        <span className="ml-auto text-[11px] text-text-tertiary">
          No status is ever shown as Verified without a checked, real source.
        </span>
      </div>

      {/* Evidence Center */}
      <div>
        <h2 className="font-display text-[15px] font-semibold text-text-primary mb-3">Evidence Center</h2>
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
          <EvidenceCard
            icon={ShieldCheck}
            title="HTTPS / TLS"
            status={httpsItem?.status ?? "not_configured"}
            summary={httpsItem?.evidenceSummary ?? "No data"}
          />
          <EvidenceCard
            icon={Database}
            title="Backups"
            status={backupItem?.status ?? "not_configured"}
            summary={backupItem?.evidenceSummary ?? "No data"}
          />
          <EvidenceCard
            icon={RotateCcw}
            title="Restore Test"
            status={
              categories
                .find((c) => c.name === "Security")
                ?.items.find((i) => i.requirement === "Automated, verified backups")?.status ?? "not_configured"
            }
            summary="See Security category for full restore-test evidence"
          />
          <EvidenceCard
            icon={Cloud}
            title="Off-site Replication"
            status={backupItem?.status ?? "not_configured"}
            summary="Encrypted copy replicated off-server (Tailscale)"
          />
          <EvidenceCard
            icon={Gauge}
            title="Load Testing"
            status={loadTestItem?.status ?? "not_configured"}
            summary={loadTestItem?.evidenceSummary ?? "No data"}
          />
          <EvidenceCard
            icon={Users}
            title="User Roles"
            status={rolesItem?.status ?? "not_configured"}
            summary={rolesItem?.evidenceSummary ?? "No data"}
          />
          <EvidenceCard
            icon={Library}
            title="Question Bank Structure"
            status={qbankItem?.status ?? "not_configured"}
            summary={qbankItem?.evidenceSummary ?? "No data"}
            href="/question-bank"
          />
          <EvidenceCard
            icon={ScrollText}
            title="Audit Logs"
            status={logsItem?.status ?? "not_configured"}
            summary={logsItem?.evidenceSummary ?? "No data"}
            href="/audit-logs"
          />
          <EvidenceCard
            icon={LifeBuoy}
            title="Technical Support"
            status={supportItem?.status ?? "not_configured"}
            summary={supportItem?.evidenceSummary ?? "No data"}
            href="/support"
          />
          <EvidenceCard
            icon={GraduationCap}
            title="Practice Test"
            status={practiceItem?.status ?? "not_configured"}
            summary={practiceItem?.evidenceSummary ?? "No data"}
            href="/practice-test"
          />
          <EvidenceCard
            icon={MessageSquareHeart}
            title="Feedback"
            status={feedbackItem?.status ?? "not_configured"}
            summary={feedbackItem?.evidenceSummary ?? "No data"}
            href="/feedback"
          />
          <EvidenceCard
            icon={ListChecks}
            title="Results Reporting"
            status={resultsItem?.status ?? "not_configured"}
            summary={resultsItem?.evidenceSummary ?? "No data"}
            href="/results"
          />
          <EvidenceCard
            icon={BookMarked}
            title="Documentation"
            status={docsItem?.status ?? "not_configured"}
            summary={docsItem?.evidenceSummary ?? "No data"}
            href="/documentation"
          />
          <EvidenceCard
            icon={Globe}
            title="Browser Compatibility"
            status={browserItem?.status ?? "not_configured"}
            summary={browserItem?.evidenceSummary ?? "No data"}
          />
          <EvidenceCard
            icon={BadgeCheck}
            title="Identity Verification"
            status={identityItem?.status ?? "not_configured"}
            summary={identityItem?.evidenceSummary ?? "No data"}
            href="/identity-verification"
          />
          <EvidenceCard
            icon={FileWarning}
            title="Incident Response Procedure"
            status={breachItem?.status ?? "not_configured"}
            summary={breachItem?.evidenceSummary ?? "No data"}
            href="/security-procedure"
          />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-[15px] font-semibold text-text-primary">Compliance Checklist</h2>
        {categories.map((category) => (
          <ComplianceCategoryCard key={category.name} category={category} />
        ))}
      </div>
    </div>
  );
}
