"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetPasswordResult } from "./actions";
import { ShieldCheck, Lock } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ResetPasswordResult, FormData>(resetPasswordAction, {});

  if (state.success) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface-raised p-6 text-center shadow-md">
        <ShieldCheck className="mx-auto mb-3 text-status-verified-text" size={28} />
        <h2 className="font-display text-[17px] font-semibold text-text-primary">Mot de passe modifié</h2>
        <p className="mt-2 text-[13px] text-text-tertiary">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <a href="/login" className="mt-5 inline-flex items-center justify-center rounded-md bg-accent-9 px-4 py-2.5 text-[13.5px] font-medium text-white hover:bg-accent-10">
          Se connecter
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-border-subtle bg-surface-raised p-6 shadow-md">
      <input type="hidden" name="token" value={token} />
      <div className="mb-4 flex items-center gap-2">
        <Lock size={16} className="text-accent-9" />
        <h2 className="font-display text-[16px] font-semibold text-text-primary">Nouveau mot de passe</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-medium text-text-secondary">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-[13.5px] outline-none focus:border-accent-9 focus:ring-2 focus:ring-accent-soft-bg"
          />
        </div>
        <div>
          <label htmlFor="passwordConfirm" className="mb-1.5 block text-[12.5px] font-medium text-text-secondary">
            Confirmer
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
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
          {pending ? "Modification…" : "Modifier le mot de passe"}
        </button>
      </div>
    </form>
  );
}
