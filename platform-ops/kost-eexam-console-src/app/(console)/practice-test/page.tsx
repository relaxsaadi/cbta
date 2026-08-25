import { GraduationCap } from "lucide-react";
import { getPracticeTest } from "@/lib/practice-test-data";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function PracticeTestPage() {
  const practiceTest = await getPracticeTest();

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Test pratique
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          En direct depuis Moodle Quiz — un vrai quiz séparé, utilisé uniquement pour se familiariser avec l&apos;interface.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-status-warning-border bg-status-warning-bg px-3.5 py-2.5">
        <span className="font-display text-[12.5px] font-semibold text-status-warning-text">
          Entraînement uniquement — ce n&apos;est pas un examen de certification
        </span>
      </div>

      {!practiceTest ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Test pratique non configuré"
            description="Aucun quiz avec le tag « practice-test » n'a été trouvé dans Moodle. Rien n'est affiché ici tant qu'un vrai quiz d'entraînement n'existe pas."
          />
        </Card>
      ) : (
        <Card>
          <CardHeader
            title={practiceTest.name}
            description={`Cours : ${practiceTest.course} — un cours dédié et visible, séparé de tout examen réglementaire.`}
          />
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 border-t border-border-subtle pt-4">
            <Field label="Durée" value={`${practiceTest.durationMinutes} min`} />
            <Field label="Questions" value={String(practiceTest.numQuestions)} />
            <Field label="Types de questions" value={practiceTest.questionTypes.join(", ") || "—"} />
            <Field
              label="Tentatives autorisées"
              value={practiceTest.attemptsAllowed === Infinity ? "Illimitées" : String(practiceTest.attemptsAllowed)}
            />
            <Field label="Réponses mélangées" value={practiceTest.shuffleAnswers ? "Oui" : "Non"} />
          </div>

          <div className="mt-4 flex gap-2 border-t border-border-subtle pt-3.5">
            <a
              href={`https://exam.kostacademy.com/mod/quiz/view.php?id=${practiceTest.cmid}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10 transition-colors"
            >
              Démarrer le test pratique
            </a>
          </div>
          <p className="mt-3 text-[11.5px] text-text-tertiary">
            Contient uniquement des questions génériques (navigation dans l&apos;interface, sélection de
            réponse, comportement du chronomètre) — aucun contenu réglementaire DGR. La catégorie de
            questions est gardée structurellement séparée des catégories de questions de l&apos;examen réel.
          </p>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-text-primary tabular-nums">{value}</p>
    </div>
  );
}
