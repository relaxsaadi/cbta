# KOST E-EXAM V2 — Parcours complet de démonstration (33 captures)

Document de sauvegarde documentaire — la même démonstration que `KOST_EEXAM_V2_DEMO_SHORT.md`, mais sans rien omettre : les captures dans l'ordre naturel d'un parcours complet (administrateur → responsable pédagogique → candidat → administrateur → auditeur). À utiliser comme document à laisser à l'auditeur, ou comme trace complète si la présentation live a dû être écourtée.

Pour le détail complet par capture (ce que dit le propriétaire, point de conformité, ce qu'il ne faut pas prétendre), voir `KOST_EEXAM_V2_DEMONSTRATION_SCREENSHOTS.md`. Pour l'index tabulaire, voir `SCREENSHOT_INDEX.md`. Pour les preuves mobile/tablette, voir `RESPONSIVE_EVIDENCE.md`.

> **Rappel permanent :** `CONFIRMÉ — SOURCE DGR VÉRIFIÉE` ≠ `REVU/APPROUVÉ PAR UN RÉVISEUR QUALIFIÉ`. Ce dossier démontre la plateforme technique, pas la revue réglementaire du contenu ni une accréditation ANAC/IATA.

---

### Partie 1 — Comptes et administration

**§1. Connexion** (`01-login.png`)
Écran de connexion unique pour les 4 rôles (candidat, responsable pédagogique, administrateur, auditeur), identité produit propre.

**§2. Tableau de bord administrateur** (`02-admin-dashboard.png`)
KPI scopés Production, dernières évaluations avec leur scope (Démo/Production) explicite.

**§3. Répertoire utilisateurs** (`03-users-directory.png`)
33 comptes, filtrables par type/client/groupe/fonction/statut/rôle, colonne MFA visible.

**§4. Création — Particulier** (`04-create-user.png`)
Aucun mot de passe saisi par l'administrateur ; activation par lien sécurisé.

**§5. Création — Entreprise** (`05-company-group-assignment.png`)
Affectation client + groupe + fonctions DGR dès la création.

**§6. Fiche candidat** (`06-user-detail.png`)
Identité, affectation, fonctions DGR centralisées sur une seule fiche.

### Partie 2 — Banque de questions

**§7. Ajout de question — statut source, compteurs, filtres** (`07-question-bank.png`)
Compteurs explicites en tête de page (244 réglementaires confirmées / 8 DEMO-brouillon / 252 au total — jamais un total unique présenté comme réglementaire), porte d'admissibilité expliquée à l'écran, panneau de filtres complet (Fonction/Type/Statut source/Statut reviewer/Classification/Statut/Recherche).

**§8. Modification — versionnement immuable** (`08-question-detail.png`)
Éditer une question crée une nouvelle version ; les examens déjà publiés restent figés.

**§9. Type Cas pratique / scénario** (`09-eight-question-types.png`)
Le plus riche des 8 types : contexte unique + sous-questions de tout type.

### Partie 3 — Préparation d'examen

**§10. Constructeur d'examen** (`10-exam-builder.png`)
12 étapes, compteur de questions admissibles avant publication.

**§10bis. Filtres et actions rapides** (`10b-exam-management-filters.png`)
Panneau de filtres (Client/Groupe/Fonction/Statut/Type/Date) et actions rapides par ligne (Prévisualiser comme candidat, Voir les résultats), sous le formulaire de création sur la même page.

**§11. Examen publié** (`11-published-exam.png`)
Récapitulatif, actions Suspendre/Clôturer, suivi des candidats affectés, lien « Prévisualiser comme candidat ».

**§12. Reprogrammation** (`12-reschedule.png`)
Changement de fenêtre bloqué si une tentative est en cours ; notification automatique aux candidats affectés.

### Partie 3bis — Aperçu candidat (sans jamais toucher un vrai historique)

**§NOUVEAU. Mode Aperçu** (`32-candidate-preview-mode.png`)
Bannière « MODE APERÇU — aucune action ne sera enregistrée dans l'historique du candidat » ; composant séparé du moteur réel, aucune action serveur importée — structurellement incapable d'écrire une tentative.

### Partie 4 — Parcours candidat complet

**§13. Tableau de bord candidat** (`13-candidate-dashboard.png`)
Examens affectés avec statut individuel sans ambiguïté.

**§14. Instructions** (`14-exam-instructions.png`)
Règles explicites : chronomètre serveur, soumission automatique à expiration.

**§15. Examen en cours — Vrai/Faux** (`15-exam-in-progress.png`)
Chronomètre en décompte réel, navigation libre entre questions.

**§16. QCM plusieurs réponses** (`16-vrai-faux-qcm.png`)
Autosave immédiat par question (indicateur « Enregistré »).

**§17. Ordering / Séquence** (`17-matching-ordering.png`)
Boutons Monter/Descendre — accessible clavier, jamais de glisser-déposer obligatoire.

**§18. Cas pratique / scénario** (`18-scenario.png`)
Contexte unique, sous-questions QCM + réponse courte.

**§19. Reprise après interruption** (`19-resume-autosave.png`)
Badge « EN COURS » / « Reprendre l'examen » — preuve d'autosave serveur après fermeture complète de session.

**§20. Révision finale** (`20-final-review.png`)
Résumé avant envoi : réponses données, sans réponse, marquées à revoir.

**§21. Confirmation de soumission** (`21-submission-confirmation.png`)
Statut « en attente de correction » — jamais un score affiché avant correction.

### Partie 5 — Suivi, correction, résultats

**§22. Vue admin — tentative en cours** (`22-in-progress-admin-view.png`)
Une tentative « En cours » n'affiche jamais de score ni de résultat, nulle part.

**§23. File de correction manuelle** (`23-manual-grading.png`)
File dédiée aux réponses à correction manuelle, distincte de la notation automatique.

**§24. Résultat final candidat** (`24-final-result.png`)
Score, statut de réussite, export PDF disponible.

**§25. Export PDF** (`25-report-export.png`)
Rapport individuel réel généré côté serveur.

### Partie 6 — Email, communications, audit, sécurité

**§26. Historique de livraison email** (`26-email-history.png`)
Statut de livraison uniquement, jamais le contenu ; `EMAIL_MODE=allowlist` démontré en conditions réelles.

**§27. Communications et actions compte** (`27-user-communication.png`)
Historique de statut de livraison, actions administratives, blocage motivé de la suppression définitive.

**§28. Journal d'audit — filtrable** (`28-audit-log.png`)
300 événements, insert-only — aucune modification possible même par un administrateur. Filtrable par date, acteur, rôle et action (valeurs réellement observées uniquement).

**§29. Sécurité — MFA** (`29-mfa-security.png`)
Authentification à deux facteurs TOTP standard disponible pour les comptes à privilèges.

### Partie 7 — Rôle auditeur

**§30. Rôle auditeur — lecture seule** (`30-auditor-role.png`)
Mêmes données que l'administrateur sur son périmètre, aucune action d'écriture possible (UI et serveur).

**§31. Isolation multi-tenant** (`31-tenant-isolation.png`)
6 tenants distincts, scopes explicites, jamais de données mélangées entre clients.

---

**Fin du parcours — 33/33 captures réelles** (31 numérotées + §10bis + §NOUVEAU aperçu candidat), plus 4 preuves responsive dans `RESPONSIVE_EVIDENCE.md`. Voir `SCREENSHOT_INDEX.md` pour le détail des corrections de confidentialité et des rafraîchissements appliqués avant publication de ce dossier (captures 11, 12, 15-18, 20, 22, 23, 26, 30, 31 — voir la colonne Notes).
