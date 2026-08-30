"use client";

import { useActionState, useMemo, useState } from "react";
import { createQuestionAction, type CreateQuestionResult } from "./actions";
import { emptyDraft, draftToPayload, SubquestionFields, SUBQUESTION_TYPE_OPTIONS, type SubquestionDraft, type ScenarioSubQType } from "./scenario-authoring";

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

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §41-51, complétée
// par "MISSION FINALE CIBLÉE" (2026-08-30) §6 — les 8 types requis, dans
// l'ordre EXACT demandé par la mission. Dupliqué depuis lib/questions.ts::
// QTYPE_LABELS pour la même raison que SOURCE_STATUS_LABELS ci-dessus.
type QType = "mcq_single" | "mcq_multi" | "true_false" | "numeric" | "short_answer" | "matching" | "ordering" | "scenario";
const QTYPE_OPTIONS: { value: QType; label: string }[] = [
  { value: "true_false", label: "Vrai / Faux" },
  { value: "mcq_single", label: "QCM — une seule réponse" },
  { value: "mcq_multi", label: "QCM — plusieurs réponses" },
  { value: "matching", label: "Appariement" },
  { value: "ordering", label: "Ordre / séquence" },
  { value: "numeric", label: "Réponse numérique" },
  { value: "short_answer", label: "Réponse courte" },
  { value: "scenario", label: "Cas pratique / scénario" },
];

export function CreateQuestionForm({ functions }: { functions: { code: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState<CreateQuestionResult, FormData>(createQuestionAction, {});
  const [qtype, setQtype] = useState<QType>("mcq_single");
  const [shortAnswerMode, setShortAnswerMode] = useState<"exact" | "manual">("exact");
  const [preview, setPreview] = useState(false);
  const [stem, setStem] = useState("");

  // --- Appariement / Ordre — mêmes listes de 4 lignes fixes que les
  // choix MCQ ci-dessus (convention déjà établie dans ce formulaire),
  // filtrées côté serveur pour ne garder que les lignes réellement
  // remplies (§2-3 : "aucun côté vide"). ---
  const [matchingLeft, setMatchingLeft] = useState(["", "", "", ""]);
  const [matchingRight, setMatchingRight] = useState(["", "", "", ""]);
  const [orderingItems, setOrderingItems] = useState(["", "", "", ""]);

  // --- Scénario — contexte partagé + sous-questions dynamiques (§4). ---
  const [scenarioContext, setScenarioContext] = useState("");
  const [scenarioDocumentRef, setScenarioDocumentRef] = useState("");
  const [subquestions, setSubquestions] = useState<SubquestionDraft[]>([emptyDraft()]);

  const scenarioSubquestionsJson = useMemo(() => JSON.stringify(subquestions.map(draftToPayload)), [subquestions]);

  function updateSub(index: number, patch: Partial<SubquestionDraft>) {
    setSubquestions((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-4">
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
        <div>
          <label htmlFor="qtype" className="mb-1 block text-[12px] font-medium text-text-secondary">Type de question</label>
          <select id="qtype" name="qtype" value={qtype} onChange={(e) => setQtype(e.target.value as QType)} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            {QTYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="stem" className="mb-1 block text-[12px] font-medium text-text-secondary">
          {qtype === "scenario" ? "Titre du scénario (§4 — distinct du contexte ci-dessous, affiché dans les listes)" : "Texte de la question"}
        </label>
        <textarea
          id="stem"
          name="stem"
          required
          rows={qtype === "scenario" ? 1 : 2}
          placeholder={qtype === "scenario" ? "Ex. Incident de fuite — colis Classe 8" : undefined}
          value={stem}
          onChange={(e) => setStem(e.target.value)}
          className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
        />
      </div>

      {(qtype === "mcq_single" || qtype === "mcq_multi") && (
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
      )}

      {qtype === "true_false" && (
        <fieldset>
          <legend className="mb-1 block text-[12px] font-medium text-text-secondary">Bonne réponse</legend>
          <div className="flex gap-4 text-[13px]">
            <label className="flex items-center gap-1.5"><input type="radio" name="trueFalseCorrect" value="true" required /> Vrai</label>
            <label className="flex items-center gap-1.5"><input type="radio" name="trueFalseCorrect" value="false" /> Faux</label>
          </div>
        </fieldset>
      )}

      {qtype === "numeric" && (
        <fieldset className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="numericValue" className="mb-1 block text-[12px] font-medium text-text-secondary">Valeur correcte</label>
            <input id="numericValue" name="numericValue" type="number" step="any" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="numericTolerance" className="mb-1 block text-[12px] font-medium text-text-secondary">Tolérance (0 = exact)</label>
            <input id="numericTolerance" name="numericTolerance" type="number" step="any" min="0" defaultValue="0" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="numericUnit" className="mb-1 block text-[12px] font-medium text-text-secondary">Unité (optionnel, affichée au candidat)</label>
            <input id="numericUnit" name="numericUnit" placeholder="kg" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
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
              <textarea id="acceptedAnswers" name="acceptedAnswers" rows={3} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" placeholder={"UN\nUnited Nations"} />
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
            <label htmlFor="scenarioDocumentRef" className="mb-1 block text-[12px] font-medium text-text-secondary">Document/image justificatif (optionnel — référence ou URL, aucun fichier stocké)</label>
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
              <div key={i} data-testid={`scenario-subquestion-${i}`} className="rounded-md border border-border-subtle p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12.5px] font-medium text-text-primary">Sous-question {i + 1}</p>
                  {subquestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSubquestions((prev) => prev.filter((_, j) => j !== i))}
                      className="text-[11.5px] text-status-critical-text underline"
                    >
                      Retirer
                    </button>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Type</label>
                    <select
                      data-testid="scenario-subquestion-type"
                      value={sq.qtype}
                      onChange={(e) => updateSub(i, { qtype: e.target.value as ScenarioSubQType })}
                      className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]"
                    >
                      {SUBQUESTION_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Points</label>
                    <input
                      data-testid="scenario-subquestion-points"
                      type="number"
                      min={1}
                      value={sq.points}
                      onChange={(e) => updateSub(i, { points: e.target.value })}
                      className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Texte de la sous-question</label>
                  <textarea
                    data-testid="scenario-subquestion-stem"
                    rows={2}
                    value={sq.stem}
                    onChange={(e) => updateSub(i, { stem: e.target.value })}
                    className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]"
                  />
                </div>
                <div className="mt-2">
                  <SubquestionFields draft={sq} onChange={(patch) => updateSub(i, patch)} />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            data-testid="scenario-add-subquestion"
            onClick={() => setSubquestions((prev) => [...prev, emptyDraft()])}
            className="self-start rounded-md border border-border-default px-2.5 py-1 text-[11.5px] font-medium text-text-secondary hover:border-border-strong"
          >
            + Ajouter une sous-question
          </button>
        </fieldset>
      )}

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

      {/* §54 — aperçu fonctionnel léger (jamais une tentative/résultat/
          audit créé) : montre juste comment la question apparaîtrait au
          candidat, pas un moteur de rendu séparé. */}
      <button type="button" onClick={() => setPreview((v) => !v)} className="self-start text-[11.5px] text-text-tertiary underline hover:text-text-secondary">
        {preview ? "Masquer l'aperçu" : "Prévisualiser comme candidat"}
      </button>
      {preview && (
        <div className="rounded-md border border-border-subtle bg-surface-sunken p-3 text-[13px]">
          <p className="mb-2 font-medium text-text-primary">{stem || (qtype === "scenario" ? "(titre du scénario)" : "(texte de la question)")}</p>
          {qtype === "numeric" && <p className="text-text-tertiary">Champ de réponse numérique</p>}
          {qtype === "short_answer" && <p className="text-text-tertiary">Champ de réponse texte libre</p>}
          {(qtype === "mcq_single" || qtype === "mcq_multi" || qtype === "true_false") && <p className="text-text-tertiary">Choix multiples (saisis ci-dessus)</p>}
          {qtype === "matching" && <p className="text-text-tertiary">Appariement — associez chaque élément à la bonne réponse</p>}
          {qtype === "ordering" && <p className="text-text-tertiary">Ordre / séquence — placez les éléments dans le bon ordre</p>}
          {qtype === "scenario" && (
            <div className="text-text-tertiary">
              <p className="mb-1">{scenarioContext || "(contexte du scénario)"}</p>
              <p>{subquestions.length} sous-question(s) — {subquestions.map((s) => s.stem || "(sans texte)").join(" / ")}</p>
            </div>
          )}
        </div>
      )}

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
