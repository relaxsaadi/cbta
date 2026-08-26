import Link from "next/link";
import { notFound } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { getGroup, listGroupMembers, removeCandidateFromGroup } from "@/lib/groups";
import { listAssessments } from "@/lib/assessments";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { Users2, X } from "lucide-react";
import { AddCandidateForm } from "./AddCandidateForm";
import { revalidatePath } from "next/cache";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { id } = await params;
  const group = getGroup(Number(id));
  if (!group) notFound();
  const canWrite = session.role !== "auditor";

  const members = listGroupMembers(group.id);
  const assessments = listAssessments().filter((a) => a.group_id === group.id);

  async function removeCandidate(formData: FormData) {
    "use server";
    await guardPage("pedagogical_manager", "administrator");
    removeCandidateFromGroup(group!.id, Number(formData.get("candidateUserId")));
    revalidatePath(`/groups/${group!.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
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
          <AddCandidateForm groupId={group.id} />
        </Card>
      )}

      <Card>
        <CardHeader title={`${members.length} candidat(s)`} />
        {members.length === 0 ? (
          <EmptyState icon={Users2} title="Aucun candidat" description="Ajoutez des candidats ci-dessus." />
        ) : (
          <div className="flex flex-col gap-1.5">
            {members.map((m) => (
              <div key={m.candidate_user_id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2">
                <div>
                  <p className="text-[13px] font-medium text-text-primary">{m.full_name}</p>
                  <p className="text-[11.5px] text-text-tertiary">{m.username}</p>
                </div>
                {canWrite && (
                  <form action={removeCandidate}>
                    <input type="hidden" name="candidateUserId" value={m.candidate_user_id} />
                    <button type="submit" className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-sunken" aria-label="Retirer du groupe">
                      <X size={14} />
                    </button>
                  </form>
                )}
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
