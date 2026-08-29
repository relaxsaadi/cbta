"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type ForgotPasswordResult } from "./actions";
import { Mail } from "lucide-react";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ForgotPasswordResult, FormData>(requestPasswordResetAction, {});

  if (state.submitted) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface-raised p-6 text-center shadow-md">
        <Mail className="mx-auto mb-3 text-accent-9" size={26} />
        <h2 className="font-display text-[16px] font-semibold text-text-primary">Vérifiez votre email</h2>
        <p className="mt-2 text-[13px] text-text-tertiary">
          Si un compte KOST E-EXAM est associé à cet identifiant, un email avec les instructions de réinitialisation vient d&apos;être envoyé.
        </p>
        <a href="/login" className="mt-4 inline-block text-[12.5px] font-medium text-accent-9 hover:underline">
          Retour à la connexion
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-border-subtle bg-surface-raised p-6 shadow-md">
      <h2 className="mb-1 font-display text-[16px] font-semibold text-text-primary">Mot de passe oublié</h2>
      <p className="mb-4 text-[12.5px] text-text-tertiary">Saisissez votre identifiant ou votre email pour recevoir un lien de réinitialisation.</p>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="identifier" className="mb-1.5 block text-[12.5px] font-medium text-text-secondary">
            Identifiant ou email
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-[13.5px] outline-none focus:border-accent-9 focus:ring-2 focus:ring-accent-soft-bg"
          />
        </div>
        {state.error && (
          <p role="alert" className="rounded-md bg-status-critical-bg border border-status-critical-border px-3 py-2 text-[12.5px] text-status-critical-text">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-1 flex items-center justify-center rounded-md bg-accent-9 px-3 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-accent-10 disabled:opacity-60"
        >
          {pending ? "Envoi…" : "Recevoir le lien"}
        </button>
        <a href="/login" className="text-center text-[12px] text-text-tertiary hover:text-text-secondary">
          Retour à la connexion
        </a>
      </div>
    </form>
  );
}
