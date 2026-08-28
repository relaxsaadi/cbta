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
| **Contenu réel en base V2** | **PARTIAL — 7 questions sur 97 admissibles réellement existantes** (voir matrice §8 ci-dessous) |
| Importeur contrôlé (CSV/JSON) | **MISSING** — à construire (mission §9) |
| Snapshot figé à publication | DONE, testé |

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
| Reconnect (fermeture/réouverture navigateur) | PARTIAL — prouvé par refresh unique (02-candidate-takes-exam), **pas testé** fermeture complète du navigateur / perte réseau réelle simulée |
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
| Secret scan (git/branche/image/staging/scripts/logs) | **PARTIAL — à exécuter cette phase** (pas encore fait pour la mission production) |
| Dependency security | **DONE** — `pnpm audit` exécuté cette session : **0 vulnérabilité** (info/low/moderate/high/critical), 526 dépendances |

## 12. Accessibilité / Device / Performance / Charge / Monitoring / Logging

Toutes **MISSING** — jamais exécutées pour V2 :
- Accessibilité (axe-core) : outil non installé, aucun audit fait.
- Device/viewport : seule la config Chromium desktop existe (`playwright.config.ts`), aucun projet tablette/mobile/WebKit.
- Performance avec données synthétiques (100/500 candidats) : jamais testé.
- Charge concurrente (20/50/100 candidats simultanés) : jamais testé.
- Monitoring production (santé, DB, disque, CPU/RAM, taux d'erreur, échec sauvegarde, alertes incident) : rien construit — `/system` existe (page) mais pas d'alerting actif.
- Logging structuré + rotation/rétention : logs actuels = stdout Docker par défaut, pas de politique de rotation/rétention définie, pas de scrub explicite de PII au-delà de l'audit_logs (déjà insert-only, déjà sans mot de passe).

## 13. Scope Démo/Test/Production

DONE au niveau schéma (colonne `scope` explicite sur `companies`/`groups`/`assessments`, jamais une regex sur un nom — corrige l'écart identifié dans V1). **À vérifier** : que les KPI/dashboards actuels excluent bien `demo`/`test` par défaut (audit ciblé à faire, §40-41 de la mission).

## 14. MFA — évaluation (mission §25)

**MISSING**, colonne prête. Implémentation TOTP nécessite : génération de secret, QR code d'enrôlement, vérification au login, codes de récupération. Faisable nativement (aucune dépendance externe obligatoire — `otplib` ou équivalent, pas de service tiers requis pour TOTP standard). Pas de blocage humain identifié pour l'implémenter — sera traité comme un gate technique normal, pas une interruption.

---

## Résumé exécutif — priorisation

1. **Contenu réel DGR (§3 ci-dessus)** — le plus gros écart, déjà entièrement cartographié cette session, aucune ambiguïté restante sur la source. Prochaine étape immédiate : construire l'importeur, migrer fonction par fonction.
2. **MFA** — technique, non bloqué, à construire.
3. **Accessibilité / Performance / Charge / Monitoring** — jamais faites, à exécuter méthodiquement.
4. **Candidate management (edit/bulk CSV/export/search roster)** — gaps ponctuels, rapides à combler.
5. **Secret scan** — à exécuter formellement (aucune fuite connue à ce jour, mais pas encore vérifié pour cette phase).
6. Tout le reste (auth/RBAC/tenant/exam engine/timer/grading/results/PDF/CSV/incidents/audit/backup/guides/familiarisation) est **DONE et testé** — ne pas reconstruire.
