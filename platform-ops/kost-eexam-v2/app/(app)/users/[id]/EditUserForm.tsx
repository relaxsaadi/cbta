"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { editUserAction, type EditUserResult } from "../actions";

export function EditUserForm({
  userId,
  fullName,
  email,
  phone,
  candidateType,
}: {
  userId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  candidateType: "particulier" | "entreprise" | null;
}) {
  const [open, setOpen] = useState(false);
  const action = editUserAction.bind(null, userId);
  const [state, formAction, pending] = useActionState<EditUserResult, FormData>(action, {});

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start rounded-md border border-border-default px-2.5 py-1 text-[12px] font-medium text-text-secondary hover:border-border-strong">
        Modifier
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border border-border-default bg-surface-sunken/40 p-3 text-[12.5px]">
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Nom complet</label>
        <input name="fullName" defaultValue={fullName} required className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
      </div>
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Email</label>
        <input name="email" type="email" defaultValue={email ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
      </div>
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Téléphone</label>
        <input name="phone" defaultValue={phone ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
      </div>
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Type candidat</label>
        <select name="candidateType" defaultValue={candidateType ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]">
          <option value="">—</option>
          <option value="particulier">Particulier</option>
          <option value="entreprise">Entreprise</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[12px] text-text-tertiary hover:text-text-secondary">Annuler</button>
      </div>
      {state.error && (
        <p className="text-status-critical-text">
          {state.error}
          {state.duplicateUserId && (
            <>
              {" "}
              <Link href={`/users/${state.duplicateUserId}`} className="underline hover:no-underline">
                Voir le compte
              </Link>
            </>
          )}
        </p>
      )}
      {state.success && <p className="text-status-verified-text">{state.success}</p>}
    </form>
  );
}
