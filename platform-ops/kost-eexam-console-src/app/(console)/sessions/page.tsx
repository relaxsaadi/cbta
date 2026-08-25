import { CalendarClock, Users, Activity } from "lucide-react";
import { getSessions } from "@/lib/sessions-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; badge: "verified" | "warning" | "neutral" }> = {
  open: { label: "Open", badge: "verified" },
  scheduled: { label: "Scheduled", badge: "warning" },
  closed: { label: "Closed", badge: "neutral" },
  no_window: { label: "No window set", badge: "neutral" },
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function SessionsPage() {
  const sessions = await getSessions();
  const totalInProgress = sessions.reduce((sum, s) => sum + s.attemptsInProgress, 0);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Sessions</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Derived from real exam open/close windows and live attempt data — no separate scheduling system.
        </p>
      </div>

      <Card>
        <CardHeader title="Live Session Monitoring" description="Real attempt data, refreshed on page load" />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-display text-[24px] font-semibold text-text-primary tabular-nums">
              {sessions.reduce((s, x) => s + x.candidatesStarted, 0)}
            </p>
            <p className="text-[12px] text-text-tertiary mt-0.5">Candidates started (all-time)</p>
          </div>
          <div>
            <p className="font-display text-[24px] font-semibold text-text-primary tabular-nums">
              {sessions.reduce((s, x) => s + x.candidatesCompleted, 0)}
            </p>
            <p className="text-[12px] text-text-tertiary mt-0.5">Attempts completed</p>
          </div>
          <div>
            <p className="font-display text-[24px] font-semibold text-text-primary tabular-nums">{totalInProgress}</p>
            <p className="text-[12px] text-text-tertiary mt-0.5">Attempts in progress now</p>
          </div>
        </div>
      </Card>

      {sessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title="No sessions yet"
            description="Sessions appear automatically once an exam has a configured open/close window."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => {
            const status = STATUS_LABEL[s.status];
            return (
              <Card key={s.examId} padding="sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-text-primary truncate">{s.examName}</p>
                    <p className="text-[12px] text-text-tertiary mt-0.5">
                      {fmtDate(s.timeOpen)} → {fmtDate(s.timeClose)} · {s.durationMinutes} min
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                      <Users size={13} />
                      {s.candidatesStarted} started
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                      <Activity size={13} />
                      {s.attemptsInProgress} in progress
                    </div>
                    <StatusBadge status={status.badge}>{status.label}</StatusBadge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
