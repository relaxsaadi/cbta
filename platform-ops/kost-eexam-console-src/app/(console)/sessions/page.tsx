import { CalendarClock, Users, Activity } from "lucide-react";
import { getSessions } from "@/lib/sessions-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SCOPE_LABELS, SCOPE_BADGE } from "@/lib/data-scope";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; badge: "verified" | "warning" | "neutral" }> = {
  open: { label: "Ouverte", badge: "verified" },
  scheduled: { label: "Programmée", badge: "warning" },
  closed: { label: "Fermée", badge: "neutral" },
  no_window: { label: "Aucune fenêtre définie", badge: "neutral" },
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function SessionsPage() {
  const sessions = await getSessions();
  const totalInProgress = sessions.reduce((sum, s) => sum + s.attemptsInProgress, 0);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Sessions</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Dérivées des vraies fenêtres d&apos;ouverture/fermeture des examens et des tentatives réelles — pas de système de planification séparé.
        </p>
      </div>

      <Card>
        <CardHeader title="Suivi des sessions en direct" description="Données réelles de tentatives, actualisées à chaque chargement" />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-display text-[24px] font-semibold text-text-primary tabular-nums">
              {sessions.reduce((s, x) => s + x.candidatesStarted, 0)}
            </p>
            <p className="text-[12px] text-text-tertiary mt-0.5">Candidats ayant commencé (total)</p>
          </div>
          <div>
            <p className="font-display text-[24px] font-semibold text-text-primary tabular-nums">
              {sessions.reduce((s, x) => s + x.candidatesCompleted, 0)}
            </p>
            <p className="text-[12px] text-text-tertiary mt-0.5">Tentatives terminées</p>
          </div>
          <div>
            <p className="font-display text-[24px] font-semibold text-text-primary tabular-nums">{totalInProgress}</p>
            <p className="text-[12px] text-text-tertiary mt-0.5">Tentatives en cours actuellement</p>
          </div>
        </div>
      </Card>

      {sessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title="Aucune session"
            description="Les sessions apparaissent automatiquement dès qu'un examen a une fenêtre d'ouverture/fermeture configurée."
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13.5px] font-semibold text-text-primary truncate">{s.examName}</p>
                      <StatusBadge status={SCOPE_BADGE[s.scope]}>{SCOPE_LABELS[s.scope]}</StatusBadge>
                    </div>
                    <p className="text-[12px] text-text-tertiary mt-0.5">
                      {fmtDate(s.timeOpen)} → {fmtDate(s.timeClose)} · {s.durationMinutes} min
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                      <Users size={13} />
                      {s.candidatesStarted} commencée{s.candidatesStarted !== 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                      <Activity size={13} />
                      {s.attemptsInProgress} en cours
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
