"use client";

import { useActionState } from "react";
import { createUserAction, type CreateUserResult } from "./actions";

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState<CreateUserResult, FormData>(createUserAction, {});

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-5 items-end">
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
      <div>
        <label htmlFor="role" className="mb-1 block text-[12px] font-medium text-text-secondary">Rôle</label>
        <select id="role" name="role" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
          <option value="pedagogical_manager">Responsable pédagogique</option>
          <option value="administrator">Administrateur</option>
          <option value="auditor">Auditeur</option>
          <option value="candidate">Candidat</option>
        </select>
      </div>
      <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
        {pending ? "Création…" : "Créer"}
      </button>
      <p className="sm:col-span-5 text-[11.5px] text-text-tertiary">
        Le compte recevra un email pour créer lui-même son mot de passe — aucun mot de passe n&apos;est saisi ici.
      </p>
      {state.error && <p className="sm:col-span-5 text-[12.5px] text-status-critical-text">{state.error}</p>}
      {state.success && <p className="sm:col-span-5 text-[12.5px] text-status-verified-text">{state.success}</p>}
    </form>
  );
}
