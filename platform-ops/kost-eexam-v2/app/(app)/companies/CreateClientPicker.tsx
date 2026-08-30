"use client";

import { useState } from "react";
import Link from "next/link";
import { CreateCompanyForm } from "./CreateCompanyForm";

/** "+ Nouveau client" (mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS",
 * 2026-08-30, §1) — Entreprise garde le formulaire inline existant
 * (CreateCompanyForm, inchangé). Particulier réutilise l'assistant de
 * création de compte déjà existant (/users/nouveau, mission "COMPLETE USER
 * MANAGEMENT") plutôt que de dupliquer une seconde logique de création —
 * son état par défaut est DÉJÀ "Particulier — pas d'entreprise rattachée"
 * quand aucune entreprise n'est présélectionnée (voir CreateUserWizard.tsx),
 * donc un simple lien suffit, jamais un second formulaire à maintenir. */
export function CreateClientPicker() {
  const [clientType, setClientType] = useState<"entreprise" | "particulier">("entreprise");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2" role="radiogroup" aria-label="Type de client">
        <button
          type="button"
          onClick={() => setClientType("entreprise")}
          aria-pressed={clientType === "entreprise"}
          className={`rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
            clientType === "entreprise" ? "border-accent-9 bg-accent-9 text-white" : "border-border-default text-text-secondary hover:border-border-strong"
          }`}
        >
          Entreprise
        </button>
        <button
          type="button"
          onClick={() => setClientType("particulier")}
          aria-pressed={clientType === "particulier"}
          className={`rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
            clientType === "particulier" ? "border-accent-9 bg-accent-9 text-white" : "border-border-default text-text-secondary hover:border-border-strong"
          }`}
        >
          Particulier
        </button>
      </div>

      {clientType === "entreprise" ? (
        <CreateCompanyForm canWrite={true} />
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-[12.5px] text-text-secondary">
            Un client Particulier est un candidat individuel — sans entreprise rattachée. Il est créé via l&apos;assistant de compte habituel (identité, accès, aucun mot de passe saisi ici).
          </p>
          <Link
            href="/users/nouveau"
            className="self-start rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10"
          >
            Créer un compte Particulier
          </Link>
        </div>
      )}
    </div>
  );
}
