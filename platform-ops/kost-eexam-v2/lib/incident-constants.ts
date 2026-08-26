// Constantes partagées client/serveur — pas de dépendance server-only,
// consommées par un composant client (formulaire de déclaration).
export const INCIDENT_TYPES: { value: string; label: string }[] = [
  { value: "login", label: "Connexion" },
  { value: "exam_access", label: "Accès à l'examen" },
  { value: "technical_failure", label: "Panne technique" },
  { value: "question_display", label: "Affichage des questions" },
  { value: "timer", label: "Chronomètre" },
  { value: "submission", label: "Soumission" },
  { value: "security", label: "Sécurité" },
  { value: "other", label: "Autre" },
];
