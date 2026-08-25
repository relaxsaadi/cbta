import { Library } from "lucide-react";
import { getQuestions } from "@/lib/question-bank-data";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { QuestionBankTable } from "./QuestionBankTable";

export const dynamic = "force-dynamic";

export default async function QuestionBankPage() {
  const questions = await getQuestions();
  const productionCount = questions.filter((q) => q.scope === "production").length;

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Banque de questions</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          En direct depuis Moodle — {questions.length} question{questions.length !== 1 ? "s" : ""} au total, toutes catégories confondues
        </p>
      </div>

      {questions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Library}
            title="Aucune question créée"
            description="Les questions apparaissent ici dès qu'elles existent dans une catégorie Moodle."
          />
        </Card>
      ) : (
        <>
          <div className="rounded-md border border-status-warning-border bg-status-warning-bg px-3.5 py-2.5 text-[12px] text-status-warning-text">
            {productionCount === 0 ? (
              <>
                Situation réelle actuelle : <strong>aucune des {questions.length} questions de cette banque n&apos;est un
                contenu réglementaire DGR de production.</strong> Elles se répartissent en questions d&apos;échantillon
                technique (catégorie « Secourisme », utilisées pour valider la plateforme), questions d&apos;entraînement
                à l&apos;interface (« Practice / Training ») et questions de démonstration ANAC (« ANAC Demo — Procédural
                (Fictif) »). C&apos;est pour cette raison que les filtres Function 7.1 à 7.10 ci-dessous affichent tous 0 —
                ce n&apos;est pas une erreur d&apos;affichage : la banque de questions DGR de production (rédigée, en cours
                de vérification Tier A/Tier B — voir le programme DGR séparé) n&apos;a pas encore été chargée dans Moodle.
                Aucune classification Function 7.X n&apos;est appliquée artificiellement pour masquer cet état.
              </>
            ) : (
              <>
                {productionCount} question{productionCount !== 1 ? "s" : ""} classée{productionCount !== 1 ? "s" : ""} en
                production sur {questions.length} au total — les autres sont des questions de démonstration ou
                d&apos;entraînement (badge « Démo » / « Entraînement » dans le tableau).
              </>
            )}
          </div>
          <QuestionBankTable questions={questions} />
        </>
      )}
    </div>
  );
}
