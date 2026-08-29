"use client";

import { useActionState, useState } from "react";
import { hardDeleteUserAction, type HardDeleteResult } from "../actions";

/** "Supprimer définitivement" (mission §22 — sécurité STRICTE). Les
 * raisons de blocage sont affichées AVANT même de proposer la confirmation
 * — un admin ne doit jamais découvrir le blocage seulement après avoir tapé
 * "SUPPRIMER" (lib/users.ts::canHardDeleteUser revérifie de toute façon
 * côté serveur, cette liste est un confort UX, pas la seule garde). Pas de
 * navigation côté client ici — hardDeleteUserAction redirige elle-même
 * (redirect("/users")) une fois la suppression réussie : un retour côté
 * client (useEffect + state.success) perdrait systématiquement la course
 * contre le rafraîchissement automatique de la route par Next.js après une
 * Server Action, qui découvre le compte disparu et rend 404 en premier
 * (bug réel trouvé en E2E, voir le commentaire dans actions.ts). */
export function HardDeleteForm({ userId, blockers }: { userId: number; blockers: string[] }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const action = hardDeleteUserAction.bind(null, userId);
  const [state, formAction, pending] = useActionState<HardDeleteResult, FormData>(action, {});

  if (blockers.length > 0) {
    return (
      <div className="rounded-md border border-border-subtle bg-surface-sunken/40 p-3 text-[12.5px]">
        <p className="mb-1.5 font-medium text-text-primary">Suppression définitive impossible</p>
        <p className="mb-1.5 text-status-critical-text">
          Cet utilisateur possède un historique d&apos;examen et ne peut pas être supprimé définitivement. Vous pouvez archiver son compte.
        </p>
        <ul className="list-inside list-disc text-text-tertiary">
          {blockers.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-md border border-status-critical-border bg-status-critical-bg px-2.5 py-1 text-[11.5px] font-medium text-status-critical-text">
        Supprimer définitivement
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border border-status-critical-border bg-status-critical-bg p-3 text-[12.5px]">
      <p className="font-medium text-status-critical-text">Suppression définitive — action irréversible</p>
      <p className="text-text-secondary">Ce compte n&apos;a aucun historique protégé. Tapez « SUPPRIMER » pour confirmer.</p>
      <input
        name="confirmText"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="SUPPRIMER"
        className="w-full max-w-[200px] rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]"
      />
      <div className="flex items-center gap-2">
        <button
          disabled={pending || confirmText !== "SUPPRIMER"}
          type="submit"
          className="rounded-md bg-status-critical-text px-2.5 py-1 text-[12px] font-medium text-white disabled:opacity-50"
        >
          {pending ? "Suppression…" : "Confirmer la suppression définitive"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[12px] text-text-tertiary hover:text-text-secondary">Annuler</button>
      </div>
      {state.error && <p className="text-status-critical-text">{state.error}</p>}
    </form>
  );
}
