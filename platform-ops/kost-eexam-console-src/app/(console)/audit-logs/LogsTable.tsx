"use client";

import { useState, useMemo } from "react";
import type { LogEntry } from "@/lib/audit-logs-data";

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export function LogsTable({ logs }: { logs: LogEntry[] }) {
  const [search, setSearch] = useState("");
  const [component, setComponent] = useState("all");

  const components = useMemo(() => Array.from(new Set(logs.map((l) => l.component))).sort(), [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (component !== "all" && l.component !== component) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          l.userFullName.toLowerCase().includes(s) ||
          l.eventName.toLowerCase().includes(s) ||
          l.action.toLowerCase().includes(s) ||
          (l.ip ?? "").includes(s)
        );
      }
      return true;
    });
  }, [logs, search, component]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          type="text"
          placeholder="Rechercher par utilisateur, événement, action, IP…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-[12.5px] text-text-primary outline-none focus:border-accent-9 focus:ring-2 focus:ring-accent-soft-bg"
        />
        <select
          value={component}
          onChange={(e) => setComponent(e.target.value)}
          className="rounded-md border border-border-default bg-surface-raised px-2.5 py-1.5 text-[12.5px] text-text-secondary outline-none focus:border-accent-9"
        >
          <option value="all">Tous les composants</option>
          {components.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="text-[11.5px] text-text-tertiary ml-auto">{filtered.length} sur {logs.length} événements</span>
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
        <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-surface-raised">
              <tr className="border-b border-border-subtle bg-surface-sunken/50">
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">Date / heure</th>
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Utilisateur</th>
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Action</th>
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Composant</th>
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Événement</th>
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-surface-sunken/40 transition-colors">
                  <td className="px-4 py-2 font-mono text-[11px] text-text-tertiary whitespace-nowrap">{fmtDateTime(log.timestamp)}</td>
                  <td className="px-4 py-2 text-[12px] text-text-primary whitespace-nowrap">{log.userFullName}</td>
                  <td className="px-4 py-2 text-[12px] text-text-secondary capitalize">{log.action}</td>
                  <td className="px-4 py-2 text-[12px] text-text-secondary">{log.component}</td>
                  <td className="px-4 py-2 text-[12px] text-text-tertiary">{log.eventName}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-text-tertiary">{log.ip ?? "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[12.5px] text-text-tertiary">
                    Aucun événement ne correspond à ce filtre.
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
