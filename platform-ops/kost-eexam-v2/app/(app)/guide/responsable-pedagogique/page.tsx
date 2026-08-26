import { guardPage } from "@/lib/rbac";
import { Card, CardHeader } from "@/components/ui/Card";
import { GuideSteps } from "../GuideSteps";

export default async function GuideResponsablePage() {
  await guardPage("pedagogical_manager", "administrator", "auditor");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Guide — Responsable pédagogique</h1>
      <Card>
        <CardHeader title="12 étapes — de la création du client à l'export" />
        <GuideSteps
          steps={[
            "Créer le client (page Clients).",
            "Créer un groupe pour ce client (page Groupes).",
            "Ajouter les candidats au groupe.",
            "Choisir la fonction DGR concernée.",
            "Créer l'évaluation (Préparation des examens) — type Exercice / Test / Examen.",
            "Vérifier le nombre de questions admissibles disponibles avant de fixer le nombre à tirer.",
            "Définir la durée et le seuil de réussite.",
            "Publier — les questions sont figées définitivement pour cet examen à cet instant.",
            "Suivre les candidats depuis la fiche de l'évaluation (non commencé / en cours / terminé).",
            "Consulter les résultats.",
            "Cliquer sur un candidat pour voir le détail question par question.",
            "Exporter les résultats en CSV.",
          ]}
        />
      </Card>
    </div>
  );
}
