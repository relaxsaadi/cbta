import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type BadgeStatus = "verified" | "warning" | "critical" | "neutral";

const statusStyles: Record<BadgeStatus, string> = {
  verified: "bg-status-verified-bg text-status-verified-text border-status-verified-border [--dot:var(--status-verified-dot)]",
  warning: "bg-status-warning-bg text-status-warning-text border-status-warning-border [--dot:var(--status-warning-dot)]",
  critical: "bg-status-critical-bg text-status-critical-text border-status-critical-border [--dot:var(--status-critical-dot)]",
  neutral: "bg-status-neutral-bg text-status-neutral-text border-status-neutral-border [--dot:var(--status-neutral-dot)]",
};

export function StatusBadge({ status, children }: { status: BadgeStatus; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium leading-none", statusStyles[status])}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--dot)" }} />
      {children}
    </span>
  );
}
