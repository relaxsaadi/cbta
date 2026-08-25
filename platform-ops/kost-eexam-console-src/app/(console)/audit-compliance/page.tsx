import { ShieldCheck, Database, RotateCcw, Cloud, Gauge, Users, Library, ScrollText, LifeBuoy, GraduationCap, MessageSquareHeart, ListChecks, BookMarked, Globe, BadgeCheck, FileWarning } from "lucide-react";
import { getComplianceData, computeSummary } from "@/lib/compliance-data";
import { EvidenceCard } from "@/components/compliance/EvidenceCard";
import { ComplianceCategoryCard } from "@/components/compliance/ComplianceCategoryCard";
import { StatusBadge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AuditCompliancePage() {
  const categories = await getComplianceData();
  const summary = computeSummary(categories);

  const findItem = (category: string, requirement: string) =>
    categories.find((c) => c.name === category)?.items.find((i) => i.requirement === requirement);

  const httpsItem = findItem("Accessibility", "Secure access to the platform (HTTPS)");
  const backupItem = findItem("Security", "Automated, verified backups");
  const qbankItem = findItem(
    "Question Bank",
    "Module-separated question categories (Sécurité et Sauvetage / Secourisme)"
  );
  const loadTestItem = findItem("Performance", "Concurrent user load testing");
  const rolesItem = findItem("Accessibility", "Account and role management");
  const logsItem = findItem("Reports & Analytics", "Audit trail / activity logs");
  const supportItem = findItem("Accessibility", "Online help / support resources");
  const practiceItem = findItem("Training & Preparation", "Practice test availability");
  const feedbackItem = findItem("Feedback", "Feedback collection mechanism");
  const resultsItem = findItem("Reports & Analytics", "Exam results reporting");
  const docsItem = findItem("Training & Preparation", "Instructor and candidate documentation");
  const browserItem = findItem("Accessibility", "Cross-browser compatibility");
  const identityItem = findItem("Security", "Candidate identity verification");
  const breachItem = findItem("Security", "Security incident / breach protocol");

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Audit &amp; conformité
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Checklist de préparation ANAC, appuyée exclusivement sur des preuves techniques vérifiables.
        </p>
      </div>

      {/* Bandeau de synthèse */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border-subtle bg-surface-raised px-5 py-3.5 shadow-sm">
        <span className="text-[12.5px] font-medium text-text-secondary mr-1">
          {summary.total} exigences suivies
        </span>
        <StatusBadge status="verified">{summary.verified} Vérifiées</StatusBadge>
        <StatusBadge status="warning">{summary.partial} Partielles</StatusBadge>
        <StatusBadge status="neutral">{summary.notConfigured} Non configurées</StatusBadge>
        <span className="ml-auto text-[11px] text-text-tertiary">
          Un statut n&apos;est jamais affiché « Vérifié » sans source réelle contrôlée.
        </span>
      </div>

      {/* Centre de preuves */}
      <div>
        <h2 className="font-display text-[15px] font-semibold text-text-primary mb-3">Centre de preuves</h2>
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
          <EvidenceCard
            icon={ShieldCheck}
            title="HTTPS / TLS"
            status={httpsItem?.status ?? "not_configured"}
            summary={httpsItem?.evidenceSummary ?? "Aucune donnée"}
          />
          <EvidenceCard
            icon={Database}
            title="Sauvegardes"
            status={backupItem?.status ?? "not_configured"}
            summary={backupItem?.evidenceSummary ?? "Aucune donnée"}
          />
          <EvidenceCard
            icon={RotateCcw}
            title="Test de restauration"
            status={
              categories
                .find((c) => c.name === "Security")
                ?.items.find((i) => i.requirement === "Automated, verified backups")?.status ?? "not_configured"
            }
            summary="Voir la catégorie Sécurité pour la preuve complète du test de restauration"
          />
          <EvidenceCard
            icon={Cloud}
            title="Réplication externalisée"
            status={backupItem?.status ?? "not_configured"}
            summary="Copie chiffrée répliquée hors serveur (Tailscale)"
          />
          <EvidenceCard
            icon={Gauge}
            title="Test de charge"
            status={loadTestItem?.status ?? "not_configured"}
            summary={loadTestItem?.evidenceSummary ?? "Aucune donnée"}
          />
          <EvidenceCard
            icon={Users}
            title="Rôles utilisateurs"
            status={rolesItem?.status ?? "not_configured"}
            summary={rolesItem?.evidenceSummary ?? "Aucune donnée"}
          />
          <EvidenceCard
            icon={Library}
            title="Structure de la banque de questions"
            status={qbankItem?.status ?? "not_configured"}
            summary={qbankItem?.evidenceSummary ?? "Aucune donnée"}
            href="/question-bank"
          />
          <EvidenceCard
            icon={ScrollText}
            title="Journaux d'audit"
            status={logsItem?.status ?? "not_configured"}
            summary={logsItem?.evidenceSummary ?? "Aucune donnée"}
            href="/audit-logs"
          />
          <EvidenceCard
            icon={LifeBuoy}
            title="Support technique"
            status={supportItem?.status ?? "not_configured"}
            summary={supportItem?.evidenceSummary ?? "Aucune donnée"}
            href="/support"
          />
          <EvidenceCard
            icon={GraduationCap}
            title="Test pratique"
            status={practiceItem?.status ?? "not_configured"}
            summary={practiceItem?.evidenceSummary ?? "Aucune donnée"}
            href="/practice-test"
          />
          <EvidenceCard
            icon={MessageSquareHeart}
            title="Retours"
            status={feedbackItem?.status ?? "not_configured"}
            summary={feedbackItem?.evidenceSummary ?? "Aucune donnée"}
            href="/feedback"
          />
          <EvidenceCard
            icon={ListChecks}
            title="Rapport de résultats"
            status={resultsItem?.status ?? "not_configured"}
            summary={resultsItem?.evidenceSummary ?? "Aucune donnée"}
            href="/results"
          />
          <EvidenceCard
            icon={BookMarked}
            title="Documentation"
            status={docsItem?.status ?? "not_configured"}
            summary={docsItem?.evidenceSummary ?? "Aucune donnée"}
            href="/documentation"
          />
          <EvidenceCard
            icon={Globe}
            title="Compatibilité navigateurs"
            status={browserItem?.status ?? "not_configured"}
            summary={browserItem?.evidenceSummary ?? "Aucune donnée"}
          />
          <EvidenceCard
            icon={BadgeCheck}
            title="Vérification d'identité"
            status={identityItem?.status ?? "not_configured"}
            summary={identityItem?.evidenceSummary ?? "Aucune donnée"}
            href="/identity-verification"
          />
          <EvidenceCard
            icon={FileWarning}
            title="Procédure de réponse aux incidents"
            status={breachItem?.status ?? "not_configured"}
            summary={breachItem?.evidenceSummary ?? "Aucune donnée"}
            href="/security-procedure"
          />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-[15px] font-semibold text-text-primary">Checklist de conformité</h2>
        {categories.map((category) => (
          <ComplianceCategoryCard key={category.name} category={category} />
        ))}
      </div>
    </div>
  );
}
