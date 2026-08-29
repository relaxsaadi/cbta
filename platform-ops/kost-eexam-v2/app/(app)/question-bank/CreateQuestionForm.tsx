"use client";

import { useActionState, useState } from "react";
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

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §41-51 — mêmes
// libellés que lib/questions.ts::QTYPE_LABELS (dupliqués ici pour la même
// raison que SOURCE_STATUS_LABELS ci-dessus — module "use client").
// matching/ordering/scenario ne sont volontairement pas dans cette liste
// (portée assumée, voir le rapport final).
type QType = "mcq_single" | "mcq_multi" | "true_false" | "numeric" | "short_answer";
const QTYPE_OPTIONS: { value: QType; label: string }[] = [
  { value: "mcq_single", label: "QCM — une seule réponse" },
  { value: "mcq_multi", label: "QCM — plusieurs réponses" },
  { value: "true_false", label: "Vrai / Faux" },
  { value: "numeric", label: "Réponse numérique" },
  { value: "short_answer", label: "Réponse courte" },
];

export function CreateQuestionForm({ functions }: { functions: { code: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState<CreateQuestionResult, FormData>(createQuestionAction, {});
  const [qtype, setQtype] = useState<QType>("mcq_single");
  const [shortAnswerMode, setShortAnswerMode] = useState<"exact" | "manual">("exact");
  const [preview, setPreview] = useState(false);
  const [stem, setStem] = useState("");

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
        <label htmlFor="stem" className="mb-1 block text-[12px] font-medium text-text-secondary">Texte de la question</label>
        <textarea id="stem" name="stem" required rows={2} value={stem} onChange={(e) => setStem(e.target.value)} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
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
          <p className="mb-2 font-medium text-text-primary">{stem || "(texte de la question)"}</p>
          {qtype === "numeric" && <p className="text-text-tertiary">Champ de réponse numérique</p>}
          {qtype === "short_answer" && <p className="text-text-tertiary">Champ de réponse texte libre</p>}
          {(qtype === "mcq_single" || qtype === "mcq_multi" || qtype === "true_false") && <p className="text-text-tertiary">Choix multiples (saisis ci-dessus)</p>}
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
