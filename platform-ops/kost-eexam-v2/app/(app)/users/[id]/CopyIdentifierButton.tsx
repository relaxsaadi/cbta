"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/** "Copier l'identifiant" (mission §19) — copie UNIQUEMENT l'identifiant de
 * connexion, jamais un mot de passe (aucun bouton "Copier le mot de passe"
 * n'existe nulle part dans cette base, par design). */
export function CopyIdentifierButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title="Copier l'identifiant"
      className="inline-flex items-center gap-1 rounded-md border border-border-default px-2 py-0.5 text-[11px] text-text-tertiary hover:border-border-strong hover:text-text-secondary"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copié" : "Copier l'identifiant"}
    </button>
  );
}
