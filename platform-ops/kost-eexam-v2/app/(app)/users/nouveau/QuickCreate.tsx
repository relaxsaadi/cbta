"use client";

import { useActionState } from "react";
import { createPortal } from "react-dom";
import { quickCreateCompanyAction, quickCreateGroupAction } from "../actions";

// Portail DOM (mission "COMPLETE USER MANAGEMENT" §16-17) — bug réel
// trouvé en E2E : ces mini-formulaires "+ Nouveau client"/"+ Nouveau
// groupe" s'affichent À L'INTÉRIEUR du grand <form> de l'assistant
// (CreateUserWizard.tsx). Un <form> imbriqué dans un autre <form> est du
// HTML invalide — le navigateur associe alors le clic sur "Créer le
// client"/"Créer le groupe" au mauvais formulaire (souvent le formulaire
// EXTÉRIEUR), et le clic ne déclenche jamais réellement
// quickCreateCompanyAction/quickCreateGroupAction (observé en E2E : la
// redirection attendue n'arrivait jamais). createPortal() rend ces deux
// mini-formulaires comme de VRAIS enfants directs de document.body — plus
// aucune imbrication dans le DOM réel, quel que soit l'endroit visuel où
// ils apparaissent.

function Overlay({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-24">
      <div className="w-full max-w-sm rounded-md border border-border-default bg-surface-raised p-3 shadow-lg">{children}</div>
    </div>,
    document.body
  );
}

/** "+ Nouveau client" (§16) — mini-formulaire en surimpression (portail),
 * sans quitter l'assistant. Succès = redirection serveur vers
 * /users/nouveau?companyId=X (voir quickCreateCompanyAction) — le
 * composant ne gère donc que le cas d'erreur (nom vide) ; le cas succès ne
 * re-render jamais ce composant (la page entière se recharge). */
export function QuickCreateCompany({ onCancel }: { onCancel?: () => void }) {
  const [state, formAction, pending] = useActionState<{ error?: string }, FormData>(quickCreateCompanyAction, {});
  return (
    <Overlay>
      <form action={formAction} className="flex flex-col gap-1.5">
        <p className="mb-1 text-[12.5px] font-medium text-text-primary">Nouveau client</p>
        <input name="name" required autoFocus placeholder="Nom du client" className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
        <input type="hidden" name="scope" value="production" />
        <div className="flex items-center gap-2">
          <button type="submit" disabled={pending} className="rounded-md bg-accent-9 px-2.5 py-1 text-[11.5px] font-medium text-white disabled:opacity-60">
            {pending ? "Création…" : "Créer le client"}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-[11.5px] text-text-tertiary hover:text-text-secondary">
              Annuler
            </button>
          )}
        </div>
        {state.error && <p className="text-[11px] text-status-critical-text">{state.error}</p>}
      </form>
    </Overlay>
  );
}

/** "+ Nouveau groupe" (§17) — même principe, rattaché au client déjà
 * choisi dans l'assistant. */
export function QuickCreateGroup({ companyId, onCancel }: { companyId: number; onCancel?: () => void }) {
  const [state, formAction, pending] = useActionState<{ error?: string }, FormData>(quickCreateGroupAction, {});
  return (
    <Overlay>
      <form action={formAction} className="flex flex-col gap-1.5">
        <p className="mb-1 text-[12.5px] font-medium text-text-primary">Nouveau groupe</p>
        <input type="hidden" name="companyId" value={companyId} />
        <input name="name" required autoFocus placeholder="Nom du groupe" className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
        <input name="sessionLabel" placeholder="Session (optionnel, ex. Septembre 2026)" className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
        <div className="flex items-center gap-2">
          <button type="submit" disabled={pending} className="rounded-md bg-accent-9 px-2.5 py-1 text-[11.5px] font-medium text-white disabled:opacity-60">
            {pending ? "Création…" : "Créer le groupe"}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-[11.5px] text-text-tertiary hover:text-text-secondary">
              Annuler
            </button>
          )}
        </div>
        {state.error && <p className="text-[11px] text-status-critical-text">{state.error}</p>}
      </form>
    </Overlay>
  );
}
