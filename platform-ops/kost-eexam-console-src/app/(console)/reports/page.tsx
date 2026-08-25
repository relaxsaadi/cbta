import { BarChart3 } from "lucide-react";
import { getReportsData } from "@/lib/reports-data";
import { DGR_FUNCTIONS } from "@/lib/dgr-functions";
import { getExams } from "@/lib/exams-data";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { parseScopeParam } from "@/lib/data-scope";

export const dynamic = "force-dynamic";

function fmtDuration(s: number | null): string {
  if (s === null) return "Aucune donnée";
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}m ${sec}s`;
}
function fmtPercent(n: number | null): string {
  return n !== null ? `${n.toFixed(0)}%` : "Aucune donnée";
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string; dgrFunction?: string; scope?: string }>;
}) {
  const params = await searchParams;
  const scope = parseScopeParam(params.scope);
  const isAllScope = scope.length > 1;
  const [data, exams] = await Promise.all([
    getReportsData({ examName: params.exam, dgrFunction: params.dgrFunction, scope }),
    getExams(),
  ]);
  const examNames = Array.from(new Set(exams.map((e) => e.name)));

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Rapports</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Statistiques agrégées calculées exclusivement à partir des vraies données Moodle — aucune donnée fictive.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2.5" method="get">
        <select name="exam" defaultValue={params.exam ?? ""} className="rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px] text-text-secondary">
          <option value="">Tous les examens</option>
          {examNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select name="dgrFunction" defaultValue={params.dgrFunction ?? ""} className="rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px] text-text-secondary">
          <option value="">Toutes les fonctions DGR</option>
          {DGR_FUNCTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select name="scope" defaultValue={isAllScope ? "all" : "production"} className="rounded-md border border-border-default bg-surface-base px-2.5 py-1.5 text-[12.5px] text-text-secondary">
          <option value="production">Production uniquement</option>
          <option value="all">Toutes les données (démos/entraînement inclus)</option>
        </select>
        <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10 transition-colors">
          Appliquer les filtres
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-5">
        <Stat label="Examens terminés" value={String(data.examsCompleted)} />
        <Stat label="Candidats évalués" value={String(data.candidatesAssessed)} />
        <Stat label="Taux de réussite" value={fmtPercent(data.passRate)} />
        <Stat label="Note moyenne" value={fmtPercent(data.averageScorePercent)} />
        <Stat label="Durée moyenne" value={fmtDuration(data.averageDurationSeconds)} />
      </div>

      {data.byExam.length === 0 ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="Aucune donnée pour ce filtre"
            description={
              isAllScope
                ? "Les rapports sont construits exclusivement à partir de vraies tentatives Moodle terminées. Ajustez les filtres ou attendez une activité réelle."
                : "Aucune tentative de production ne correspond à ce filtre. Essayez « Toutes les données » pour inclure les tentatives de démonstration/entraînement."
            }
          />
        </Card>
      ) : (
        <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-sunken/50">
                  {["Examen", "Fonction DGR", "Tentatives", "Taux de réussite", "Note moyenne"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {data.byExam.map((row) => (
                  <tr key={row.examName} className="hover:bg-surface-sunken/40 transition-colors">
                    <td className="px-4 py-2.5 text-[12.5px] font-medium text-text-primary max-w-[240px] truncate">{row.examName}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-secondary">{row.dgrFunctions.join(", ") || "Non classée"}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-tertiary tabular-nums">{row.attempts}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-primary tabular-nums">{fmtPercent(row.passRate)}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-primary tabular-nums">{fmtPercent(row.averageScorePercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="mt-1 font-display text-[18px] font-semibold text-text-primary tabular-nums">{value}</p>
    </Card>
  );
}
