"use client";

import { Clock, AlertTriangle, TimerOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §31-33 —
// chronomètre moderne. Le SERVEUR reste la seule autorité sur le temps
// (expires_at vient de la base, remainingMs est recalculé côté
// ExamRunner.tsx à chaque tick contre l'heure système — cette exigence
// était déjà respectée AVANT ce composant, jamais modifiée ici) : cet
// anneau n'est qu'une représentation VISUELLE de remainingMs déjà connu,
// jamais une seconde horloge. §33 — aucune media query locale nécessaire :
// app/globals.css force déjà animation-duration/transition-duration à
// 0.01ms sous prefers-reduced-motion pour TOUT élément (règle globale
// existante), donc la transition CSS de l'anneau ci-dessous est
// automatiquement neutralisée sans code supplémentaire ici.

export type TimerState = "normal" | "approaching" | "critical" | "expired";

/** §32 — seuils en pourcentage du temps total (jamais un seuil fixe en
 * minutes qui n'aurait aucun sens identique pour un exercice de 10 min et
 * un examen de 3h) : Normal > 25%, Approche 10-25%, Critique < 10%,
 * Écoulé <= 0. */
export function timerState(remainingMs: number, totalMs: number): TimerState {
  if (remainingMs <= 0) return "expired";
  if (totalMs <= 0) return "critical";
  const pct = remainingMs / totalMs;
  if (pct <= 0.1) return "critical";
  if (pct <= 0.25) return "approaching";
  return "normal";
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

// Uniquement des tokens réellement générés par Tailwind (voir
// @theme inline dans app/globals.css — les variantes "-dot" n'y sont
// jamais mappées, contrairement à "-bg"/"-border"/"-text").
const STATE_STYLES: Record<TimerState, { ring: string; bg: string; text: string; icon: typeof Clock; label: string }> = {
  normal: { ring: "stroke-accent-9", bg: "bg-accent-soft-bg", text: "text-accent-11", icon: Clock, label: "Temps restant" },
  approaching: { ring: "stroke-status-warning-text", bg: "bg-status-warning-bg", text: "text-status-warning-text", icon: Clock, label: "Temps restant" },
  critical: { ring: "stroke-status-critical-text", bg: "bg-status-critical-bg", text: "text-status-critical-text", icon: AlertTriangle, label: "Temps restant" },
  expired: { ring: "stroke-status-critical-text", bg: "bg-status-critical-bg", text: "text-status-critical-text", icon: TimerOff, label: "Temps écoulé" },
};

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Timer({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
  const state = timerState(remainingMs, totalMs);
  const style = STATE_STYLES[state];
  const Icon = style.icon;
  const fraction = totalMs > 0 ? Math.min(1, Math.max(0, remainingMs / totalMs)) : 0;
  const offset = CIRCUMFERENCE * (1 - fraction);
  // §32 — jamais la couleur seule : icône dédiée par état + libellé texte
  // explicite ("< 1 min restante" en dessous de 60s, jamais juste un
  // chiffre qui clignote).
  const under60s = state !== "expired" && remainingMs <= 60_000;

  return (
    <div
      className={cn("flex items-center gap-2.5 rounded-md px-3 py-1.5", style.bg, state === "critical" && "animate-pulse")}
      role="timer"
      aria-live="polite"
      aria-label={state === "expired" ? "Temps écoulé" : `Temps restant : ${formatTime(remainingMs)}`}
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <svg viewBox="0 0 44 44" className="h-9 w-9 -rotate-90">
          <circle cx="22" cy="22" r={RADIUS} fill="none" strokeWidth="4" className="stroke-black/10 dark:stroke-white/10" />
          <circle
            cx="22"
            cy="22"
            r={RADIUS}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className={cn(style.ring, "transition-[stroke-dashoffset] duration-1000 ease-linear")}
          />
        </svg>
        <Icon size={14} className={cn("absolute", style.text)} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className={cn("text-[10.5px] font-medium uppercase tracking-wide", style.text)}>{style.label}</span>
        <span className={cn("font-mono text-[17px] font-semibold tabular-nums", style.text)}>
          {state === "expired" ? "00:00" : formatTime(remainingMs)}
        </span>
        {under60s && <span className={cn("text-[10.5px] font-medium", style.text)}>Moins d&apos;1 minute restante</span>}
      </div>
    </div>
  );
}
