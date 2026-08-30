# KOST E-EXAM V2 — Checklist démo live auditeur

**URL :** https://staging.kostacademy.com
**Date de cette actualisation :** 2026-08-30 (mission "MISSION DE FERMETURE — CLEAR REMAINING P2 BEFORE AUDITOR DEMO")

> **Cette checklist était périmée.** La version précédente (2026-08-27) ne couvrait ni les 3 types de question ajoutés depuis (Appariement/Ordre-séquence/Cas pratique — 8 types désormais supportés), ni la réinitialisation MFA administrateur, ni la politique de précédence des webhooks email. Réécrite pour refléter la plateforme actuelle.

Chaque ligne = une preuve concrète à observer réellement à l'écran, pas une explication à réciter. Cocher au fur et à mesure.

## ⚠️ Ce que cette démo NE prouve PAS — à dire explicitement si le sujet vient

- **SOURCE VERIFIED ≠ HUMAN REVIEWED / APPROVED.** Les 244 questions de la banque portent `source_status = FROZEN_SOURCE_VERIFIED` (le texte réglementaire source — IATA DGR 67e édition 2026, Addendum 1 intégré — a été vérifié/figé) et `reviewer_status = PENDING` pour la totalité des 244 (aucune n'a encore de réviseur qualifié nommé + date de révision — voir le registre de sources de la revalidation question-bank, `docs/DGR_SOURCE_REGISTER.md` dans le dépôt racine du projet, distinct de ce sous-projet plateforme). **Ne jamais dire "ces questions sont approuvées".**
- **Aucune accréditation ANAC n'est affirmée par cette démo.** Statut d'accréditation : hors périmètre de cette checklist — vérifier l'état réel à la date de la démo auprès du propriétaire avant toute déclaration à l'auditeur, jamais présumé ici.
- **Aucune approbation IATA au-delà de ce qui est réellement démontré** (le centre est un centre CBTA IATA certifié — un fait déjà établi indépendamment de cette plateforme logicielle, jamais à confondre avec une validation IATA du LOGICIEL lui-même).
- Cette démo prouve la plateforme TECHNIQUE — authentification, cycle de vie candidat, 8 types de question, notation, email, sécurité, audit. Elle ne prouve ni ne remplace la revue réglementaire humaine du contenu.

---

## 1. ACCOUNT / USER (≈4 min)

| # | Étape | Preuve à observer |
|---|---|---|
| 1 | Connexion candidat | `candidat1.staging` → landing sur « Mes examens » |
| 2 | Connexion administrateur | `admin.staging` → « Vue d'ensemble » |
| 3 | Créer un candidat **Particulier** | `/users/nouveau` → sans client/groupe → « Créer sans envoyer maintenant » → statut « En attente d'activation » visible sur la fiche |
| 4 | Créer un candidat **Entreprise** | Via « + Nouveau client » / « + Nouveau groupe » depuis la fiche → affecter une fonction DGR → « Envoyer l'invitation » |
| 5 | Activation par jeton | Lien d'activation (capturé en environnement de test) → le candidat choisit lui-même son mot de passe → **jamais un mot de passe envoyé par email** |
| 6 | Identifiant de connexion | Fiche candidat → « Copier l'identifiant » → changer l'identifiant → ancien immédiatement réutilisable |
| 7 | Affectation client/groupe/fonction | Fiche candidat → « Affecter à une entreprise » → client + groupe choisis → fonction(s) DGR affectée(s), plusieurs simultanément supportées |
| 8 | Suspendre / réactiver | « Suspendre » → tentative de connexion avec ce compte → refus visible → « Réactiver » → connexion réussie |
| 9 | Archiver / restaurer | « Archiver » → statut « Archivé », connexion structurellement refusée → « Restaurer » → statut correct restauré (jamais silencieusement « actif » si jamais activé) |
| 10 | Suppression définitive — bloquée | Candidat avec historique d'examen → « Supprimer définitivement » → message exact de blocage, aucune saisie de confirmation proposée |
| 11 | Suppression définitive — autorisée | Candidat sans historique → suppression réelle, confirmation exigée, disparaît de la liste |

## 2. EXAM (≈5 min)

| # | Étape | Preuve à observer |
|---|---|---|
| 12 | Créer et publier un examen | « Préparation des examens » → créer → écran « À qui affecter cet examen ? » (3 choix) → publier |
| 13 | Reprogrammer un examen publié | Fiche examen → reprogrammer les dates d'ouverture/fermeture → dates invalides (fermeture avant ouverture) refusées avec message FR explicite |
| 14 | Démarrage candidat | `candidat1.staging` → « Commencer » → instructions → chronomètre visible et décompte réellement |
| 15 | Reprise après rafraîchissement | En cours d'examen → rafraîchir la page → réponses déjà données toujours présentes (autosave prouvé) |
| 16 | Écran de révision finale | « Vérifier avant d'envoyer » → résumé, questions sans réponse signalées le cas échéant |
| 17 | Soumission manuelle | « Terminer et envoyer l'examen » → confirmation → tentative verrouillée |
| 18 | Auto-soumission par expiration | (Environnement de test, durée courte) — aucune interaction candidat → soumission automatique, message exact affiché |

## 3. LES 8 TYPES DE QUESTION (≈4 min)

Dropdown d'auteurage (`/question-bank`), ordre exact affiché :

| # | Type | Preuve à observer côté candidat |
|---|---|---|
| 19 | Vrai/Faux | Deux choix fixes, sélection radio |
| 20 | QCM — une seule réponse | Une seule case cochable à la fois |
| 21 | QCM — plusieurs réponses | Plusieurs cases cochables simultanément |
| 22 | Matching / Appariement | Un `<select>` par élément — **jamais de glisser-déposer obligatoire**, entièrement clavier |
| 23 | Ordering / Séquence | Boutons Monter/Descendre — même garantie d'accessibilité |
| 24 | Numeric | Valeur + tolérance, notation automatique |
| 25 | Short Answer | Correction automatique (liste de réponses acceptées) OU correction manuelle explicite |
| 26 | Scenario / Cas pratique | Contexte affiché une seule fois + plusieurs sous-questions (pouvant elles-mêmes être de n'importe lequel des 7 autres types, y compris Matching/Ordering) |

Snapshot immuable : éditer une question déjà utilisée dans un examen publié après coup → l'examen déjà publié reste rigoureusement inchangé (le prouver en rouvrant le détail d'une tentative déjà notée).

## 4. RESULTS (≈4 min)

| # | Étape | Preuve à observer |
|---|---|---|
| 27 | État « en cours » jamais un résultat | Tentative `in_progress` → jamais affichée comme un résultat final nulle part |
| 28 | Notation automatique | Types auto-notables → score calculé immédiatement à la soumission |
| 29 | Correction manuelle en attente | Question à correction manuelle → statut « En attente de correction » → **jamais un score fabriqué** avant correction |
| 30 | Correction manuelle réalisée | `/grading` → corriger la réponse en attente → résultat final se calcule alors, plus jamais « en attente » |
| 31 | Détail question par question | « Résultats » → un candidat → chaque question : réponse candidat vs réponse correcte, points — pour les 8 types |
| 32 | Rapport individuel PDF | Bouton « PDF détaillé » → fichier réel téléchargé, en-tête KOST E-EXAM + métadonnées complètes |
| 33 | Export CSV | « Export CSV (résultats) » et « (réponses détaillées) » → fichiers réels |

## 5. EMAIL (≈3 min)

| # | Étape | Preuve à observer |
|---|---|---|
| 34 | Invitation | Candidat créé avec envoi → email réel (boîte de test approuvée uniquement, `EMAIL_MODE=allowlist`) |
| 35 | Affectation d'examen | Publication → notification affectation visible dans l'historique |
| 36 | Reprogrammation | Reprogrammer un examen → notification `EXAM_RESCHEDULED` visible |
| 37 | Examen soumis | Soumission candidat → notification `EXAM_SUBMITTED` (candidat) + `EXAM_SUBMITTED_ADMIN` (responsable/admin du périmètre) |
| 38 | Résultat disponible | Résultat finalisé → `RESULT_AVAILABLE` (respecte la politique NO_EMAIL/score-only/score+détail configurée) |
| 39 | Historique de livraison | `/notifications` → statut réel par email (`SENT`/`DELIVERED`/`SUPPRESSED`/`FAILED`/`BOUNCED`), jamais le contenu de l'email lui-même |
| 40 | Support / Reply-To | N'importe quel email candidat → pied de page → **cbta@kostacademy.com**, jamais une adresse personnelle |

## 6. SECURITY (≈3 min)

| # | Étape | Preuve à observer |
|---|---|---|
| 41 | Administrateur | Accès complet `/users`, `/question-bank`, `/exam-preparation`, `/grading`, `/incidents`, `/audit-logs`, `/system` |
| 42 | Responsable pédagogique | Périmètre borné à son propre client/groupe — `/users` **structurellement inaccessible** (403 serveur, pas juste un bouton masqué) — voir §6 pour la justification produit |
| 43 | Candidat | Uniquement son propre compte/examens/résultats — tentative d'accès à un autre attempt par URL devinée → refus serveur |
| 44 | Auditeur | Lecture seule stricte — **aucun bouton d'écriture visible nulle part**, et les actions serveur elles-mêmes rejettent le rôle (pas seulement l'UI masquée) |
| 45 | Isolation multi-client | Un responsable d'un AUTRE client ne voit jamais les données d'un client qui n'est pas le sien, ni en liste ni par URL devinée |
| 46 | Réinitialisation MFA administrateur *(optionnel, si le temps/l'intérêt le permet)* | Un compte administrateur/responsable pédagogique avec MFA actif (candidat non concerné — MFA hors périmètre candidat par politique produit) → fiche `/users/[id]` → « Réinitialiser MFA » → confirmation exigée → MFA désactivé pour ce compte, aucun secret jamais affiché, le titulaire peut se ré-inscrire ensuite normalement |

## 7. AUDIT (≈2 min)

| # | Étape | Preuve à observer |
|---|---|---|
| 47 | Journal d'audit | `admin.staging` ou `auditeur.staging` → « Journal d'audit » → traçabilité des actions ci-dessus (connexion, activation, suspension/réactivation, archivage/restauration, notation manuelle, réinitialisation MFA, etc.) |
| 48 | Incidents | « Incidents » → déclarer → action immédiate (ex. suspendre un compte) → historique complet visible, y compris la réouverture/clôture |
| 49 | Sauvegarde/restauration | « Système » → dernière sauvegarde et dernier test de restauration, tous deux réussis et non périmés |

---

## Si le temps manque — ordre de priorité

1→9 (compte/cycle de vie), 14→17 (examen candidat), 22→26 (les 3 types récents — c'est ce qui a le plus changé depuis la dernière démo), 29→31 (correction manuelle + détail), 44→45 (auditeur + isolation) — c'est le cœur de ce qu'une revue de plateforme demande à voir en premier.

**Durée totale estimée : ≈25 minutes** pour les 49 points ; ≈15 minutes pour le sous-ensemble prioritaire ci-dessus.
