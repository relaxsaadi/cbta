"use client";

import { useMemo, useState, useTransition } from "react";
import type { Incident } from "@/lib/incidents-data";
import { INCIDENT_CATEGORIES, type IncidentStatus } from "@/lib/incident-constants";
import { StatusBadge, type BadgeStatus } from "@/components/ui/Badge";
import { changeIncidentStatusAction } from "./actions";
import { cn } from "@/lib/utils";
import { Search, ChevronDown } from "lucide-react";

const STATUS_BADGE: Record<IncidentStatus, BadgeStatus> = {
  open: "critical",
  in_progress: "warning",
  resolved: "verified",
  closed: "neutral",
};

const STATUS_LABEL: Record<IncidentStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const PRIORITY_LABEL: Record<string, string> = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function IncidentsTable({ incidents, canEdit }: { incidents: Incident[]; canEdit: boolean }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return incidents.filter((i) => {
      const matchesQ =
        !q ||
        i.subject.toLowerCase().includes(q) ||
        i.reporterFullName.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.relatedExam ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || i.status === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [incidents, search, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, reporter, category, exam…"
            className="w-full rounded-md border border-border-default bg-surface-base py-1.5 pl-8 pr-3 text-[12.5px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-9/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px] text-text-secondary"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-sunken/50">
                {["Subject", "Category", "Priority", "Reporter", "Exam", "Reported", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((incident) => (
                <IncidentRow
                  key={incident.id}
                  incident={incident}
                  canEdit={canEdit}
                  expanded={expanded === incident.id}
                  onToggle={() => setExpanded(expanded === incident.id ? null : incident.id)}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[12.5px] text-text-tertiary">
                    No incidents match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function IncidentRow({
  incident,
  canEdit,
  expanded,
  onToggle,
}: {
  incident: Incident;
  canEdit: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const categoryLabel = INCIDENT_CATEGORIES.find((c) => c.value === incident.category)?.label ?? incident.category;

  return (
    <>
      <tr className="hover:bg-surface-sunken/40 transition-colors cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-2.5 text-[12.5px] font-medium text-text-primary max-w-[220px] truncate">{incident.subject}</td>
        <td className="px-4 py-2.5 text-[12px] text-text-secondary whitespace-nowrap">{categoryLabel}</td>
        <td className="px-4 py-2.5 text-[12px] text-text-secondary whitespace-nowrap">{PRIORITY_LABEL[incident.priority]}</td>
        <td className="px-4 py-2.5 text-[12px] text-text-secondary whitespace-nowrap">{incident.reporterFullName}</td>
        <td className="px-4 py-2.5 text-[12px] text-text-tertiary max-w-[160px] truncate">{incident.relatedExam ?? "—"}</td>
        <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary tabular-nums whitespace-nowrap">{fmtDate(incident.createdAt)}</td>
        <td className="px-4 py-2.5">
          <StatusBadge status={STATUS_BADGE[incident.status]}>{STATUS_LABEL[incident.status]}</StatusBadge>
        </td>
        <td className="px-4 py-2.5">
          <ChevronDown size={14} className={cn("text-text-tertiary transition-transform", expanded && "rotate-180")} />
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8} className="px-4 pb-4 pt-1 bg-surface-sunken/30">
            <div className="rounded-md border border-border-subtle bg-surface-base p-3.5">
              <p className="text-[12.5px] text-text-primary whitespace-pre-wrap leading-relaxed">{incident.description}</p>
              {incident.attachmentNote && (
                <p className="mt-2 text-[11.5px] text-text-tertiary">Attachment note: {incident.attachmentNote}</p>
              )}
              {incident.relatedSession && (
                <p className="mt-1 text-[11.5px] text-text-tertiary">Related session: {incident.relatedSession}</p>
              )}

              <div className="mt-3 border-t border-border-subtle pt-3">
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary mb-1.5">
                  History ({incident.events.length} event{incident.events.length !== 1 ? "s" : ""})
                </p>
                <ul className="flex flex-col gap-1">
                  {incident.events.map((ev) => (
                    <li key={ev.id} className="font-mono text-[11px] text-text-tertiary">
                      {fmtDate(ev.createdAt)} — {ev.detail} ({ev.actorUsername})
                    </li>
                  ))}
                </ul>
              </div>

              {canEdit && (
                <div className="mt-3 flex items-center gap-2 border-t border-border-subtle pt-3">
                  <span className="text-[11.5px] text-text-tertiary mr-1">Change status:</span>
                  {(["open", "in_progress", "resolved", "closed"] as const).map((s) => (
                    <button
                      key={s}
                      disabled={isPending || incident.status === s}
                      onClick={(e) => {
                        e.stopPropagation();
                        startTransition(() => changeIncidentStatusAction(incident.id, s));
                      }}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                        incident.status === s
                          ? "bg-accent-9 border-accent-9 text-white cursor-default"
                          : "bg-surface-raised border-border-default text-text-secondary hover:border-border-strong"
                      )}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
