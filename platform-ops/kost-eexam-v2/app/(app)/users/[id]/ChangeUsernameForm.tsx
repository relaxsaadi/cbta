"use client";

import { useActionState, useState } from "react";
import { changeUsernameAction, type ChangeUsernameResult } from "../actions";

/** "Modifier l'identifiant" (mission §18-21) — unicité/normalisation
 * appliquées côté serveur (lib/users.ts::changeUsername). Après succès,
 * déclenche USERNAME_CHANGED côté serveur — jamais un mot de passe ici. */
export function ChangeUsernameForm({ userId, currentUsername }: { userId: number; currentUsername: string }) {
  const [open, setOpen] = useState(false);
  const action = changeUsernameAction.bind(null, userId);
  const [state, formAction, pending] = useActionState<ChangeUsernameResult, FormData>(action, {});

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start rounded-md border border-border-default px-2.5 py-1 text-[12px] font-medium text-text-secondary hover:border-border-strong">
        Modifier l&apos;identifiant
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border border-border-default bg-surface-sunken/40 p-3 text-[12.5px]">
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Nouvel identifiant (actuel : {currentUsername})</label>
        <input name="newUsername" required className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
      </div>
      <div className="flex items-center gap-2">
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[12px] text-text-tertiary hover:text-text-secondary">Annuler</button>
      </div>
      {state.error && <p className="text-status-critical-text">{state.error}</p>}
      {state.success && <p className="text-status-verified-text">{state.success}</p>}
    </form>
  );
}
