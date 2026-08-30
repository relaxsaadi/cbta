"use client";

import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §35 —
// indicateur d'enregistrement moderne. L'état lui-même (idle/saving/saved/
// error) reste calculé EXACTEMENT comme avant dans ExamRunner.tsx (jamais
// affiché "Enregistré" avant l'accusé de réception serveur — cette
// garantie préexistait déjà, ce composant n'en est que la présentation
// visuelle). Icône + texte pour chaque état, jamais la couleur seule.
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function AutosaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return <span className="text-[11.5px] text-text-tertiary">&nbsp;</span>;

  const config = {
    saving: { icon: Loader2, spin: true, text: "Enregistrement…", className: "text-text-tertiary" },
    saved: { icon: CheckCircle2, spin: false, text: "Enregistré", className: "text-status-verified-text" },
    error: { icon: AlertCircle, spin: false, text: "Erreur — nouvelle tentative…", className: "text-status-critical-text" },
  }[status];

  const Icon = config.icon;
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-1.5 text-[11.5px] font-medium transition-opacity duration-300", config.className)}
    >
      <Icon size={13} className={config.spin ? "animate-spin" : undefined} />
      {config.text}
    </span>
  );
}
