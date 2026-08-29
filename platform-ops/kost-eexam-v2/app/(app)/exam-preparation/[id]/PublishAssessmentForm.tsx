"use client";

import { useActionState, useState } from "react";
import { publishAssessmentAction } from "../actions";

export interface PublishResult {
  error?: string;
  success?: string;
}

// Deux modes d'affectation (addendum auditeur) — le libellé et les trois
// options sont repris mot pour mot de la demande : « À qui affecter cet
// examen ? » / « Tout le groupe » / « Certains candidats du groupe » /
// « Un candidat individuel ».
export function PublishAssessmentForm({
  assessmentId,
  members,
}: {
  assessmentId: number;
  members: { candidate_user_id: number; full_name: string; username: string }[];
}) {
  const boundAction = publishAssessmentAction.bind(null, assessmentId);
  const [state, formAction, pending] = useActionState<PublishResult, FormData>(boundAction, {});
  const [mode, setMode] = useState<"group" | "selected_candidates" | "individual">("group");

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-md border border-border-subtle p-3">
      <p className="text-[12.5px] font-medium text-text-primary">À qui affecter cet examen ?</p>
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-[13px] text-text-secondary">
          <input type="radio" name="mode" value="group" checked={mode === "group"} onChange={() => setMode("group")} />
          Tout le groupe
          <span className="text-[11.5px] text-text-tertiary">({members.length} candidat{members.length > 1 ? "s" : ""})</span>
        </label>
        <label className="flex items-center gap-2 text-[13px] text-text-secondary">
          <input
            type="radio"
            name="mode"
            value="selected_candidates"
            checked={mode === "selected_candidates"}
            onChange={() => setMode("selected_candidates")}
          />
          Certains candidats du groupe
        </label>
        <label className="flex items-center gap-2 text-[13px] text-text-secondary">
          <input type="radio" name="mode" value="individual" checked={mode === "individual"} onChange={() => setMode("individual")} />
          Un candidat individuel
        </label>
      </div>

      {mode === "selected_candidates" && (
        <div className="ml-5 flex flex-col gap-1 rounded-md border border-border-subtle bg-surface-sunken p-2">
          {members.length === 0 && <p className="text-[12px] text-text-tertiary">Aucun candidat dans ce groupe.</p>}
          {members.map((m) => (
            <label key={m.candidate_user_id} className="flex items-center gap-2 text-[12.5px] text-text-secondary">
              <input type="checkbox" name="candidateUserIds" value={m.candidate_user_id} />
              {m.full_name} <span className="text-text-tertiary">({m.username})</span>
            </label>
          ))}
        </div>
      )}

      {mode === "individual" && (
        <div className="ml-5 flex flex-col gap-1 rounded-md border border-border-subtle bg-surface-sunken p-2">
          {members.length === 0 && <p className="text-[12px] text-text-tertiary">Aucun candidat dans ce groupe.</p>}
          {members.map((m) => (
            <label key={m.candidate_user_id} className="flex items-center gap-2 text-[12.5px] text-text-secondary">
              <input type="radio" name="candidateUserIds" value={m.candidate_user_id} required />
              {m.full_name} <span className="text-text-tertiary">({m.username})</span>
            </label>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60"
      >
        {pending ? "Publication…" : "Publier"}
      </button>
      {state.error && <p className="text-[12.5px] text-status-critical-text">{state.error}</p>}
      {state.success && <p className="text-[12.5px] text-status-verified-text">{state.success}</p>}
    </form>
  );
}
