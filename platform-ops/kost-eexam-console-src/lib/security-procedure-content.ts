// Contenu structuré du document versionné docs/SECURITY_INCIDENT_RESPONSE_PROCEDURE.md
// — dupliqué ici en constante TS pour un rendu in-app fiable sans dépendre
// d'un parseur Markdown ni de la présence du fichier au runtime Docker.
// Toute modification doit être répercutée dans les deux fichiers.
export const SECURITY_PROCEDURE_META = {
  version: "1.0",
  effectiveDate: "2026-08-20",
  owner: "KOST Academy — Administration de la plateforme",
};

export const SECURITY_PROCEDURE_SECTIONS: { title: string; body: string }[] = [
  {
    title: "Objet",
    body: "Définit comment KOST E-EXAM détecte, contient, investigue et se rétablit d'un incident de sécurité, et comment il est signalé ensuite. Ce document ne certifie pas que la plateforme est exempte de vulnérabilités — il définit le processus de réponse pour le jour où l'une d'elles est découverte ou exploitée.",
  },
  {
    title: "Périmètre",
    body: "S'applique à la console Next.js, au moteur d'examen Moodle, à l'infrastructure VPS sous-jacente (Docker, MySQL, Nginx) et à toute donnée KOST E-EXAM. Exclut les systèmes corporate de KOST Group sans rapport avec la plateforme.",
  },
  {
    title: "Rôles & responsabilités",
    body: "L'Administrateur de la plateforme déclare l'incident et pilote la réponse. Le Responsable d'examen évalue l'impact sur les sessions d'examen. L'Administrateur technique exécute le confinement/rétablissement. La Direction est informée des incidents Élevé/Critique. Des rôles, pas des personnes nommées.",
  },
  {
    title: "Niveaux de gravité",
    body: "Faible : aucun impact sur les données candidat ni l'intégrité des examens. Moyen : impact limité et contenu. Élevé : données candidat ou intégrité des examens en risque. Critique : violation active ou intégrité des examens compromise.",
  },
  {
    title: "1. Détection",
    body: "Via la surveillance (journaux Nginx/application, journal d'audit Moodle, alertes de vérification des sauvegardes), un signalement du personnel, ou un signalement candidat/instructeur.",
  },
  {
    title: "2. Évaluation initiale",
    body: "L'Administrateur de la plateforme confirme s'il s'agit d'un incident réel et assigne un niveau de gravité préliminaire.",
  },
  {
    title: "3. Classification de l'incident",
    body: "Confirmer le périmètre (systèmes/comptes/données concernés), assigner la gravité finale, ouvrir un identifiant d'incident.",
  },
  {
    title: "4. Confinement",
    body: "Limiter l'impact en cours avec l'action minimale qui arrête l'incident — désactiver le(s) compte(s) concerné(s), restreindre l'accès réseau, ou mettre en pause le service concerné — pas un arrêt général sauf nécessité.",
  },
  {
    title: "5. Préservation des preuves",
    body: "Avant toute remédiation : capturer les journaux Nginx, les journaux applicatifs, les événements d'audit Moodle, les pistes d'audit des incidents/vérifications de la console, les horodatages, le(s) utilisateur(s) concerné(s), l'examen/la session affecté(e) et les données IP/appareil disponibles. Stocké en dehors du système affecté.",
  },
  {
    title: "6. Révocation de comptes / identifiants",
    body: "Faire tourner ou révoquer tout identifiant potentiellement exposé — mot de passe du compte Moodle, jetons de service, mots de passe de base de données, clés SSH.",
  },
  {
    title: "7. Isolation du service",
    body: "Sortir le composant affecté du réseau Docker partagé ou le bloquer au niveau Nginx si le confinement l'exige, sans perturber inutilement les services non affectés.",
  },
  {
    title: "8. Investigation",
    body: "Déterminer la cause racine à partir des preuves préservées.",
  },
  {
    title: "9. Rétablissement",
    body: "Restaurer le(s) service(s) affecté(s) depuis un état sain connu (sauvegarde vérifiée si des données ont été touchées), réémettre les identifiants, réactiver les comptes une fois la situation sûre.",
  },
  {
    title: "10. Validation",
    body: "Confirmer que la vulnérabilité/exposition est fermée et que le service restauré se comporte correctement (test de fumée) avant de déclarer le rétablissement terminé.",
  },
  {
    title: "11. Clôture de l'incident",
    body: "L'Administrateur de la plateforme clôture formellement l'incident une fois la validation réussie.",
  },
  {
    title: "12. Actions correctives / préventives",
    body: "Un suivi concret (correctif, changement de configuration, surveillance ajoutée) est suivi jusqu'à son achèvement, jamais laissé ouvert indéfiniment.",
  },
  {
    title: "Escalade",
    body: "Administrateur technique → Administrateur de la plateforme → Direction, selon la gravité. Élevé/Critique remonte immédiatement à la Direction dès la classification.",
  },
  {
    title: "Revue post-incident",
    body: "Tout incident de niveau Moyen ou supérieur produit un enregistrement avec : identifiant de l'incident, résumé, cause racine, actions prises, rétablissement, action préventive, date de clôture.",
  },
];
