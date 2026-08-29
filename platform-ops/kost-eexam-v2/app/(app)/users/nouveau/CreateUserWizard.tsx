"use client";

import { useActionState, useMemo, useState } from "react";
import { createUserAction, type CreateUserResult } from "../actions";
import { QuickCreateCompany, QuickCreateGroup } from "./QuickCreate";
// Import TYPE-ONLY de lib/session.ts (jamais la valeur ROLE_LABELS) — ce
// module porte `import "server-only"` + `next/headers` et NE PEUT PAS être
// bundlé côté client (bug réel trouvé au build : "'server-only' cannot be
// imported from a Client Component module"). ROLE_LABELS est redéfini
// localement ci-dessous, jamais réimporté depuis lib/session.ts ici.
import type { ConsoleRole } from "@/lib/session";

const ROLE_LABELS: Record<ConsoleRole, string> = {
  candidate: "Candidat",
  pedagogical_manager: "Responsable pédagogique",
  administrator: "Administrateur",
  auditor: "Auditeur",
};

interface CompanyOption {
  id: number;
  name: string;
}
interface GroupOption {
  id: number;
  company_id: number;
  name: string;
  session_label: string | null;
}
interface FunctionOption {
  code: string;
  label: string;
}

const ROLES: ConsoleRole[] = ["candidate", "pedagogical_manager", "administrator", "auditor"];

/** Assistant de création à formulaire UNIQUE avec sections conditionnelles
 * (mission "COMPLETE USER MANAGEMENT" §12-17) — simplification d'ingénierie
 * assumée : plutôt qu'une navigation multi-écran réelle côté client (4
 * routes/étapes distinctes avec état partagé complexe entre elles), un seul
 * formulaire dont les sections IDENTITÉ / AFFECTATION / ACCÈS / résumé de
 * CONFIRMATION s'affichent/se masquent selon les choix déjà faits — même
 * résultat fonctionnel (4 groupes de champs logiques, résumé avant
 * validation, jamais de mot de passe demandé), sans la complexité d'état
 * inter-étapes. Documenté honnêtement, pas caché. */
export function CreateUserWizard({
  companies,
  groups,
  functions,
  preselectedCompanyId,
  preselectedGroupId,
}: {
  companies: CompanyOption[];
  groups: GroupOption[];
  functions: FunctionOption[];
  preselectedCompanyId?: number;
  preselectedGroupId?: number;
}) {
  const [state, formAction, pending] = useActionState<CreateUserResult, FormData>(createUserAction, {});

  const [role, setRole] = useState<ConsoleRole>("candidate");
  const [candidateType, setCandidateType] = useState<"particulier" | "entreprise">(preselectedCompanyId ? "entreprise" : "particulier");
  const [companyId, setCompanyId] = useState<string>(preselectedCompanyId ? String(preselectedCompanyId) : "");
  const [groupId, setGroupId] = useState<string>(preselectedGroupId ? String(preselectedGroupId) : "");
  const [fullName, setFullName] = useState("");
  const [showQuickCompany, setShowQuickCompany] = useState(false);
  const [showQuickGroup, setShowQuickGroup] = useState(false);

  const groupsForCompany = useMemo(() => groups.filter((g) => String(g.company_id) === companyId), [groups, companyId]);
  const isCandidate = role === "candidate";
  const isEntreprise = isCandidate && candidateType === "entreprise";
  const selectedCompany = companies.find((c) => String(c.id) === companyId);
  const selectedGroup = groups.find((g) => String(g.id) === groupId);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* IDENTITÉ */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-display text-[13px] font-semibold text-text-primary">IDENTITÉ</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-[12px] font-medium text-text-secondary">Nom complet</label>
            <input id="fullName" name="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="username" className="mb-1 block text-[12px] font-medium text-text-secondary">Identifiant de connexion</label>
            <input id="username" name="username" required className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-[12px] font-medium text-text-secondary">Email</label>
            <input id="email" name="email" type="email" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-[12px] font-medium text-text-secondary">Téléphone (optionnel)</label>
            <input id="phone" name="phone" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="role" className="mb-1 block text-[12px] font-medium text-text-secondary">Rôle</label>
            <select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value as ConsoleRole)} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* AFFECTATION — uniquement pour un candidat */}
      {isCandidate && (
        <fieldset className="flex flex-col gap-3 border-t border-border-subtle pt-4">
          <legend className="mb-1 font-display text-[13px] font-semibold text-text-primary">AFFECTATION</legend>
          <div className="flex gap-4 text-[13px]">
            <label className="flex items-center gap-1.5">
              <input type="radio" name="candidateType" value="particulier" checked={candidateType === "particulier"} onChange={() => setCandidateType("particulier")} />
              A. Particulier — pas d&apos;entreprise rattachée
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" name="candidateType" value="entreprise" checked={candidateType === "entreprise"} onChange={() => setCandidateType("entreprise")} />
              B. Entreprise — rattaché à une organisation cliente
            </label>
          </div>

          {isEntreprise && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="companyId" className="mb-1 block text-[12px] font-medium text-text-secondary">Client / Entreprise</label>
                <div className="flex gap-1.5">
                  <select
                    id="companyId"
                    name="companyId"
                    value={companyId}
                    onChange={(e) => {
                      setCompanyId(e.target.value);
                      setGroupId("");
                    }}
                    className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]"
                  >
                    <option value="">Choisir…</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowQuickCompany((v) => !v)} className="whitespace-nowrap rounded-md border border-border-default px-2.5 py-1.5 text-[12px] text-text-secondary hover:border-border-strong">
                    + Nouveau
                  </button>
                </div>
                {showQuickCompany && <QuickCreateCompany onCancel={() => setShowQuickCompany(false)} />}
              </div>
              <div>
                <label htmlFor="groupId" className="mb-1 block text-[12px] font-medium text-text-secondary">Groupe / Session</label>
                <div className="flex gap-1.5">
                  <select
                    id="groupId"
                    name="groupId"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    disabled={!companyId}
                    className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px] disabled:opacity-50"
                  >
                    <option value="">Choisir…</option>
                    {groupsForCompany.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}{g.session_label ? ` (${g.session_label})` : ""}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!companyId}
                    onClick={() => setShowQuickGroup((v) => !v)}
                    className="whitespace-nowrap rounded-md border border-border-default px-2.5 py-1.5 text-[12px] text-text-secondary hover:border-border-strong disabled:opacity-50"
                  >
                    + Nouveau
                  </button>
                </div>
                {showQuickGroup && companyId && <QuickCreateGroup companyId={Number(companyId)} onCancel={() => setShowQuickGroup(false)} />}
              </div>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-[12px] font-medium text-text-secondary">Fonction(s) DGR (optionnel — peut être affecté plus tard)</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px]">
              {functions.map((f) => (
                <label key={f.code} className="flex items-center gap-1.5">
                  <input type="checkbox" name="functionCodes" value={f.code} />
                  {f.code}
                </label>
              ))}
            </div>
          </div>
        </fieldset>
      )}

      {/* ACCÈS */}
      <fieldset className="flex flex-col gap-2 border-t border-border-subtle pt-4">
        <legend className="mb-1 font-display text-[13px] font-semibold text-text-primary">ACCÈS</legend>
        <p className="text-[12.5px] text-text-tertiary">
          Méthode d&apos;activation : lien d&apos;invitation sécurisé par email — jamais un mot de passe saisi ici. Le titulaire choisit
          lui-même son mot de passe en cliquant sur le lien reçu.
        </p>
      </fieldset>

      {/* CONFIRMATION */}
      <div className="rounded-md border border-border-subtle bg-surface-sunken/40 p-3 text-[12.5px] text-text-secondary">
        <p className="mb-1 font-medium text-text-primary">Résumé</p>
        <p>{fullName || "(nom à saisir)"} — {ROLE_LABELS[role]}{isCandidate && ` — ${candidateType === "particulier" ? "Particulier" : "Entreprise"}`}</p>
        {isEntreprise && selectedCompany && <p>{selectedCompany.name}{selectedGroup ? ` — ${selectedGroup.name}` : " — (groupe non sélectionné)"}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="submit" name="sendInvitation" value="true" disabled={pending} className="rounded-md bg-accent-9 px-4 py-2 text-[13px] font-medium text-white hover:bg-accent-10 disabled:opacity-60">
          {pending ? "Création…" : "Créer et envoyer l'invitation"}
        </button>
        <button type="submit" name="sendInvitation" value="false" disabled={pending} className="rounded-md border border-border-default px-4 py-2 text-[13px] font-medium text-text-secondary hover:border-border-strong disabled:opacity-60">
          Créer sans envoyer maintenant
        </button>
      </div>
      {state.error && <p className="text-[12.5px] text-status-critical-text">{state.error}</p>}
      {state.success && <p className="text-[12.5px] text-status-verified-text">{state.success}</p>}
    </form>
  );
}
