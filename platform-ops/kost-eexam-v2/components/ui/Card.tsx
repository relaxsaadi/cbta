import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  padding = "md",
}: {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border-subtle bg-surface-raised shadow-sm",
        "ring-1 ring-black/[0.02]",
        padding === "md" && "p-5",
        padding === "sm" && "p-3.5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h3 className="font-display text-[13.5px] font-semibold text-text-primary tracking-tight">{title}</h3>
        {description && <p className="mt-0.5 text-[12.5px] text-text-tertiary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
