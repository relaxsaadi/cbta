"use client";

import { useActionState, useState } from "react";
import { assignCompanyGroupAction, addToGroupAction, changeGroupAction, removeFromGroupAction, type AffiliationResult } from "../actions";
import { ActionButton } from "../ActionButton";

interface CandidateGroupRow {
  group_id: number;
  group_name: string;
  session_label: string | null;
  company_id: number;
  company_name: string;
}
interface CompanyOption {
  id: number;
  name: string;
}
interface GroupOption {
  id: number;
  company_id: number;
  name: string;
  company_name: string;
}

/** "Affecter à une entreprise" / "Ajouter à un groupe" / "Changer de
 * groupe" / "Retirer d'un groupe" (mission §22-24) — l'entreprise est
 * TOUJOURS dérivée de l'appartenance à un groupe réel (voir
 * lib/user-affiliation.ts) : jamais un champ "entreprise" isolé sans
 * groupe. Un candidat "Particulier" affiche "Entreprise : Aucune" tant
 * qu'aucun groupe n'est présent — jamais une entreprise fictive. */
export function AffiliationSection({
  userId,
  candidateGroups,
  companies,
  groups,
}: {
  userId: number;
  candidateGroups: CandidateGroupRow[];
  companies: CompanyOption[];
  groups: GroupOption[];
}) {
  const hasAffiliation = candidateGroups.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {hasAffiliation ? (
        <div className="flex flex-col gap-1.5">
          {candidateGroups.map((g) => (
            <div key={g.group_id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2 text-[12.5px]">
              <span className="text-text-primary">
                {g.company_name} — {g.group_name}
                {g.session_label && <span className="text-text-tertiary"> ({g.session_label})</span>}
              </span>
              <RemoveFromGroupButton userId={userId} groupId={g.group_id} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[12.5px] text-text-tertiary">Type : Particulier — Entreprise : Aucune.</p>
      )}

      <AssignForm
        userId={userId}
        companies={companies}
        groups={groups}
        label={hasAffiliation ? "Ajouter à un groupe" : "Affecter à une entreprise"}
        action={hasAffiliation ? addToGroupAction : assignCompanyGroupAction}
      />

      {hasAffiliation && <ChangeGroupSection userId={userId} candidateGroups={candidateGroups} groups={groups} />}
    </div>
  );
}

function RemoveFromGroupButton({ userId, groupId }: { userId: number; groupId: number }) {
  return (
    <ActionButton
      action={removeFromGroupAction.bind(null, userId, groupId)}
      label="Retirer"
      pendingLabel="…"
      variant="danger"
      confirmMessage="Retirer ce candidat de ce groupe ? Impossible si un historique d'examen existe sous ce groupe."
    />
  );
}

function AssignForm({
  userId,
  companies,
  groups,
  label,
  action,
}: {
  userId: number;
  companies: CompanyOption[];
  groups: GroupOption[];
  label: string;
  action: (userId: number, prev: AffiliationResult, formData: FormData) => Promise<AffiliationResult>;
}) {
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const bound = action.bind(null, userId);
  const [state, formAction, pending] = useActionState<AffiliationResult, FormData>(bound, {});
  const groupsForCompany = groups.filter((g) => String(g.company_id) === companyId);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start rounded-md border border-border-default px-2.5 py-1 text-[12px] font-medium text-text-secondary hover:border-border-strong">
        {label}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border border-border-default bg-surface-sunken/40 p-3 text-[12.5px]">
      <p className="font-medium text-text-primary">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <select name="companyId" value={companyId} onChange={(e) => setCompanyId(e.target.value)} required className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]">
          <option value="">Client…</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="groupId" required disabled={!companyId} className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px] disabled:opacity-50">
          <option value="">Groupe…</option>
          {groupsForCompany.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Enregistrement…" : "Confirmer"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[12px] text-text-tertiary hover:text-text-secondary">Annuler</button>
      </div>
      {state.error && <p className="text-status-critical-text">{state.error}</p>}
      {state.success && <p className="text-status-verified-text">{state.success}</p>}
    </form>
  );
}

function ChangeGroupSection({
  userId,
  candidateGroups,
  groups,
}: {
  userId: number;
  candidateGroups: CandidateGroupRow[];
  groups: GroupOption[];
}) {
  const [open, setOpen] = useState(false);
  const bound = changeGroupAction.bind(null, userId);
  const [state, formAction, pending] = useActionState<AffiliationResult, FormData>(bound, {});

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start rounded-md border border-border-default px-2.5 py-1 text-[12px] font-medium text-text-secondary hover:border-border-strong">
        Changer de groupe / d&apos;entreprise
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border border-border-default bg-surface-sunken/40 p-3 text-[12.5px]">
      <p className="font-medium text-text-primary">Changer de groupe / d&apos;entreprise</p>
      <p className="text-[11.5px] text-text-tertiary">Bloqué si le groupe actuel porte un historique d&apos;examen ou de familiarisation pour ce candidat.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <select name="oldGroupId" required className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]">
          <option value="">Groupe actuel à quitter…</option>
          {candidateGroups.map((g) => (
            <option key={g.group_id} value={g.group_id}>{g.company_name} — {g.group_name}</option>
          ))}
        </select>
        <select name="newGroupId" required className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]">
          <option value="">Nouveau groupe…</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.company_name} — {g.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Enregistrement…" : "Confirmer"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[12px] text-text-tertiary hover:text-text-secondary">Annuler</button>
      </div>
      {state.error && <p className="text-status-critical-text">{state.error}</p>}
      {state.success && <p className="text-status-verified-text">{state.success}</p>}
    </form>
  );
}
