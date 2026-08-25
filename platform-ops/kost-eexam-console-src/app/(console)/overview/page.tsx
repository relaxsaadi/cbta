import Link from "next/link";
import {
  FileCheck2,
  Users,
  CheckCircle2,
  TrendingUp,
  Library,
  Activity,
  CalendarClock,
  GraduationCap,
  ShieldCheck,
  Search,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession } from "@/lib/session";
import { getDashboardKpis } from "@/lib/dashboard-data";
import { getSystemHealth } from "@/lib/system-health";
import { getResults } from "@/lib/results-data";
import { getSessions } from "@/lib/sessions-data";
import { isDemoModeActive } from "@/lib/demo-mode-server";
import { redactName } from "@/lib/demo-mode";
import { parseScopeParam, SCOPE_LABELS } from "@/lib/data-scope";

export const dynamic = "force-dynamic";

const STATE_LABEL: Record<string, string> = {
  finished: "Terminée",
  inprogress: "En cours",
  overdue: "Hors délai",
  abandoned: "Abandonnée",
};

const SESSION_STATUS_LABEL: Record<string, { label: string; badge: "verified" | "warning" | "neutral" }> = {
  open: { label: "Ouverte", badge: "verified" },
  scheduled: { label: "Programmée", badge: "warning" },
  closed: { label: "Fermée", badge: "neutral" },
  no_window: { label: "Aucune fenêtre définie", badge: "neutral" },
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const params = await searchParams;
  const scope = parseScopeParam(params.scope);
  const session = await getSession();
  const [kpis, health, results, sessions, demoMode] = await Promise.all([
    getDashboardKpis(scope),
    getSystemHealth(),
    getResults(),
    getSessions(),
    isDemoModeActive(),
  ]);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const scopedResults = results.filter((r) => scope.includes(r.scope));
  const recentActivity = [...scopedResults]
    .filter((r) => r.state === "finished")
    .slice(0, 6)
    .map((r) => (demoMode ? { ...r, candidateName: redactName(r.candidateName) } : r));

  const scopedSessions = sessions.filter((s) => scope.includes(s.scope));
  const upcomingSessions = [...scopedSessions]
    .sort((a, b) => {
      // Ouvertes puis programmées en premier, fermées en dernier — même
      // logique de tri que la page /sessions elle-même consulterait.
      const rank = { open: 0, scheduled: 1, no_window: 2, closed: 3 };
      return rank[a.status] - rank[b.status];
    })
    .slice(0, 5);

  const isAllScope = scope.length > 1;

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
            Bienvenue, {session.fullName ?? session.username}
          </h1>
          <p className="mt-1 text-[13px] text-text-tertiary capitalize">{today}</p>
        </div>

        <form className="flex items-center gap-2" method="get">
          <label className="text-[12px] text-text-tertiary" htmlFor="scope">
            Périmètre des données
          </label>
          <select
            id="scope"
            name="scope"
            defaultValue={isAllScope ? "all" : "production"}
            className="rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px] text-text-secondary"
          >
            <option value="production">Production uniquement</option>
            <option value="all">Toutes les données (inclut démos/entraînement)</option>
          </select>
          <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10 transition-colors">
            Appliquer
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          label="Examens ouverts"
          value={kpis.activeExams ?? 0}
          icon={FileCheck2}
          unavailable={kpis.activeExams === null}
          accent="brand"
        />
        <KpiCard label="Candidats" value={kpis.candidates ?? 0} icon={Users} unavailable={kpis.candidates === null} />
        <KpiCard
          label="Tentatives terminées"
          value={kpis.completedExams ?? 0}
          icon={CheckCircle2}
          unavailable={kpis.completedExams === null}
        />
        <KpiCard
          label="Taux de réussite"
          value={kpis.passRate !== null ? `${kpis.passRate}%` : "—"}
          icon={TrendingUp}
          unavailable={kpis.passRate === null}
        />
        <KpiCard label="Banque de questions" value={kpis.questionBankSize ?? 0} icon={Library} unavailable={kpis.questionBankSize === null} />
      </div>
      <p className="-mt-3 text-[11.5px] text-text-tertiary">
        « Examens ouverts », « Tentatives terminées » et « Taux de réussite » sont calculés{" "}
        {isAllScope ? "sur toutes les données (production + démonstration + entraînement)" : "sur les données de production uniquement"} —
        même définition et même source que les pages Examens, Résultats et Rapports. « Candidats » et « Banque de
        questions » sont des comptages globaux, indépendants du périmètre.
        {kpis.passRate === null && kpis.completedExams === 0 && (
          <> Aucune tentative de production n&apos;a encore été enregistrée — le taux de réussite n&apos;est donc pas encore calculable pour ce périmètre.</>
        )}
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Activité récente"
            description={`Tentatives d'examen réellement terminées — ${isAllScope ? "toutes données" : "production uniquement"}, issues de Moodle`}
          />
          {recentActivity.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Aucune tentative terminée dans ce périmètre"
              description={
                isAllScope
                  ? "Aucune tentative d'examen n'a encore été enregistrée sur cette plateforme."
                  : "Aucune tentative de production n'a encore été enregistrée. Des tentatives de démonstration/entraînement existent peut-être — voir « Toutes les données » ci-dessus."
              }
            />
          ) : (
            <div className="flex flex-col divide-y divide-border-subtle">
              {recentActivity.map((r) => (
                <div key={r.attemptId} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-text-primary truncate">
                      {r.candidateName} — {r.examName}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-text-tertiary">
                      {fmtDate(r.timeFinish)} · {SCOPE_LABELS[r.scope]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.passFail === "pass" && <StatusBadge status="verified">Réussi</StatusBadge>}
                    {r.passFail === "fail" && <StatusBadge status="critical">Échoué</StatusBadge>}
                    {r.passFail === "not_applicable" && <StatusBadge status="neutral">{STATE_LABEL[r.state]}</StatusBadge>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/results" className="mt-3 inline-block text-[12px] font-medium text-accent-9 hover:underline underline-offset-2">
            Voir tous les résultats →
          </Link>
        </Card>

        <Card>
          <CardHeader title="État du système" description="Sauvegardes et infrastructure — vérification en direct" />
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
                  {item.status === "not_available" ? "N/D" : item.status === "verified" ? "Vérifié" : item.status === "warning" ? "Attention" : "Critique"}
                </StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Sessions" description="Mêmes données live que la page Sessions — fenêtres d'ouverture/fermeture réelles des examens Moodle" />
        {upcomingSessions.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Aucune session dans ce périmètre"
            description="Une session apparaît automatiquement dès qu'un examen a une fenêtre d'ouverture/fermeture configurée dans Moodle."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border-subtle">
            {upcomingSessions.map((s) => {
              const status = SESSION_STATUS_LABEL[s.status];
              return (
                <div key={s.examId} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-text-primary truncate">{s.examName}</p>
                    <p className="mt-0.5 text-[11.5px] text-text-tertiary">
                      {fmtDate(s.timeOpen)} → {fmtDate(s.timeClose)} · {SCOPE_LABELS[s.scope]}
                    </p>
                  </div>
                  <StatusBadge status={status.badge}>{status.label}</StatusBadge>
                </div>
              );
            })}
          </div>
        )}
        <Link href="/sessions" className="mt-3 inline-block text-[12px] font-medium text-accent-9 hover:underline underline-offset-2">
          Voir toutes les sessions →
        </Link>
      </Card>

      {/* Rôle de la console */}
      <Card>
        <CardHeader
          title="Rôle de la console KOST E-EXAM"
          description="Cette console n'est pas une deuxième base de données indépendante : elle lit et supervise les vraies données Moodle."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-md border border-border-subtle bg-surface-sunken/50 p-4">
            <p className="font-display text-[13.5px] font-semibold text-text-primary">Moodle — moteur d&apos;examen</p>
            <p className="mt-1 text-[12px] text-text-tertiary">exam.kostacademy.com</p>
            <ul className="mt-2.5 flex flex-col gap-1.5 text-[12.5px] text-text-secondary">
              <li>• Création et configuration des examens (Quiz)</li>
              <li>• Inscription des candidats</li>
              <li>• Passage réel de l&apos;examen</li>
              <li>• Notation officielle (carnet de notes Moodle)</li>
            </ul>
          </div>
          <div className="rounded-md border border-border-subtle bg-surface-sunken/50 p-4">
            <p className="font-display text-[13.5px] font-semibold text-text-primary">Console KOST E-EXAM — supervision</p>
            <p className="mt-1 text-[12px] text-text-tertiary">console.kostacademy.com</p>
            <ul className="mt-2.5 flex flex-col gap-1.5 text-[12.5px] text-text-secondary">
              <li>• Supervision opérationnelle des sessions et examens</li>
              <li>• Résultats et rapports agrégés</li>
              <li>• Vérification d&apos;identité et incidents techniques</li>
              <li>• Audit, conformité, preuves techniques et sauvegardes</li>
              <li>• Préparation à l&apos;audit ANAC</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* À qui s'adresse la console */}
      <Card>
        <CardHeader title="À qui s'adresse cette console ?" description="État réel des rôles actuellement actifs — voir le Guide d'utilisation pour le détail" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft-bg text-accent-9">
              <ShieldCheck size={16} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-primary">Administrateur</p>
              <p className="mt-0.5 text-[12.5px] text-text-secondary">
                Supervision générale, résultats, rapports, conformité, preuves, identité et incidents.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft-bg text-accent-9">
              <Search size={16} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-primary">Auditeur</p>
              <p className="mt-0.5 text-[12.5px] text-text-secondary">
                Accès de consultation adapté à l&apos;audit : preuves, conformité, traçabilité.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 rounded-md border border-status-warning-border bg-status-warning-bg px-3.5 py-2.5 text-[12px] text-status-warning-text">
          Les rôles « Responsable d&apos;examen » et « Instructeur » sont prévus dans le code de la console mais ne
          sont pas encore activés côté Moodle à ce jour — seuls Administrateur et Auditeur sont réellement
          opérationnels en production. L&apos;instructeur/responsable d&apos;examen utilise aujourd&apos;hui Moodle
          directement pour la gestion pédagogique et la configuration des examens ; la console interviendra pour ces
          rôles dès qu&apos;ils seront provisionnés.
        </p>
      </Card>

      <Card padding="sm" className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <GraduationCap size={16} className="text-accent-9" />
          <p className="text-[12.5px] text-text-secondary">
            Nouveau sur la console ? Le Guide d&apos;utilisation explique chaque page en détail.
          </p>
        </div>
        <Link href="/guide" className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10 transition-colors">
          Ouvrir le guide →
        </Link>
      </Card>
    </div>
  );
}
