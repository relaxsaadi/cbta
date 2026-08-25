import Link from "next/link";
import { StatusPill } from "./StatusPill";
import type { ComplianceStatus } from "@/lib/compliance-data";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EvidenceCard({
  icon: Icon,
  title,
  status,
  summary,
  detail,
  href,
}: {
  icon: LucideIcon;
  title: string;
  status: ComplianceStatus;
  summary: string;
  detail?: string;
  href?: string;
}) {
  const cardClass = cn(
    "rounded-lg border border-border-subtle bg-surface-raised p-4 shadow-sm ring-1 ring-black/[0.02] block",
    href && "hover:border-border-strong hover:shadow-md transition-all cursor-pointer"
  );

  const content = (
    <>
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft-bg text-accent-9">
          <Icon size={15} strokeWidth={2} />
        </div>
        <StatusPill status={status} />
      </div>
      <p className="font-display text-[13px] font-semibold text-text-primary">{title}</p>
      <p className="mt-1 text-[12px] text-text-tertiary leading-relaxed">{summary}</p>
      {detail && (
        <p className="mt-2 font-mono text-[10.5px] text-text-tertiary border-t border-border-subtle pt-2">
          {detail}
        </p>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return <div className={cardClass}>{content}</div>;
}
