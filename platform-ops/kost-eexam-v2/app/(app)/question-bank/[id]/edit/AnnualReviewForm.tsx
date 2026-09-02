"use client";

import { useActionState } from "react";
import { recordAnnualReviewAction, type RecordAnnualReviewResult } from "../../actions";

// Mission "CLOSE AUDITOR REMARKS" (2026-08-31) §2-4 — formulaire de SAISIE
// CONTRÔLÉE d'une revue annuelle RÉELLEMENT menée, jamais un générateur.
// Aucun champ n'est pré-rempli — l'opérateur doit transcrire une décision
// humaine déjà survenue (nom du réviseur, date, édition applicable),
// exactement la même discipline que le formulaire de création de question.
export function AnnualReviewForm({ questionId }: { questionId: number }) {
  const action = recordAnnualReviewAction.bind(null, questionId);
  const [state, formAction, pending] = useActionState<RecordAnnualReviewResult, FormData>(action, {});
  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-[11.5px] text-text-tertiary">
        Enregistre une revue annuelle RÉELLEMENT menée par un instructeur habilité — ne choisissez « Revue annuelle terminée » que si cette revue a
        effectivement eu lieu et si la qualification / autorité du réviseur est documentée. Chaque enregistrement crée une nouvelle ligne
        d&apos;historique, jamais un écrasement de la précédente.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="reviewYear" className="mb-1 block text-[12px] font-medium text-text-secondary">Année applicable</label>
          <input id="reviewYear" name="reviewYear" type="number" min="2020" max="2100" defaultValue={currentYear} required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="applicableEdition" className="mb-1 block text-[12px] font-medium text-text-secondary">Édition / manuel DGR applicable</label>
          <input id="applicableEdition" name="applicableEdition" placeholder="ex. IATA DGR 67e édition 2026 + Addendum 1" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="reviewerName" className="mb-1 block text-[12px] font-medium text-text-secondary">Nom du réviseur</label>
          <input id="reviewerName" name="reviewerName" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="reviewerQualification" className="mb-1 block text-[12px] font-medium text-text-secondary">Qualification / autorité (obligatoire si terminée)</label>
          <input id="reviewerQualification" name="reviewerQualification" placeholder="ex. Instructeur DGR — autorité documentée" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="reviewDate" className="mb-1 block text-[12px] font-medium text-text-secondary">Date de revue</label>
          <input id="reviewDate" name="reviewDate" type="date" max={today} required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="decision" className="mb-1 block text-[12px] font-medium text-text-secondary">Décision</label>
          <select id="decision" name="decision" required defaultValue="" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
            <option value="" disabled>Choisir…</option>
            <option value="A_REVOIR">À revoir</option>
            <option value="REVUE_EN_COURS">Revue annuelle en cours</option>
            <option value="REVUE_TERMINEE">Revue annuelle terminée</option>
          </select>
        </div>
        <div>
          <label htmlFor="nextReviewDue" className="mb-1 block text-[12px] font-medium text-text-secondary">Prochaine échéance (optionnel)</label>
          <input id="nextReviewDue" name="nextReviewDue" type="date" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="comment" className="mb-1 block text-[12px] font-medium text-text-secondary">Commentaire (optionnel)</label>
          <textarea id="comment" name="comment" rows={2} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
      </div>
      <p className="text-[11.5px] text-text-tertiary">
        Contrôles serveur : aucune date future ; l&apos;année applicable doit correspondre à l&apos;année de la date de revue. Une référence durable de
        preuve de revue reste un gate séparé avant clôture du blocker readiness #16.
      </p>
      <div>
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Enregistrement…" : "Enregistrer la revue annuelle"}
        </button>
      </div>
      {state.error && <p className="text-[12.5px] text-status-critical-text">{state.error}</p>}
      {state.success && <p className="text-[12.5px] text-status-verified-text">{state.success}</p>}
    </form>
  );
}
