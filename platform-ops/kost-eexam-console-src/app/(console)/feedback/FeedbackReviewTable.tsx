"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import type { FeedbackEntry } from "@/lib/feedback-data";
import { FEEDBACK_CATEGORIES, type FeedbackStatus } from "@/lib/feedback-constants";
import { StatusBadge, type BadgeStatus } from "@/components/ui/Badge";
import { changeFeedbackStatusAction } from "./actions";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<FeedbackStatus, BadgeStatus> = {
  new: "critical",
  reviewed: "warning",
  action_required: "warning",
  actioned: "verified",
  closed: "neutral",
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  action_required: "Action Required",
  actioned: "Actioned",
  closed: "Closed",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function FeedbackReviewTable({ entries, canEdit }: { entries: FeedbackEntry[]; canEdit: boolean }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-sunken/50">
              {["Rating", "Category", "Comment", "Reporter", "Date", "Status", canEdit ? "Update" : ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {entries.map((f) => (
              <FeedbackRow key={f.id} entry={f} canEdit={canEdit} />
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[12.5px] text-text-tertiary">
                  No feedback recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeedbackRow({ entry, canEdit }: { entry: FeedbackEntry; canEdit: boolean }) {
  const [isPending, startTransition] = useTransition();
  const categoryLabel = FEEDBACK_CATEGORIES.find((c) => c.value === entry.category)?.label ?? entry.category;

  return (
    <tr className="hover:bg-surface-sunken/40 transition-colors align-top">
      <td className="px-4 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={12} className={cn(n <= entry.rating ? "fill-accent-9 text-accent-9" : "text-border-strong")} />
          ))}
        </div>
      </td>
      <td className="px-4 py-2.5 text-[12px] text-text-secondary whitespace-nowrap">{categoryLabel}</td>
      <td className="px-4 py-2.5 text-[12px] text-text-secondary max-w-[280px]">{entry.comment ?? "—"}</td>
      <td className="px-4 py-2.5 text-[12px] text-text-secondary whitespace-nowrap">{entry.reporterFullName}</td>
      <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary tabular-nums whitespace-nowrap">{fmtDate(entry.createdAt)}</td>
      <td className="px-4 py-2.5">
        <StatusBadge status={STATUS_BADGE[entry.status]}>{STATUS_LABEL[entry.status]}</StatusBadge>
      </td>
      {canEdit && (
        <td className="px-4 py-2.5">
          <div className="flex flex-wrap gap-1">
            {(["new", "reviewed", "action_required", "actioned", "closed"] as const).map((s) => (
              <button
                key={s}
                disabled={isPending || entry.status === s}
                onClick={() => startTransition(() => changeFeedbackStatusAction(entry.id, s))}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-colors",
                  entry.status === s
                    ? "bg-accent-9 border-accent-9 text-white cursor-default"
                    : "bg-surface-raised border-border-default text-text-secondary hover:border-border-strong"
                )}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </td>
      )}
    </tr>
  );
}
