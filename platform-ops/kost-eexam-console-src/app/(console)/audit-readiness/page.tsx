import Link from "next/link";
import { getComplianceData, computeSummary } from "@/lib/compliance-data";
import { deriveVerificationMethod, evidenceAnchor } from "@/lib/verification-method";
import { trCat, trReq } from "@/lib/compliance-labels-fr";
import { StatusBadge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/compliance/StatusPill";
import { Card } from "@/components/ui/Card";
import { ReportPrintHeader } from "@/components/reports/ReportPrintHeader";
import { PrintButton } from "@/components/reports/PrintButton";

export const dynamic = "force-dynamic";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AuditReadinessPage() {
  const categories = await getComplianceData();
  const summary = computeSummary(categories);
  const generatedAt = new Date().toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // La préparation est une appréciation qualitative, volontairement pas un
  // pourcentage — un « score de conformité » chiffré représenterait mal la
  // conformité réglementaire, que seule l'ANAC peut accorder.
  const readinessLabel =
    summary.notConfigured === 0
      ? "Techniquement prêt pour revue — tous les contrôles suivis sont Vérifiés ou Partiels avec une raison documentée"
      : `${summary.notConfigured} contrôle(s) encore Non configuré(s) — à revoir avant présentation à l'ANAC`;

  return (
    <div className="print-page mx-auto flex max-w-[1280px] flex-col gap-6">
      <ReportPrintHeader title="Synthèse de préparation à l'audit" generatedAt={generatedAt} />

      <div className="no-print flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
            Synthèse de préparation à l&apos;audit
          </h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            Préparation technique à l&apos;audit — chaque statut ci-dessous s&apos;appuie sur une source réelle
            vérifiée en direct ou documentée. Ce n&apos;est pas un pourcentage de conformité réglementaire.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/evidence-pack"
            className="no-print rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong transition-colors"
          >
            Dossier de preuves →
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Statement de préparation global */}
      <Card className="print-avoid-break">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
          Préparation technique globale à l&apos;audit
        </p>
        <p className="mt-1.5 text-[15px] font-medium text-text-primary leading-relaxed">{readinessLabel}</p>
        <p className="mt-2 text-[12px] text-text-tertiary">
          Cette appréciation décrit la préparation technique de la plateforme à un audit ANAC — ce n&apos;est
          pas en soi une décision de conformité ANAC, que seule l&apos;ANAC peut émettre.
        </p>
      </Card>

      {/* Compteurs de synthèse */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-5 print-avoid-break">
        <Stat label="Exigences totales" value={String(summary.total)} />
        <Stat label="Vérifiées" value={String(summary.verified)} accent="verified" />
        <Stat label="Partielles" value={String(summary.partial)} accent="warning" />
        <Stat label="Non configurées" value={String(summary.notConfigured)} accent="neutral" />
        <Stat label="Non applicables" value={String(summary.notApplicable)} accent="neutral" />
      </div>

      {/* Répartition par catégorie */}
      <div>
        <h2 className="font-display text-[15px] font-semibold text-text-primary mb-3">Par catégorie</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 print-avoid-break">
          {categories.map((c) => {
            const v = c.items.filter((i) => i.status === "verified").length;
            const p = c.items.filter((i) => i.status === "partial").length;
            const nc = c.items.filter((i) => i.status === "not_configured").length;
            return (
              <Card key={c.name} padding="sm">
                <p className="font-display text-[13px] font-semibold text-text-primary">{trCat(c.name)}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <StatusBadge status="verified">{v} Vérifiées</StatusBadge>
                  {p > 0 && <StatusBadge status="warning">{p} Partielles</StatusBadge>}
                  {nc > 0 && <StatusBadge status="neutral">{nc} Non configurées</StatusBadge>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Table exigence -> preuve */}
      <div>
        <h2 className="font-display text-[15px] font-semibold text-text-primary mb-3">
          Correspondance exigence → preuve
        </h2>
        <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-sunken/50">
                  {["Exigence", "Statut", "Source de preuve", "Dernière vérification", "Méthode de vérification", "Responsable", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {categories.flatMap((c) =>
                  c.items.map((item) => (
                    <tr key={`${c.name}-${item.requirement}`} className="hover:bg-surface-sunken/40 transition-colors">
                      <td className="px-4 py-2.5 text-[12.5px] font-medium text-text-primary max-w-[260px]">
                        {trReq(item.requirement)}
                        <span className="block text-[10.5px] font-normal text-text-tertiary">{trCat(c.name)}</span>
                      </td>
                      <td className="px-4 py-2.5"><StatusPill status={item.status} /></td>
                      <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary max-w-[220px] truncate">{item.evidence?.source ?? "—"}</td>
                      <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary tabular-nums whitespace-nowrap">{fmt(item.lastVerified)}</td>
                      <td className="px-4 py-2.5 text-[11.5px] text-text-secondary whitespace-nowrap">{deriveVerificationMethod(item)}</td>
                      <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary whitespace-nowrap">{item.responsible}</td>
                      <td className="px-4 py-2.5 no-print">
                        <Link
                          href={`/audit-compliance#${evidenceAnchor(item)}`}
                          className="rounded-md border border-border-default bg-surface-base px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:border-border-strong transition-colors whitespace-nowrap"
                        >
                          Voir la preuve
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "verified" | "warning" | "neutral" }) {
  return (
    <Card padding="sm">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p
        className="mt-1 font-display text-[22px] font-semibold tabular-nums"
        style={{
          color:
            accent === "verified"
              ? "var(--status-verified-text)"
              : accent === "warning"
              ? "var(--status-warning-text)"
              : "var(--text-primary)",
        }}
      >
        {value}
      </p>
    </Card>
  );
}
