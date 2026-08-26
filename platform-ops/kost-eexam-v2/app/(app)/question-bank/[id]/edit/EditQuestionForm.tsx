"use client";

import { useActionState } from "react";
import { editQuestionAction, type EditQuestionResult } from "../../actions";

export function EditQuestionForm({
  questionId,
  initialStem,
  initialChoices,
  initialCorrect,
  initialExplanation,
}: {
  questionId: number;
  initialStem: string;
  initialChoices: { key: string; text: string }[];
  initialCorrect: string[];
  initialExplanation: string;
}) {
  const action = editQuestionAction.bind(null, questionId);
  const [state, formAction, pending] = useActionState<EditQuestionResult, FormData>(action, {});
  const slots = [0, 1, 2, 3];

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label htmlFor="stem" className="mb-1 block text-[12px] font-medium text-text-secondary">Texte de la question</label>
        <textarea id="stem" name="stem" required rows={2} defaultValue={initialStem} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
      </div>
      <fieldset>
        <legend className="mb-1 block text-[12px] font-medium text-text-secondary">Choix de réponse (cocher la/les bonne(s) réponse(s))</legend>
        <div className="flex flex-col gap-1.5">
          {slots.map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="correct"
                value={i}
                defaultChecked={initialChoices[i] ? initialCorrect.includes(initialChoices[i]!.key) : false}
                aria-label={`Bonne réponse — choix ${String.fromCharCode(65 + i)}`}
                className="h-4 w-4"
              />
              <input
                name="choiceText"
                defaultValue={initialChoices[i]?.text ?? ""}
                aria-label={`Choix ${String.fromCharCode(65 + i)}`}
                placeholder={`Choix ${String.fromCharCode(65 + i)}`}
                className="flex-1 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
              />
            </div>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="explanation" className="mb-1 block text-[12px] font-medium text-text-secondary">Explication / correction</label>
        <input id="explanation" name="explanation" defaultValue={initialExplanation} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
      </div>
      <div>
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Enregistrement…" : "Enregistrer une nouvelle version"}
        </button>
        {state.error && <p className="mt-2 text-[12.5px] text-status-critical-text">{state.error}</p>}
      </div>
    </form>
  );
}
