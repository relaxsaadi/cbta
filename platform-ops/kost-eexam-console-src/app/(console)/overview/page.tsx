import { FileCheck2, Users, CheckCircle2, TrendingUp, Library, Activity } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession } from "@/lib/session";
import { getDashboardKpis } from "@/lib/dashboard-data";
import { getSystemHealth } from "@/lib/system-health";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await getSession();
  const [kpis, health] = await Promise.all([getDashboardKpis(), getSystemHealth()]);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
            Welcome back, {session.fullName ?? session.username}
          </h1>
          <p className="mt-1 text-[13px] text-text-tertiary">{today}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Active Exams" value={kpis.activeExams ?? 0} icon={FileCheck2} unavailable={kpis.activeExams === null} accent="brand" />
        <KpiCard label="Candidates" value={kpis.candidates ?? 0} icon={Users} unavailable={kpis.candidates === null} />
        <KpiCard label="Completed Exams" value={kpis.completedExams ?? 0} icon={CheckCircle2} unavailable={kpis.completedExams === null} />
        <KpiCard
          label="Pass Rate"
          value={kpis.passRate !== null ? `${kpis.passRate}%` : "—"}
          icon={TrendingUp}
          unavailable={kpis.passRate === null}
        />
        <KpiCard label="Question Bank" value={kpis.questionBankSize ?? 0} icon={Library} unavailable={kpis.questionBankSize === null} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Exam Activity" description="Live once exams are configured in Phase 2" />
          <EmptyState
            icon={Activity}
            title="No exam activity yet"
            description="Activity will appear here once exams and sessions are published from the Exams module (Phase 2)."
          />
        </Card>

        <Card>
          <CardHeader title="System Health" description="Sourced from Phase 0 backup infrastructure" />
          <div className="flex flex-col gap-3.5">
            {health.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-text-primary">{item.label}</p>
                  <p className="mt-0.5 text-[11.5px] text-text-tertiary">{item.detail}</p>
                </div>
                <StatusBadge
                  status={
                    item.status === "verified"
                      ? "verified"
                      : item.status === "warning"
                      ? "warning"
                      : item.status === "critical"
                      ? "critical"
                      : "neutral"
                  }
                >
                  {item.status === "not_available" ? "N/A" : item.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Upcoming Exam Sessions" description="Coming in Phase 2 — Session management" />
        <EmptyState
          icon={FileCheck2}
          title="No sessions scheduled"
          description="Session scheduling becomes available once the Sessions module ships in Phase 2."
        />
      </Card>
    </div>
  );
}
