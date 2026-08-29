"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { batchAssignFunctionAction, batchAssignGroupAction, batchArchiveAction, type BatchResult } from "./actions";

interface GroupOption {
  id: number;
  name: string;
  company_name: string;
}
interface FunctionOption {
  code: string;
  label: string;
}

/** Actions groupées (mission "COMPLETE USER MANAGEMENT" §27) — UNIQUEMENT
 * les actions sûres explicitement autorisées : affecter à un groupe,
 * affecter à une fonction, archiver. JAMAIS de suppression définitive ni de
 * réinitialisation de mot de passe/MFA en masse (aucun bouton pour ces
 * actions ici, volontairement — voir app/(app)/users/actions.ts). Appelle
 * directement les Server Actions (pas de <form>, les tableaux d'ids ne
 * transitent pas naturellement par FormData) puis rafraîchit la page. */
export function BatchActionsBar({
  users,
  groups,
  functions,
}: {
  users: { id: number; fullName: string }[];
  groups: GroupOption[];
  functions: FunctionOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<BatchResult | null>(null);
  const [groupId, setGroupId] = useState("");
  const [functionCode, setFunctionCode] = useState("");

  function selectedIds(): number[] {
    const checked = document.querySelectorAll<HTMLInputElement>(".batch-user-checkbox:checked");
    return Array.from(checked).map((el) => Number(el.value));
  }

  function run(fn: () => Promise<BatchResult>) {
    const ids = selectedIds();
    if (ids.length === 0) {
      setResult({ error: "Sélectionnez au moins un candidat (cases à cocher)." });
      return;
    }
    startTransition(async () => {
      const r = await fn();
      setResult(r);
      router.refresh();
    });
  }

  if (users.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap items-end gap-2 rounded-md border border-border-subtle bg-surface-sunken/40 p-3">
      <div>
        <label className="mb-1 block text-[11px] font-medium text-text-secondary">Affecter au groupe (sélection)</label>
        <div className="flex gap-1.5">
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="rounded-md border border-border-default bg-surface-base px-2 py-1 text-[12px]">
            <option value="">Choisir…</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.company_name} — {g.name}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending || !groupId}
            onClick={() => run(() => batchAssignGroupAction(selectedIds(), Number(groupId)))}
            className="rounded-md border border-border-default px-2.5 py-1 text-[11.5px] font-medium text-text-secondary hover:border-border-strong disabled:opacity-60"
          >
            Affecter
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-text-secondary">Affecter à une fonction DGR (sélection)</label>
        <div className="flex gap-1.5">
          <select value={functionCode} onChange={(e) => setFunctionCode(e.target.value)} className="rounded-md border border-border-default bg-surface-base px-2 py-1 text-[12px]">
            <option value="">Choisir…</option>
            {functions.map((f) => (
              <option key={f.code} value={f.code}>{f.code}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending || !functionCode}
            onClick={() => run(() => batchAssignFunctionAction(selectedIds(), functionCode))}
            className="rounded-md border border-border-default px-2.5 py-1 text-[11.5px] font-medium text-text-secondary hover:border-border-strong disabled:opacity-60"
          >
            Affecter
          </button>
        </div>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Archiver les comptes sélectionnés ? Cette action est réversible (Restaurer).")) return;
          run(() => batchArchiveAction(selectedIds()));
        }}
        className="rounded-md border border-status-critical-border bg-status-critical-bg px-2.5 py-1 text-[11.5px] font-medium text-status-critical-text disabled:opacity-60"
      >
        Archiver la sélection
      </button>
      {result?.error && <p className="w-full text-[11.5px] text-status-critical-text">{result.error}</p>}
      {result?.success && <p className="w-full text-[11.5px] text-status-verified-text">{result.success}</p>}
    </div>
  );
}
