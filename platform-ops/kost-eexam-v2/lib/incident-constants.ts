// Constantes partagées client/serveur — pas de dépendance server-only,
// consommées par un composant client (formulaire de déclaration).
export const INCIDENT_TYPES: { value: string; label: string }[] = [
  { value: "login", label: "Connexion" },
  { value: "exam_access", label: "Accès à l'examen" },
  { value: "technical_failure", label: "Panne technique" },
  { value: "question_display", label: "Affichage des questions" },
  { value: "timer", label: "Chronomètre" },
  // "answer_save" (mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF",
  // 2026-08-31 §25) — catégorie candidate-friendly manquante ("Sauvegarde
  // de réponse"), ajoutée ici (liste PARTAGÉE admin/candidat) plutôt que
  // dupliquée : un responsable peut tout aussi bien déclarer ce type.
  { value: "answer_save", label: "Sauvegarde de réponse" },
  { value: "submission", label: "Soumission" },
  { value: "security", label: "Sécurité" },
  { value: "other", label: "Autre" },
];

/** §25 — sous-ensemble candidate-friendly de INCIDENT_TYPES : exclut
 * "exam_access" (ambigu, relève souvent d'une décision admin — accès
 * affecté/fenêtre d'examen, pas un fait que le candidat peut lui-même
 * observer) et "security" (classification de sévérité/cybersécurité —
 * explicitement une responsabilité admin, jamais demandée au candidat,
 * §25 de la mission). Réutilise les MÊMES value/label que INCIDENT_TYPES
 * pour les catégories communes — jamais un second vocabulaire divergent. */
export const CANDIDATE_INCIDENT_TYPES: { value: string; label: string }[] = INCIDENT_TYPES.filter(
  (t) => t.value !== "exam_access" && t.value !== "security"
);
