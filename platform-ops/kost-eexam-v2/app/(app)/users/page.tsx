import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listUsers } from "@/lib/user-directory";
import { listCompanies } from "@/lib/companies";
import { listGroups } from "@/lib/groups";
import { listFunctions } from "@/lib/functions";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge, type BadgeStatus } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users as UsersIcon } from "lucide-react";
import { ROLE_LABELS, type ConsoleRole } from "@/lib/session";
import type { UserStatus, CandidateType } from "@/lib/users";
import { BatchActionsBar } from "./BatchActionsBar";

const ROLES: ConsoleRole[] = ["administrator", "pedagogical_manager", "auditor", "candidate"];

// Mission "COMPLETE USER MANAGEMENT" (2026-08-29, §7) — 4 états clairement
// distincts, jamais "tout ce qui n'est pas actif" fourré dans "Suspendu"
// (bug historique corrigé par la mission "FIX ACCOUNT LIFECYCLE GUARDS").
const STATUS_BADGE: Record<UserStatus, BadgeStatus> = {
  active: "verified",
  pending_activation: "warning",
  suspended: "critical",
  archived: "neutral",
};
const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Actif",
  pending_activation: "En attente d'activation",
  suspended: "Suspendu",
  archived: "Archivé",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; status?: string; type?: string; companyId?: string; groupId?: string; functionCode?: string; q?: string }>;
}) {
  // Politique produit délibérée, pas un oubli — ADMIN ONLY, confirmée par
  // deux audits transversaux (2026-08-30). Voir la justification complète
  // (ce que le responsable pédagogique gère déjà dans son propre périmètre
  // vs. ce qui reste administrateur) sur lib/tenant-scope.ts::hasUserAccess().
  await guardPage("administrator");
  const { role, status, type, companyId, groupId, functionCode, q } = await searchParams;

  const users = listUsers({
    userIdsOrNull: null, // administrator — aucune restriction (voir lib/tenant-scope.ts)
    role: (role as ConsoleRole) || undefined,
    status: status === "all" ? "all" : ((status as UserStatus) || undefined),
    candidateType: (type as CandidateType) || undefined,
    companyId: companyId ? Number(companyId) : undefined,
    groupId: groupId ? Number(groupId) : undefined,
    functionCode: functionCode || undefined,
    search: q || undefined,
  });

  const companies = listCompanies();
  const groups = listGroups();
  const functions = listFunctions();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Utilisateurs</h1>
        <Link href="/users/nouveau" className="rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10">
          + Nouveau candidat
        </Link>
      </div>

      <Card>
        <form method="get" className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
          <div className="lg:col-span-2">
            <label htmlFor="q" className="mb-1 block text-[12px] font-medium text-text-secondary">Recherche</label>
            <input id="q" name="q" defaultValue={q ?? ""} placeholder="Nom, identifiant, email…" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="type" className="mb-1 block text-[12px] font-medium text-text-secondary">Type</label>
            <select id="type" name="type" defaultValue={type ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="particulier">Particulier</option>
              <option value="entreprise">Entreprise</option>
            </select>
          </div>
          <div>
            <label htmlFor="companyId" className="mb-1 block text-[12px] font-medium text-text-secondary">Client</label>
            <select id="companyId" name="companyId" defaultValue={companyId ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="groupId" className="mb-1 block text-[12px] font-medium text-text-secondary">Groupe</label>
            <select id="groupId" name="groupId" defaultValue={groupId ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.company_name} — {g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="functionCode" className="mb-1 block text-[12px] font-medium text-text-secondary">Fonction DGR</label>
            <select id="functionCode" name="functionCode" defaultValue={functionCode ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Toutes</option>
              {functions.map((f) => (
                <option key={f.code} value={f.code}>{f.code}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-[12px] font-medium text-text-secondary">Statut</label>
            <select id="status" name="status" defaultValue={status ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Actifs + en attente + suspendus</option>
              <option value="active">Actifs</option>
              <option value="pending_activation">En attente d&apos;activation</option>
              <option value="suspended">Suspendus</option>
              <option value="archived">Archivés</option>
              <option value="all">Tous</option>
            </select>
          </div>
          <div>
            <label htmlFor="role" className="mb-1 block text-[12px] font-medium text-text-secondary">Rôle</label>
            <select id="role" name="role" defaultValue={role ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-3 lg:col-span-7">
            <button type="submit" className="rounded-md bg-brand-accent px-3.5 py-1.5 text-[13px] font-medium text-white hover:opacity-90">
              Filtrer
            </button>
            {/* Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30)
                §11 — absent jusqu'ici (même convention que /results),
                affiché seulement quand un filtre est réellement actif. */}
            {(role || status || type || companyId || groupId || functionCode || q) && (
              <Link href="/users" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser les filtres</Link>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title={`${users.length} compte(s)`} />
        {users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="Aucun compte" description="Aucun compte ne correspond à ces filtres." />
        ) : (
          <>
            <BatchActionsBar users={users.map((u) => ({ id: u.id, fullName: u.full_name }))} groups={groups} functions={functions} />
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-text-tertiary">
                    <th className="pb-2 pr-3 font-medium"><span className="sr-only">Sélection</span></th>
                    <th className="pb-2 pr-3 font-medium">Nom</th>
                    <th className="pb-2 pr-3 font-medium">Identifiant</th>
                    <th className="pb-2 pr-3 font-medium">Type</th>
                    <th className="pb-2 pr-3 font-medium">Entreprise</th>
                    <th className="pb-2 pr-3 font-medium">Rôle</th>
                    <th className="pb-2 pr-3 font-medium">Statut</th>
                    <th className="pb-2 font-medium">MFA</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} data-testid={`user-row-${u.username}`} className="border-b border-border-subtle last:border-0">
                      <td className="py-2 pr-3">
                        <input type="checkbox" name="batch-user" value={u.id} className="batch-user-checkbox" aria-label={`Sélectionner ${u.full_name}`} />
                      </td>
                      <td className="py-2 pr-3">
                        <Link href={`/users/${u.id}`} className="font-medium text-text-primary hover:text-accent-9 hover:underline">
                          {u.full_name}
                        </Link>
                      </td>
                      <td className="py-2 pr-3 font-mono text-[11.5px] text-text-tertiary">{u.username}</td>
                      <td className="py-2 pr-3 text-text-secondary">
                        {u.candidate_type === "particulier" ? "Particulier" : u.candidate_type === "entreprise" ? "Entreprise" : "—"}
                      </td>
                      <td className="py-2 pr-3 text-text-secondary">{u.company_name ?? "Aucune"}</td>
                      <td className="py-2 pr-3 text-text-secondary">{(u.role_codes ?? "").split(",").filter(Boolean).map((r) => ROLE_LABELS[r as ConsoleRole] ?? r).join(", ") || "—"}</td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={STATUS_BADGE[u.status]}>{STATUS_LABELS[u.status]}</StatusBadge>
                      </td>
                      <td className="py-2">{u.mfa_enabled === 1 ? <StatusBadge status="verified">Actif</StatusBadge> : <span className="text-text-tertiary">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
