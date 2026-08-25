"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { StatusPill } from "./StatusPill";
import type { ComplianceCategory } from "@/lib/compliance-data";
import { trCat, trReq } from "@/lib/compliance-labels-fr";
import { cn, slugify } from "@/lib/utils";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function ComplianceCategoryCard({ category }: { category: ComplianceCategory }) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const verified = category.items.filter((i) => i.status === "verified").length;

  // Auto-expand + scroll to a row when arriving via a deep link
  // (/audit-compliance#<requirement-slug>) — used by "View Evidence" links
  // from the Audit Readiness Summary and Evidence Pack pages.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const idx = category.items.findIndex((item) => slugify(item.requirement) === hash);
    if (idx === -1) return;
    setExpandedRow(idx);
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
        <h3 className="font-display text-[14px] font-semibold text-text-primary">{trCat(category.name)}</h3>
        <span className="text-[11.5px] font-medium text-text-tertiary tabular-nums">
          {verified}/{category.items.length} vérifié{verified !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="divide-y divide-border-subtle">
        {category.items.map((item, i) => {
          const isExpanded = expandedRow === i;
          return (
            <div key={item.requirement} id={slugify(item.requirement)}>
              <button
                onClick={() => setExpandedRow(isExpanded ? null : i)}
                className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-surface-sunken/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text-primary">{trReq(item.requirement)}</p>
                  <p className="mt-0.5 text-[12px] text-text-tertiary">{item.evidenceSummary}</p>
                </div>
                <div className="hidden sm:block text-[11.5px] text-text-tertiary w-24 shrink-0">
                  {fmt(item.lastVerified)}
                </div>
                <div className="hidden md:block text-[11.5px] text-text-tertiary w-40 shrink-0 truncate">
                  {item.responsible}
                </div>
                <div className="shrink-0">
                  <StatusPill status={item.status} />
                </div>
                {(item.evidence || item.notes) && (
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-text-tertiary shrink-0 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                )}
              </button>

              {isExpanded && item.evidence && (
                <div className="px-5 pb-4 pt-1">
                  <div className="rounded-md bg-surface-sunken border border-border-subtle p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                        Preuve
                      </span>
                      {item.evidence.timestamp && (
                        <span className="font-mono text-[10.5px] text-text-tertiary">
                          {new Date(item.evidence.timestamp).toLocaleString("fr-FR")}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] font-medium text-text-primary mb-1.5">{item.evidence.source}</p>
                    <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-text-secondary">
                      {item.evidence.technicalDetails}
                    </pre>
                  </div>
                  {item.notes && (
                    <p className="mt-2 text-[12px] text-text-tertiary italic">{item.notes}</p>
                  )}
                </div>
              )}
              {isExpanded && !item.evidence && item.notes && (
                <div className="px-5 pb-4 pt-1">
                  <p className="text-[12px] text-text-tertiary italic">{item.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
