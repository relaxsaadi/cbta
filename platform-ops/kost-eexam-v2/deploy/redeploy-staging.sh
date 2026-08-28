#!/bin/bash
# Séquence de redéploiement STAGING réelle, prouvée en usage répété cette
# session (pas un brouillon — voir deploy/README.md pour le contexte
# historique des autres fichiers de ce dossier). docker-compose n'est PAS
# utilisé sur ce serveur : la version installée (1.25.0) ne supporte pas
# le format de fichier "3.8" du docker-compose.yml existant — `docker
# build` + `docker rm -f` + `docker run` directement, jamais `docker
# restart` (qui ne reprendrait pas une image reconstruite).
#
# Usage : ./deploy/redeploy-staging.sh
# (lancé depuis un poste avec accès SSH ~/.ssh/hostarts_kost_moodle —
# jamais depuis le serveur lui-même)
set -euo pipefail

SSH_KEY="$HOME/.ssh/hostarts_kost_moodle"
HOST="root@102.206.40.221"
REMOTE_APP_DIR="/root/kost-eexam-v2-stack/app"
REMOTE_STACK_DIR="/root/kost-eexam-v2-stack"

echo "== 1/4 rsync code (jamais .env*/node_modules/.next/.git/data/*.db) =="
rsync -az --delete \
  --exclude '.env*' \
  --exclude '.moodle-extracts' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'data' \
  --exclude '*.db' \
  -e "ssh -i $SSH_KEY" \
  ./ "$HOST:$REMOTE_APP_DIR/"

echo "== 2/4 docker build (image taggée kost-eexam-v2:latest) =="
ssh -i "$SSH_KEY" "$HOST" "cd $REMOTE_APP_DIR && docker build -t kost-eexam-v2:latest ."

echo "== 3/4 docker rm -f + docker run (jamais 'docker restart') =="
# --log-opt max-size/max-file : rotation réelle des logs du conteneur
# (mission §12 — trouvé SANS rotation cette session, corrigé ici ; le
# pilote json-file de Docker n'a par défaut AUCUNE limite de taille).
ssh -i "$SSH_KEY" "$HOST" "cd $REMOTE_STACK_DIR && docker rm -f kost-eexam-v2 && docker run -d --name kost-eexam-v2 --restart unless-stopped -p 127.0.0.1:3200:3000 --env-file .env -v $REMOTE_STACK_DIR/data:/app/data --log-opt max-size=10m --log-opt max-file=5 kost-eexam-v2:latest"

echo "== 4/4 migration schéma (idempotente — ADDITIVE_COLUMNS, jamais destructive) =="
sleep 2
ssh -i "$SSH_KEY" "$HOST" "docker exec kost-eexam-v2 node_modules/.bin/tsx scripts/migrate.ts"

echo "== Terminé — vérifier manuellement (curl /login, logs, régression E2E) avant de considérer le déploiement validé =="
