"use client";

import { useActionState } from "react";
import { FAMILIARIZATION_AUDIENCES } from "@/lib/familiarization-audience";
import { createFamiliarizationSessionAction, type CreateSessionResult } from "./actions";

export function CreateSessionForm({
  groups,
  functions,
}: {
  groups: { id: number; name: string; company_name: string }[];
  functions: { code: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState<CreateSessionResult, FormData>(createFamiliarizationSessionAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="groupId" className="mb-1 block text-[12px] font-medium text-text-secondary">Groupe / session</label>
          <select id="groupId" name="groupId" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            <option value="">Sélectionner…</option>
            {groups.map((g) => (<option key={g.id} value={g.id}>{g.company_name} — {g.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="functionCode" className="mb-1 block text-[12px] font-medium text-text-secondary">Fonction DGR</label>
          <select id="functionCode" name="functionCode" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            <option value="">Sélectionner…</option>
            {functions.map((f) => (<option key={f.code} value={f.code}>{f.label}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="heldAt" className="mb-1 block text-[12px] font-medium text-text-secondary">Date / heure de début</label>
          <input id="heldAt" name="heldAt" type="datetime-local" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="endedAt" className="mb-1 block text-[12px] font-medium text-text-secondary">Heure de fin (optionnel)</label>
          <input id="endedAt" name="endedAt" type="datetime-local" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="location" className="mb-1 block text-[12px] font-medium text-text-secondary">Lieu / mode</label>
          <input id="location" name="location" placeholder="ex. Salle KOST Academy Alger, ou À distance" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          {/* Mission "CLOSE AUDITOR REMARKS" (2026-08-31) §14/§17 — l'auditeur
              exige que la familiarisation soit planifiable pour le PERSONNEL
              ET pour les CANDIDATS. Les valeurs proviennent de la même source
              de vérité que la validation côté serveur. */}
          <label htmlFor="audience" className="mb-1 block text-[12px] font-medium text-text-secondary">Public visé</label>
          <select id="audience" name="audience" required defaultValue="candidats" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            {FAMILIARIZATION_AUDIENCES.map((entry) => (
              <option key={entry.value} value={entry.value}>{entry.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="mb-1 block text-[12px] font-medium text-text-secondary">Notes</label>
        <textarea id="notes" name="notes" rows={2} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
      </div>
      <div>
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Création…" : "Créer la session de familiarisation"}
        </button>
        {state.error && <p className="mt-2 text-[12.5px] text-status-critical-text">{state.error}</p>}
      </div>
    </form>
  );
}
