"use client";

import { useState, useMemo } from "react";
import type { QuestionRecord } from "@/lib/question-bank-data";
import { DGR_FUNCTIONS } from "@/lib/dgr-functions";
import { SCOPE_LABELS, SCOPE_BADGE } from "@/lib/data-scope";
import { StatusBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function QuestionBankTable({ questions }: { questions: QuestionRecord[] }) {
  const [activeFunction, setActiveFunction] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeFunction) return questions;
    return questions.filter((q) => q.dgrFunctions.includes(activeFunction));
  }, [questions, activeFunction]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveFunction(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
            activeFunction === null
              ? "bg-accent-9 border-accent-9 text-white"
              : "bg-surface-raised border-border-default text-text-secondary hover:border-border-strong"
          )}
        >
          Toutes ({questions.length})
        </button>
        {DGR_FUNCTIONS.map((fn) => {
          const count = questions.filter((q) => q.dgrFunctions.includes(fn)).length;
          return (
            <button
              key={fn}
              onClick={() => setActiveFunction(fn)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
                activeFunction === fn
                  ? "bg-accent-9 border-accent-9 text-white"
                  : "bg-surface-raised border-border-default text-text-secondary hover:border-border-strong"
              )}
            >
              {fn} ({count})
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-sunken/50">
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Question</th>
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Type</th>
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Catégorie</th>
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Périmètre</th>
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Fonction DGR</th>
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Modifiée le</th>
                <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-surface-sunken/40 transition-colors">
                  <td className="px-4 py-2.5 text-[12.5px] font-medium text-text-primary">{q.name}</td>
                  <td className="px-4 py-2.5 text-[12px] text-text-secondary">{q.qtype}</td>
                  <td className="px-4 py-2.5 text-[12px] text-text-secondary">{q.category}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={SCOPE_BADGE[q.scope]}>{SCOPE_LABELS[q.scope]}</StatusBadge>
                  </td>
                  <td className="px-4 py-2.5 text-[12px]">
                    {q.dgrFunctions.length > 0 ? (
                      <span className="text-text-secondary">{q.dgrFunctions.join(", ")}</span>
                    ) : (
                      <span className="text-text-tertiary italic">Non classée</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-text-tertiary tabular-nums">{fmtDate(q.lastModified)}</td>
                  <td className="px-4 py-2.5 text-[12px] text-text-secondary capitalize">{q.status === "ready" ? "Prête" : q.status === "draft" ? "Brouillon" : q.status}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[12.5px] text-text-tertiary">
                    Aucune question ne correspond à ce filtre.
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
