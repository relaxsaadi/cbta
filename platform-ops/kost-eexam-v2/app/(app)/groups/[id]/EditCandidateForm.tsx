"use client";

import { useActionState, useState } from "react";
import { editCandidateAction, type EditCandidateResult } from "../actions";

// Mission "PRODUCTION READINESS" §3 — édition inline (aucun composant
// modal dans cette base, cohérent avec le reste de l'app — voir
// docs/KOST_EEXAM_V2_ARCHITECTURE.md §1.5) : un clic sur "Modifier"
// révèle le formulaire dans la même ligne, pas de superposition.
export function EditCandidateForm({
  groupId,
  candidateUserId,
  fullName,
}: {
  groupId: number;
  candidateUserId: number;
  fullName: string;
}) {
  const [open, setOpen] = useState(false);
  const action = editCandidateAction.bind(null, groupId, candidateUserId);
  const [state, formAction, pending] = useActionState<EditCandidateResult, FormData>(action, {});

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[12px] text-text-tertiary hover:text-text-secondary">
        Modifier
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border border-border-default bg-surface-raised p-3 text-[12.5px]">
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Nom complet</label>
          <input name="fullName" defaultValue={fullName} required className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
        </div>
        <div>
          <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Email (optionnel)</label>
          <input name="email" type="email" className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
        </div>
        <div>
          <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Téléphone (optionnel)</label>
          <input name="phone" className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[12px] text-text-tertiary hover:text-text-secondary">
          Annuler
        </button>
      </div>
      {state.error && <p className="text-status-critical-text">{state.error}</p>}
      {state.success && <p className="text-status-verified-text">{state.success}</p>}
    </form>
  );
}
