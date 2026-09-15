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

echo "== 1/5 rsync code (jamais .env*/node_modules/.next/.git/data/*.db) =="
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

echo "== 2/5 docker build (image taggée kost-eexam-v2:latest) =="
ssh -i "$SSH_KEY" "$HOST" "cd $REMOTE_APP_DIR && docker build -t kost-eexam-v2:latest ."

echo "== 3/5 préflight DB/readiness AVANT coupure du conteneur courant =="
# Le nouveau code est exécuté dans un conteneur jetable contre le volume DB
# persistant pendant que le service courant reste intact. Une anomalie de rôle
# ou de relation candidat stoppe donc le script AVANT `docker rm -f` : jamais
# de bascule vers un déploiement non validé. migrate.ts reste additif ;
# enforce-role-cardinality n'installe l'index unique user_roles(user_id) que si
# l'inventaire persistant est déjà propre et ne choisit/supprime/réécrit aucune
# preuve contradictoire. check-role-integrity est strictement read-only.
ssh -i "$SSH_KEY" "$HOST" "cd $REMOTE_STACK_DIR && docker run --rm --env-file .env -v $REMOTE_STACK_DIR/data:/app/data kost-eexam-v2:latest sh -lc 'node_modules/.bin/tsx scripts/migrate.ts && node_modules/.bin/tsx scripts/enforce-role-cardinality.ts && node_modules/.bin/tsx scripts/check-role-integrity.ts'"

echo "== 4/5 docker rm -f + docker run (jamais 'docker restart') =="
# --log-opt max-size/max-file : rotation réelle des logs du conteneur
# (mission §12 — trouvé SANS rotation cette session, corrigé ici ; le
# pilote json-file de Docker n'a par défaut AUCUNE limite de taille).
ssh -i "$SSH_KEY" "$HOST" "cd $REMOTE_STACK_DIR && docker rm -f kost-eexam-v2 && docker run -d --name kost-eexam-v2 --restart unless-stopped -p 127.0.0.1:3200:3000 --env-file .env -v $REMOTE_STACK_DIR/data:/app/data --log-opt max-size=10m --log-opt max-file=5 kost-eexam-v2:latest"

echo "== 5/5 smoke + readiness post-cutover =="
sleep 2
# Confirme que le nouveau conteneur répond réellement et que le même volume
# DB reste propre après démarrage. Le curl local évite de dépendre du DNS/TLS
# public pour ce contrôle de processus ; la régression E2E externe reste une
# validation séparée avant toute promotion de production.
ssh -i "$SSH_KEY" "$HOST" "curl -fsS -o /dev/null http://127.0.0.1:3200/login && docker exec kost-eexam-v2 node_modules/.bin/tsx scripts/check-role-integrity.ts"

echo "== Terminé — staging redéployé avec préflight DB + smoke local ; exécuter la régression E2E externe avant toute promotion production =="
