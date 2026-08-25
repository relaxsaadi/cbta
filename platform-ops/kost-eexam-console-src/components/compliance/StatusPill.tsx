import { StatusBadge } from "@/components/ui/Badge";
import type { ComplianceStatus } from "@/lib/compliance-data";

const LABELS: Record<ComplianceStatus, string> = {
  verified: "Verified",
  partial: "Partial",
  not_configured: "Not Configured",
  not_applicable: "Not Applicable",
};

export function StatusPill({ status }: { status: ComplianceStatus }) {
  const badgeStatus =
    status === "verified" ? "verified" : status === "partial" ? "warning" : "neutral";
  return <StatusBadge status={badgeStatus}>{LABELS[status]}</StatusBadge>;
}
