"use client";

import { useActionState } from "react";
import { verifyMfaAction, cancelMfaLoginAction, type VerifyMfaResult } from "./actions";
import { ShieldCheck } from "lucide-react";

const initialState: VerifyMfaResult = {};

export function VerifyMfaForm() {
  const [state, formAction, pending] = useActionState(verifyMfaAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-base px-6 py-12">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-9 text-white">
            <ShieldCheck size={18} />
          </div>
          <h1 className="font-display text-[17px] font-semibold tracking-tight text-text-primary">Vérification en deux étapes</h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            Entrez le code à 6 chiffres de votre application d&apos;authentification, ou un code de secours.
          </p>
        </div>

        <form action={formAction} className="rounded-lg border border-border-subtle bg-surface-raised p-6 shadow-md">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="code" className="mb-1.5 block text-[12.5px] font-medium text-text-secondary">
                Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                placeholder="123456"
                className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-center text-[16px] tracking-[0.3em] text-text-primary outline-none transition-colors focus:border-accent-9 focus:ring-2 focus:ring-accent-soft-bg"
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
              {pending ? "Vérification…" : "Valider"}
            </button>
          </div>
        </form>

        <form action={cancelMfaLoginAction} className="mt-4 flex justify-center">
          <button type="submit" className="text-[12px] text-text-tertiary hover:text-text-secondary hover:underline">
            Annuler et revenir à la connexion
          </button>
        </form>
      </div>
    </main>
  );
}
