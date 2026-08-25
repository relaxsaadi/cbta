import { StatusBadge } from "@/components/ui/Badge";
import type { ComplianceStatus } from "@/lib/compliance-data";

const LABELS: Record<ComplianceStatus, string> = {
  verified: "Vérifié",
  partial: "Partiel",
  not_configured: "Non configuré",
  not_applicable: "Non applicable",
};

export function StatusPill({ status }: { status: ComplianceStatus }) {
  const badgeStatus =
    status === "verified" ? "verified" : status === "partial" ? "warning" : "neutral";
  return <StatusBadge status={badgeStatus}>{LABELS[status]}</StatusBadge>;
}
