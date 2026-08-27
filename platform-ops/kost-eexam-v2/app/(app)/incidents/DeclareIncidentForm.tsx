"use client";

import { useActionState } from "react";
import { declareIncidentAction, type DeclareIncidentResult } from "./actions";
import { INCIDENT_TYPES } from "@/lib/incident-constants";

export function DeclareIncidentForm({
  groups,
  groupRequired,
}: {
  groups: { id: number; name: string; company_name: string }[];
  // Un responsable pédagogique déclare TOUJOURS un incident au nom d'un de
  // ses groupes (jamais "plateforme", classification réservée à
  // administrator) — voir lib/tenant-scope.ts pour la frontière que ce
  // choix de groupe fait ensuite respecter en lecture.
  groupRequired: boolean;
}) {
  const [state, formAction, pending] = useActionState<DeclareIncidentResult, FormData>(declareIncidentAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="type" className="mb-1 block text-[12px] font-medium text-text-secondary">Type</label>
          <select id="type" name="type" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            {INCIDENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="severity" className="mb-1 block text-[12px] font-medium text-text-secondary">Gravité</label>
          <select id="severity" name="severity" required defaultValue="medium" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
            <option value="critical">Critique</option>
          </select>
        </div>
        <div>
          <label htmlFor="systemConcerned" className="mb-1 block text-[12px] font-medium text-text-secondary">Système concerné</label>
          <input id="systemConcerned" name="systemConcerned" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
      </div>
      <div>
        <label htmlFor="groupId" className="mb-1 block text-[12px] font-medium text-text-secondary">
          Client / groupe concerné{!groupRequired && " (laisser vide = incident plateforme, visible de tous)"}
        </label>
        <select id="groupId" name="groupId" required={groupRequired} defaultValue="" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
          <option value="">{groupRequired ? "Sélectionner…" : "— Incident plateforme (aucun client spécifique) —"}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.company_name} — {g.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-[12px] font-medium text-text-secondary">Description</label>
        <textarea id="description" name="description" required rows={2} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
      </div>
      <div>
        <label htmlFor="peopleConcerned" className="mb-1 block text-[12px] font-medium text-text-secondary">Personnes concernées</label>
        <input id="peopleConcerned" name="peopleConcerned" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
      </div>
      <div>
        <button disabled={pending} type="submit" className="rounded-md bg-status-critical-text px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60">
          {pending ? "Déclaration…" : "Déclarer un incident"}
        </button>
        {state.error && <p className="mt-2 text-[12.5px] text-status-critical-text">{state.error}</p>}
      </div>
    </form>
  );
}
