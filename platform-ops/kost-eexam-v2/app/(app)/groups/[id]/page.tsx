import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { getGroup, listGroupMembers } from "@/lib/groups";
import { removeUserFromGroupSafely } from "@/lib/user-affiliation";
import { listAssessments } from "@/lib/assessments";
import { hasGroupAccess, assertAccess } from "@/lib/tenant-scope";
import { audit } from "@/lib/audit";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { Users2, X } from "lucide-react";
import { AddCandidateForm } from "./AddCandidateForm";
import { EditCandidateForm } from "./EditCandidateForm";
import { BulkImportCandidatesForm } from "./BulkImportCandidatesForm";
import { revalidatePath } from "next/cache";

export default async function GroupDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string; blocked?: string }> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { id } = await params;
  const { q, blocked } = await searchParams;
  const group = getGroup(Number(id));
  // Voir lib/tenant-scope.ts : introuvable, pas "refusé", pour un groupe
  // hors périmètre.
  if (!group || !hasGroupAccess(session, group.id)) notFound();
  const canWrite = session.role !== "auditor";

  const allMembers = listGroupMembers(group.id);
  // Recherche/filtre côté serveur (mission "PRODUCTION READINESS" §3) —
  // cohérent avec le reste de l'app (server components, pas de JS client
  // pour un filtre simple sur un roster typiquement petit).
  const search = (q ?? "").trim().toLowerCase();
  const members = search ? allMembers.filter((m) => m.full_name.toLowerCase().includes(search) || m.username.toLowerCase().includes(search)) : allMembers;
  const assessments = listAssessments().filter((a) => a.group_id === group.id);

  async function removeCandidate(formData: FormData) {
    "use server";
    const s = await guardPage("pedagogical_manager", "administrator");
    assertAccess(hasGroupAccess(s, group!.id));
    const candidateUserId = Number(formData.get("candidateUserId"));
    // Audit "MISSION FINALE — TRANSVERSAL STAGING AUDIT" (2026-08-30) §18/
    // §4 — GAP réel (P1) trouvé : ce bouton appelait directement
    // removeCandidateFromGroup(), CONTOURNANT le garde-fou "historique
    // protégé" (hasProtectedGroupHistory / removeUserFromGroupSafely,
    // lib/user-affiliation.ts) que l'action équivalente côté fiche
    // "Utilisateur" applique déjà — un responsable pédagogique pouvait donc
    // retirer silencieusement du groupe un candidat ayant déjà un examen/
    // une présence de familiarisation sous ce groupe précis, ce qui n'était
    // jamais possible depuis /users. Corrigé en passant par le MÊME
    // gardien, avec le MÊME nom d'action audit pour rester cherchable
    // indépendamment de l'écran d'origine (voir app/(app)/users/actions.ts
    // ::removeFromGroupAction).
    const result = removeUserFromGroupSafely(candidateUserId, group!.id);
    if (!result.removed) {
      audit({ actorUserId: s.userId, actorRole: s.role, action: "user_group_removal_blocked", targetType: "user", targetId: candidateUserId, result: "failure", metadata: { groupId: group!.id, reason: result.blockedReason } });
      redirect(`/groups/${group!.id}?blocked=${encodeURIComponent(result.blockedReason ?? "Retrait impossible.")}`);
    }
    audit({ actorUserId: s.userId, actorRole: s.role, action: "user_group_removed", targetType: "user", targetId: candidateUserId, metadata: { groupId: group!.id } });
    revalidatePath(`/groups/${group!.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      {blocked && (
        <div className="rounded-md border border-status-critical-border bg-status-critical-bg px-4 py-3 text-[13px] text-status-critical-text">
          {blocked}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">{group.name}</h1>
          <p className="mt-1 text-[13px] text-text-tertiary">{group.company_name}{group.session_label ? ` — ${group.session_label}` : ""}</p>
        </div>
        {canWrite && (
          <Link href={`/exam-preparation?groupId=${group.id}`} className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10">
            + Créer une évaluation
          </Link>
        )}
      </div>

      {canWrite && (
        <Card>
          <CardHeader title="Ajouter un candidat" description="Crée le compte s'il n'existe pas encore, puis l'ajoute au groupe" />
          <div className="flex flex-col gap-3">
            <AddCandidateForm groupId={group.id} />
            <BulkImportCandidatesForm groupId={group.id} />
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardHeader title={`${allMembers.length} candidat(s)${search ? ` — ${members.length} correspondant(s) à « ${q} »` : ""}`} />
          <div className="flex shrink-0 items-center gap-2 pb-3">
            <form method="get" className="flex items-center gap-1">
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Rechercher nom ou identifiant…"
                className="w-56 rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px]"
              />
            </form>
            <a
              href={`/api/groups/${group.id}/candidates-export`}
              className="rounded-md border border-border-default px-2.5 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong"
            >
              Exporter (CSV)
            </a>
          </div>
        </div>
        {members.length === 0 ? (
          <EmptyState icon={Users2} title={search ? "Aucun résultat" : "Aucun candidat"} description={search ? "Aucun candidat ne correspond à cette recherche." : "Ajoutez des candidats ci-dessus."} />
        ) : (
          <div className="flex flex-col gap-1.5">
            {members.map((m) => (
              <div key={m.candidate_user_id} className="flex flex-col gap-1.5 rounded-md border border-border-subtle px-3 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">{m.full_name}</p>
                    <p className="text-[11.5px] text-text-tertiary">{m.username}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {canWrite && <EditCandidateForm groupId={group.id} candidateUserId={m.candidate_user_id} fullName={m.full_name} />}
                    {canWrite && (
                      <form action={removeCandidate}>
                        <input type="hidden" name="candidateUserId" value={m.candidate_user_id} />
                        <button type="submit" className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-sunken" aria-label="Retirer du groupe">
                          <X size={14} />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title={`${assessments.length} évaluation(s) pour ce groupe`} />
        {assessments.length === 0 ? (
          <p className="text-[13px] text-text-tertiary">Aucune évaluation créée pour ce groupe.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {assessments.map((a) => (
              <Link key={a.id} href={`/exam-preparation/${a.id}`} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2 hover:border-border-strong">
                <span className="text-[13px] text-text-primary">{a.name}</span>
                <StatusBadge status={a.status === "published" || a.status === "open" ? "verified" : a.status === "suspended" ? "critical" : "neutral"}>{a.status}</StatusBadge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
