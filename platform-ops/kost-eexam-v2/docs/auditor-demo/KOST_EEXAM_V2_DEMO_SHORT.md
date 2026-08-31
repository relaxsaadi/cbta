# KOST E-EXAM V2 — Séquence de présentation live (≈25 minutes)

Séquence resserrée pour une présentation en direct à un auditeur, construite à partir des 33 captures réelles du dossier complet (`KOST_EEXAM_V2_DEMO_FULL.md`) + des preuves responsive (`RESPONSIVE_EVIDENCE.md`). Chaque capture ci-dessous reste un écran réel de https://staging.kostacademy.com — rien n'est simulé.

> **À dire explicitement en ouverture :** cette démonstration prouve la plateforme **technique** — authentification, cycle de vie candidat, 8 types de question, notation, email, sécurité, audit. Elle ne prouve ni ne remplace la revue réglementaire humaine du contenu. `CONFIRMÉ — SOURCE DGR VÉRIFIÉE` (texte source vérifié) est un champ distinct de `REVU/APPROUVÉ PAR UN RÉVISEUR QUALIFIÉ` (revue humaine, en cours pour les 244 questions — voir `docs/DGR_SOURCE_REGISTER.md`). Aucune accréditation ANAC ni approbation IATA du logiciel n'est affirmée ici.

**Complétude vérifiée le 2026-08-31** (mission "FINAL AUDITOR PACK COMPLETENESS AUDIT") face à la checklist de couverture attendue : accès par rôle, clients, gestion utilisateurs, banque de questions (244+8), préparation d'examen, cycle de vie candidat, aperçu candidat, moteur d'examen moderne, autosave, revue finale/soumission, correction manuelle, résultat, notifications/audit, rôle auditeur en lecture seule. Chaque point a désormais une capture dédiée ci-dessous (sections 3bis, 4bis, 5bis, 8bis ajoutées).

---

## 1. Connexion et tableau de bord (≈2 min)

**`01-login.png`** — Écran de connexion unique, 4 rôles distincts.
**`02-admin-dashboard.png`** — Tableau de bord administrateur, KPI scopés Production, examens récents avec leur scope explicite (Démo/Production).

*À dire :* « Chaque examen porte un scope explicite — jamais de confusion entre données de test et données réelles. »

## 2. Création de compte et sécurité mot de passe (≈2 min)

**`04-create-user.png`** — Création d'un candidat : « Aucun mot de passe n'est jamais saisi ici — activation par lien sécurisé. »

*À dire :* « L'administrateur ne connaît jamais le mot de passe d'un candidat. »

## 3. Banque de questions et statut source (≈3 min)

**`07-question-bank.png`** — Compteurs explicites (244 réglementaires confirmées / 8 DEMO-brouillon / 252 au total), formulaire de saisie contrôlée, bandeau explicite sur l'admissibilité, filtres (Fonction/Type/Statut/Classification/Recherche).

*À dire :* « Une question non confirmée côté source ne peut structurellement jamais entrer dans un examen de production — c'est vérifié côté serveur, pas seulement affiché. » *(Point à approfondir si l'auditeur pose la question : montrer la distinction source vérifiée / revue humaine.)*

## 3bis. Préparation d'examen — filtres et actions rapides (≈2 min)

**`10b-exam-management-filters.png`** — Panneau de filtres complet (Client/Groupe/Fonction/Statut/Type/Date) + actions rapides par ligne (Prévisualiser comme candidat, Voir les résultats).
**`11-published-exam.png`** — Fiche d'un examen publié : suivi candidats, suspension/clôture, reprogrammation, lien direct vers l'aperçu candidat.

*À dire :* « Un responsable retrouve n'importe quel examen en quelques clics, et peut voir ce qu'un candidat verra AVANT que le premier candidat ne se connecte. »

## 4. Aperçu candidat — sans jamais toucher un vrai historique (≈2 min)

**`32-candidate-preview-mode.png`** — Mode Aperçu candidat : bannière « MODE APERÇU — aucune action ne sera enregistrée dans l'historique du candidat ».

*À dire :* « Un responsable peut prévisualiser l'examen exactement comme un candidat le verrait — sans jamais créer de vraie tentative ni toucher l'historique de qui que ce soit. Structurellement impossible d'écrire en base depuis cet écran. »

## 5. Examen en cours — moteur moderne (≈3 min)

**`15-exam-in-progress.png`** — Chronomètre serveur circulaire en décompte réel, barre de progression, type Vrai/Faux.
**`17-matching-ordering.png`** — Type Ordering/Séquence, entièrement accessible clavier.

*À dire :* « Le chronomètre est géré côté serveur — fermer l'onglet ne l'arrête pas. Les types récents (Appariement, Ordering, Scénario) sont accessibles sans souris. »

## 5bis. Revue finale et soumission (≈2 min)

**`20-final-review.png`** — Résumé avant envoi : 4 indicateurs (répondues/sans réponse/à revoir/temps restant), jamais de soumission accidentelle sans confirmation.
**`21-submission-confirmation.png`** — Confirmation de soumission : statut « en attente de correction » explicite, jamais un score affiché avant notation réelle.

*À dire :* « Le candidat voit un résumé complet avant d'envoyer, et une confirmation claire après — jamais une soumission silencieuse ni un score prématuré. »

## 6. Continuité — autosave et reprise (≈2 min)

**`19-resume-autosave.png`** — Badge « EN COURS » / « Reprendre l'examen » après une interruption complète de session.

*À dire :* « Rien n'est perdu si la connexion tombe — le candidat reprend exactement où il était. »

## 7. Jamais de résultat prématuré (≈3 min)

**`22-in-progress-admin-view.png`** — Vue administrateur filtrée par Statut : une tentative « En cours » n'affiche ni score ni résultat.
**`23-manual-grading.png`** — File de correction manuelle filtrable ; compteur global cohérent avec le détail par type (réponses courtes / scénarios).

*À dire :* « Un score n'apparaît jamais avant que la notation — automatique ou manuelle — soit réellement terminée, nulle part dans l'application. »

## 8. Résultat final (≈2 min)

**`24-final-result.png`** — Résultat final du candidat, export PDF disponible.

*À dire :* « Le résultat final est calculé une fois, à partir d'un instantané figé de la tentative — jamais recalculé à la volée. »

## 8bis. Notifications et journal d'audit (≈2 min)

**`26-email-history.png`** — Historique de livraison email : statut de livraison seul, jamais le contenu, filtrable.
**`28-audit-log.png`** — Journal d'audit insert-only, filtrable par date/acteur/rôle/action.

*À dire :* « Chaque envoi et chaque action significative laisse une trace, jamais modifiable — même par un administrateur. »

## 9. Auditeur et isolation (≈3 min)

**`30-auditor-role.png`** — Rôle auditeur : mêmes données filtrées, aucune action d'écriture visible.
**`31-tenant-isolation.png`** — Clients (Entreprise/Particulier unifiés) avec filtres, isolation multi-tenant : plusieurs clients côte à côte, jamais de données mélangées.

*À dire :* « Le rôle auditeur a un accès en lecture seule appliqué au niveau serveur, pas seulement dans l'interface — et voit l'isolation entre tenants, qu'aucun autre rôle à périmètre restreint ne peut franchir. »

---

## Si le temps manque encore — cœur absolu (≈8 min)

`01` → `02` → `07` → `15` → `22` → `30` — connexion, tableau de bord, admissibilité des questions, examen en cours, jamais de résultat prématuré, rôle auditeur en lecture seule. C'est le socle minimal qu'une revue de plateforme demande à voir.

---

*Pour la version interactive live (cliquer réellement dans l'application plutôt que montrer des captures), voir `docs/KOST_EEXAM_V2_LIVE_DEMO_CHECKLIST.md`. Pour le dossier de référence complet des captures, voir `KOST_EEXAM_V2_DEMONSTRATION_SCREENSHOTS.md`, `KOST_EEXAM_V2_DEMO_FULL.md` et `RESPONSIVE_EVIDENCE.md` (mobile/tablette).*
