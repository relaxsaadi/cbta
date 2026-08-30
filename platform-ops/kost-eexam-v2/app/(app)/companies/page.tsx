import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listCompanies, listCompaniesForManager, companyGroupCount } from "@/lib/companies";
import { listUsers } from "@/lib/user-directory";
import { scopedUserIdsForSessionsOrNull } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge, type BadgeStatus } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SCOPE_LABELS, SCOPE_BADGE } from "@/lib/scope";
import { Building2, User } from "lucide-react";
import { CreateClientPicker } from "./CreateClientPicker";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §1-4 —
// "Clients" devient un annuaire UNIFIÉ Entreprise + Particulier. Un
// Particulier n'a jamais de ligne `companies` montrée comme telle ("Do NOT
// represent a particulier as a fake company") : son entreprise/groupe
// "plomberie" (provisionParticulierAccess, lib/user-affiliation.ts,
// companies.client_type='particulier') reste strictement interne — la
// ligne "client" d'un Particulier ici provient directement de sa fiche
// `users` réelle (nom, email, téléphone déjà sur son propre compte),
// jamais dupliquée sur une entreprise fictive.
export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { type, q } = await searchParams;
  const canWrite = session.role !== "auditor";
  const isManager = session.role === "pedagogical_manager";

  // Frontière multi-client (lib/tenant-scope.ts) : un responsable
  // pédagogique ne voit que les clients qu'il gère, jamais la liste
  // globale — administrateur et auditeur gardent la vue complète.
  // includeParticulierPlumbing reste à false partout ici (défaut) : les
  // entreprises "plomberie" ne sont jamais listées comme un vrai client.
  const showEntreprises = !type || type === "entreprises";
  const showParticuliers = !type || type === "particuliers";

  const companiesRaw = isManager ? listCompaniesForManager(session.userId) : listCompanies();
  const companies = q ? companiesRaw.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) : companiesRaw;

  const userIdsOrNull = isManager ? scopedUserIdsForSessionsOrNull(session) : null;
  const particuliers = showParticuliers
    ? listUsers({ role: "candidate", candidateType: "particulier", userIdsOrNull, search: q || undefined })
    : [];

  const totalCount = (showEntreprises ? companies.length : 0) + particuliers.length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Clients</h1>

      {canWrite && (
        <Card>
          <CardHeader title="Nouveau client" description="Entreprise (organisation cliente) ou Particulier (candidat individuel, sans entreprise rattachée)." />
          <CreateClientPicker />
        </Card>
      )}

      <Card>
        <form method="get" className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="q" className="mb-1 block text-[12px] font-medium text-text-secondary">Recherche</label>
            <input id="q" name="q" defaultValue={q ?? ""} placeholder="Nom, email, identifiant…" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="type" className="mb-1 block text-[12px] font-medium text-text-secondary">Type</label>
            <select id="type" name="type" defaultValue={type ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="entreprises">Entreprises</option>
              <option value="particuliers">Particuliers</option>
            </select>
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" className="rounded-md bg-accent-9 px-3.5 py-1.5 text-[13px] font-medium text-white hover:opacity-90">
              Filtrer
            </button>
            {(type || q) && (
              <Link href="/companies" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser les filtres</Link>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title={`${totalCount} client(s)`} />
        {totalCount === 0 ? (
          <EmptyState icon={Building2} title="Aucun client" description="Aucun client ne correspond à ces filtres." />
        ) : (
          <div className="flex flex-col gap-2">
            {showEntreprises &&
              companies.map((c) => (
                <Link
                  key={`c-${c.id}`}
                  href={`/companies/${c.id}`}
                  className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 size={15} className="shrink-0 text-text-tertiary" />
                    <div>
                      <p className="text-[13.5px] font-medium text-text-primary">{c.name}</p>
                      <p className="text-[12px] text-text-tertiary">Entreprise — {companyGroupCount(c.id)} groupe(s)</p>
                    </div>
                  </div>
                  <StatusBadge status={SCOPE_BADGE[c.scope]}>{SCOPE_LABELS[c.scope]}</StatusBadge>
                </Link>
              ))}
            {particuliers.map((p) => (
              <Link
                key={`p-${p.id}`}
                href={`/users/${p.id}`}
                className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User size={15} className="shrink-0 text-text-tertiary" />
                  <div>
                    <p className="text-[13.5px] font-medium text-text-primary">{p.full_name}</p>
                    <p className="text-[12px] text-text-tertiary">Particulier{p.email ? ` — ${p.email}` : ""}</p>
                  </div>
                </div>
                <StatusBadge status={PARTICULIER_STATUS_BADGE[p.status] ?? "neutral"}>{PARTICULIER_STATUS_LABELS[p.status] ?? p.status}</StatusBadge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

const PARTICULIER_STATUS_BADGE: Record<string, BadgeStatus> = {
  active: "verified",
  pending_activation: "warning",
  suspended: "critical",
  archived: "neutral",
};
const PARTICULIER_STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  pending_activation: "En attente d'activation",
  suspended: "Suspendu",
  archived: "Archivé",
};
