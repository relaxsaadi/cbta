import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  unavailable,
  accent = "neutral",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  unavailable?: boolean;
  accent?: "neutral" | "brand";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border-subtle bg-surface-raised p-[18px] shadow-sm ring-1 ring-black/[0.02]",
        "transition-shadow hover:shadow-md"
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-[0.06]"
        style={{ background: accent === "brand" ? "var(--accent-9)" : "var(--text-primary)" }}
      />
      <div className="relative flex items-start justify-between">
        <p className="text-[11.5px] font-semibold tracking-[0.02em] text-text-tertiary uppercase">
          {label}
        </p>
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-sunken text-text-secondary">
          <Icon size={13} strokeWidth={2.25} />
        </div>
      </div>
      <p
        className={cn(
          "relative mt-3 font-display tracking-tight tabular-nums",
          unavailable ? "text-[15px] font-medium text-text-tertiary" : "text-[26px] font-semibold text-text-primary"
        )}
      >
        {unavailable ? "Not available" : value}
      </p>
    </div>
  );
}
