import { getComplianceData } from "@/lib/compliance-data";
import { ANAC_GAP_NOTES } from "@/lib/anac-gap-notes";
import { trCat, trReq } from "@/lib/compliance-labels-fr";
import { StatusPill } from "@/components/compliance/StatusPill";
import { ReportPrintHeader } from "@/components/reports/ReportPrintHeader";
import { PrintButton } from "@/components/reports/PrintButton";

export const dynamic = "force-dynamic";

export default async function AnacChecklistPage() {
  const categories = await getComplianceData();
  const generatedAt = new Date().toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="print-page mx-auto flex max-w-[1280px] flex-col gap-6">
      <ReportPrintHeader title="Checklist KOST — Préparation ANAC" generatedAt={generatedAt} />

      <div className="no-print flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
            Checklist KOST — Préparation ANAC
          </h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            Checklist interne KOST de préparation à l&apos;audit, appuyée par des preuves techniques
            vérifiables — les {categories.flatMap((c) => c.items).length} contrôles suivis, mis en
            correspondance avec le domaine d&apos;audit ANAC qu&apos;ils couvrent.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="no-print rounded-md border border-status-warning-border bg-status-warning-bg px-3.5 py-2.5 text-[12px] text-status-warning-text">
        Ceci n&apos;est pas une checklist officielle de l&apos;ANAC. Aucun document ANAC papier/officiel n&apos;a été
        fourni à ce système pour une vérification ligne par ligne. Ce tableau met en correspondance les 30
        contrôles suivis dans la console avec les catégories générales d&apos;audit ANAC qu&apos;ils visent à
        couvrir (Sécurité, Accessibilité, Banque de questions, Gestion des examens, Performance, Rapports &amp;
        Analytique, Conformité réglementaire, Formation &amp; Préparation, Retours). Si KOST Academy dispose d&apos;un
        document de checklist ANAC officiel, il peut être fourni pour une re-vérification ligne par ligne.
      </div>

      <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-sunken/50">
                {["Exigence d'origine (domaine d'audit)", "Contrôle KOST correspondant", "Statut", "Preuve", "Écart"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {categories.flatMap((c) =>
                c.items.map((item, idx) => (
                  <tr key={`${c.name}-${item.requirement}`} className="hover:bg-surface-sunken/40 transition-colors">
                    {idx === 0 && (
                      <td rowSpan={c.items.length} className="px-4 py-2.5 text-[12.5px] font-semibold text-text-primary align-top border-r border-border-subtle whitespace-nowrap">
                        {trCat(c.name)}
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-[12.5px] text-text-primary max-w-[240px]">{trReq(item.requirement)}</td>
                    <td className="px-4 py-2.5"><StatusPill status={item.status} /></td>
                    <td className="px-4 py-2.5 text-[11.5px] text-text-secondary max-w-[260px]">{item.evidenceSummary}</td>
                    <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary max-w-[280px]">
                      {ANAC_GAP_NOTES[item.requirement] ?? "Aucun écart identifié dans le périmètre actuellement suivi."}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
