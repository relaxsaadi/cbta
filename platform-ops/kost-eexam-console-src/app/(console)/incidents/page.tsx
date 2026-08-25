import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getIncidents } from "@/lib/incidents-data";
import { getSession } from "@/lib/session";
import { isDemoModeActive } from "@/lib/demo-mode-server";
import { redactName } from "@/lib/demo-mode";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { IncidentsTable } from "./IncidentsTable";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const [incidents, session, demoMode] = await Promise.all([getIncidents(), getSession(), isDemoModeActive()]);
  const canEdit = session.role === "administrator" || session.role === "exam_manager";
  const displayIncidents = demoMode
    ? incidents.map((i) => ({ ...i, reporterFullName: redactName(i.reporterFullName) }))
    : incidents;

  const open = incidents.filter((i) => i.status === "open").length;
  const inProgress = incidents.filter((i) => i.status === "in_progress").length;

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
            Technical Incidents
          </h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            {incidents.length} incident{incidents.length !== 1 ? "s" : ""} logged — {open} open, {inProgress} in progress.
            Stored in the console's own table (kost_console_incidents), never in Moodle.
          </p>
        </div>
        <Link
          href="/support/report"
          className="shrink-0 rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong transition-colors"
        >
          Report an issue
        </Link>
      </div>

      {incidents.length === 0 ? (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="No incidents reported yet"
            description="Once a technical issue is reported, it appears here in real time — with full status history."
          />
        </Card>
      ) : (
        <IncidentsTable incidents={displayIncidents} canEdit={canEdit} />
      )}
    </div>
  );
}
