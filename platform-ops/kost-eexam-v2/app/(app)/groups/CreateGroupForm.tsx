"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createGroupAction, type CreateGroupResult } from "./actions";

export function CreateGroupForm({ companies, defaultCompanyId }: { companies: { id: number; name: string }[]; defaultCompanyId?: number }) {
  const [state, formAction, pending] = useActionState<CreateGroupResult, FormData>(createGroupAction, {});
  const router = useRouter();

  useEffect(() => {
    if (state.groupId) router.push(`/groups/${state.groupId}`);
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="companyId" className="mb-1 block text-[12px] font-medium text-text-secondary">Client</label>
          <select id="companyId" name="companyId" defaultValue={defaultCompanyId} required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            <option value="">Sélectionner…</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="name" className="mb-1 block text-[12px] font-medium text-text-secondary">Nom du groupe</label>
          <input id="name" name="name" required placeholder="Ex. Air Algérie — DGR Septembre 2026" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="sessionLabel" className="mb-1 block text-[12px] font-medium text-text-secondary">Libellé de session</label>
          <input id="sessionLabel" name="sessionLabel" placeholder="Optionnel" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="scope" className="mb-1 block text-[12px] font-medium text-text-secondary">Périmètre</label>
          <select id="scope" name="scope" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            <option value="production">Production</option>
            <option value="demo">Démo</option>
            <option value="test">Test</option>
          </select>
        </div>
        <div>
          <label htmlFor="dateStart" className="mb-1 block text-[12px] font-medium text-text-secondary">Date début</label>
          <input id="dateStart" type="date" name="dateStart" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="dateEnd" className="mb-1 block text-[12px] font-medium text-text-secondary">Date fin</label>
          <input id="dateEnd" type="date" name="dateEnd" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
      </div>
      <div>
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Création…" : "Créer le groupe"}
        </button>
        {state.error && <p className="mt-2 text-[12.5px] text-status-critical-text">{state.error}</p>}
      </div>
    </form>
  );
}
