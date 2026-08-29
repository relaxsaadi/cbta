# KOST E-EXAM V2 — Opérations Resend / email

**Date :** 2026-08-29
**Environnement couvert :** staging réel — https://staging.kostacademy.com
**Production :** NON déployée — ce document prépare une checklist de bascule, il ne l'exécute jamais.

---

## 1. Variables d'environnement

Voir `.env.example` pour la liste complète et à jour. Résumé :

| Variable | Secret ? | Statut sur staging (2026-08-29) |
|---|---|---|
| `RESEND_API_KEY` | **OUI** | **MISSING** — jamais fourni, jamais fabriqué |
| `RESEND_WEBHOOK_SECRET` | **OUI** | **MISSING** |
| `EMAIL_MODE` | non | `allowlist` |
| `EMAIL_ALLOWED_RECIPIENTS` | non (mais sensible — liste de destinataires) | vide (aucune boîte de test approuvée) |
| `EMAIL_FROM_EXAM` / `_NOTIFICATIONS` / `_SECURITY` / `_SUPPORT` | non | configurées |
| `EMAIL_REPLY_TO` | non | configurée |
| `EMAIL_DEFAULT_TIMEZONE` | non | `Africa/Algiers` |
| `APP_BASE_URL` | non | `https://staging.kostacademy.com` |

Vérifier l'état réel en tout temps (jamais en lisant `.env` directement en session) via :

```bash
curl -s https://staging.kostacademy.com/api/health | jq .email
```

Cet endpoint ne renvoie que des booléens/compte/enum — jamais une valeur de secret (voir `lib/email/config.ts::safeEmailConfigReport()`).

## 2. Ajouter `RESEND_API_KEY` / `RESEND_WEBHOOK_SECRET` quand disponibles

1. Le propriétaire fournit la clé via un canal **hors chat** (jamais collée dans une conversation avec un agent).
2. Sur le serveur :
   ```bash
   ssh -i ~/.ssh/hostarts_kost_moodle root@102.206.40.221
   printf 'RESEND_API_KEY=%s\n' 're_...' >> /root/kost-eexam-v2-stack/.env
   printf 'RESEND_WEBHOOK_SECRET=%s\n' 'whsec_...' >> /root/kost-eexam-v2-stack/.env
   docker rm -f kost-eexam-v2 && docker run -d --name kost-eexam-v2 --restart unless-stopped -p 127.0.0.1:3200:3000 --env-file /root/kost-eexam-v2-stack/.env -v /root/kost-eexam-v2-stack/data:/app/data --log-opt max-size=10m --log-opt max-file=5 kost-eexam-v2:latest
   ```
3. Vérifier : `curl -s https://staging.kostacademy.com/api/health | jq .email` doit passer à `resendApiKeyConfigured: true` / `resendWebhookSecretConfigured: true`.
4. Configurer le endpoint webhook côté dashboard Resend : `https://staging.kostacademy.com/api/webhooks/resend`, événements `sent`, `delivered`, `delivery_delayed`, `bounced`, `complained`, `failed`.
5. **Ne jamais** passer `EMAIL_MODE=send` avant d'avoir suivi §4 ci-dessous (approbation explicite d'un destinataire de test).

## 3. `EMAIL_MODE` — les 3 modes

| Mode | Comportement | Quand l'utiliser |
|---|---|---|
| `log` | Aucun envoi réel, jamais — chaque email est marqué `SUPPRESSED` et journalisé. | Développement local, E2E (`playwright.config.ts`, valeur explicite). |
| `allowlist` | Envoi réel uniquement si `recipientEmail` ∈ `EMAIL_ALLOWED_RECIPIENTS` (comparaison insensible à la casse). Tout autre destinataire → `SUPPRESSED`. | **Défaut staging.** Reste actif tant qu'aucune boîte de test n'est approuvée. |
| `send` | Envoi réel à tout destinataire. | Production uniquement, jamais activé cette mission. |

## 4. Test de livraison réelle contrôlée (§73 de la mission)

**BLOQUÉ à ce jour** — aucune boîte de test approuvée par le propriétaire. Pour débloquer :

1. Le propriétaire fournit UNE adresse de test (jamais devinée/inventée par l'agent — voir la règle mémoire "Never guess emails").
2. Sur le serveur : ajouter cette adresse à `EMAIL_ALLOWED_RECIPIENTS` (en conserver `EMAIL_MODE=allowlist`, ne jamais passer à `send` pour ce test).
3. Configurer `RESEND_API_KEY` (§2).
4. Déclencher, dans cet ordre, uniquement APRÈS que la suite automatisée (`pnpm run test:unit` + `npx playwright test tests/e2e/`) est verte :
   - `ACCOUNT_CREATED` — créer un candidat de test avec cette adresse via l'UI Groupes.
   - `EXAM_ASSIGNED` — l'affecter à un examen publié.
   - `RESULT_AVAILABLE` — lui faire composer et soumettre.
5. Confirmer réception réelle dans la boîte de test, vérifier le rendu (desktop + mobile), puis **supprimer immédiatement** le compte de test et vider `EMAIL_ALLOWED_RECIPIENTS` si le test n'a pas vocation à rester.

## 5. Cron : rappels d'examen

`deploy/reminders.sh` existe et a été testé manuellement (voir le rapport final). La ligne crontab est présente mais **COMMENTÉE** dans `deploy/crontab.example` — activation volontairement laissée à une décision explicite du propriétaire plutôt qu'installée silencieusement pendant cette mission (contrairement à `sweep.sh`/`monitor.sh`, déjà installés lors d'une mission précédente et dont le statut « installé » était déjà acté).

Pour installer :
```bash
ssh -i ~/.ssh/hostarts_kost_moodle root@102.206.40.221
cp /root/kost-eexam-v2-stack/app/deploy/reminders.sh /root/kost-eexam-v2-stack/reminders.sh
chmod +x /root/kost-eexam-v2-stack/reminders.sh
crontab -e   # décommenter la ligne correspondante de deploy/crontab.example
```

## 6. Journal de bord — incidents réels rencontrés cette mission

### 6.1 `getAppBaseUrl()` pouvait faire échouer une action métier (CRITIQUE, corrigé)

**Trouvé** en préparant les tests E2E : chaque `notify*()` construit son URL via `getAppBaseUrl()`, qui lève une exception si `APP_BASE_URL` n'est pas configuré. Cette exception, survenant AVANT `queueAndSendEmail()` (donc avant toute protection outbox), remontait telle quelle à l'action métier appelante — un `APP_BASE_URL` manquant aurait donc pu faire échouer une création de compte ou une publication d'examen, à l'exact opposé de la garantie explicite de la mission (« un problème d'email n'annule jamais une action métier »). Aucun test existant ne l'exerçait : les comptes de démo n'ont pas d'email, donc le garde `if (!candidate?.email) continue` court-circuitait l'appel avant qu'il puisse lever.

**Corrigé** en enveloppant chaque fonction `notify*()` exportée dans un filet `safe()` (`lib/email/events.ts`) — aucune exception ne peut plus structurellement sortir de ce module. Preuve : `tests/unit/email-never-throws.test.ts` (3 tests, appelle `notifyAccountCreated`/`notifyExamAssigned`/`notifyAccountActivated` SANS `APP_BASE_URL` configuré, vérifie qu'aucun ne lève et qu'aucune ligne partielle n'est créée en base).

### 6.2 Migration `users.status` cassait sur le vrai schéma staging (CRITIQUE, corrigé)

**Trouvé** au premier déploiement réel : `migrateUsersStatusCheckConstraint()` échouait avec `NOT NULL constraint failed: users_new.created_at`. Cause : `INSERT INTO users_new SELECT * FROM users` est **positionnel** — la vraie table `users` de staging a `mfa_secret`/`mfa_recovery_codes_json` ajoutées via `ALTER TABLE ADD COLUMN` lors d'une mission antérieure (donc physiquement APRÈS `last_login_at`), alors que la nouvelle table `users_new` les déclare entre `mfa_enabled` et `created_at` (ordre logique, identique à `lib/schema.sql`). Le décalage positionnel qui en résultait plaçait la valeur de `mfa_secret` (souvent `NULL`, MFA non activée) dans `users_new.created_at` (NOT NULL) — échec pour tout utilisateur sans MFA.

La transaction (`BEGIN IMMEDIATE`/`ROLLBACK` sur erreur) a fonctionné exactement comme prévu : **zéro perte de données**, `users_new` proprement supprimée, les 44 comptes de staging intacts, confirmé par lecture directe après l'échec.

**Corrigé** en remplaçant `SELECT *` par des listes de colonnes explicites (nommées, pas positionnelles) des deux côtés de l'`INSERT`, dans `migrateUsersStatusCheckConstraint()` **et**, par prévention, dans `migrateIncidentActionsCheckConstraint()` (même risque structurel, avait réussi par chance lors d'une mission antérieure). Vérifié en reproduisant exactement l'ordre physique réel des colonnes de staging dans un test local dédié (script jetable, colonnes dans le même ordre que `sqlite_master.sql` réel de staging) avant de retenter le déploiement — succès confirmé en conditions réelles, `docker exec kost-eexam-v2 node -e "..."` a confirmé les 44 comptes intacts après coup (37 `active` + 7 `suspended`, aucune ligne `users_new` résiduelle).

**Leçon pour les migrations futures** : un test local contre une base « simulée » ne suffit pas si l'ordre physique des colonnes n'est pas reproduit EXACTEMENT (`ALTER TABLE ADD COLUMN` ajoute toujours en fin de table, jamais à la position logique du schéma actuel) — toujours lire `SELECT sql FROM sqlite_master WHERE name='<table>'` sur l'environnement réel avant d'écrire une migration de reconstruction de table, et toujours utiliser des colonnes nommées, jamais `SELECT *`, dans ce genre de migration.

## 7. Dépannage courant

| Symptôme | Diagnostic | Action |
|---|---|---|
| Un email attendu n'apparaît jamais dans `/notifications` | Vérifier `shouldSendToUser()` — préférence désactivée ? Politique `RESULT_AVAILABLE` = `NO_EMAIL` ? | `/notifications` (filtre par type d'événement) ; `getResultEmailPolicy()`. |
| Une ligne reste `QUEUED`/`FAILED` indéfiniment | `processOutboxRetries()` n'est appelé par aucun cron actuellement (non demandé dans la spec — seul le webhook et l'envoi immédiat mettent à jour le statut). | Ajouter un appel cron à `processOutboxRetries()` si des échecs transitoires s'accumulent en production (décision produit non prise cette mission — aucun cron de retry n'existe, contrairement aux rappels §5). |
| `failure_reason_safe` peu informatif | Volontaire — jamais un message brut potentiellement porteur d'un fragment de clé/URL signée (§57). | Consulter les logs serveur (`docker logs kost-eexam-v2`) pour le détail technique complet, jamais exposé en base. |
| Un candidat n'a pas reçu son invitation | Vérifier `EMAIL_MODE` (probablement `log`/`allowlist` en staging — comportement attendu, pas un bug). | `/notifications`, colonne Statut = `SUPPRESSED` + raison. |
| Webhook Resend retourne 503 | `RESEND_WEBHOOK_SECRET` manquant — comportement voulu (`app/api/webhooks/resend/route.ts` refuse plutôt que de faire confiance à une requête non signée). | Configurer le secret (§2). |

## 8. Checklist de bascule production — PRÉPARÉE, JAMAIS EXÉCUTÉE

Aucune étape ci-dessous n'a été exécutée cette mission.

- [ ] `RESEND_API_KEY` configuré en production (jamais réutiliser une clé de staging).
- [ ] `RESEND_WEBHOOK_SECRET` configuré, endpoint webhook enregistré côté Resend pour le domaine de production.
- [ ] SPF/DKIM/DMARC vérifiés pour `kostacademy.com` (changement DNS = approbation explicite du propriétaire requise, jamais exécuté par un agent).
- [ ] `EMAIL_MODE=send` — seulement après un test de livraison contrôlé réussi (§4) ET une revue humaine.
- [ ] `APP_BASE_URL=https://exam.kostacademy.com` (jamais `staging.` en production).
- [ ] Cron rappels (§5) installé si souhaité en production.
- [ ] Cron retry outbox (voir §7) — décision produit à prendre.
- [ ] Décision produit sur `MAINTENANCE_STARTED`/`COMPLETED` (qui notifier) — actuellement non câblé.
- [ ] Revue finale RGPD/vie privée du contenu des 18 gabarits par une personne humaine.

**PRODUCTION CUTOVER : NOT EXECUTED.**
