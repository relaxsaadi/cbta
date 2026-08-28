#!/bin/sh
# Installé réellement sur staging à /root/kost-eexam-v2-stack/sweep.sh,
# appelé toutes les 5 minutes par cron (voir crontab.example). Balayage
# périodique des tentatives expirées (§8) — filet de sécurité pour les
# candidats qui ferment l'onglet / perdent le réseau sans jamais revenir.
# Le code applicatif déclenche déjà ce même balayage à l'affichage de
# /mes-examens (voir app/(app)/mes-examens/page.tsx), mais ça ne suffit
# pas si personne ne visite cette page pendant un moment (nuit, cohorte
# réduite) — d'où ce filet indépendant de toute visite.
set -e
TOKEN=$(grep '^SWEEP_TOKEN=' /root/kost-eexam-v2-stack/.env | cut -d= -f2-)
curl -fsS -X POST http://127.0.0.1:3200/api/attempts/sweep -H "Authorization: Bearer ${TOKEN}"
echo
