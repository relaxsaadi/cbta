import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listFunctions } from "@/lib/functions";
import {
  listQuestions,
  countQuestionsByClassification,
  countAdmissibleQuestions,
  SOURCE_STATUS_LABELS,
  QTYPE_LABELS,
  type SourceStatus,
  type QType,
} from "@/lib/questions";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Library } from "lucide-react";
import { CreateQuestionForm } from "./CreateQuestionForm";

const SOURCE_STATUS_BADGE: Record<string, "verified" | "warning" | "critical" | "neutral"> = {
  FROZEN_SOURCE_VERIFIED: "verified",
  DRAFT: "neutral",
  PARTIAL: "warning",
  STALE: "warning",
  SOURCE_GAP: "critical",
  SOURCE_CONFLICT: "critical",
  NOT_ATTEMPTED: "neutral",
};

const REVIEWER_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
};
const REVIEWER_STATUS_BADGE: Record<string, "verified" | "warning" | "critical" | "neutral"> = {
  PENDING: "neutral",
  APPROVED: "verified",
  REJECTED: "critical",
};

// "functionCode"/"qtype"/"sourceStatus" (sans préfixe) sont déjà les
// name/id des champs de CreateQuestionForm plus bas sur cette MÊME page —
// un id dupliqué est un vrai bug HTML/accessibilité (voir le même
// correctif déjà appliqué sur app/(app)/exam-preparation/page.tsx, §27-29
// d'une mission antérieure). Tout paramètre de FILTRE prend donc
// systématiquement le préfixe "filter", jamais réutilisé par le
// formulaire de création.
interface QuestionBankSearchParams {
  filterFunctionCode?: string;
  filterQtype?: string;
  filterSourceStatus?: string;
  filterReviewerStatus?: string;
  filterClassification?: string;
  filterActive?: string;
  q?: string;
}

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: Promise<QuestionBankSearchParams>;
}) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const sp = await searchParams;
  const functions = listFunctions();
  const canWrite = session.role === "administrator";

  // Mission "NORMALIZE QUESTION COUNTS" §1-2 — jamais présenter le total
  // brut (252) comme s'il s'agissait uniquement de questions
  // réglementaires. Voir lib/questions.ts::isDemoQuestionId pour la
  // justification du signal de classification (préfixe "DEMO-", pas
  // source_status seul).
  const counts = countQuestionsByClassification();

  const questions = listQuestions({
    functionCode: sp.filterFunctionCode || undefined,
    qtype: (sp.filterQtype as QType) || undefined,
    sourceStatus: (sp.filterSourceStatus as SourceStatus) || undefined,
    reviewerStatus: (sp.filterReviewerStatus as "PENDING" | "APPROVED" | "REJECTED") || undefined,
    classification: (sp.filterClassification as "regulatory" | "demo") || undefined,
    active: sp.filterActive === "1" ? true : sp.filterActive === "0" ? false : undefined,
    search: sp.q || undefined,
  });

  const hasFilters = !!(sp.filterFunctionCode || sp.filterQtype || sp.filterSourceStatus || sp.filterReviewerStatus || sp.filterClassification || sp.filterActive || sp.q);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Banque de questions</h1>

      <Card>
        <CardHeader title="Composition de la banque" description="Classification RÉGLEMENTAIRE / DEMO — voir §1-2 de la mission « NORMALIZE QUESTION COUNTS »." />
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[11.5px] font-medium uppercase tracking-wide text-text-tertiary">Questions réglementaires confirmées</p>
            <p className="mt-1 text-[22px] font-semibold text-text-primary">{counts.regulatory}</p>
          </div>
          <div>
            <p className="text-[11.5px] font-medium uppercase tracking-wide text-text-tertiary">Questions DEMO / brouillon</p>
            <p className="mt-1 text-[22px] font-semibold text-text-primary">{counts.demo}</p>
          </div>
          <div>
            <p className="text-[11.5px] font-medium uppercase tracking-wide text-text-tertiary">Total enregistré</p>
            <p className="mt-1 text-[22px] font-semibold text-text-primary">{counts.total}</p>
          </div>
        </div>
      </Card>

      {canWrite && (
        <Card>
          <CardHeader
            title="Ajouter une question"
            description={`Saisie contrôlée uniquement — jamais de contenu inventé. Une question non « Confirmé — source DGR vérifiée » n'entre jamais automatiquement dans un examen de production.`}
          />
          <CreateQuestionForm functions={functions} />
        </Card>
      )}

      <Card>
        <form className="flex flex-wrap items-end gap-3" method="get">
          <div>
            <label htmlFor="filterFunctionCode" className="mb-1 block text-[12px] font-medium text-text-secondary">Fonction DGR</label>
            <select id="filterFunctionCode" name="filterFunctionCode" defaultValue={sp.filterFunctionCode ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Toutes</option>
              {functions.map((f) => (<option key={f.code} value={f.code}>{f.label}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="filterQtype" className="mb-1 block text-[12px] font-medium text-text-secondary">Type de question</label>
            <select id="filterQtype" name="filterQtype" defaultValue={sp.filterQtype ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {(Object.keys(QTYPE_LABELS) as QType[]).map((t) => (<option key={t} value={t}>{QTYPE_LABELS[t]}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="filterSourceStatus" className="mb-1 block text-[12px] font-medium text-text-secondary">Statut source</label>
            <select id="filterSourceStatus" name="filterSourceStatus" defaultValue={sp.filterSourceStatus ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {(Object.keys(SOURCE_STATUS_LABELS) as SourceStatus[]).map((s) => (<option key={s} value={s}>{SOURCE_STATUS_LABELS[s]}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="filterReviewerStatus" className="mb-1 block text-[12px] font-medium text-text-secondary">Statut reviewer</label>
            <select id="filterReviewerStatus" name="filterReviewerStatus" defaultValue={sp.filterReviewerStatus ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuvé</option>
              <option value="REJECTED">Rejeté</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterClassification" className="mb-1 block text-[12px] font-medium text-text-secondary">Classification</label>
            <select id="filterClassification" name="filterClassification" defaultValue={sp.filterClassification ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Toutes</option>
              <option value="regulatory">Réglementaire</option>
              <option value="demo">DEMO / brouillon</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterActive" className="mb-1 block text-[12px] font-medium text-text-secondary">Statut</label>
            <select id="filterActive" name="filterActive" defaultValue={sp.filterActive ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="1">Actif</option>
              <option value="0">Inactif</option>
            </select>
          </div>
          <div>
            <label htmlFor="q" className="mb-1 block text-[12px] font-medium text-text-secondary">Recherche</label>
            <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="ID, texte, référence…" className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10">Filtrer</button>
          {hasFilters && (
            <Link href="/question-bank" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser les filtres</Link>
          )}
        </form>
      </Card>

      <Card>
        <CardHeader title={`${questions.length} question(s)`} />
        {questions.length === 0 ? (
          <EmptyState icon={Library} title="Aucune question" description="Aucune question ne correspond à ces filtres." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-subtle text-left text-text-tertiary">
                  <th className="pb-2 pr-3 font-medium">Question</th>
                  <th className="pb-2 pr-3 font-medium">Fonction</th>
                  <th className="pb-2 pr-3 font-medium">Type</th>
                  <th className="pb-2 pr-3 font-medium">Source</th>
                  <th className="pb-2 pr-3 font-medium">Reviewer</th>
                  <th className="pb-2 pr-3 font-medium">Classification</th>
                  <th className="pb-2 pr-3 font-medium">Statut</th>
                  {canWrite && <th className="pb-2 font-medium"></th>}
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-b border-border-subtle last:border-0">
                    <td className="max-w-[320px] py-2 pr-3">
                      <p className="truncate text-text-primary">
                        <span className="font-mono text-[11.5px] text-text-tertiary mr-2">{q.kost_question_id}</span>
                        {q.stem}
                      </p>
                    </td>
                    <td className="py-2 pr-3 text-text-secondary">{q.function_code}</td>
                    <td className="py-2 pr-3 text-text-secondary">{QTYPE_LABELS[q.qtype] ?? q.qtype}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={SOURCE_STATUS_BADGE[q.source_status] ?? "neutral"}>{SOURCE_STATUS_LABELS[q.source_status] ?? q.source_status}</StatusBadge>
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={REVIEWER_STATUS_BADGE[q.reviewer_status] ?? "neutral"}>{REVIEWER_STATUS_LABELS[q.reviewer_status] ?? q.reviewer_status}</StatusBadge>
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={q.is_demo ? "warning" : "verified"}>{q.is_demo ? "DEMO / brouillon" : "Réglementaire"}</StatusBadge>
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={q.active ? "verified" : "neutral"}>{q.active ? "Actif" : "Inactif"}</StatusBadge>
                    </td>
                    {canWrite && (
                      <td className="py-2 text-right">
                        <Link href={`/question-bank/${q.id}/edit`} className="text-[12px] font-medium text-accent-9 hover:underline">Modifier</Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Admissibilité par fonction" description="Nombre de questions RÉGLEMENTAIRES admissibles pour un tirage de production (non affecté par les filtres ci-dessus)." />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {functions.map((fn) => (
            <div key={fn.code} className="rounded-md border border-border-subtle px-3 py-2">
              <p className="text-[12px] text-text-tertiary">{fn.label}</p>
              <p className="text-[15px] font-semibold text-text-primary">{countAdmissibleQuestions(fn.code)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
