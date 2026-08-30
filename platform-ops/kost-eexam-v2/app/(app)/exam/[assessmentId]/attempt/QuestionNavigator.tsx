"use client";

import { cn } from "@/lib/utils";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §34/§36 —
// navigation moderne : barre de progression + compteurs Répondues/Sans
// réponse/À revoir, distinction claire current/answered/unanswered/marked,
// accessible clavier nativement (ce sont de vrais <button>, jamais un <div
// onClick>), responsive (flex-wrap existant + overflow-x-auto en dessous
// de la largeur mobile pour ne jamais forcer un débordement horizontal de
// PAGE — seul CE bandeau défile, jamais tout l'écran, §40).
export interface NavigatorItem {
  id: number | string;
  answered: boolean;
  markedForReview: boolean;
}

export function QuestionNavigator({ items, currentIndex, onSelect }: { items: NavigatorItem[]; currentIndex: number; onSelect: (index: number) => void }) {
  const answeredCount = items.filter((q) => q.answered).length;
  const unansweredCount = items.length - answeredCount;
  const markedCount = items.filter((q) => q.markedForReview).length;
  const progressPct = items.length > 0 ? Math.round((answeredCount / items.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-surface-raised p-3">
      <div className="flex items-center justify-between text-[11.5px] text-text-tertiary">
        <span>Question {currentIndex + 1} sur {items.length}</span>
        <div className="flex gap-3">
          <span className="font-medium text-status-verified-text">{answeredCount} répondue{answeredCount > 1 ? "s" : ""}</span>
          <span className={unansweredCount > 0 ? "font-medium text-text-secondary" : undefined}>{unansweredCount} sans réponse</span>
          {markedCount > 0 && <span className="font-medium text-status-warning-text">{markedCount} à revoir</span>}
        </div>
      </div>

      {/* Barre de progression — purement visuelle (transition CSS déjà
          neutralisée sous prefers-reduced-motion par la règle globale). */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Progression des réponses">
        <div className="h-full rounded-full bg-status-verified-text transition-[width] duration-500 ease-out" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="flex flex-wrap gap-1.5 overflow-x-auto">
        {items.map((q, i) => {
          const isCurrent = i === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(i)}
              title={q.answered ? "Répondue" : "Sans réponse"}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Question ${i + 1}${q.answered ? ", répondue" : ", sans réponse"}${q.markedForReview ? ", marquée à revoir" : ""}`}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[12px] font-medium transition-colors",
                isCurrent
                  ? "border-accent-9 bg-accent-9 text-white"
                  : q.markedForReview
                    ? "border-status-warning-border bg-status-warning-bg text-status-warning-text"
                    : q.answered
                      ? "border-status-verified-border bg-status-verified-bg text-status-verified-text"
                      : "border-border-default text-text-tertiary hover:border-border-strong"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
