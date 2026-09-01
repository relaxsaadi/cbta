"use client";

import { useActionState, useEffect, useState } from "react";
import { createAssessmentAction, type CreateAssessmentResult } from "./actions";

type Preset = { attemptsAllowed: number; feedbackMode: string; showResult: boolean; showCorrectAnswers: boolean };
const PRESETS: Record<string, Preset> = {
  exercice: { attemptsAllowed: 0, feedbackMode: "immediate", showResult: true, showCorrectAnswers: true },
  test: { attemptsAllowed: 2, feedbackMode: "deferred", showResult: true, showCorrectAnswers: false },
  examen: { attemptsAllowed: 1, feedbackMode: "deferred", showResult: true, showCorrectAnswers: false },
};

export function CreateAssessmentForm({
  functions,
  groups,
  defaultGroupId,
}: {
  functions: { code: string; label: string }[];
  groups: { id: number; name: string; company_name: string }[];
  defaultGroupId?: number;
}) {
  const [state, formAction, pending] = useActionState<CreateAssessmentResult, FormData>(createAssessmentAction, {});
  const [type, setType] = useState<"exercice" | "test" | "examen">("test");
  const [functionCode, setFunctionCode] = useState(functions[0]?.code ?? "7.1");
  const [admissible, setAdmissible] = useState<number | null>(null);
  const preset = PRESETS[type]!;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/question-bank/admissible-count?function=${functionCode}`)
      .then((r) => r.json())
      .then((d) => !cancelled && setAdmissible(d.count ?? 0));
    return () => {
      cancelled = true;
    };
  }, [functionCode]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Étape 1 — Type */}
      <div>
        <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">1. Type</label>
        <div className="flex gap-2">
          {(["exercice", "test", "examen"] as const).map((t) => (
            <label key={t} className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-[13px] capitalize ${type === t ? "border-accent-9 bg-accent-soft-bg text-accent-11 font-medium" : "border-border-default text-text-secondary"}`}>
              <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Étape 2 — Groupe */}
        <div>
          <label htmlFor="groupId" className="mb-1 block text-[12px] font-medium text-text-secondary">2. Client / Groupe</label>
          <select id="groupId" name="groupId" required defaultValue={defaultGroupId} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            <option value="">Sélectionner…</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.company_name} — {g.name}</option>
            ))}
          </select>
        </div>

        {/* Étape 3 — Fonction */}
        <div>
          <label htmlFor="functionCode" className="mb-1 block text-[12px] font-medium text-text-secondary">3. Fonction DGR</label>
          <select id="functionCode" name="functionCode" value={functionCode} onChange={(e) => setFunctionCode(e.target.value)} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            {functions.map((f) => (
              <option key={f.code} value={f.code}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-[12px] font-medium text-text-secondary">4. Nom de l&apos;évaluation</label>
        <input id="name" name="name" required placeholder="Ex. DGR Fonction 7.1 — Examen Septembre 2026" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
      </div>

      {/* Étape 5 — Banque (information, pas un champ à remplir) */}
      <div className="rounded-md border border-accent-soft-border bg-accent-soft-bg px-3 py-2 text-[13px] text-accent-11">
        5. Questions admissibles disponibles : <strong>{admissible === null ? "…" : admissible}</strong>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Étape 6 */}
        <div>
          <label htmlFor="questionCount" className="mb-1 block text-[12px] font-medium text-text-secondary">6. Nombre à tirer</label>
          {/* Bug réel trouvé en E2E sous charge machine élevée (2026-08-30,
              mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS") : seul ce
              champ, parmi ceux dont la valeur par défaut dépend d'un état
              calculé, n'avait PAS le `key` qui force un vrai remontage React
              (contrairement à attemptsAllowed/showResult/showCorrectAnswers/
              feedbackMode ci-dessous, tous keyés sur `type`) — `defaultValue`
              ne s'applique qu'au MONTAGE initial, donc quand `admissible`
              passait de `null` à sa vraie valeur après le fetch async
              (ligne 28), ce champ non-remonté gardait son ancien defaultValue
              (15) au lieu de suivre l'admissible réel, avec un risque de
              valeur incohérente si l'utilisateur (ou un test E2E) le
              remplissait pendant cette fenêtre de course. */}
          <input id="questionCount" type="number" name="questionCount" required min={1} max={admissible ?? undefined} defaultValue={Math.min(15, admissible ?? 15)} key={`qcount-${functionCode}-${admissible}`} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        {/* Étape 7 */}
        <div>
          <label htmlFor="durationMinutes" className="mb-1 block text-[12px] font-medium text-text-secondary">7. Durée (min)</label>
          <input id="durationMinutes" type="number" name="durationMinutes" required min={1} defaultValue={30} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        {/* Étape 8 */}
        <div>
          <label htmlFor="passThresholdPct" className="mb-1 block text-[12px] font-medium text-text-secondary">8. Seuil de réussite (%)</label>
          <input id="passThresholdPct" type="number" name="passThresholdPct" required min={1} max={100} defaultValue={80} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          <p className="mt-1 text-[11px] text-text-tertiary">Paramètre KOST configurable — jamais une exigence IATA universelle.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Étape 9 */}
        <div>
          <label htmlFor="attemptsAllowed" className="mb-1 block text-[12px] font-medium text-text-secondary">9. Tentatives autorisées (0 = illimité)</label>
          <input id="attemptsAllowed" type="number" name="attemptsAllowed" min={0} defaultValue={preset.attemptsAllowed} key={`attempts-${type}`} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        {/* Étape 10 — ouverture ET fermeture (une seule "étape" : la même
            fenêtre de disponibilité, jamais affichée nulle part ensuite —
            voir aussi le Récapitulatif de app/(app)/exam-preparation/[id]/
            page.tsx, corrigé pour la reprendre) */}
        <div>
          <label htmlFor="openAt" className="mb-1 block text-[12px] font-medium text-text-secondary">10. Ouverture</label>
          <input id="openAt" type="datetime-local" name="openAt" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="closeAt" className="mb-1 block text-[12px] font-medium text-text-secondary">10. Fermeture</label>
          <input id="closeAt" type="datetime-local" name="closeAt" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          <p className="mt-1 text-[11px] text-text-tertiary">Obligatoire lorsque le feedback est « Différé ».</p>
        </div>
      </div>

      {/* Étape 11 — Options */}
      <div>
        <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">11. Options</label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-[13px] text-text-secondary">
            <input type="checkbox" name="shuffleQuestions" defaultChecked className="h-4 w-4" /> Mélanger les questions
          </label>
          <label className="flex items-center gap-2 text-[13px] text-text-secondary">
            <input type="checkbox" name="shuffleAnswers" defaultChecked className="h-4 w-4" /> Mélanger les réponses
          </label>
          <label className="flex items-center gap-2 text-[13px] text-text-secondary">
            <input type="checkbox" name="showResult" defaultChecked={preset.showResult} key={`showresult-${type}`} className="h-4 w-4" /> Montrer le résultat au candidat
          </label>
          <label className="flex items-center gap-2 text-[13px] text-text-secondary">
            <input type="checkbox" name="showCorrectAnswers" defaultChecked={preset.showCorrectAnswers} key={`showcorrect-${type}`} className="h-4 w-4" /> Montrer les réponses correctes au candidat
          </label>
        </div>
        <div className="mt-2">
          <label htmlFor="feedbackMode" className="mb-1 block text-[12px] font-medium text-text-secondary">Feedback</label>
          <select id="feedbackMode" name="feedbackMode" defaultValue={preset.feedbackMode} key={`feedback-${type}`} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            <option value="immediate">Immédiat</option>
            <option value="deferred">Différé</option>
            <option value="none">Aucun</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="scope" className="mb-1 block text-[12px] font-medium text-text-secondary">12. Périmètre</label>
        <select id="scope" name="scope" className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
          <option value="production">Production</option>
          <option value="demo">Démo</option>
          <option value="test">Test</option>
        </select>
      </div>

      <div>
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-4 py-2 text-[13.5px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Création…" : "Créer le brouillon"}
        </button>
        {state.error && <p className="mt-2 text-[12.5px] text-status-critical-text">{state.error}</p>}
      </div>
    </form>
  );
}