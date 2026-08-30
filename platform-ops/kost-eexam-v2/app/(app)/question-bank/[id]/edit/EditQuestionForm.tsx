"use client";

import { useActionState, useMemo, useState } from "react";
import { editQuestionAction, type EditQuestionResult } from "../../actions";
import { emptyDraft, draftToPayload, subquestionToDraft, SubquestionFields, SUBQUESTION_TYPE_OPTIONS, type SubquestionDraft, type ScenarioSubQType } from "../../scenario-authoring";

type QType = "mcq_single" | "mcq_multi" | "true_false" | "numeric" | "short_answer" | "matching" | "ordering" | "scenario";
interface NumericAnswerSpec {
  value: number;
  tolerance: number;
  unit?: string;
}
type ShortAnswerSpec = { mode: "exact"; acceptedAnswers: string[] } | { mode: "manual" };
interface MatchingAnswerSpec {
  pairs: { left: string; right: string }[];
}
interface OrderingAnswerSpec {
  sequence: string[];
}
interface ScenarioSubquestionRaw {
  id: string;
  qtype: ScenarioSubQType;
  stem: string;
  points: number;
  choices: { key: string; text: string }[];
  correctAnswer: unknown;
}
interface ScenarioAnswerSpec {
  context: string;
  documentRef?: string;
  subquestions: ScenarioSubquestionRaw[];
}

export function EditQuestionForm({
  questionId,
  qtype,
  initialStem,
  initialChoices,
  initialCorrect,
  initialExplanation,
  initialNumeric,
  initialShortAnswer,
  initialMatching,
  initialOrdering,
  initialScenario,
}: {
  questionId: number;
  qtype: QType;
  initialStem: string;
  initialChoices: { key: string; text: string }[];
  initialCorrect: string[];
  initialExplanation: string;
  initialNumeric: NumericAnswerSpec | null;
  initialShortAnswer: ShortAnswerSpec | null;
  initialMatching: MatchingAnswerSpec | null;
  initialOrdering: OrderingAnswerSpec | null;
  initialScenario: ScenarioAnswerSpec | null;
}) {
  const action = editQuestionAction.bind(null, questionId);
  const [state, formAction, pending] = useActionState<EditQuestionResult, FormData>(action, {});
  const [shortAnswerMode, setShortAnswerMode] = useState<"exact" | "manual">(initialShortAnswer?.mode ?? "exact");
  const slots = [0, 1, 2, 3];

  // --- Appariement/Ordre — reconstruit les lignes brutes depuis les
  // clés stables (choices) + la référence de correction (pairs/sequence),
  // même logique que scenario-authoring.tsx::subquestionToDraft. ---
  const byKey = useMemo(() => new Map(initialChoices.map((c) => [c.key, c.text])), [initialChoices]);
  const [matchingLeft, setMatchingLeft] = useState<string[]>(() => {
    const base = (initialMatching?.pairs ?? []).map((p) => byKey.get(p.left) ?? "");
    return base.concat(["", "", "", ""]).slice(0, Math.max(4, base.length));
  });
  const [matchingRight, setMatchingRight] = useState<string[]>(() => {
    const base = (initialMatching?.pairs ?? []).map((p) => byKey.get(p.right) ?? "");
    return base.concat(["", "", "", ""]).slice(0, Math.max(4, base.length));
  });
  const [orderingItems, setOrderingItems] = useState<string[]>(() => {
    const base = (initialOrdering?.sequence ?? []).map((k) => byKey.get(k) ?? "");
    return base.concat(["", "", "", ""]).slice(0, Math.max(4, base.length));
  });

  // --- Scénario — contexte partagé + sous-questions reconstruites. ---
  const [scenarioContext, setScenarioContext] = useState(initialScenario?.context ?? "");
  const [scenarioDocumentRef, setScenarioDocumentRef] = useState(initialScenario?.documentRef ?? "");
  const [subquestions, setSubquestions] = useState<SubquestionDraft[]>(
    () => (initialScenario?.subquestions.length ? initialScenario.subquestions.map(subquestionToDraft) : [emptyDraft()])
  );
  const scenarioSubquestionsJson = useMemo(() => JSON.stringify(subquestions.map(draftToPayload)), [subquestions]);
  function updateSub(index: number, patch: Partial<SubquestionDraft>) {
    setSubquestions((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label htmlFor="stem" className="mb-1 block text-[12px] font-medium text-text-secondary">
          {qtype === "scenario" ? "Titre du scénario (distinct du contexte ci-dessous)" : "Texte de la question"}
        </label>
        <textarea id="stem" name="stem" required rows={qtype === "scenario" ? 1 : 2} defaultValue={initialStem} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
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

      {qtype === "matching" && (
        <fieldset>
          <legend className="mb-1 block text-[12px] font-medium text-text-secondary">Paires à associer (Élément → Correspondance) — au moins 2 lignes complètes</legend>
          <div className="flex flex-col gap-1.5">
            {matchingLeft.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  name="matchingLeftText"
                  aria-label={`Élément ${i + 1} (gauche)`}
                  placeholder={`Élément ${i + 1}`}
                  value={matchingLeft[i]}
                  onChange={(e) => setMatchingLeft((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                  className="flex-1 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
                />
                <span aria-hidden="true" className="text-text-tertiary">→</span>
                <input
                  name="matchingRightText"
                  aria-label={`Correspondance ${i + 1} (droite)`}
                  placeholder={`Correspondance ${i + 1}`}
                  value={matchingRight[i]}
                  onChange={(e) => setMatchingRight((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                  className="flex-1 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
                />
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {qtype === "ordering" && (
        <fieldset>
          <legend className="mb-1 block text-[12px] font-medium text-text-secondary">Éléments dans le BON ORDRE (l&apos;ordre de saisie = l&apos;ordre correct) — au moins 2</legend>
          <div className="flex flex-col gap-1.5">
            {orderingItems.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-[12px] text-text-tertiary">{i + 1}.</span>
                <input
                  name="orderingItemText"
                  aria-label={`Étape ${i + 1}`}
                  placeholder={`Étape ${i + 1}`}
                  value={orderingItems[i]}
                  onChange={(e) => setOrderingItems((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                  className="flex-1 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
                />
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {qtype === "scenario" && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 block text-[12px] font-medium text-text-secondary">Cas pratique / scénario</legend>
          <div>
            <label htmlFor="scenarioContext" className="mb-1 block text-[12px] font-medium text-text-secondary">Contexte / situation (affiché UNE SEULE FOIS pour toutes les sous-questions)</label>
            <textarea
              id="scenarioContext"
              name="scenarioContext"
              required
              rows={3}
              value={scenarioContext}
              onChange={(e) => setScenarioContext(e.target.value)}
              className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
            />
          </div>
          <div>
            <label htmlFor="scenarioDocumentRef" className="mb-1 block text-[12px] font-medium text-text-secondary">Document/image justificatif (optionnel)</label>
            <input
              id="scenarioDocumentRef"
              name="scenarioDocumentRef"
              value={scenarioDocumentRef}
              onChange={(e) => setScenarioDocumentRef(e.target.value)}
              className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
            />
          </div>
          <input type="hidden" name="scenarioSubquestionsJson" value={scenarioSubquestionsJson} readOnly />

          <div className="flex flex-col gap-3">
            {subquestions.map((sq, i) => (
              <div key={i} className="rounded-md border border-border-subtle p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12.5px] font-medium text-text-primary">Sous-question {i + 1}</p>
                  {subquestions.length > 1 && (
                    <button type="button" onClick={() => setSubquestions((prev) => prev.filter((_, j) => j !== i))} className="text-[11.5px] text-status-critical-text underline">
                      Retirer
                    </button>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Type</label>
                    <select value={sq.qtype} onChange={(e) => updateSub(i, { qtype: e.target.value as ScenarioSubQType })} className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]">
                      {SUBQUESTION_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Points</label>
                    <input type="number" min={1} value={sq.points} onChange={(e) => updateSub(i, { points: e.target.value })} className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]" />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Texte de la sous-question</label>
                  <textarea rows={2} value={sq.stem} onChange={(e) => updateSub(i, { stem: e.target.value })} className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]" />
                </div>
                <div className="mt-2">
                  <SubquestionFields draft={sq} onChange={(patch) => updateSub(i, patch)} />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setSubquestions((prev) => [...prev, emptyDraft()])} className="self-start rounded-md border border-border-default px-2.5 py-1 text-[11.5px] font-medium text-text-secondary hover:border-border-strong">
            + Ajouter une sous-question
          </button>
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
