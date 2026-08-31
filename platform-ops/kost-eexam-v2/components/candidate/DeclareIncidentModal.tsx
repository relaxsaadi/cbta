"use client";

import { useActionState, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CANDIDATE_INCIDENT_TYPES } from "@/lib/incident-constants";
import { declareCandidateIncidentAction, type DeclareCandidateIncidentResult } from "./actions";

// Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
// §24-33 — bouton + modale RÉUTILISÉS aux 3 points d'entrée demandés
// ("avant/pendant/immédiatement après l'examen", §24) : ExamRunner.tsx
// (pendant, attemptId fourni), /mes-examens (avant, attemptId=null),
// /mes-resultats (juste après, attemptId fourni). Jamais 3 formulaires
// divergents.
//
// §27/§32 — SÉCURITÉ CENTRALE pendant un examen en cours : ceci est une
// MODALE en overlay (components/ui/Modal.tsx), jamais une navigation de
// page. ExamRunner ne démonte donc JAMAIS pendant que la modale est
// ouverte — le chronomètre continue de tourner exactement comme avant
// (aucune pause automatique, §27), l'autosave des réponses n'est jamais
// interrompu, et fermer la modale ramène le candidat EXACTEMENT à la même
// question (index local React inchangé, jamais réinitialisé) — §32 "no
// modal that hides the exam irrecoverably ; candidate must be able to
// return safely to the same question".
export function DeclareIncidentModal({ attemptId, variant = "default" }: { attemptId?: number; variant?: "default" | "compact" }) {
  const [open, setOpen] = useState(false);
  const action = declareCandidateIncidentAction.bind(null, attemptId ?? null);
  const [state, formAction, pending] = useActionState<DeclareCandidateIncidentResult, FormData>(action, {});

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "compact"
            ? "flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-[12px] font-medium text-text-secondary hover:border-border-strong"
            : "flex items-center gap-1.5 rounded-md border border-status-warning-border bg-status-warning-bg px-3 py-1.5 text-[12.5px] font-medium text-status-warning-text hover:opacity-90"
        }
      >
        <AlertTriangle size={13} />
        Déclarer un incident
      </button>

      <Modal open={open} onClose={close} title="Déclarer un incident">
        {state.success ? (
          <div className="flex flex-col gap-3">
            <p className="text-[13.5px] font-medium text-status-verified-text">{state.success}</p>
            {/* Wording EXACT demandé par la mission §27 — seulement
                pertinent si un examen est réellement en cours (attemptId
                fourni depuis ExamRunner), jamais affiché depuis
                /mes-examens ou /mes-resultats où aucun examen ne tourne. */}
            {attemptId !== undefined && (
              <p className="text-[13px] text-text-secondary">L&apos;examen continue sauf indication contraire du responsable.</p>
            )}
            <button type="button" onClick={close} className="self-start rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
              Fermer
            </button>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-3">
            <p className="text-[12.5px] text-text-tertiary">
              {attemptId !== undefined
                ? "Cet incident sera automatiquement associé à votre tentative en cours."
                : "Décrivez le problème rencontré — un responsable pédagogique en sera informé."}
            </p>
            <div>
              <label htmlFor="incident-type" className="mb-1 block text-[12px] font-medium text-text-secondary">Type de problème</label>
              <select id="incident-type" name="type" required defaultValue="" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
                <option value="" disabled>Sélectionner…</option>
                {CANDIDATE_INCIDENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="incident-description" className="mb-1 block text-[12px] font-medium text-text-secondary">Description</label>
              <textarea
                id="incident-description"
                name="description"
                required
                rows={3}
                placeholder="Décrivez ce qui s'est passé…"
                className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={close} className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
                Annuler
              </button>
              <button type="submit" disabled={pending} className="rounded-md bg-status-warning-text px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:opacity-90 disabled:opacity-60">
                {pending ? "Envoi…" : "Déclarer"}
              </button>
            </div>
            {state.error && <p className="text-[12px] text-status-critical-text">{state.error}</p>}
          </form>
        )}
      </Modal>
    </>
  );
}
