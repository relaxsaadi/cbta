"use client";

import { useActionState } from "react";
import { createCompanyAction } from "./actions";

export function CreateCompanyForm({ canWrite }: { canWrite: boolean }) {
  const [state, formAction, pending] = useActionState(createCompanyAction, {});
  if (!canWrite) return null;

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="name" className="mb-1 block text-[12px] font-medium text-text-secondary">Nom du client</label>
        <input id="name" name="name" required className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" placeholder="Ex. Air Algérie" />
      </div>
      <div>
        <label htmlFor="scope" className="mb-1 block text-[12px] font-medium text-text-secondary">Périmètre</label>
        <select id="scope" name="scope" className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
          <option value="production">Production</option>
          <option value="demo">Démo</option>
          <option value="test">Test</option>
        </select>
      </div>
      <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
        {pending ? "Création…" : "Créer le client"}
      </button>
      {state.error && <p className="text-[12.5px] text-status-critical-text">{state.error}</p>}
    </form>
  );
}
