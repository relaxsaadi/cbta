import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listFunctions } from "@/lib/functions";
import { listGroups } from "@/lib/groups";
import { listAssessments } from "@/lib/assessments";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookOpenCheck } from "lucide-react";
import { CreateAssessmentForm } from "./CreateAssessmentForm";

const STATUS_BADGE: Record<string, "verified" | "warning" | "critical" | "neutral"> = {
  draft: "neutral",
  published: "verified",
  open: "verified",
  closed: "neutral",
  suspended: "critical",
  archived: "neutral",
};

export default async function ExamPreparationPage({ searchParams }: { searchParams: Promise<{ groupId?: string }> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { groupId } = await searchParams;
  const functions = listFunctions();
  const groups = listGroups().map((g) => ({ id: g.id, name: g.name, company_name: g.company_name }));
  const assessments = listAssessments();
  const canWrite = session.role !== "auditor";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Préparation des examens</h1>

      {canWrite && (
        <Card>
          <CardHeader title="Créer une évaluation" description="Exercice / Test / Examen — 12 étapes, tout est modifiable jusqu'à la publication" />
          <CreateAssessmentForm functions={functions} groups={groups} defaultGroupId={groupId ? Number(groupId) : undefined} />
        </Card>
      )}

      <Card>
        <CardHeader title={`${assessments.length} évaluation(s)`} />
        {assessments.length === 0 ? (
          <EmptyState icon={BookOpenCheck} title="Aucune évaluation" description="Créez la première évaluation ci-dessus." />
        ) : (
          <div className="flex flex-col gap-2">
            {assessments.map((a) => (
              <Link key={a.id} href={`/exam-preparation/${a.id}`} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors">
                <div>
                  <p className="text-[13.5px] font-medium text-text-primary">{a.name}</p>
                  <p className="text-[12px] text-text-tertiary capitalize">{a.type} — {a.function_code} — {a.company_name} / {a.group_name}</p>
                </div>
                <StatusBadge status={STATUS_BADGE[a.status] ?? "neutral"}>{a.status}</StatusBadge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
