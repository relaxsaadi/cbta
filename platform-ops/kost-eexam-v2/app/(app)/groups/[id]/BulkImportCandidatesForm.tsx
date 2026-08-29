"use client";

import { useActionState, useState } from "react";
import { bulkImportCandidatesAction, type BulkImportResult } from "../actions";

const STATUS_LABEL: Record<string, string> = {
  created: "Créé et ajouté",
  existing_added: "Compte existant, ajouté au groupe",
  duplicate_in_group: "Déjà membre — ignoré",
  error: "Erreur",
};

// Mission "PRODUCTION READINESS" §3 — import CSV en masse. Un rapport
// explicite ligne par ligne (jamais un succès supposé) — même discipline
// que l'importeur banque de questions (scripts/import-dgr-from-moodle.ts).
export function BulkImportCandidatesForm({ groupId }: { groupId: number }) {
  const [open, setOpen] = useState(false);
  const action = bulkImportCandidatesAction.bind(null, groupId);
  const [state, formAction, pending] = useActionState<BulkImportResult, FormData>(action, {});

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
        Import CSV en masse
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border-default bg-surface-raised p-3">
      <p className="text-[12px] text-text-tertiary">
        Format (en-tête obligatoire) : <code className="rounded bg-surface-sunken px-1 py-0.5">full_name,username,email</code> — colonne optionnelle :{" "}
        <code className="rounded bg-surface-sunken px-1 py-0.5">phone</code>. Un candidat par ligne. Chaque nouveau candidat reçoit un email pour créer
        lui-même son mot de passe — aucun mot de passe n&apos;est saisi ici.
      </p>
      <form action={formAction} className="flex flex-col gap-2">
        <textarea
          name="csv"
          rows={6}
          placeholder={"full_name,username,email\nAmina Belkacem,amina.belkacem,amina.belkacem@example.com"}
          className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 font-mono text-[12px]"
        />
        <div className="flex items-center gap-2">
          <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
            {pending ? "Import en cours…" : "Importer"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-[12.5px] text-text-tertiary hover:text-text-secondary">
            Fermer
          </button>
        </div>
      </form>
      {state.error && <p className="text-[12.5px] text-status-critical-text">{state.error}</p>}
      {state.report && (
        <div className="flex flex-col gap-1 rounded-md border border-border-subtle p-2">
          <p className="text-[12px] font-medium text-text-secondary">
            Rapport d&apos;import — {state.report.filter((r) => r.status === "created").length} créé(s),{" "}
            {state.report.filter((r) => r.status === "existing_added").length} ajouté(s) (compte existant),{" "}
            {state.report.filter((r) => r.status === "duplicate_in_group").length} déjà membre(s),{" "}
            {state.report.filter((r) => r.status === "error").length} erreur(s).
          </p>
          <div className="max-h-48 overflow-y-auto">
            {state.report.map((r) => (
              <p key={r.line} className="text-[11.5px] text-text-tertiary">
                L{r.line} — <span className="font-medium text-text-secondary">{r.identifier}</span> —{" "}
                <span className={r.status === "error" ? "text-status-critical-text" : ""}>{STATUS_LABEL[r.status]}</span>
                {r.detail ? ` (${r.detail})` : ""}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
