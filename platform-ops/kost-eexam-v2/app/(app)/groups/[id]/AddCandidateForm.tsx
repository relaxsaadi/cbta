"use client";

import { useState } from "react";
import { useActionState } from "react";
import { addCandidateAction, type AddCandidateResult } from "../actions";
import { formatAlgeriaDateTime } from "@/lib/timezone";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §5-9 —
// MÉTHODE D'ACCÈS explicite : A. invitation sécurisée (RECOMMENDED, défaut
// inchangé) ou B. accès temporaire (immédiat, mot de passe à usage
// unique). Confirmation forte avant B (§8), jamais un simple clic sans
// avertissement.
export function AddCandidateForm({ groupId }: { groupId: number }) {
  const action = addCandidateAction.bind(null, groupId);
  const [state, formAction, pending] = useActionState<AddCandidateResult, FormData>(action, {});
  const [accessMethod, setAccessMethod] = useState<"invitation" | "temporary">("invitation");
  const [confirmedTemporary, setConfirmedTemporary] = useState(false);

  if (state.temporaryPassword) {
    return (
      <div className="rounded-md border border-status-warning-border bg-status-warning-bg p-4">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-status-warning-text">Affichage unique</p>
        <p className="mb-3 text-[13px] text-text-primary">{state.success}</p>
        <div className="mb-3 rounded-md border border-border-default bg-surface-raised px-3 py-2">
          <p className="text-[11.5px] text-text-tertiary">Mot de passe temporaire</p>
          <p className="font-mono text-[14px] font-semibold text-text-primary">{state.temporaryPassword}</p>
          {state.temporaryPasswordExpiresAt && (
            <p className="mt-1 text-[11px] text-text-tertiary">Expire le {formatAlgeriaDateTime(state.temporaryPasswordExpiresAt, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
          )}
        </div>
        <p className="text-[11.5px] text-text-tertiary">
          Ce mot de passe ne sera plus jamais affiché ici — il a aussi été envoyé par email. Le candidat devra le remplacer lors de sa première connexion.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-4 items-end">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-[12px] font-medium text-text-secondary">Nom complet</label>
          <input id="fullName" name="fullName" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="username" className="mb-1 block text-[12px] font-medium text-text-secondary">Identifiant</label>
          <input id="username" name="username" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-[12px] font-medium text-text-secondary">Email (invitation)</label>
          <input id="email" name="email" type="email" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
        </div>
        <button
          disabled={pending || (accessMethod === "temporary" && !confirmedTemporary)}
          type="submit"
          className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60"
        >
          {pending ? "Ajout…" : "Ajouter"}
        </button>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-[12px] font-medium text-text-secondary">Méthode d&apos;accès</legend>
        <div className="flex flex-col gap-2">
          <label className="flex items-start gap-2 text-[12.5px]">
            <input
              type="radio"
              name="accessMethod"
              value="invitation"
              checked={accessMethod === "invitation"}
              onChange={() => { setAccessMethod("invitation"); setConfirmedTemporary(false); }}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium text-text-primary">A. Envoyer une invitation sécurisée</span>{" "}
              <span className="rounded bg-status-verified-bg px-1.5 py-0.5 text-[10.5px] font-semibold text-status-verified-text">RECOMMANDÉ</span>
              <br />
              <span className="text-text-tertiary">Le candidat crée lui-même son mot de passe via un lien reçu par email — aucun mot de passe n&apos;est jamais saisi ici.</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-[12.5px]">
            <input
              type="radio"
              name="accessMethod"
              value="temporary"
              checked={accessMethod === "temporary"}
              onChange={() => setAccessMethod("temporary")}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium text-text-primary">B. Créer un accès temporaire</span>
              <br />
              <span className="text-text-tertiary">Un mot de passe temporaire fort est généré et envoyé au candidat. Il devra être remplacé lors de la première connexion.</span>
            </span>
          </label>
        </div>
        {accessMethod === "temporary" && !confirmedTemporary && (
          <div className="mt-2 rounded-md border border-status-warning-border bg-status-warning-bg px-3 py-2">
            <p className="mb-2 text-[12px] text-status-warning-text">
              Un mot de passe temporaire sera généré et envoyé au candidat. Il devra être remplacé lors de la première connexion.
            </p>
            <button type="button" onClick={() => setConfirmedTemporary(true)} className="rounded-md border border-status-warning-border px-2.5 py-1 text-[11.5px] font-medium text-status-warning-text hover:bg-status-warning-border/20">
              Confirmer cette méthode
            </button>
          </div>
        )}
      </fieldset>

      <p className="text-[11.5px] text-text-tertiary">
        {accessMethod === "invitation"
          ? "Le candidat recevra un email pour créer lui-même son mot de passe — aucun mot de passe n'est saisi ici."
          : "Un mot de passe temporaire fort sera généré automatiquement et envoyé par email — jamais saisi par vous, jamais réutilisable après le premier changement."}
      </p>
      {state.error && <p className="text-[12.5px] text-status-critical-text">{state.error}</p>}
      {state.success && !state.temporaryPassword && <p className="text-[12.5px] text-status-verified-text">{state.success}</p>}
    </form>
  );
}
