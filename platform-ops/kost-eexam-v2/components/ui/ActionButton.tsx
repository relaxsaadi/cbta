"use client";

import { useActionState } from "react";

export interface SimpleActionResult {
  error?: string;
  success?: string;
}

/** Bouton d'action générique — "Result + champs cachés + bouton unique",
 * avec confirmation navigateur optionnelle avant soumission. Utilisé à
 * l'origine uniquement par la fiche candidat (/users/[id] — renvoyer
 * l'invitation, réinitialisation, archiver, retirer d'un groupe, retirer
 * une fonction…), promu ici (mission "FINAL PRODUCT IMPROVEMENTS BEFORE
 * AUDITOR PDF", 2026-08-31 §8-10) car /question-bank a exactement le même
 * besoin ("Supprimer définitivement cette question ?" / "Désactiver
 * cette question ?") — jamais une 2e implémentation quasi-identique. */
export function ActionButton({
  action,
  hiddenFields,
  label,
  pendingLabel,
  variant = "default",
  confirmMessage,
}: {
  action: (prev: SimpleActionResult, formData: FormData) => Promise<SimpleActionResult>;
  hiddenFields?: Record<string, string | number>;
  label: string;
  pendingLabel?: string;
  variant?: "default" | "danger" | "primary";
  confirmMessage?: string;
}) {
  const [state, formAction, pending] = useActionState<SimpleActionResult, FormData>(action, {});

  const variantClass =
    variant === "danger"
      ? "border-status-critical-border bg-status-critical-bg text-status-critical-text"
      : variant === "primary"
        ? "bg-accent-9 text-white border-transparent hover:bg-accent-10"
        : "border-border-default text-text-secondary hover:border-border-strong";

  return (
    <form
      action={formAction}
      className="inline-flex flex-col items-start gap-1"
      onSubmit={(e) => {
        if (confirmMessage && !confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {hiddenFields &&
        Object.entries(hiddenFields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button type="submit" disabled={pending} className={`rounded-md border px-2.5 py-1 text-[11.5px] font-medium disabled:opacity-60 ${variantClass}`}>
        {pending ? (pendingLabel ?? "…") : label}
      </button>
      {state.error && <p className="max-w-xs text-[11px] text-status-critical-text">{state.error}</p>}
      {state.success && <p className="max-w-xs text-[11px] text-status-verified-text">{state.success}</p>}
    </form>
  );
}
