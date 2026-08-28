# KOST E-EXAM V2 — Analyse d'écarts production (fresh, 2026-08-28)

**Statut :** inspection réelle du code/DB/staging/tests/infra actuels — pas une relecture du résumé de session précédent. Base de référence : ADDENDUM §1–27 COMPLETE (branche `feature/kost-eexam-v2-native`, staging https://staging.kostacademy.com, tag `kost-eexam-v2-auditor-review-2026-08-27`).

Classification par item : **DONE** / **PARTIAL** / **MISSING** / **BLOCKED** / **HUMAN/REGULATORY REVIEW REQUIRED**.

---

## 1. Auth / RBAC / Tenant isolation

| Item | Statut | Preuve |
|---|---|---|
| Auth native (login, sessions serveur, cookie) | DONE | `lib/auth.ts`, `lib/session.ts`, `lib/sessions-registry.ts` — testé E2E (08-security-checks) |
| RBAC 4 rôles, appliqué serveur | DONE | `lib/rbac.ts` — `requireRole`/`requireWriteRole`/`guardPage`, testé sur chaque route mutante |
| Tenant isolation (module central) | DONE | `lib/tenant-scope.ts` — 3 gaps fermés et re-testés cette session (incidents/overview/sessions), 09/11-isolation E2E verts |
| Rate limiting login | PARTIAL | `lib/rate-limit.ts` — **en mémoire, mono-processus** (documenté explicitement dans le code). Acceptable pour le déploiement actuel (1 instance Node), **bloquant si scaling horizontal futur** — nécessiterait un magasin partagé (Redis) |
| MFA | MISSING | Colonne `mfa_enabled` existe dans `users` (prévue), **aucune logique TOTP implémentée** — ni enrôlement, ni vérification au login |
| Session security (HttpOnly/Secure/SameSite/CSRF) | DONE | Vérifié live sur cookie réel (08-security-checks), Server Actions = protection CSRF native Next.js |

## 2. Companies / Groups / Candidates

| Item | Statut |
|---|---|
| Company CRUD (create) | DONE — pas d'edit/delete (create seul demandé jusqu'ici) |
| Group CRUD (create) | DONE — pas d'edit/delete |
| Candidate creation | DONE |
| Candidate edit | **MISSING** — aucune route/action `editCandidate` trouvée |
| Candidate activate/suspend/reactivate | DONE (`setUserStatus`, incident actions + comptes) |
| Candidate assign company/group/function/exam | DONE (addendum §1-2) |
| Candidate bulk CSV import | **MISSING** |
| Candidate export | PARTIAL — résultats exportables (CSV), pas un export candidat-seul (fiche/roster) |
| Candidate search/filter | PARTIAL — filtres existent sur `/results` (addendum §7), pas sur `/groups/[id]` roster lui-même |
| Duplicate prevention | DONE — `username` UNIQUE en base |

## 3. Fonctions 7.1–7.10 / Question bank / Contenu réel — **CRITIQUE, voir §6 de la mission**

| Item | Statut |
|---|---|
| Modèle natif Fonction (table `functions`, 10 lignes 7.1–7.10) | DONE |
| Question bank + versioning append-only | DONE — `lib/questions.ts`, immutabilité prouvée (06-versioning) |
| **Contenu réel en base V2** | **DONE — 92 des 97 questions FROZEN réellement récupérables sont maintenant en base, sur les 10 fonctions** (voir §3bis ci-dessous ; les 5 dernières restent un blocage humain/régulatoire permanent, pas une tâche technique) |
| Importeur contrôlé (Moodle → V2, lecture seule) | **DONE** — `scripts/import-dgr-from-moodle.ts`, exécuté fonction par fonction, rapport complet à chaque exécution, idempotent (testé : ré-exécution = 0 doublon créé) |
| Snapshot figé à publication | DONE, testé |

## 3bis. Migration réelle exécutée cette session — résultat définitif

Exécutée fonction par fonction (mission §10), sur staging réel, vérifiée à
chaque étape :

| Fonction | Avant | Après | Importées cette session |
|---|---:|---:|---:|
| 7.1 | 7 | 13 | 6 |
| 7.2 | 0 | 21 | 21 |
| 7.3 | 0 | 7 | 7 |
| 7.4 | 0 | 7 | 7 |
| 7.5 | 0 | 7 | 7 |
| 7.6 | 0 | 8 | 8 |
| 7.7 | 0 | 7 | 7 |
| 7.8 | 0 | 10 | 10 |
| 7.9 | 0 | 5 | 5 |
| 7.10 | 0 | 7 | 7 |
| **Total** | **7** | **92** | **85** |

- **0 erreur, 0 texte manquant, 0 réponse invalide** sur les 92 items traités.
- **100% `source_status = FROZEN_SOURCE_VERIFIED`**, **100% `reviewer_status = PENDING`** (jamais `APPROVED` — vérifié en base après import).
- Vérifié via l'API réelle de l'application (`/api/question-bank/admissible-count`), pas seulement en base : les 10 fonctions renvoient exactement les comptes ci-dessus à l'assistant de création d'examen.
- Traçabilité : chaque exécution insère une ligne dans la table `imports` (10 lignes au total, une par fonction).
- Deux sources croisées, jamais une seule : structure (énoncé/choix/bonne réponse) depuis Moodle (lecture seule, jamais écrit), métadonnée réglementaire (sous-tâche, référence DGR, date de vérification, explication) depuis le markdown source de la branche `ai/dgr-stage2b-handoff` — jamais depuis la CSV de traçabilité, dont au moins un champ (`Q-7.2-001.dgr_reference`) s'est révélé structurellement tronqué par un bug de guillemets imbriqués dans la CSV source elle-même (confirmé par lecture des octets bruts, pas une erreur de ce parseur).
- **5 questions Fonction 7.1 restent définitivement exclues** (Q-7.1-005/007/008/010/012) — texte intégral introuvable dans aucune source accessible à cet environnement, blocage humain/réglementaire documenté depuis la phase précédente, pas une omission de cette migration.
- **Limitation connue signalée honnêtement** : le champ `explanation` des 85 questions nouvellement importées mélange framing anglais et citations françaises (ex. « Course slide 20: "Le SCoETDG élabore..." ») — factuellement exact, jamais fabriqué, mais pas encore une explication 100% française prête pour affichage large candidat. Une passe éditoriale FR reste recommandée avant que ce champ soit considéré publication-grade (n'affecte ni l'énoncé, ni les choix, ni la bonne réponse — tous corrects et complets).

**Fait central établi cette session** (source : `docs/KOST_EEXAM_V2_ARCHITECTURE.md` §1.2 et `platform-ops/kost-eexam-console-src/docs/DGR_MOODLE_BANK_INTEGRATION_PLAN.md`, tous deux déjà présents dans ce dépôt, lus intégralement) :

- **453 items** au total existent dans le programme de vérification Tier A, sur la branche non fusionnée `ai/dgr-stage2b-handoff`.
- **97 items exactement** portent le statut `FROZEN FR / SOURCE VERIFIED` **au niveau de chaque item** (reconciliation faite par l'équipe console le 25/08 — l'agrégat historique "218" était une erreur de synchronisation entre document de suivi et champ réel de l'item, corrigée).
- **92 de ces 97** sont déjà importés dans **Moodle** (lecture seule confirmée cette session : `mdl_question` accessible), avec traçabilité complète par fonction (`docs/DGR_MOODLE_IMPORT_TRACEABILITY_7.X.csv`, `platform-ops/kost-eexam-console-src/docs/`).
- **5 items de la Fonction 7.1** (Q-7.1-005/007/008/010/012) sont FROZEN mais **le texte intégral n'est récupérable nulle part dans cet environnement** (règle de licence documentée : seule la copie administrée en direct porte le texte complet) — **exclusion définitive, pas une tâche à finir**, sauf fourniture du texte par le propriétaire humain.
- V2 contient aujourd'hui **7 des 13 questions Fonction 7.1 déjà dans Moodle** (Q-7.1-013 à 019) — **85 questions FROZEN supplémentaires existent et sont accessibles en lecture seule dans Moodle, jamais migrées vers V2** : 6 de plus pour 7.1, et la totalité de 7.2→7.10 (79 questions).

## 4. Question importer (mission §9)

**MISSING.** À construire :
- Lecture SELECT-only de Moodle (`mdl_question`, `mdl_question_bank_entries`, `mdl_question_versions`, `mdl_question_answers`, tags) — jamais d'écriture Moodle.
- Preview → validation → détection doublons (par `kost_question_id`) → rapport d'erreurs → confirmation → import → rapport de migration.
- Mapping KOST ID → V2 question ID → V2 version ID (traçabilité).
- Idempotent (ré-exécutable sans dupliquer).

## 5. Exam builder / Assignments / Lifecycle

| Item | Statut |
|---|---|
| Assistant 17 étapes (type→publier) | DONE — correspond à l'assistant déjà construit (`PublishAssessmentForm.tsx` + wizard `/exam-preparation`) |
| Affectation groupe / candidats sélectionnés / individuel | DONE (addendum §1-2), audit trail complet, rejet explicite hors-périmètre |
| Cycle de vie DRAFT→PUBLISHED→OPEN→SUSPENDED→CLOSED→ARCHIVED | DONE — `AssessmentStatus`, `suspendAssessment`/`reopenAssessment`, testé E2E (17) |
| Pas de mutation rétroactive de tentative complétée | DONE — snapshot figé, `results.locked` |

## 6. Candidate engine / Timer / Autosave / Concurrency

| Item | Statut |
|---|---|
| Parcours candidat complet | DONE |
| Timer serveur (`expires_at`, indépendant du navigateur) | DONE, testé refresh + expiry (timer.test.ts unit + E2E) |
| Autosave | DONE — sauvegarde à chaque réponse |
| Reconnect / crash / perte réseau / expiry (§8) | **DONE** — refresh mid-tentative prouvé en E2E réel (`scenario-c-candidate-flow.spec.ts`, réponse conservée, chronomètre non redémarré) ; le cas "le candidat ne revient JAMAIS" (fermeture complète, crash, perte réseau) est couvert au niveau serveur, pas au niveau navigateur — c'est structurellement correct : `sweepExpiredAttempts()` (`lib/attempts.ts`) auto-soumet et note toute tentative expirée sans dépendre d'aucune action client, prouvé par `timer.test.ts` (2/2). Filet indépendant de toute page consultée : cron `*/5 * * * * sweep.sh` **installé et vérifié réellement sur staging** cette session (`crontab -l` confirmé). Bug réel trouvé et corrigé en l'installant : `proxy.ts` redirigeait cette route vers `/login` pour toute requête sans cookie de session, rendant le cron structurellement inappelable malgré son authentification par jeton dédiée — exempté, revérifié par 2 tests E2E dédiés (`08-security-checks.spec.ts`). |
| Concurrency (double-clic, 2 onglets) | DONE — contrainte DB + transaction, `attempt-concurrency.test.ts`, prouvé aussi en E2E (deux onglets, scénario E historique) |
| Grading — source unique | DONE — `lib/grading.ts`, seul point d'écriture `results` |

## 7. Results / PDF / CSV / Reports

Tout DONE et testé cette session (addendum) : rapport individuel écran+PDF, rapport global session écran+PDF, liste officielle résultats PDF+CSV, CSV résumé+détaillé avec filtres complets, protection injection de formule CSV, immutabilité historique.

## 8. Incidents / Continuité / Audit

Tout DONE (addendum §9-11, 17-incident-platform-actions.spec.ts, 22-acceptance-incident.spec.ts) : suspend/reactivate compte, revoke sessions, block logins, block attempts, maintenance mode (un seul geste couvrant les deux), suspend/reopen exam, evidence, corrective measure, close, audit trail double-écriture systématique.

## 9. Guides / Familiarisation

DONE (addendum §12-21) — 5 guides écran+PDF, module de familiarisation complet (sessions, présence, feuille PDF, historique candidat).

## 10. Backup / Restore / DB integrity

| Item | Statut |
|---|---|
| Backup automatique | DONE — `scripts/backup.ts`, format `backup-log.jsonl` compatible V1 |
| Test de restauration isolé | DONE — exécuté réellement (`scripts/restore-test.ts`), intégrité vérifiée |
| RPO/RTO documentés | PARTIAL — cible 24h/30min documentée dans l'architecture, **pas formellement re-confirmée pour ce nouveau plan de production** |
| Contraintes FK/UNIQUE/CHECK | DONE — `lib/schema.sql`, `PRAGMA foreign_keys = ON` actif, vérifié cette session (le nettoyage de données de test a été bloqué correctement par une FK, preuve que la contrainte fonctionne réellement) |
| Copie chiffrée hors site | MISSING — dépend du choix d'hébergement final, non tranché |

## 11. Sécurité — TLS, headers, secrets, dépendances

| Item | Statut |
|---|---|
| HTTPS + TLS staging | DONE — vérifié live |
| Security headers (HSTS, CSP, X-Frame-Options, etc.) | DONE — `next.config.ts` `headers()`, en code (pas seulement nginx) |
| Secret scan (git/branche/image/staging/scripts/logs) | **DONE** — exécuté cette session, 2 fuites réelles trouvées et corrigées (voir ci-dessous), aucune n'était un secret de production |
| Dependency security | **DONE** — `pnpm audit` exécuté cette session : **0 vulnérabilité** (info/low/moderate/high/critical), 526 dépendances |

**Détail du scan de secrets :**
- Git (branche courante + historique complet, tous commits) : aucune clé AWS/clé privée/clé API/token GitHub, aucun `.env` réel jamais commité (seul `.env.example`, un gabarit vide). `.gitignore` couvre correctement `.env`/`.env.local`/`.env*.local`.
- Code source applicatif : aucun mot de passe/secret en dur (seules des références de nom de champ de formulaire).
- Image Docker : `.dockerignore` exclut correctement `.env`/`.env.local`/`.env*.local` — le vrai `.env` de production (`SESSION_SECRET`, `SWEEP_TOKEN`) vit **hors** du répertoire de build (`/root/kost-eexam-v2-stack/.env`, permissions `600 root:root`), jamais copié dans le contexte Docker ni dans le conteneur en dehors de l'injection `--env-file` au runtime.
- Logs conteneur : aucun mot de passe/secret/token trouvé dans 200 lignes récentes.
- **Fuite réelle #1 (corrigée) :** `.env.staging.local` (identifiants de TEST staging — candidats/responsables/admin de démonstration, jamais des secrets de production) s'était retrouvé copié sur le serveur via `rsync` (répertoire `app/`, jamais dans l'image Docker grâce à `.dockerignore`, mais présent en clair sur le système de fichiers du serveur). Supprimé du serveur ; ce fichier n'a aucune utilité côté serveur (seul le lanceur de tests Playwright local en a besoin).
- **Fuite réelle #2 (corrigée) :** un script d'extraction Moodle ponctuel (`/tmp/extract_moodle_questions.py`, jamais commis dans le dépôt) contenait le mot de passe root de la base MySQL Moodle en dur, nécessaire pour l'extraction lecture-seule de la banque de questions (§6-10 ci-dessus). Supprimé du serveur et de la machine locale après usage.
- **Faille d'accès réelle #3 (corrigée) :** `proxy.ts` (garde de session globale) redirigeait `/api/attempts/sweep` vers `/login` pour toute requête sans cookie — pas une fuite de données, mais un défaut de disponibilité du filet de sécurité chronomètre (§6 ci-dessus) qui rendait la route inappelable par le cron alors que sa propre authentification par jeton (`SWEEP_TOKEN`) fonctionnait correctement. Trouvé en installant le cron, corrigé (exemption ciblée, jeton toujours vérifié côté route), revérifié par 2 tests E2E dédiés.

## 12. Accessibilité / Device / Performance / Charge / Monitoring / Logging

Toutes **MISSING** — jamais exécutées pour V2 :
- Accessibilité (axe-core) : outil non installé, aucun audit fait.
- Device/viewport : seule la config Chromium desktop existe (`playwright.config.ts`), aucun projet tablette/mobile/WebKit.
- Performance avec données synthétiques (100/500 candidats) : jamais testé.
- Charge concurrente (20/50/100 candidats simultanés) : jamais testé.
- Monitoring production (santé, DB, disque, CPU/RAM, taux d'erreur, échec sauvegarde, alertes incident) : rien construit — `/system` existe (page) mais pas d'alerting actif. Un seul filet périodique réel existe à ce jour : le cron de balayage du chronomètre (§6/§8, `*/5 * * * * sweep.sh`, installé et vérifié cette session) — pas une alerte, mais une action corrective automatique réelle.
- Logging structuré + rotation/rétention : logs actuels = stdout Docker par défaut, pas de politique de rotation/rétention définie, pas de scrub explicite de PII au-delà de l'audit_logs (déjà insert-only, déjà sans mot de passe).

## 13. Scope Démo/Test/Production

DONE au niveau schéma (colonne `scope` explicite sur `companies`/`groups`/`assessments`, jamais une regex sur un nom — corrige l'écart identifié dans V1). **À vérifier** : que les KPI/dashboards actuels excluent bien `demo`/`test` par défaut (audit ciblé à faire, §40-41 de la mission).

## 14. MFA — évaluation (mission §25)

**DONE** — TOTP natif (RFC 6238/4226, `node:crypto` HMAC-SHA1, zéro dépendance npm nouvelle), validé contre les 5 vecteurs de test officiels RFC 6238 Annexe B (14/14 tests unitaires). Enrôlement en libre-service (`/mon-compte`, administrateur + responsable pédagogique), codes de secours à usage unique (hachés scrypt, affichés une seule fois), connexion à deux facteurs (`/login/verifier-mfa`, même limiteur anti-force-brute que le mot de passe), désactivation en libre-service (mot de passe requis), voie de récupération administrateur pour compte verrouillé (`/users`, action auditée séparément). Déployé et vérifié réellement sur staging (2 tests E2E dédiés, cycle complet + usage unique des codes de secours). MFA **fonctionnel et disponible dès maintenant**, mais **pas rendu obligatoire de force** sur les comptes administrateur existants cette session — décision de politique explicite (voir `lib/mfa.ts`), pas une omission : forcer maintenant risquerait de verrouiller le seul compte administrateur sans qu'un parcours de récupération complet ait été validé par son propriétaire. Rendre MFA obligatoire pour tout compte administrateur avant la bascule production reste une recommandation forte, actionnable en quelques minutes le moment venu.

## 15. Session / Auth security pass (mission §16-19-20)

**DONE** — repasse complète, rien de nouveau à construire, confirmé par relecture de code + preuve E2E existante :

| Item | Statut |
|---|---|
| Cookie de session (`kost_eexam_v2_session`) | DONE — `HttpOnly`, `SameSite=Strict`, `Secure` (vérifiés comme attributs RÉELS du cookie navigateur, pas seulement la config source — `08-security-checks.spec.ts`), expiration 8h |
| CSRF — Server Actions (l'écrasante majorité des mutations de l'app) | DONE — protection **native Next.js** : chaque appel de Server Action compare l'origine de la requête au host, refusée si différente (`allowedOrigins` non configuré dans `next.config.ts` → same-origin strict uniquement, confirmé dans `node_modules/next/dist/docs/.../serverActions.md`). Défense en profondeur avec `SameSite=Strict` (double couche indépendante). |
| CSRF — Route Handlers mutants (`app/api/**/route.ts`) | DONE — seulement 2 existent en écriture (`POST`) : `auth/logout` (protégé par `SameSite=Strict`, et une déconnexion forcée n'est pas un impact de sécurité réel) et `attempts/sweep` (jamais de cookie ambiant à exploiter — authentification par jeton `Authorization: Bearer` explicite, qu'une page tierce ne peut pas fournir sans déjà connaître le secret — voir §6/§11 ci-dessus). Aucune autre route API mutante n'existe. |
| Révocation de session server-side | DONE — table `sessions` dédiée (§20), revérifiée à `requireRole()`/`requireWriteRole()` sur CHAQUE action mutante et au rendu de `app/(app)/layout.tsx`, pas seulement à la connexion |
| Anti-force-brute (mot de passe + MFA) | DONE — `lib/rate-limit.ts`, 5 échecs/15min, clé `IP+utilisateur` (pas IP seule — n'affecte pas tout un bureau/NAT partagé), même limiteur réutilisé pour la vérification MFA (§25) |
| Limite architecturale connue du rate-limit | **Documentée, assumée, pas un blocage** — stockage en mémoire de PROCESSUS (`Map`), adapté au déploiement actuel (une seule instance Node, pas de scaling horizontal). Une évolution multi-instance nécessiterait un magasin partagé (Redis ou équivalent) — hors périmètre de ce pilote, à traiter avant toute mise à l'échelle horizontale. Documenté en tête de `lib/rate-limit.ts`. |
| En-têtes de sécurité (HSTS, CSP, X-Frame-Options, etc.) | DONE — voir §11, en code (`next.config.ts`), pas seulement nginx |

---

## Résumé exécutif — priorisation

1. ~~**Contenu réel DGR**~~ — **FAIT cette session** (§3bis) : 92/97 questions FROZEN réellement récupérables migrées sur les 10 fonctions, importeur contrôlé construit et prouvé idempotent, vérifié via l'API réelle de l'application. 5 items restent un blocage humain/réglementaire permanent (texte introuvable).
2. ~~**MFA**~~ — **FAIT cette session** (§14) : TOTP natif + codes de secours, enrôlement/désactivation en libre-service, connexion à 2 facteurs, voie de récupération admin. Déployé, vérifié en E2E réel sur staging.
3. ~~**Filet de sécurité chronomètre (crash/perte réseau)**~~ — **FAIT cette session** (§6/§8) : cron réel installé sur staging, un bug d'accès réel trouvé et corrigé en l'installant (`proxy.ts` bloquait la route malgré son authentification par jeton dédiée).
4. **Accessibilité / Performance / Charge / Monitoring** — jamais faites, à exécuter méthodiquement.
5. ~~**Candidate management (edit/bulk CSV/export/search roster)**~~ — **FAIT** (session précédente).
6. ~~**Secret scan**~~ — **FAIT** (session précédente) : 2 fuites réelles trouvées et corrigées, aucune n'était un secret de production. +1 faille d'accès réelle trouvée et corrigée cette session (voir §11).
7. ~~**Session/auth security pass (cookies, CSRF, rate-limit)**~~ — **FAIT cette session** (§15) : rien à construire, tout confirmé DONE (cookie HttpOnly/SameSite=Strict/Secure vérifié réel, CSRF natif Next.js sur les Server Actions, aucune route API mutante exposée sans protection équivalente, limite architecturale du rate-limit documentée et assumée).
8. Tout le reste (auth/RBAC/tenant/exam engine/timer/grading/results/PDF/CSV/incidents/audit/backup/guides/familiarisation) est **DONE et testé** — ne pas reconstruire.
