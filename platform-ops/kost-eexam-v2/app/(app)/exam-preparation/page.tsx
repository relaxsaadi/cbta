import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listFunctions } from "@/lib/functions";
import { listGroups, listGroupsForManager } from "@/lib/groups";
import { listCompanies, listCompaniesForManager } from "@/lib/companies";
import { listAssessmentsWithFilters, getAssignmentStatsByAssessment, type ExamManagementFilters } from "@/lib/assessments";
import { functionLabel } from "@/lib/questions";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookOpenCheck, Eye, ListChecks, ClipboardCheck } from "lucide-react";
import { CreateAssessmentForm } from "./CreateAssessmentForm";

const STATUS_BADGE: Record<string, "verified" | "warning" | "critical" | "neutral"> = {
  draft: "neutral",
  published: "verified",
  open: "verified",
  closed: "neutral",
  suspended: "critical",
  archived: "neutral",
};

interface ExamManagementSearchParams {
  groupId?: string;
  companyId?: string;
  functionCode?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
}

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §27-29 —
// aperçu opérationnel réel : jusqu'ici 5 champs par ligne (nom/type/
// fonction/client-groupe/statut), aucun filtre, aucune action rapide par
// ligne (toute la carte était un seul lien de navigation vers le détail).
export default async function ExamPreparationPage({ searchParams }: { searchParams: Promise<ExamManagementSearchParams> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const sp = await searchParams;
  const functions = listFunctions();
  // Frontière multi-client (lib/tenant-scope.ts) : la liste d'évaluations
  // ET les sélecteurs de filtre/formulaire de création sont tous restreints
  // — un responsable ne doit jamais pouvoir choisir/filtrer sur le
  // périmètre d'un autre client, même s'il n'en voit qu'un identifiant.
  const isManager = session.role === "pedagogical_manager";
  const rawGroups = isManager ? listGroupsForManager(session.userId) : listGroups();
  const groups = rawGroups.map((g) => ({ id: g.id, name: g.name, company_name: g.company_name }));
  const companies = isManager ? listCompaniesForManager(session.userId) : listCompanies();
  const canWrite = session.role !== "auditor";

  const filters: ExamManagementFilters = {
    companyId: sp.companyId ? Number(sp.companyId) : undefined,
    groupId: sp.groupId ? Number(sp.groupId) : undefined,
    functionCode: sp.functionCode || undefined,
    status: sp.status || undefined,
    type: (sp.type as ExamManagementFilters["type"]) || undefined,
    dateFrom: sp.dateFrom || undefined,
    dateTo: sp.dateTo || undefined,
    search: sp.q || undefined,
  };
  const assessments = listAssessmentsWithFilters(filters, isManager ? session.userId : undefined);
  const stats = getAssignmentStatsByAssessment();

  const anyFilterActive = Boolean(sp.companyId || sp.groupId || sp.functionCode || sp.status || sp.type || sp.dateFrom || sp.dateTo || sp.q);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Préparation des examens</h1>

      {canWrite && (
        <Card>
          <CardHeader title="Créer une évaluation" description="Exercice / Test / Examen — 12 étapes, tout est modifiable jusqu'à la publication" />
          <CreateAssessmentForm functions={functions} groups={groups} defaultGroupId={sp.groupId ? Number(sp.groupId) : undefined} />
        </Card>
      )}

      {/* Mission §28 — filtres réels, changent effectivement la requête
          serveur (jamais un affichage cosmétique). */}
      <Card>
        <form method="get" className="grid gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="q" className="mb-1 block text-[12px] font-medium text-text-secondary">Recherche</label>
            <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Nom de l'examen…" className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="companyId" className="mb-1 block text-[12px] font-medium text-text-secondary">Client</label>
            <select id="companyId" name="companyId" defaultValue={sp.companyId ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="groupId" className="mb-1 block text-[12px] font-medium text-text-secondary">Groupe</label>
            <select id="groupId" name="groupId" defaultValue={sp.groupId ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {groups.map((g) => (<option key={g.id} value={g.id}>{g.company_name} — {g.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="functionCode" className="mb-1 block text-[12px] font-medium text-text-secondary">Fonction DGR</label>
            <select id="functionCode" name="functionCode" defaultValue={sp.functionCode ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Toutes</option>
              {functions.map((f) => (<option key={f.code} value={f.code}>{f.code}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-[12px] font-medium text-text-secondary">Statut</label>
            <select id="status" name="status" defaultValue={sp.status ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="open">Ouvert</option>
              <option value="closed">Clôturé</option>
              <option value="suspended">Suspendu</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
          <div>
            <label htmlFor="type" className="mb-1 block text-[12px] font-medium text-text-secondary">Type</label>
            <select id="type" name="type" defaultValue={sp.type ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="exercice">Exercice</option>
              <option value="test">Test</option>
              <option value="examen">Examen</option>
            </select>
          </div>
          <div>
            <label htmlFor="dateFrom" className="mb-1 block text-[12px] font-medium text-text-secondary">Créé du</label>
            <input type="date" id="dateFrom" name="dateFrom" defaultValue={sp.dateFrom ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="dateTo" className="mb-1 block text-[12px] font-medium text-text-secondary">Au</label>
            <input type="date" id="dateTo" name="dateTo" defaultValue={sp.dateTo ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" className="rounded-md bg-brand-accent px-3.5 py-1.5 text-[13px] font-medium text-white hover:opacity-90">
              Filtrer
            </button>
            {anyFilterActive && (
              <Link href="/exam-preparation" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser les filtres</Link>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title={`${assessments.length} évaluation(s)`} />
        {assessments.length === 0 ? (
          <EmptyState icon={BookOpenCheck} title="Aucune évaluation" description="Aucune évaluation ne correspond à ces filtres." />
        ) : (
          <div className="flex flex-col gap-2">
            {assessments.map((a) => {
              const s = stats.get(a.id);
              return (
                <div key={a.id} className="rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/exam-preparation/${a.id}`} className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-text-primary hover:underline">{a.name}</p>
                      <p className="text-[12px] text-text-tertiary capitalize">
                        {a.type} — {functionLabel(a.function_code)} — {a.company_name} / {a.group_name}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-text-tertiary">
                        {a.duration_minutes} min — {a.question_count} question(s)
                        {(a.open_at || a.close_at) && (
                          <>
                            {" — "}
                            {a.open_at ? new Date(a.open_at).toLocaleDateString("fr-FR") : "dès maintenant"}
                            {" → "}
                            {a.close_at ? new Date(a.close_at).toLocaleDateString("fr-FR") : "sans limite"}
                          </>
                        )}
                      </p>
                    </Link>
                    <StatusBadge status={STATUS_BADGE[a.status] ?? "neutral"}>{a.status}</StatusBadge>
                  </div>

                  {/* §27 — répartition opérationnelle par examen, jamais une
                      2e requête par ligne (getAssignmentStatsByAssessment
                      calculée UNE fois pour toute la page). */}
                  {s && s.assigned > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-text-tertiary">
                      <span>{s.assigned} affecté(s)</span>
                      <span>{s.notStarted} non commencé(s)</span>
                      <span>{s.inProgress} en cours</span>
                      <span>{s.submittedTotal} soumis(e)</span>
                      {s.awaitingCorrection > 0 && <span className="font-medium text-status-warning-text">{s.awaitingCorrection} en attente de correction</span>}
                      <span>{s.resultsAvailable} résultat(s) disponible(s)</span>
                    </div>
                  )}

                  {/* §29 — actions rapides de navigation (les mutations
                      elles-mêmes — Affecter/Reprogrammer/Publier/
                      Suspendre — restent sur la fiche détail, formulaires
                      déjà existants et testés, jamais dupliqués ici). */}
                  {a.status !== "draft" && (
                    <div className="mt-2 flex flex-wrap gap-3 border-t border-border-subtle pt-2">
                      <Link href={`/apercu-candidat/${a.id}`} className="flex items-center gap-1 text-[11.5px] font-medium text-text-tertiary hover:text-accent-9">
                        <Eye size={12} /> Prévisualiser comme candidat
                      </Link>
                      <Link href={`/results?assessmentId=${a.id}`} className="flex items-center gap-1 text-[11.5px] font-medium text-text-tertiary hover:text-accent-9">
                        <ListChecks size={12} /> Voir les résultats
                      </Link>
                      {(s?.awaitingCorrection ?? 0) > 0 && (
                        <Link href={`/grading?assessmentId=${a.id}`} className="flex items-center gap-1 text-[11.5px] font-medium text-status-warning-text hover:underline">
                          <ClipboardCheck size={12} /> Voir les corrections ({s!.awaitingCorrection})
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
