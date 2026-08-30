# KOST E-EXAM V2 — Opérations Resend / email

**Date de cette actualisation :** 2026-08-30 (mission "MISSION DE FERMETURE — CLEAR REMAINING P2 BEFORE AUDITOR DEMO")
**Environnement couvert :** staging réel — https://staging.kostacademy.com
**Production :** NON déployée — ce document prépare une checklist de bascule, il ne l'exécute jamais.

> **Ce document était périmé.** La version précédente (2026-08-29) décrivait `RESEND_API_KEY`/`RESEND_WEBHOOK_SECRET` comme MISSING et le test de livraison réelle comme BLOQUÉ. Les deux ont été résolus le même jour (commit `c689d44`) — voir §1/§4 ci-dessous, vérifiés à nouveau le 2026-08-30 via `/api/health`.

---

## 1. Variables d'environnement

Voir `.env.example` pour la liste complète et à jour. Résumé (vérifié 2026-08-30, `/api/health` + présence de variable côté conteneur — jamais la valeur) :

| Variable | Secret ? | Statut sur staging (2026-08-30) |
|---|---|---|
| `RESEND_API_KEY` | **OUI** | **Configuré** |
| `RESEND_WEBHOOK_SECRET` | **OUI** | **Configuré** |
| `EMAIL_MODE` | non | `allowlist` |
| `EMAIL_ALLOWED_RECIPIENTS` | non (mais sensible — liste de destinataires) | **2 destinataires approuvés** (comptage exposé, jamais les adresses elles-mêmes) |
| `EMAIL_FROM_EXAM` / `_NOTIFICATIONS` / `_SECURITY` / `_SUPPORT` | non | configurées |
| `EMAIL_REPLY_TO` | non | **Configuré** — résout vers `cbta@kostacademy.com` (jamais `kostgroupe@gmail.com`, l'adresse personnelle du propriétaire) |
| `EMAIL_DEFAULT_TIMEZONE` | non | `Africa/Algiers` |
| `APP_BASE_URL` | non | `https://staging.kostacademy.com` |

Vérifier l'état réel en tout temps (jamais en lisant `.env` directement en session) via :

```bash
curl -s https://staging.kostacademy.com/api/health | jq .email
```

Cet endpoint ne renvoie que des booléens/compte/enum — jamais une valeur de secret (voir `lib/email/config.ts::safeEmailConfigReport()`).

## 2. Ajouter/faire tourner `RESEND_API_KEY` / `RESEND_WEBHOOK_SECRET` (déjà fait — procédure conservée pour référence/rotation future)

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
5. **Ne jamais** passer `EMAIL_MODE=send` avant d'avoir suivi §4 ci-dessous.

## 3. `EMAIL_MODE` — les 3 modes

| Mode | Comportement | Quand l'utiliser |
|---|---|---|
| `log` | Aucun envoi réel, jamais — chaque email est marqué `SUPPRESSED` et journalisé. | Développement local, E2E (`playwright.config.ts`, valeur explicite). |
| `allowlist` | Envoi réel uniquement si `recipientEmail` ∈ `EMAIL_ALLOWED_RECIPIENTS` (comparaison insensible à la casse). Tout autre destinataire → `SUPPRESSED`. | **Défaut staging, toujours actif.** |
| `send` | Envoi réel à tout destinataire. | Production uniquement, jamais activé cette mission. |

## 4. Test de livraison réelle contrôlée — RÉALISÉ le 2026-08-29 (commit `c689d44`)

Un destinataire de test approuvé par le propriétaire a été ajouté à `EMAIL_ALLOWED_RECIPIENTS` (staging, `EMAIL_MODE=allowlist` conservé — jamais `send`). Événements confirmés **DELIVERED** en conditions réelles après correction d'un bug de formatage de l'expéditeur (`from` doublement enveloppé — `extractEmailAddress()`, `lib/email/config.ts:97-113`, corrigé le même jour) :

- `ACCOUNT_CREATED`
- `ACCOUNT_ACTIVATED`
- `PASSWORD_RESET_REQUESTED`
- `PASSWORD_CHANGED`
- `EXAM_ASSIGNED`
- `RESULT_AVAILABLE`

Les 6 lignes `notification_log` du run **pré-correctif** (avant 18:11:11 le 2026-08-29) restent en base avec `status = 'FAILED'` — preuve d'audit délibérément conservée (voir §6.3 et §9 de la mission "MISSION DE FERMETURE" : ne jamais supprimer un historique d'échec de notification). Elles ne représentent aucun défaut actif — le bug qui les a causées est corrigé depuis le même jour, confirmé par le run post-correctif ci-dessus.

**Reconduire ce test** (nouvelle adresse, ou reconfirmation périodique) :
1. Le propriétaire fournit UNE adresse de test (jamais devinée/inventée par l'agent — voir la règle mémoire "Never guess emails").
2. Ajouter cette adresse à `EMAIL_ALLOWED_RECIPIENTS` (conserver `EMAIL_MODE=allowlist`).
3. Déclencher, uniquement APRÈS que la suite automatisée (`pnpm run test:unit` + `npx playwright test tests/e2e/`) est verte, les événements voulus via l'UI réelle.
4. Confirmer réception réelle dans la boîte de test, vérifier le rendu (desktop + mobile), puis retirer l'adresse de `EMAIL_ALLOWED_RECIPIENTS` si le test n'a pas vocation à rester approuvée durablement.

## 5. Cron : rappels d'examen

`deploy/reminders.sh` existe et a été testé manuellement. La ligne crontab est présente mais **COMMENTÉE** dans `deploy/crontab.example` — activation volontairement laissée à une décision explicite du propriétaire plutôt qu'installée silencieusement (contrairement à `sweep.sh`/`monitor.sh`, déjà installés lors d'une mission précédente).

Pour installer :
```bash
ssh -i ~/.ssh/hostarts_kost_moodle root@102.206.40.221
cp /root/kost-eexam-v2-stack/app/deploy/reminders.sh /root/kost-eexam-v2-stack/reminders.sh
chmod +x /root/kost-eexam-v2-stack/reminders.sh
crontab -e   # décommenter la ligne correspondante de deploy/crontab.example
```

## 6. Journal de bord — incidents réels rencontrés (historique conservé, jamais réécrit)

### 6.1 `getAppBaseUrl()` pouvait faire échouer une action métier (CRITIQUE, corrigé — 2026-08-29)

**Trouvé** en préparant les tests E2E : chaque `notify*()` construit son URL via `getAppBaseUrl()`, qui lève une exception si `APP_BASE_URL` n'est pas configuré. Cette exception, survenant AVANT `queueAndSendEmail()` (donc avant toute protection outbox), remontait telle quelle à l'action métier appelante — un `APP_BASE_URL` manquant aurait donc pu faire échouer une création de compte ou une publication d'examen.

**Corrigé** en enveloppant chaque fonction `notify*()` exportée dans un filet `safe()` (`lib/email/events.ts`) — aucune exception ne peut plus structurellement sortir de ce module. Preuve : `tests/unit/email-never-throws.test.ts`. **Reconfirmé lors de l'audit transversal du 2026-08-30** pour les 4 flux critiques (création de compte, affectation d'examen, soumission, notation/résultat) : l'écriture métier (DB) précède ou est indépendante de l'appel `notify*()` dans chacun.

### 6.2 Migration `users.status` cassait sur le vrai schéma staging (CRITIQUE, corrigé — 2026-08-29)

**Trouvé** au premier déploiement réel : `migrateUsersStatusCheckConstraint()` échouait avec `NOT NULL constraint failed: users_new.created_at` — `INSERT INTO users_new SELECT * FROM users` était **positionnel**, décalé par des colonnes `ALTER TABLE ADD COLUMN` physiquement en fin de table réelle mais déclarées à leur position logique dans `users_new`.

La transaction (`BEGIN IMMEDIATE`/`ROLLBACK` sur erreur) a fonctionné exactement comme prévu : **zéro perte de données**.

**Corrigé** en remplaçant `SELECT *` par des listes de colonnes explicites (nommées, pas positionnelles). **Leçon pour les migrations futures** : toujours lire `SELECT sql FROM sqlite_master WHERE name='<table>'` sur l'environnement réel avant d'écrire une migration de reconstruction de table, jamais `SELECT *`.

### 6.3 Sender `from` doublement enveloppé — 6 envois FAILED avant correctif (CRITIQUE, corrigé — 2026-08-29, 18:11:11, commit `c689d44`)

**Trouvé** pendant le test de livraison contrôlée (§4) : `EMAIL_FROM_*` était déployé au format complet `"Nom <adresse>"`, et `lib/email/send.ts` l'enveloppait une seconde fois avant l'appel Resend, produisant un `from` invalide (imbriqué) — rejeté par l'API Resend (`validation_error`). Symptôme observé : 6 lignes `notification_log` en `FAILED` pour le destinataire de test approuvé, sur les 6 premiers événements du run contrôlé.

**Corrigé** par `extractEmailAddress()` (`lib/email/config.ts:97-113`), appliqué avant tout envoi réel. Retest immédiat (même run, mêmes 6 événements) : tous **DELIVERED**. Les 6 lignes `FAILED` pré-correctif sont volontairement conservées en base comme preuve d'audit (voir §4 et §9 de la mission "MISSION DE FERMETURE" — ne jamais supprimer un historique d'échec de notification), reconfirmées comme non-actives lors de l'audit du 2026-08-30 (aucune nouvelle ligne `FAILED` pour cette adresse depuis le correctif).

### 6.4 Statuts terminaux `bounced`/`complained`/`failed` sans garde de non-régression (P2, corrigé — 2026-08-30)

**Trouvé** lors de l'audit transversal du 2026-08-30 : contrairement à `sent`/`delivered`/`delivery_delayed` (déjà protégés depuis §6.3), les webhooks `bounced`/`complained`/`failed` n'avaient **aucune** garde de statut — un événement terminal différent arrivant hors-ordre pouvait écraser un état déjà enregistré, et un doublon exact re-timestampait les champs et ré-émettait une entrée d'audit.

**Corrigé** — politique de précédence monotone étendue à TOUS les états terminaux (`DELIVERED`, `BOUNCED`, `COMPLAINED`, `FAILED`, `SUPPRESSED` — premier atteint, gagné définitivement), avec une exception étroite et documentée pour `email_suppressions` (mise à jour même si le statut de la ligne reste figé, protège les envois futurs). Voir §G.9 de `KOST_EEXAM_V2_EMAIL_ARCHITECTURE.md` et `lib/email/webhook.ts` (commentaire de tête de `applyWebhookEvent`). Testé : `tests/unit/email-webhook.test.ts` (18 tests, incluant les 6 séquences hors-ordre + doublon terminal + événement terminal inhabituel après DELIVERED explicitement exigés par la mission).

## 7. Dépannage courant

| Symptôme | Diagnostic | Action |
|---|---|---|
| Un email attendu n'apparaît jamais dans `/notifications` | Vérifier `shouldSendToUser()` — préférence désactivée ? Politique `RESULT_AVAILABLE` = `NO_EMAIL` ? | `/notifications` (filtre par type d'événement) ; `getResultEmailPolicy()`. |
| Une ligne reste `QUEUED`/`FAILED` indéfiniment | `processOutboxRetries()` n'est appelé par aucun cron actuellement. | Ajouter un appel cron à `processOutboxRetries()` si des échecs transitoires s'accumulent en production (décision produit non prise). |
| `failure_reason_safe` peu informatif | Volontaire — jamais un message brut potentiellement porteur d'un fragment de clé/URL signée. | Consulter les logs serveur (`docker logs kost-eexam-v2`) pour le détail technique complet, jamais exposé en base. |
| Un candidat n'a pas reçu son invitation | Vérifier `EMAIL_MODE` (probablement `allowlist` en staging — comportement attendu, pas un bug, sauf si son adresse DEVRAIT être dans `EMAIL_ALLOWED_RECIPIENTS`). | `/notifications`, colonne Statut = `SUPPRESSED` + raison. |
| Webhook Resend retourne 503 | `RESEND_WEBHOOK_SECRET` manquant — comportement voulu (`app/api/webhooks/resend/route.ts` refuse plutôt que de faire confiance à une requête non signée). | Configurer le secret (§2 — déjà fait sur staging). |
| Un `bounced`/`complained`/`failed` tardif ne change pas le statut d'une ligne déjà `DELIVERED` | Comportement voulu depuis le 2026-08-30 (§6.4) — premier état terminal gagné, la liste de suppression est quand même mise à jour. | Vérifier `email_suppressions` pour l'adresse concernée si un envoi futur semble anormalement suppressed. |

## 8. Checklist de bascule production — PRÉPARÉE, JAMAIS EXÉCUTÉE

Aucune étape ci-dessous n'a été exécutée en production.

- [x] `RESEND_API_KEY` configuré — **sur staging seulement**. Ne jamais réutiliser cette clé de staging en production ; en obtenir/configurer une distincte.
- [x] `RESEND_WEBHOOK_SECRET` configuré, endpoint webhook enregistré côté Resend — **staging seulement**, même réserve.
- [ ] SPF/DKIM/DMARC vérifiés pour `kostacademy.com` (changement DNS = approbation explicite du propriétaire requise, jamais exécuté par un agent).
- [ ] `EMAIL_MODE=send` — seulement après un test de livraison contrôlé réussi en PRODUCTION (§4 décrit le test STAGING, déjà réalisé, ne compte pas pour la production) ET une revue humaine.
- [ ] `APP_BASE_URL=https://exam.kostacademy.com` (jamais `staging.` en production).
- [ ] Cron rappels (§5) installé si souhaité en production.
- [ ] Cron retry outbox (voir §7) — décision produit à prendre.
- [ ] Décision produit sur `MAINTENANCE_STARTED`/`COMPLETED` (qui notifier) — toujours non câblé au 2026-08-30.
- [ ] Revue finale RGPD/vie privée du contenu des 22 gabarits par une personne humaine.

**PRODUCTION CUTOVER : NOT EXECUTED.**
