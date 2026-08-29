"use client";

import { useActionState } from "react";
import { rescheduleAssessmentAction, type RescheduleAssessmentResult } from "../actions";

// Mission "COMPLETE REAL EXAM RESCHEDULING WORKFLOW" (2026-08-29) — mêmes
// champs datetime-local que l'étape 10 du formulaire de création
// (CreateAssessmentForm.tsx), pour rester cohérent avec la convention déjà
// établie (chaîne "AAAA-MM-JJTHH:mm" passée telle quelle, jamais convertie
// — voir le commentaire dans lib/assessments.ts sur le modèle de fuseau
// horaire actuel). Affiche la fenêtre ACTUELLE en préremplissage — jamais
// un formulaire vide qui obligerait à redevoir la deviner.
export function RescheduleAssessmentForm({
  assessmentId,
  currentOpenAt,
  currentCloseAt,
}: {
  assessmentId: number;
  currentOpenAt: string | null;
  currentCloseAt: string | null;
}) {
  const boundAction = rescheduleAssessmentAction.bind(null, assessmentId);
  const [state, formAction, pending] = useActionState<RescheduleAssessmentResult, FormData>(boundAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="reschedule-openAt" className="mb-1 block text-[12px] font-medium text-text-secondary">
            Nouvelle ouverture
          </label>
          <input
            id="reschedule-openAt"
            type="datetime-local"
            name="openAt"
            defaultValue={currentOpenAt ?? ""}
            className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
          />
        </div>
        <div>
          <label htmlFor="reschedule-closeAt" className="mb-1 block text-[12px] font-medium text-text-secondary">
            Nouvelle fermeture
          </label>
          <input
            id="reschedule-closeAt"
            type="datetime-local"
            name="closeAt"
            defaultValue={currentCloseAt ?? ""}
            className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
          />
        </div>
      </div>
      <p className="text-[11.5px] text-text-tertiary">
        Laisser un champ vide = pas de limite pour cette borne. Les candidats déjà affectés recevront une notification
        avec l&apos;ancienne et la nouvelle fenêtre. Bloqué si une tentative est actuellement en cours.
      </p>
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-border-default px-3 py-1.5 text-[13px] font-medium text-text-secondary hover:border-border-strong disabled:opacity-60"
        >
          {pending ? "Reprogrammation…" : "Reprogrammer l'examen"}
        </button>
        {state.error && <p className="mt-2 text-[12.5px] text-status-critical-text">{state.error}</p>}
        {state.success && <p className="mt-2 text-[12.5px] text-status-verified-text">{state.success}</p>}
      </div>
    </form>
  );
}
