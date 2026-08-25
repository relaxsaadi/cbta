"use client";

import { useActionState } from "react";
import { recordVerificationAction, type VerificationFormResult } from "./actions";
import { CheckCircle2 } from "lucide-react";

const initialState: VerificationFormResult = {};

export function VerificationForm() {
  const [state, formAction, isPending] = useActionState(recordVerificationAction, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-status-verified-border bg-status-verified-bg px-6 py-10 text-center">
        <CheckCircle2 size={28} className="text-status-verified-text" />
        <p className="font-display text-[14.5px] font-semibold text-status-verified-text">Vérification enregistrée</p>
        <p className="text-[12.5px] text-text-secondary max-w-[380px]">
          Journalisée avec votre identité, un horodatage et la méthode utilisée. Cet enregistrement ne peut pas être modifié ensuite.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-md border border-status-critical-border bg-status-critical-bg px-3.5 py-2.5 text-[12.5px] text-status-critical-text">
          {state.error}
        </div>
      )}

      <Field label="Identifiant Moodle du candidat" required>
        <input name="candidateUsername" required maxLength={100} className={inputClass} placeholder="ex. test_candidate" />
      </Field>
      <Field label="Nom complet du candidat" required>
        <input name="candidateFullName" required maxLength={150} className={inputClass} placeholder="Tel qu'affiché sur la pièce d'identité officielle" />
      </Field>
      <Field label="Examen" required>
        <input name="examName" required maxLength={200} className={inputClass} placeholder="ex. DGR Function 7.3 — Sample Exam" />
      </Field>
      <Field label="Référence de session (optionnel)">
        <input name="sessionReference" maxLength={200} className={inputClass} placeholder="ex. date / salle / groupe" />
      </Field>

      <div className="rounded-md border border-border-subtle bg-surface-sunken/50 px-3.5 py-2.5 text-[12px] text-text-tertiary">
        Méthode : <strong className="text-text-secondary">pièce d&apos;identité officielle + vérification supervisée</strong> — le
        superviseur confirme l&apos;identité du candidat par rapport à un document officiel et à son compte
        Moodle avant d&apos;autoriser l&apos;accès à l&apos;examen. Aucune copie du document d&apos;identité n&apos;est
        conservée (minimisation des données).
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-accent-9 px-4 py-2 text-[13px] font-medium text-white hover:bg-accent-10 transition-colors disabled:opacity-60"
      >
        {isPending ? "Enregistrement…" : "Enregistrer la vérification"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-9/30 focus:border-accent-9";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-text-secondary">
        {label}
        {required && <span className="text-status-critical-text"> *</span>}
      </span>
      {children}
    </label>
  );
}
