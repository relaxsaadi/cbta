"use client";

import { useActionState, useState } from "react";
import { editQuestionAction, type EditQuestionResult } from "../../actions";

type QType = "mcq_single" | "mcq_multi" | "true_false" | "numeric" | "short_answer";
interface NumericAnswerSpec {
  value: number;
  tolerance: number;
  unit?: string;
}
type ShortAnswerSpec = { mode: "exact"; acceptedAnswers: string[] } | { mode: "manual" };

export function EditQuestionForm({
  questionId,
  qtype,
  initialStem,
  initialChoices,
  initialCorrect,
  initialExplanation,
  initialNumeric,
  initialShortAnswer,
}: {
  questionId: number;
  qtype: QType;
  initialStem: string;
  initialChoices: { key: string; text: string }[];
  initialCorrect: string[];
  initialExplanation: string;
  initialNumeric: NumericAnswerSpec | null;
  initialShortAnswer: ShortAnswerSpec | null;
}) {
  const action = editQuestionAction.bind(null, questionId);
  const [state, formAction, pending] = useActionState<EditQuestionResult, FormData>(action, {});
  const [shortAnswerMode, setShortAnswerMode] = useState<"exact" | "manual">(initialShortAnswer?.mode ?? "exact");
  const slots = [0, 1, 2, 3];

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label htmlFor="stem" className="mb-1 block text-[12px] font-medium text-text-secondary">Texte de la question</label>
        <textarea id="stem" name="stem" required rows={2} defaultValue={initialStem} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
      </div>

      {(qtype === "mcq_single" || qtype === "mcq_multi") && (
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
      )}

      {qtype === "true_false" && (
        <fieldset>
          <legend className="mb-1 block text-[12px] font-medium text-text-secondary">Bonne réponse</legend>
          <div className="flex gap-4 text-[13px]">
            <label className="flex items-center gap-1.5"><input type="radio" name="trueFalseCorrect" value="true" defaultChecked={initialCorrect.includes("true")} required /> Vrai</label>
            <label className="flex items-center gap-1.5"><input type="radio" name="trueFalseCorrect" value="false" defaultChecked={initialCorrect.includes("false")} /> Faux</label>
          </div>
        </fieldset>
      )}

      {qtype === "numeric" && (
        <fieldset className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="numericValue" className="mb-1 block text-[12px] font-medium text-text-secondary">Valeur correcte</label>
            <input id="numericValue" name="numericValue" type="number" step="any" required defaultValue={initialNumeric?.value} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="numericTolerance" className="mb-1 block text-[12px] font-medium text-text-secondary">Tolérance (0 = exact)</label>
            <input id="numericTolerance" name="numericTolerance" type="number" step="any" min="0" required defaultValue={initialNumeric?.tolerance ?? 0} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="numericUnit" className="mb-1 block text-[12px] font-medium text-text-secondary">Unité (optionnel, affichée au candidat)</label>
            <input id="numericUnit" name="numericUnit" defaultValue={initialNumeric?.unit ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
        </fieldset>
      )}

      {qtype === "short_answer" && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 block text-[12px] font-medium text-text-secondary">Mode de correction</legend>
          <div className="flex gap-4 text-[13px]">
            <label className="flex items-center gap-1.5">
              <input type="radio" name="shortAnswerMode" value="exact" checked={shortAnswerMode === "exact"} onChange={() => setShortAnswerMode("exact")} />
              Correspondance exacte (auto-notée)
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" name="shortAnswerMode" value="manual" checked={shortAnswerMode === "manual"} onChange={() => setShortAnswerMode("manual")} />
              Correction manuelle obligatoire
            </label>
          </div>
          {shortAnswerMode === "exact" && (
            <div>
              <label htmlFor="acceptedAnswers" className="mb-1 block text-[12px] font-medium text-text-secondary">Réponses acceptées (une par ligne)</label>
              <textarea
                id="acceptedAnswers"
                name="acceptedAnswers"
                rows={3}
                defaultValue={initialShortAnswer?.mode === "exact" ? initialShortAnswer.acceptedAnswers.join("\n") : ""}
                className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
              />
            </div>
          )}
        </fieldset>
      )}

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
