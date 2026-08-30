# KOST E-EXAM V2 — Index des captures d'écran auditeur

**Environnement :** https://staging.kostacademy.com (Chromium Playwright isolé, jamais un aperçu simulé — voir `tests/staging/33-auditor-demo-screenshots.spec.ts`)
**Résolution :** 1440×900
**Date de capture :** 2026-08-30
**Dossier :** `docs/auditor-demo/screenshots/`

Toutes les captures ont été revues manuellement une par une avant publication (secrets, jetons, PII, UI cassée, spinner, devtools, terminal — voir la colonne « Sûr pour auditeur »). Trois problèmes réels ont été trouvés et corrigés pendant cette revue (voir Notes des lignes 22, 26, 30, 11, 12) — aucun n'a modifié la banque réglementaire, l'historique de Brahimi, ni un compte réel au-delà d'une affectation d'examen démo interne.

| No. | Fichier | Route | Rôle | Objet | Sûr pour auditeur | Notes |
|---|---|---|---|---|---|---|
| 01 | `01-login.png` | `/login` | (public) | Écran de connexion, positionnement produit | ✅ | — |
| 02 | `02-admin-dashboard.png` | `/overview` | admin | Tableau de bord KPI, périmètre Production explicite | ✅ | Le compteur « 283 Incidents ouverts » reflète l'activité cumulée de la suite de tests automatisés sur cet environnement de préproduction partagé, pas des incidents opérationnels réels — repartira de zéro à la bascule production réelle. |
| 03 | `03-users-directory.png` | `/users` | admin | Répertoire utilisateurs, recherche/filtre | ✅ | Filtré sur « staging » pour exclure les comptes de charge/simulation d'autres suites de tests. |
| 04 | `04-create-user.png` | `/users/nouveau` | admin | Création de compte — Particulier | ✅ | Aucun mot de passe saisi par l'administrateur — activation par lien sécurisé uniquement. |
| 05 | `05-company-group-assignment.png` | `/users/nouveau` | admin | Création de compte — Entreprise, affectation client/groupe | ✅ | — |
| 06 | `06-user-detail.png` | `/users/[id]` | admin | Fiche candidat — identité, affectation, fonctions DGR | ✅ | Compte pilote étiqueté « (pilote) ». |
| 07 | `07-question-bank.png` | `/question-bank` | admin | Banque de questions — saisie contrôlée, statut source | ✅ | Bandeau explicite : une question non « Confirmé — source DGR vérifiée » n'entre jamais automatiquement dans un examen de production. Questions `[DÉMO]` visibles en `Brouillon`. |
| 08 | `08-question-detail.png` | `/question-bank/[id]` | admin | Modification d'une question — versionnement immuable | ✅ | « Enregistrer crée une NOUVELLE version — les examens déjà publiés avec la version précédente ne sont jamais modifiés rétroactivement. » |
| 09 | `09-eight-question-types.png` | `/question-bank` | admin | Formulaire d'auteurage — type Cas pratique / scénario | ✅ | Un des 8 types de question supportés par la banque. |
| 10 | `10-exam-builder.png` | `/exam-preparation` | responsable pédagogique | Constructeur d'examen — 12 étapes, aperçu non publié | ✅ | — |
| 11 | `11-published-exam.png` | `/exam-preparation/[id]` | responsable pédagogique | Examen publié — récapitulatif, suivi candidats | ✅ | Corrigé le 2026-08-30 : le panneau « Affecter d'autres candidats » (qui listait un membre réel du groupe non étiqueté démo/pilote) a été masqué côté navigateur avant capture — aucune donnée modifiée en base. |
| 12 | `12-reschedule.png` | `/exam-preparation/[id]` | responsable pédagogique | Reprogrammation d'un examen publié | ✅ | Même correctif que la ligne 11. |
| 13 | `13-candidate-dashboard.png` | `/mes-examens` | candidat | Tableau de bord candidat — examens affectés | ✅ | — |
| 14 | `14-exam-instructions.png` | `/exam/[id]/instructions` | candidat | Instructions pré-examen, règles, tentatives | ✅ | — |
| 15 | `15-exam-in-progress.png` | `/exam/[id]/attempt` | candidat | Examen en cours — chronomètre serveur, type Vrai/Faux | ✅ | Question étiquetée `[DÉMO]`. |
| 16 | `16-vrai-faux-qcm.png` | `/exam/[id]/attempt` | candidat | Type QCM — plusieurs réponses possibles | ✅ | — |
| 17 | `17-matching-ordering.png` | `/exam/[id]/attempt` | candidat | Type Ordering / Séquence — boutons Monter/Descendre | ✅ | Accessible clavier, jamais de glisser-déposer obligatoire. |
| 18 | `18-scenario.png` | `/exam/[id]/attempt` | candidat | Type Cas pratique / scénario — sous-questions | ✅ | Contexte affiché une seule fois pour toutes les sous-questions. |
| 19 | `19-resume-autosave.png` | `/mes-examens` | candidat | Badge « EN COURS » / reprise après rafraîchissement | ✅ | Preuve d'autosave serveur. |
| 20 | `20-final-review.png` | `/exam/[id]/attempt` (révision) | candidat | Écran de révision finale avant envoi | ✅ | 8/8 questions répondues, 0 marquée à revoir. |
| 21 | `21-submission-confirmation.png` | `/mes-resultats?justSubmitted=` | candidat | Confirmation de soumission | ✅ | Statut « en attente de correction » explicite, jamais un score. |
| 22 | `22-in-progress-admin-view.png` | `/results` (filtré) | admin | Vue admin — tentative en cours jamais un résultat prématuré | ✅ | Corrigé le 2026-08-30 (voir rapport) : filtré par groupe démo ET examen démo précis, et une vraie tentative « En cours » a été créée via le formulaire d'affectation réel pour que la preuve soit authentique. |
| 23 | `23-manual-grading.png` | `/grading` | admin | File de correction manuelle | ✅ | État vide au moment de la capture — aucune correction en attente. |
| 24 | `24-final-result.png` | `/mes-resultats` | candidat | Résultat final du candidat, export PDF disponible | ✅ | — |
| 25 | `25-report-export.png` | `/mes-resultats` | candidat | Export PDF détaillé | ✅ | — |
| 26 | `26-email-history.png` | `/notifications` | admin | Historique de livraison email — statut seul, jamais le contenu | ✅ | Corrigé le 2026-08-30 : l'historique réel ne contenait que l'email personnel de Brahimi et l'adresse propriétaire. Remplacé par une notification synthétique sur domaine de test réservé RFC 2606 (`example.test`), filtrée. Le statut `SUPPRESSED` démontre en prime le mécanisme `EMAIL_MODE=allowlist`. |
| 27 | `27-user-communication.png` | `/users/[id]` (section Communications/Actions) | admin | Historique communications + actions compte | ✅ | Nom du candidat hors cadre dans cette capture — aucune identité visible. |
| 28 | `28-audit-log.png` | `/audit-logs` | admin | Journal d'audit — insert-only, 300 événements récents | ✅ | Uniquement des identifiants de comptes staging synthétiques. |
| 29 | `29-mfa-security.png` | `/account` | responsable pédagogique | Authentification à deux facteurs — point d'entrée | ✅ | Aucun secret MFA affiché (ni QR, ni code TOTP, ni codes de récupération). |
| 30 | `30-auditor-role.png` | `/results` (filtré) | auditeur | Rôle auditeur — même vue filtrée, accès lecture seule | ✅ | Même correctif que la ligne 22 — nav latérale « Conformité (lecture seule) » visible. |
| 31 | `31-tenant-isolation.png` | `/companies` | auditeur | Isolation multi-tenant — plusieurs clients côte à côte | ✅ | Tous les tenants sont explicitement étiquetés Démo/Test/Production ; aucune donnée d'un tenant mélangée à un autre. |

**Total : 31/31 captures réelles, revues, sûres pour un auditeur externe.**
