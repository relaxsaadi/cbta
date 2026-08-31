"use client";

import { useActionState } from "react";
import { addFamiliarizationEvidenceAction, type AddEvidenceResult } from "../actions";

export function AddEvidenceForm({ sessionId }: { sessionId: number }) {
  const action = addFamiliarizationEvidenceAction.bind(null, sessionId);
  const [state, formAction, pending] = useActionState<AddEvidenceResult, FormData>(action, {});

  return (
    <form action={formAction} className="mb-3 flex items-end gap-2">
      <div className="flex-1">
        <label htmlFor="description" className="mb-1 block text-[12px] font-medium text-text-secondary">Référence / description de la preuve</label>
        <input
          id="description"
          name="description"
          placeholder="ex. Feuille de présence signée — classée dossier RH, session du 12/08/2026"
          required
          className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
        />
      </div>
      <button disabled={pending} type="submit" className="shrink-0 rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
        {pending ? "Ajout…" : "Rattacher"}
      </button>
      {state.error && <p className="text-[12px] text-status-critical-text">{state.error}</p>}
    </form>
  );
}
