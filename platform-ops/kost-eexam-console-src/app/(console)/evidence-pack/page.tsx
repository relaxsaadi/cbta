import { getComplianceData } from "@/lib/compliance-data";
import { deriveVerificationMethod } from "@/lib/verification-method";
import { StatusPill } from "@/components/compliance/StatusPill";
import { Card } from "@/components/ui/Card";
import { ReportPrintHeader } from "@/components/reports/ReportPrintHeader";
import { PrintButton } from "@/components/reports/PrintButton";

export const dynamic = "force-dynamic";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Groupes de preuves demandés pour l'Evidence Pack — chaque entrée référence
// la catégorie + l'exigence réelle dont elle est tirée dans
// lib/compliance-data.ts. Aucune preuve n'est dupliquée ou reformulée avec
// des valeurs différentes : c'est exactement le même item que sur
// /audit-compliance et /audit-readiness.
const PACK_GROUPS: { label: string; category: string; requirement: string }[] = [
  { label: "TLS / HTTPS", category: "Accessibility", requirement: "Secure access to the platform (HTTPS)" },
  { label: "Backup Logs", category: "Security", requirement: "Automated, verified backups" },
  { label: "Restore Test", category: "Security", requirement: "Automated, verified backups" },
  { label: "Off-site Replication", category: "Security", requirement: "Automated, verified backups" },
  { label: "Server Configuration", category: "Security", requirement: "Server stability and security hardening" },
  { label: "Load Test", category: "Performance", requirement: "Concurrent user load testing" },
  { label: "Roles / RBAC", category: "Accessibility", requirement: "Account and role management" },
  { label: "Question Bank", category: "Question Bank", requirement: "Module-separated question categories (Sécurité et Sauvetage / Secourisme)" },
  { label: "Randomization", category: "Question Bank", requirement: "Randomized question selection / shuffled answers" },
  { label: "Timer / Auto-submit", category: "Exam Management", requirement: "Timer and automatic submission" },
  { label: "Sessions", category: "Exam Management", requirement: "Session scheduling and management" },
  { label: "Audit Logs", category: "Reports & Analytics", requirement: "Audit trail / activity logs" },
  { label: "Support", category: "Accessibility", requirement: "Online help / support resources" },
  { label: "Technical Incidents", category: "Security", requirement: "Technical incident reporting mechanism" },
  { label: "Practice Test", category: "Training & Preparation", requirement: "Practice test availability" },
  { label: "Feedback", category: "Feedback", requirement: "Feedback collection mechanism" },
  { label: "Results", category: "Reports & Analytics", requirement: "Exam results reporting" },
  { label: "Documentation", category: "Training & Preparation", requirement: "Instructor and candidate documentation" },
  { label: "Browser Tests", category: "Accessibility", requirement: "Cross-browser compatibility" },
  { label: "Security Incident Procedure", category: "Security", requirement: "Security incident / breach protocol" },
  { label: "Identity Verification", category: "Security", requirement: "Candidate identity verification" },
];

export default async function EvidencePackPage() {
  const categories = await getComplianceData();
  const generatedAt = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const findItem = (category: string, requirement: string) =>
    categories.find((c) => c.name === category)?.items.find((i) => i.requirement === requirement);

  return (
    <div className="print-page mx-auto flex max-w-[1000px] flex-col gap-6">
      <ReportPrintHeader title="ANAC E-EXAM Evidence Pack" generatedAt={generatedAt} />

      <div className="no-print flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
            ANAC E-EXAM Evidence Pack
          </h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            21 technical evidence groups, compiled from the same live sources as Audit &amp; Compliance.
            Excludes passwords, tokens, private keys, and raw personal data.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="no-print rounded-md border border-status-warning-border bg-status-warning-bg px-3.5 py-2.5 text-[12px] text-status-warning-text">
        This pack never includes secrets (passwords, tokens, private keys) or raw personal data. Where
        a full document exists (e.g. Security Incident Response Procedure), only its published summary
        is included here — the source document is linked, not reproduced with sensitive detail.
      </div>

      <div className="flex flex-col gap-3">
        {PACK_GROUPS.map((g, i) => {
          const item = findItem(g.category, g.requirement);
          return (
            <Card key={`${g.label}-${i}`} padding="sm" className="print-avoid-break">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[13.5px] font-semibold text-text-primary">{g.label}</p>
                  <p className="text-[11px] text-text-tertiary">{g.category}</p>
                </div>
                {item && <StatusPill status={item.status} />}
              </div>
              {item ? (
                <>
                  <p className="mt-2 text-[12.5px] text-text-secondary">{item.evidenceSummary}</p>
                  <div className="mt-2 grid grid-cols-3 gap-3 text-[11px] text-text-tertiary">
                    <span>Source: {item.evidence?.source ?? "—"}</span>
                    <span>Last verified: {fmt(item.lastVerified)}</span>
                    <span>Method: {deriveVerificationMethod(item)}</span>
                  </div>
                  {item.evidence?.technicalDetails && (
                    <pre className="mt-2 whitespace-pre-wrap rounded-md bg-surface-sunken border border-border-subtle p-2.5 font-mono text-[10.5px] leading-relaxed text-text-secondary">
                      {item.evidence.technicalDetails}
                    </pre>
                  )}
                </>
              ) : (
                <p className="mt-2 text-[12.5px] text-text-tertiary italic">No data available for this item.</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
