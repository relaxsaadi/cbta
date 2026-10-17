# Checklist rapide — Démo Audit ANAC (26/08/2026)

*Garder cette page ouverte pendant l'audit. Détails complets et phrases exactes : `docs/SCRIPT_DEMO_AUDIT_ANAC.md`.*

**⚠️ 3 rappels absolus :** (1) jamais dire « accrédité par l'ANAC » — l'accord est en cours ; (2) la checklist ANAC est une **checklist KOST**, pas un document ANAC officiel ; (3) seuls **Administrateur** et **Auditeur** sont des rôles réels — pas « instructeur »/« exam manager ».

| # | ÉTAPE | ÉCRAN | ACTION | MESSAGE À DIRE | PREUVE |
|---|---|---|---|---|---|
| 1 | Vue générale | console → **Overview** | Se connecter (admin), activer « Presentation » (bouton en haut) | « Environnement de production réel, mode présentation activé pour masquer les identités réelles à l'écran » | Connexion Moodle réelle, chiffres calculés en direct |
| 2 | Architecture | **System** | Montrer tuiles infra | « Serveur Algérie (Hostarts), Docker, HTTPS valide, BDD non publique » | Vérifications réseau/TLS en direct |
| 3 | Parcours candidat | `exam.kostacademy.com` → login `anac_demo_candidat` | Login → intro → démarrer → répondre 1-2 q. → flag → aller à la dernière → soumettre → confirmer | « Voici le parcours candidat réel, sur un examen et un compte de démonstration clairement marqués » | Tentative réelle horodatée en base |
| 4 | Parcours admin | **Exam Preparation** puis **Identity Verification** | Montrer paramètres examen ; enregistrer une vérification d'identité | « Seuls admin/auditeur existent réellement — pas d'instructeur fonctionnel aujourd'hui » | Table append-only, non modifiable après coup |
| 5 | Sessions | **Sessions** | Montrer fenêtres ouverture/fermeture | « Dérivé directement des réglages Moodle, pas de saisie séparée » | Lecture live Moodle |
| 6 | Monitoring | **Sessions** + **Results** | Préciser qu'il n'y a pas de page « Monitoring » séparée | « Le suivi se fait via Sessions + Results, pas un module dédié » | Honnêteté sur la limite |
| 7 | Résultats | **Results** | Montrer la tentative du candidat démo tout en haut | « La note que vous voyez est celle de la tentative que je viens de faire, calculée uniquement par Moodle » | Grade lu depuis `mdl_grade_grades` |
| 8 | Rapports | **Reports** | Montrer taux de réussite, score moyen, filtre par Fonction DGR | « Recalculé en direct à partir des mêmes vraies tentatives » | Agrégats live |
| 9 | Audit & Compliance | **Audit & Compliance** | Montrer bandeau 30 exigences (Vérifié/Partiel), Centre de preuves | « Rien n'est marqué Vérifié sans preuve technique réelle » | Requêtes DB/tests réels par ligne |
| 10 | ANAC Checklist | **ANAC Checklist** | Montrer bandeau d'avertissement + tableau | « Ce n'est PAS un document ANAC officiel — c'est notre checklist KOST de préparation, mappée aux catégories d'audit habituelles » | Export PDF disponible (bouton en haut) |
| 11 | Evidence Pack | **Evidence Pack** | Montrer groupes de preuves | « Même données que Audit & Compliance, format imprimable, sans aucun secret » | Export PDF disponible |
| 12 | Sécurité | **Security Procedure** | Montrer procédure d'incident v1.0 | « HTTPS partout, BDD jamais publique, SSH par clé, cookies sécurisés » | Document versionné + vérifs réseau |
| 13 | Journaux d'audit | **Audit Logs** | Montrer volume d'événements + filtres | « Journal natif Moodle, consultation en lecture seule uniquement » | `mdl_logstore_standard_log`, continu |
| 14 | Sauvegardes | **System** / carte Backups | Montrer date dernière sauvegarde + copie hors-site | « Sauvegarde complète chaque nuit + copie chiffrée hors du serveur » | Journal horodaté avec checksums |
| 15 | Test de restauration | carte **Restore Test** | Montrer résultat du test du jour même | « Restauration testée aujourd'hui même : 491/491 tables, 9 comptes, archive intègre » | Test réel dans conteneur isolé, jamais en production |

---

## Points « Partiel » à assumer sans détour si posés en question

- **Compatibilité OS :** testé macOS + Linux seulement, pas de test Windows natif.
- **Contenu réglementaire de la banque de questions :** seules des questions de démonstration existent en production ; le contenu DGR officiel est en vérification séparée, pas encore chargé.
- **Cycle complet créer/modifier/supprimer un examen :** fait réellement dans Moodle par l'équipe KOST ; démonstration automatisée bloquée par un bug confirmé de Moodle 5.0.1 lui-même (pas contourné par un raccourci non fiable).
- **Accord d'audit ANAC :** en cours, pas encore formalisé — point contractuel externe, pas technique.

## À la fin

Proposer l'export PDF de l'ANAC Checklist et/ou de l'Evidence Pack à l'auditeur (bouton « Print / Export PDF »).
