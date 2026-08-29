"use client";

import { useActionState, useState } from "react";
import { sendMessageAction, type SendMessageResult } from "../actions";

const MESSAGE_TYPES = [
  { value: "information", label: "Information" },
  { value: "session", label: "Session / formation" },
  { value: "examen", label: "Examen" },
  { value: "document", label: "Document / rapport" },
  { value: "support", label: "Support" },
  { value: "autre", label: "Autre" },
];

/** "Envoyer un message" (mission §36-40) — le destinataire n'est JAMAIS un
 * champ de ce formulaire (affiché en lecture seule uniquement) : résolu
 * côté serveur depuis le dossier du compte cible (voir
 * app/(app)/users/actions.ts::sendMessageAction), empêchant structurellement
 * toute injection d'un destinataire arbitraire. Réutilise l'outbox existant
 * — jamais une seconde architecture d'email. */
export function SendMessageForm({ userId, disabled }: { userId: number; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [subject, setSubject] = useState("");
  const [messageType, setMessageType] = useState("information");
  const [bodyText, setBodyText] = useState("");
  const action = sendMessageAction.bind(null, userId);
  const [state, formAction, pending] = useActionState<SendMessageResult, FormData>(action, {});

  if (disabled) {
    return <p className="text-[12.5px] text-text-tertiary">Ce compte n&apos;a pas d&apos;email au dossier — impossible d&apos;envoyer un message.</p>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start rounded-md border border-border-default px-2.5 py-1 text-[12px] font-medium text-text-secondary hover:border-border-strong">
        Envoyer un message
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border border-border-default bg-surface-sunken/40 p-3 text-[12.5px]">
      <p className="font-medium text-text-primary">Envoyer un message</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Type de message</label>
          <select name="messageType" value={messageType} onChange={(e) => setMessageType(e.target.value)} className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]">
            {MESSAGE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Objet</label>
          <input name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-text-secondary">Message</label>
        <textarea name="bodyText" value={bodyText} onChange={(e) => setBodyText(e.target.value)} required rows={4} className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input name="ctaLabel" placeholder="Libellé bouton (optionnel)" className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
        <input name="ctaUrl" placeholder="Lien (optionnel)" className="w-full rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[12.5px]" />
      </div>

      <button type="button" onClick={() => setPreview((v) => !v)} className="self-start text-[11.5px] text-text-tertiary underline hover:text-text-secondary">
        {preview ? "Masquer l'aperçu" : "Aperçu"}
      </button>
      {preview && (
        <div className="rounded-md border border-border-subtle bg-surface-base p-2.5 text-[12px] text-text-secondary">
          <p className="font-medium text-text-primary">{subject || "(objet)"}</p>
          <p className="mb-1 text-[11px] text-text-tertiary">{MESSAGE_TYPES.find((t) => t.value === messageType)?.label}</p>
          <p className="whitespace-pre-wrap">{bodyText || "(message)"}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button disabled={pending} type="submit" className="rounded-md bg-accent-9 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Envoi…" : "Envoyer"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[12px] text-text-tertiary hover:text-text-secondary">Annuler</button>
      </div>
      {state.error && <p className="text-status-critical-text">{state.error}</p>}
      {state.success && <p className="text-status-verified-text">{state.success}</p>}
    </form>
  );
}
