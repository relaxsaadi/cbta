// Traduction d'affichage uniquement — les clés anglaises (`requirement`,
// nom de catégorie) restent inchangées dans lib/compliance-data.ts car
// elles servent de clé de correspondance (`.find(...)`) entre
// /audit-compliance, /audit-readiness, /evidence-pack et /anac-checklist.
// Modifier ces clés casserait ces correspondances silencieusement. Cette
// table ne fait que déterminer ce qui s'affiche à l'écran.
const CATEGORY_LABELS_FR: Record<string, string> = {
  Accessibility: "Accessibilité",
  Security: "Sécurité",
  "Question Bank": "Banque de questions",
  "Exam Management": "Gestion des examens",
  Performance: "Performance",
  "Reports & Analytics": "Rapports & analytique",
  "Regulatory Compliance": "Conformité réglementaire",
  "Training & Preparation": "Formation & préparation",
  Feedback: "Retours",
};

const REQUIREMENT_LABELS_FR: Record<string, string> = {
  "Secure access to the platform (HTTPS)": "Accès sécurisé à la plateforme (HTTPS)",
  "Cross-browser compatibility": "Compatibilité multi-navigateurs",
  "OS compatibility": "Compatibilité multi-systèmes d'exploitation",
  "Online help / support resources": "Ressources d'aide et de support en ligne",
  "Account and role management": "Gestion des comptes et des rôles",
  "Data encryption in transit": "Chiffrement des données en transit",
  "Candidate identity verification": "Vérification d'identité des candidats",
  "Security incident / breach protocol": "Protocole d'incident de sécurité / violation",
  "Technical incident reporting mechanism": "Mécanisme de signalement d'incidents techniques",
  "Automated, verified backups": "Sauvegardes automatisées et vérifiées",
  "Server stability and security hardening": "Stabilité serveur et durcissement sécurité",
  "Module-separated question categories (Sécurité et Sauvetage / Secourisme)":
    "Catégories de questions séparées par module (Sécurité et Sauvetage / Secourisme)",
  "Question bank populated with regulatory content": "Banque de questions alimentée en contenu réglementaire",
  "Randomized question selection / shuffled answers": "Sélection aléatoire des questions / réponses mélangées",
  "Multiple question types (MCQ, True/False, open)": "Plusieurs types de questions (QCM, Vrai/Faux, réponse libre)",
  "Exam creation, modification, deletion": "Création, modification, suppression d'examens",
  "Timer and automatic submission": "Chronomètre et envoi automatique",
  "Session scheduling and management": "Planification et gestion des sessions",
  "Results validation workflow": "Flux de validation des résultats",
  "Concurrent user load testing": "Test de charge en utilisateurs simultanés",
  "Response time under load": "Temps de réponse sous charge",
  "Exam results reporting": "Rapport des résultats d'examen",
  "Audit trail / activity logs": "Piste d'audit / journaux d'activité",
  "Legal basis for mandatory DGR training documented": "Base légale de la formation DGR obligatoire documentée",
  "IATA CBTA Provider accreditation": "Accréditation IATA en tant que Provider CBTA",
  "ANAC platform audit agreement": "Accord d'audit de la plateforme avec l'ANAC",
  "Instructor and candidate documentation": "Documentation instructeur et candidat",
  "Practice test availability": "Disponibilité du test pratique",
  "Feedback collection mechanism": "Mécanisme de collecte des retours",
  "Administrator feedback review": "Revue des retours par l'administrateur",
};

export function trCat(name: string): string {
  return CATEGORY_LABELS_FR[name] ?? name;
}

export function trReq(requirement: string): string {
  return REQUIREMENT_LABELS_FR[requirement] ?? requirement;
}
