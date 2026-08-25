import { getComplianceData } from "@/lib/compliance-data";
import { deriveVerificationMethod } from "@/lib/verification-method";
import { trCat } from "@/lib/compliance-labels-fr";
import { StatusPill } from "@/components/compliance/StatusPill";
import { Card } from "@/components/ui/Card";
import { ReportPrintHeader } from "@/components/reports/ReportPrintHeader";
import { PrintButton } from "@/components/reports/PrintButton";

export const dynamic = "force-dynamic";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// Groupes de preuves demandés pour le Dossier de preuves — chaque entrée
// référence la catégorie + l'exigence réelle dont elle est tirée dans
// lib/compliance-data.ts (clés en anglais, stables — voir ce fichier).
// Aucune preuve n'est dupliquée ou reformulée avec des valeurs différentes :
// c'est exactement le même item que sur /audit-compliance et /audit-readiness.
const PACK_GROUPS: { label: string; category: string; requirement: string }[] = [
  { label: "TLS / HTTPS", category: "Accessibility", requirement: "Secure access to the platform (HTTPS)" },
  { label: "Journaux de sauvegarde", category: "Security", requirement: "Automated, verified backups" },
  { label: "Test de restauration", category: "Security", requirement: "Automated, verified backups" },
  { label: "Réplication externalisée", category: "Security", requirement: "Automated, verified backups" },
  { label: "Configuration serveur", category: "Security", requirement: "Server stability and security hardening" },
  { label: "Test de charge", category: "Performance", requirement: "Concurrent user load testing" },
  { label: "Rôles / RBAC", category: "Accessibility", requirement: "Account and role management" },
  { label: "Banque de questions", category: "Question Bank", requirement: "Module-separated question categories (Sécurité et Sauvetage / Secourisme)" },
  { label: "Aléatoire (randomisation)", category: "Question Bank", requirement: "Randomized question selection / shuffled answers" },
  { label: "Chronomètre / envoi automatique", category: "Exam Management", requirement: "Timer and automatic submission" },
  { label: "Sessions", category: "Exam Management", requirement: "Session scheduling and management" },
  { label: "Journaux d'audit", category: "Reports & Analytics", requirement: "Audit trail / activity logs" },
  { label: "Support", category: "Accessibility", requirement: "Online help / support resources" },
  { label: "Incidents techniques", category: "Security", requirement: "Technical incident reporting mechanism" },
  { label: "Test pratique", category: "Training & Preparation", requirement: "Practice test availability" },
  { label: "Retours", category: "Feedback", requirement: "Feedback collection mechanism" },
  { label: "Résultats", category: "Reports & Analytics", requirement: "Exam results reporting" },
  { label: "Documentation", category: "Training & Preparation", requirement: "Instructor and candidate documentation" },
  { label: "Tests multi-navigateurs", category: "Accessibility", requirement: "Cross-browser compatibility" },
  { label: "Procédure d'incident de sécurité", category: "Security", requirement: "Security incident / breach protocol" },
  { label: "Vérification d'identité", category: "Security", requirement: "Candidate identity verification" },
];

export default async function EvidencePackPage() {
  const categories = await getComplianceData();
  const generatedAt = new Date().toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const findItem = (category: string, requirement: string) =>
    categories.find((c) => c.name === category)?.items.find((i) => i.requirement === requirement);

  return (
    <div className="print-page mx-auto flex max-w-[1000px] flex-col gap-6">
      <ReportPrintHeader title="Dossier de preuves E-EXAM ANAC" generatedAt={generatedAt} />

      <div className="no-print flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
            Dossier de preuves E-EXAM ANAC
          </h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            21 groupes de preuves techniques, compilés depuis les mêmes sources en direct que Audit &amp;
            conformité. Exclut mots de passe, jetons, clés privées et données personnelles brutes.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="no-print rounded-md border border-status-warning-border bg-status-warning-bg px-3.5 py-2.5 text-[12px] text-status-warning-text">
        Ce dossier n&apos;inclut jamais de secrets (mots de passe, jetons, clés privées) ni de données
        personnelles brutes. Lorsqu&apos;un document complet existe (ex. Procédure de réponse aux incidents de
        sécurité), seul son résumé publié est inclus ici — le document source est lié, pas reproduit avec
        son détail sensible.
      </div>

      <div className="flex flex-col gap-3">
        {PACK_GROUPS.map((g, i) => {
          const item = findItem(g.category, g.requirement);
          return (
            <Card key={`${g.label}-${i}`} padding="sm" className="print-avoid-break">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[13.5px] font-semibold text-text-primary">{g.label}</p>
                  <p className="text-[11px] text-text-tertiary">{trCat(g.category)}</p>
                </div>
                {item && <StatusPill status={item.status} />}
              </div>
              {item ? (
                <>
                  <p className="mt-2 text-[12.5px] text-text-secondary">{item.evidenceSummary}</p>
                  <div className="mt-2 grid grid-cols-3 gap-3 text-[11px] text-text-tertiary">
                    <span>Source : {item.evidence?.source ?? "—"}</span>
                    <span>Dernière vérification : {fmt(item.lastVerified)}</span>
                    <span>Méthode : {deriveVerificationMethod(item)}</span>
                  </div>
                  {item.evidence?.technicalDetails && (
                    <pre className="mt-2 whitespace-pre-wrap rounded-md bg-surface-sunken border border-border-subtle p-2.5 font-mono text-[10.5px] leading-relaxed text-text-secondary">
                      {item.evidence.technicalDetails}
                    </pre>
                  )}
                </>
              ) : (
                <p className="mt-2 text-[12.5px] text-text-tertiary italic">Aucune donnée disponible pour cet élément.</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
