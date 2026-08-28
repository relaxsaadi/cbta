# Déploiement V2 — staging RÉELLEMENT déployé

Staging tourne réellement sur https://staging.kostacademy.com (même serveur
dédié que V1, `102.206.40.221`, clé SSH `~/.ssh/hostarts_kost_moodle`).
**Production reste non déployée** — aucune action de production
irréversible n'a été prise sans confirmation explicite (§55 de la
mission : la bascule finale reste la seule action nécessitant une
autorisation explicite).

## État réel (pas un brouillon)

- **Conteneur** : `kost-eexam-v2`, `docker build`/`docker run` directs
  (PAS `docker-compose` — la version installée sur le serveur, 1.25.0, ne
  supporte pas le format `3.8` du fichier `docker-compose.yml` du dossier
  `/root/kost-eexam-v2-stack/`). Séquence exacte prouvée en usage répété :
  voir `redeploy-staging.sh`.
- **Volume de données** : `/root/kost-eexam-v2-stack/data` monté sur
  `/app/data`, persistant, jamais recréé au redéploiement.
- **Rotation des logs conteneur** : `--log-opt max-size=10m --log-opt
  max-file=5` (trouvé SANS rotation cette session, corrigé).
- **Sauvegarde + test de restauration automatisés** : crons **réellement
  installés** cette session (`crontab.example`, jamais appliqués avant —
  gap trouvé et corrigé), rejoués manuellement après la migration de
  contenu DGR pour confirmation immédiate.
- **Filet de sécurité chronomètre** (cron sweep 5 min) : **réellement
  installé** cette session (`sweep.sh`, `crontab.example`) — un bug réel
  de `proxy.ts` le rendait inappelable jusqu'à correction (voir
  `tests/staging/08-security-checks.spec.ts`).
- **Rotation des logs cron** (`/var/log/kost-eexam-v2-*.log`) :
  `logrotate-kost-eexam-v2`, installé à `/etc/logrotate.d/` cette
  session.
- **TLS** : certificat Let's Encrypt réel, renouvellement automatique
  (`certbot.timer` systemd, déjà en place côté serveur).

## Reste à trancher avant toute bascule production

1. **Copie hors site chiffrée** — non couverte (§21 de la mission) —
   dépend du choix d'hébergement final, non tranché.
2. **Domaine de production** — `exam.kostacademy.com` (actuel, V1/Moodle)
   ne doit être déplacé qu'après autorisation explicite (§55). Voir
   `docs/KOST_EEXAM_V2_PRODUCTION_CUTOVER_PLAN.md`.
3. **MFA obligatoire** sur les comptes administrateur — actuellement
   disponible mais pas forcé (décision de politique documentée dans
   `lib/mfa.ts` et le rapport de readiness).

## Fichiers

- `redeploy-staging.sh` — séquence de redéploiement complète (rsync →
  build → run → migrate), la même utilisée réellement cette session.
- `sweep.sh` — filet de sécurité chronomètre, installé sur le serveur à
  `/root/kost-eexam-v2-stack/sweep.sh`.
- `crontab.example` — sauvegarde nocturne, test de restauration
  hebdomadaire, balayage chronomètre — tous **réellement installés**.
- `logrotate-kost-eexam-v2` — rotation des logs cron, réellement
  installée à `/etc/logrotate.d/`.
- `nginx-v2-vhost.conf.example` — vhost nginx réel (`staging.kostacademy.com`).
- `docker-compose.snippet.yml` — **brouillon obsolète**, conservé pour
  référence historique uniquement — le déploiement réel n'utilise pas
  docker-compose (voir ci-dessus).
