"use client";

import { useActionState, useState } from "react";
import { gradeAnswerAction, type GradeAnswerResult } from "./actions";

export function GradeAnswerForm({ attemptQuestionId }: { attemptQuestionId: number }) {
  const action = gradeAnswerAction.bind(null, attemptQuestionId);
  const [state, formAction, pending] = useActionState<GradeAnswerResult, FormData>(action, {});
  const [comment, setComment] = useState("");

  // Pas de branche "succès" locale ici — la Server Action redirige vers
  // /grading?graded=1 en cas de réussite (voir actions.ts pour la raison
  // exacte : un simple retour {success} disparaissait avant tout
  // affichage). Cette ligne n'existe donc que pour le cas d'erreur, qui
  // lui NE redirige jamais et reste affiché normalement.
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input
        name="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Commentaire (optionnel)"
        className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          name="isCorrect"
          value="true"
          disabled={pending}
          className="rounded-md border border-status-verified-border bg-status-verified-bg px-2.5 py-1 text-[11.5px] font-medium text-status-verified-text disabled:opacity-60"
        >
          Correcte
        </button>
        <button
          type="submit"
          name="isCorrect"
          value="false"
          disabled={pending}
          className="rounded-md border border-status-critical-border bg-status-critical-bg px-2.5 py-1 text-[11.5px] font-medium text-status-critical-text disabled:opacity-60"
        >
          Incorrecte
        </button>
      </div>
      {state.error && <p className="text-[11.5px] text-status-critical-text">{state.error}</p>}
    </form>
  );
}
