"use client";

import { useActionState, useState } from "react";
import { startMfaEnrollmentAction, confirmMfaEnrollmentAction, disableMfaAction, type MfaConfirmResult, type MfaDisableResult } from "./actions";

// Mission "PRODUCTION READINESS" §25 — pas de rendu de QR code (aucune
// dépendance npm nouvelle, même discipline que lib/mfa.ts) : la clé
// formatée en groupes de 4 + l'URI otpauth:// couvrent la saisie manuelle,
// acceptée par toute application d'authentification standard.
export function MfaSettings({ enabled }: { enabled: boolean }) {
  const [enrollment, setEnrollment] = useState<{ formattedSecret: string; otpauthUri: string } | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [confirmState, confirmFormAction, confirmPending] = useActionState<MfaConfirmResult, FormData>(confirmMfaEnrollmentAction, {});
  const [disableState, disableFormAction, disablePending] = useActionState<MfaDisableResult, FormData>(disableMfaAction, {});
  const [showDisableForm, setShowDisableForm] = useState(false);

  async function handleStart() {
    setStarting(true);
    setStartError(null);
    try {
      const result = await startMfaEnrollmentAction();
      if (result.error) {
        setStartError(result.error);
      } else if (result.formattedSecret && result.otpauthUri) {
        setEnrollment({ formattedSecret: result.formattedSecret, otpauthUri: result.otpauthUri });
      }
    } finally {
      setStarting(false);
    }
  }

  // Affichage UNIQUE, une seule fois — les codes ne sont jamais
  // reconsultables ensuite (§25), donc jamais persistés hors de cet état
  // local le temps de cette page.
  if (confirmState.recoveryCodes) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-md border border-status-verified-border bg-status-verified-bg px-3 py-2 text-[12.5px] text-status-verified-text">
          MFA activé. Notez ces codes de secours <strong>maintenant</strong> — ils ne seront plus jamais affichés. Chacun
          n&apos;est utilisable qu&apos;une seule fois, en remplacement d&apos;un code de votre application si vous perdez
          l&apos;accès à celle-ci.
        </p>
        <div className="grid grid-cols-2 gap-1.5 rounded-md border border-border-default bg-surface-base p-3 font-mono text-[13px] text-text-primary sm:grid-cols-4">
          {confirmState.recoveryCodes.map((c) => (
            <span key={c} data-testid="mfa-recovery-code">
              {c}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (enabled) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[12.5px] font-medium text-status-verified-text">✓ MFA activé sur ce compte.</p>
        {!showDisableForm ? (
          <button
            type="button"
            onClick={() => setShowDisableForm(true)}
            className="w-fit text-[12px] text-status-critical-text hover:underline"
          >
            Désactiver MFA
          </button>
        ) : (
          <form action={disableFormAction} className="flex flex-col gap-2 rounded-md border border-status-critical-border bg-status-critical-bg p-3">
            <label htmlFor="mfa-disable-password" className="text-[12px] font-medium text-status-critical-text">
              Confirmez votre mot de passe pour désactiver MFA
            </label>
            <input
              id="mfa-disable-password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="w-full max-w-[280px] rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]"
            />
            <div className="flex items-center gap-3">
              <button
                disabled={disablePending}
                type="submit"
                className="rounded-md bg-status-critical-text px-2.5 py-1 text-[12px] font-medium text-white disabled:opacity-60"
              >
                {disablePending ? "…" : "Désactiver"}
              </button>
              <button type="button" onClick={() => setShowDisableForm(false)} className="text-[12px] text-text-tertiary">
                Annuler
              </button>
            </div>
            {disableState.error && <p className="text-[12px] text-status-critical-text">{disableState.error}</p>}
          </form>
        )}
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[12.5px] text-text-tertiary">MFA n&apos;est pas encore activé sur ce compte.</p>
        <button
          type="button"
          disabled={starting}
          onClick={handleStart}
          className="w-fit rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-accent-10 disabled:opacity-60"
        >
          {starting ? "Génération…" : "Activer MFA"}
        </button>
        {startError && <p className="text-[12px] text-status-critical-text">{startError}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-2 text-[12.5px] text-text-secondary">
        <li>1. Ouvrez votre application d&apos;authentification (Google Authenticator, Authy, 1Password…).</li>
        <li>
          2. Ajoutez un compte → saisie manuelle → entrez cette clé :{" "}
          <span data-testid="mfa-secret" className="ml-1 rounded bg-surface-base px-2 py-0.5 font-mono text-[12.5px] text-text-primary">
            {enrollment.formattedSecret}
          </span>
        </li>
        <li>3. Entrez le code à 6 chiffres généré pour confirmer l&apos;activation :</li>
      </ol>
      <form action={confirmFormAction} className="flex items-center gap-2">
        <label htmlFor="mfa-confirm-code" className="sr-only">
          Code de vérification à 6 chiffres
        </label>
        <input
          id="mfa-confirm-code"
          name="code"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          autoComplete="one-time-code"
          placeholder="123456"
          className="w-32 rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[13px] tracking-widest outline-none focus:border-accent-9 focus:ring-2 focus:ring-accent-soft-bg"
        />
        <button
          disabled={confirmPending}
          type="submit"
          className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-accent-10 disabled:opacity-60"
        >
          {confirmPending ? "Vérification…" : "Confirmer"}
        </button>
      </form>
      {confirmState.error && <p className="text-[12px] text-status-critical-text">{confirmState.error}</p>}
    </div>
  );
}
