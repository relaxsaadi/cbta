# Déploiement V2 — brouillons, non appliqués

Ce dossier documente le déploiement cible mais **rien ici n'a été exécuté sur le
serveur de production**. Aucune action de production irréversible n'a été prise
sans confirmation explicite (règle §34 de la mission). Ce sont des brouillons prêts
pour revue, à adapter (nom de domaine, chemins réels) avant application.

## Ce qui reste à confirmer avant mise en service

1. **Sous-domaine** — `v2.kostacademy.com` est un espace réservé dans
   `nginx-v2-vhost.conf.example`. À remplacer par le sous-domaine réel choisi.
2. **Accès serveur** — le déploiement suppose le même serveur dédié que V1
   (clé SSH `~/.ssh/hostarts_kost_moodle`, déjà utilisée dans une session
   précédente pour l'intégration Moodle), mais cette session n'a pas
   elle-même établi de connexion SSH sortante.
3. **Volume de données** — `/app/data` doit être monté sur un volume Docker
   persistant distinct du conteneur (voir `docker-compose.snippet.yml`),
   jamais recréé à chaque déploiement.
4. **Sauvegarde automatisée** — voir `crontab.example` : sauvegarde
   quotidienne + test de restauration hebdomadaire, tous deux déjà prouvés
   fonctionnels en local (`pnpm backup` / `pnpm restore-test`, voir
   `docs/KOST_EEXAM_V2_ARCHITECTURE.md` §13).
5. **Copie hors site** — le brouillon ne couvre pas encore la réplication
   chiffrée vers un second emplacement (§21 de la mission) — à ajouter au
   script `scripts/backup.ts` ou via un job cron séparé (`rsync`/`rclone`)
   une fois l'hébergement cible confirmé.

## Fichiers

- `nginx-v2-vhost.conf.example` — vhost nginx, reverse proxy vers le
  conteneur `kost-eexam-v2` (port interne 3000).
- `docker-compose.snippet.yml` — bloc de service à ajouter au
  docker-compose existant du serveur (aux côtés de `moodle`, `db`,
  `console` — V1 reste inchangé).
- `crontab.example` — sauvegarde nocturne + test de restauration
  hebdomadaire.
