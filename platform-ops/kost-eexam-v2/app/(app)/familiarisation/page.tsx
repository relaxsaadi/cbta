import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listFamiliarizationSessions } from "@/lib/familiarization";
import { listGroups, listGroupsForManager } from "@/lib/groups";
import { listFunctions } from "@/lib/functions";
import { scopedGroupIdsOrNull } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { GraduationCap } from "lucide-react";
import { CreateSessionForm } from "./CreateSessionForm";

// Addendum §18-21 — module de familiarisation, CRITIQUE AUDIT. Scopé
// tenant comme le reste (lib/tenant-scope.ts scopedGroupIdsOrNull) : un
// responsable ne voit/crée que sur ses propres groupes.
export default async function FamiliarizationPage() {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const isManager = session.role === "pedagogical_manager";
  const canWrite = session.role !== "auditor";
  const sessions = listFamiliarizationSessions(scopedGroupIdsOrNull(session));
  const groups = isManager ? listGroupsForManager(session.userId) : listGroups();
  const functions = listFunctions();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Familiarisation</h1>

      {canWrite && (
        <Card>
          <CardHeader title="Déclarer une session de familiarisation" description="Une ligne de présence est créée pour chaque candidat actuellement dans le groupe." />
          <CreateSessionForm groups={groups} functions={functions} />
        </Card>
      )}

      <Card>
        <CardHeader title={`${sessions.length} session(s)`} />
        {sessions.length === 0 ? (
          <EmptyState icon={GraduationCap} title="Aucune session" description="Aucune session de familiarisation déclarée pour l'instant." />
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <Link key={s.id} href={`/familiarisation/${s.id}`} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors">
                <div>
                  <p className="text-[13.5px] font-medium text-text-primary">{s.company_name} — {s.group_name} — Fonction {s.function_code}</p>
                  <p className="text-[12px] text-text-tertiary">{new Date(s.held_at).toLocaleString("fr-FR")}{s.location ? ` — ${s.location}` : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
