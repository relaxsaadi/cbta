"use client";

import { useActionState } from "react";
import type { ResendActionResult } from "./actions";

/** Petit formulaire inline réutilisé pour les deux boutons "Renvoyer"
 * (invitation / notification d'examen) — même useActionState que
 * DeclareIncidentForm.tsx, un seul champ visible : le résultat
 * (succès/erreur limite de débit) directement sous le bouton. */
export function ResendButton({
  action,
  hiddenFields,
  label,
}: {
  action: (prev: ResendActionResult, formData: FormData) => Promise<ResendActionResult>;
  hiddenFields: Record<string, string | number>;
  label: string;
}) {
  const [state, formAction, pending] = useActionState<ResendActionResult, FormData>(action, {});

  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1">
      {Object.entries(hiddenFields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-border-default px-2.5 py-1 text-[11.5px] font-medium text-text-secondary hover:border-border-strong disabled:opacity-60"
      >
        {pending ? "Envoi…" : label}
      </button>
      {state.error && <p className="text-[11px] text-status-critical-text">{state.error}</p>}
      {state.success && <p className="text-[11px] text-status-verified-text">Renvoyé.</p>}
    </form>
  );
}
