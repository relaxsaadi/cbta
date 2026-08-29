"use client";

import { useActionState } from "react";
import { createQuestionAction, type CreateQuestionResult } from "./actions";

const SOURCE_STATUSES = [
  "FROZEN_SOURCE_VERIFIED",
  "DRAFT",
  "PARTIAL",
  "STALE",
  "SOURCE_GAP",
  "SOURCE_CONFLICT",
  "NOT_ATTEMPTED",
];

// Libellé d'affichage — dupliqué depuis lib/questions.ts::SOURCE_STATUS_LABELS
// (jamais importé ici : ce composant est "use client", et lib/questions.ts
// tire node:sqlite via lib/db.ts, non-bundlable côté navigateur). La VALEUR
// soumise au formulaire reste l'enum brut (`value={s}`) — seul le texte visible
// change. Garder synchronisé avec lib/questions.ts si un statut est ajouté.
const SOURCE_STATUS_LABELS: Record<string, string> = {
  FROZEN_SOURCE_VERIFIED: "Confirmé — source DGR vérifiée",
  DRAFT: "Brouillon",
  PARTIAL: "Partiel",
  STALE: "Périmé",
  SOURCE_GAP: "Écart de source",
  SOURCE_CONFLICT: "Conflit de source",
  NOT_ATTEMPTED: "Non traité",
};

export function CreateQuestionForm({ functions }: { functions: { code: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState<CreateQuestionResult, FormData>(createQuestionAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="kostQuestionId" className="mb-1 block text-[12px] font-medium text-text-secondary">ID KOST</label>
          <input id="kostQuestionId" name="kostQuestionId" required placeholder="Q-7.1-020" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="functionCode" className="mb-1 block text-[12px] font-medium text-text-secondary">Fonction</label>
          <select id="functionCode" name="functionCode" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            {functions.map((f) => (
              <option key={f.code} value={f.code}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sourceStatus" className="mb-1 block text-[12px] font-medium text-text-secondary">Statut source</label>
          <select id="sourceStatus" name="sourceStatus" required defaultValue="NOT_ATTEMPTED" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            {SOURCE_STATUSES.map((s) => (
              <option key={s} value={s}>{SOURCE_STATUS_LABELS[s] ?? s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="stem" className="mb-1 block text-[12px] font-medium text-text-secondary">Texte de la question</label>
        <textarea id="stem" name="stem" required rows={2} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
      </div>

      <fieldset>
        <legend className="mb-1 block text-[12px] font-medium text-text-secondary">Choix de réponse (cocher la/les bonne(s) réponse(s))</legend>
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="checkbox" name="correct" value={i} aria-label={`Bonne réponse — choix ${String.fromCharCode(65 + i)}`} className="h-4 w-4" />
              <input name="choiceText" aria-label={`Choix ${String.fromCharCode(65 + i)}`} placeholder={`Choix ${String.fromCharCode(65 + i)}`} className="flex-1 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="regulatoryReference" className="mb-1 block text-[12px] font-medium text-text-secondary">Référence réglementaire</label>
          <input id="regulatoryReference" name="regulatoryReference" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" placeholder="Ex. DGR 67e éd. §1.0" />
        </div>
        <div>
          <label htmlFor="explanation" className="mb-1 block text-[12px] font-medium text-text-secondary">Explication / correction</label>
          <input id="explanation" name="explanation" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
      </div>

      <input type="hidden" name="qtype" value="mcq_single" />

      <div>
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Création…" : "Ajouter à la banque"}
        </button>
        {state.error && <p className="mt-2 text-[12.5px] text-status-critical-text">{state.error}</p>}
        {state.success && <p className="mt-2 text-[12.5px] text-status-verified-text">{state.success}</p>}
      </div>
    </form>
  );
}
