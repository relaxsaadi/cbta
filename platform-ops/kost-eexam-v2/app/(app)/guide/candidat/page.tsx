import { guardPage } from "@/lib/rbac";
import { Card, CardHeader } from "@/components/ui/Card";
import { GuideSteps } from "../GuideSteps";

export default async function GuideCandidatPage() {
  await guardPage("candidate", "pedagogical_manager", "administrator", "auditor");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Guide — Candidat</h1>
      <Card>
        <CardHeader title="8 étapes" />
        <GuideSteps
          steps={[
            "Se connecter avec votre identifiant et mot de passe.",
            "Voir mes examens — la liste de vos examens affectés apparaît sur cette page.",
            "Ouvrir un examen disponible.",
            "Lire attentivement les instructions (durée, nombre de questions, tentatives).",
            "Cliquer sur « Commencer l'examen » — le chronomètre démarre alors, côté serveur.",
            "Répondre aux questions, naviguer librement, marquer celles à revoir.",
            "Soumettre — manuellement, ou automatiquement si le temps est écoulé.",
            "Voir mon résultat sur « Mes résultats », selon ce que l'examen autorise à afficher.",
          ]}
        />
      </Card>
    </div>
  );
}
