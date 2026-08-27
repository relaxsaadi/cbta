"use client";

import { useActionState } from "react";
import { assignMoreCandidatesAction, type AssignMoreResult } from "../actions";

export function AssignMoreCandidatesForm({
  assessmentId,
  members,
}: {
  assessmentId: number;
  members: { candidate_user_id: number; full_name: string; username: string }[];
}) {
  const boundAction = assignMoreCandidatesAction.bind(null, assessmentId);
  const [state, formAction, pending] = useActionState<AssignMoreResult, FormData>(boundAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        {members.map((m) => (
          <label key={m.candidate_user_id} className="flex items-center gap-2 text-[12.5px] text-text-secondary">
            <input type="checkbox" name="candidateUserIds" value={m.candidate_user_id} />
            {m.full_name} <span className="text-text-tertiary">({m.username})</span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong disabled:opacity-60"
      >
        {pending ? "Affectation…" : "Affecter la sélection"}
      </button>
      {state.error && <p className="text-[12px] text-status-critical-text">{state.error}</p>}
      {state.success && <p className="text-[12px] text-status-verified-text">{state.success}</p>}
    </form>
  );
}
