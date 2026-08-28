#!/bin/bash
# Installé réellement sur staging cette session à
# /root/kost-eexam-v2-stack/monitor.sh, appelé toutes les 10 minutes par
# cron (voir crontab.example). Mission §12 — supervision active minimale :
# vérifie /api/health (DB, fraîcheur backup/restore-test) + l'espace
# disque du volume de données, écrit un événement JSONL structuré dans
# /var/log/kost-eexam-v2-alerts.log à CHAQUE exécution (pas seulement en
# cas d'alerte — utile pour confirmer que la supervision elle-même tourne
# bien), et affiche un résumé lisible sur stdout.
#
# Ce script détecte et journalise les anomalies réellement — il n'envoie
# PAS de notification push (e-mail/SMS/Slack) : le choix du canal
# d'alerte en temps réel dépend d'un outil/service que le propriétaire de
# la plateforme doit choisir (ex. UptimeRobot/Pingdom en pull externe,
# ou un webhook Slack/e-mail en push) — décision de déploiement non
# tranchée, documentée dans docs/KOST_EEXAM_V2_PRODUCTION_READINESS_REPORT.md,
# jamais fabriquée ici sans un canal réel configuré.
set -uo pipefail

ALERT_LOG="/var/log/kost-eexam-v2-alerts.log"
DATA_DIR="/root/kost-eexam-v2-stack/data"
DISK_WARN_PCT=85

ts() { date -Iseconds; }

health_json=$(curl -fsS --max-time 10 http://127.0.0.1:3200/api/health 2>&1)
health_curl_status=$?

disk_pct=$(df -P "$DATA_DIR" 2>/dev/null | awk 'NR==2 {gsub("%","",$5); print $5}')

status="ok"
reasons=()

if [[ $health_curl_status -ne 0 ]]; then
  status="critical"
  reasons+=("health_endpoint_unreachable")
elif ! echo "$health_json" | grep -q '"status":"healthy"'; then
  status="warning"
  reasons+=("health_degraded")
fi

if [[ -n "${disk_pct:-}" ]] && [[ "$disk_pct" -ge "$DISK_WARN_PCT" ]]; then
  [[ "$status" == "ok" ]] && status="warning"
  reasons+=("disk_${disk_pct}pct")
fi

# printf exécute son format une fois même sans argument (produirait
# `[""]` au lieu de `[]` pour un tableau vide, un JSON techniquement
# valide mais trompeur pour ce champ) — garde explicite sur la taille.
reasons_json=""
if [[ ${#reasons[@]} -gt 0 ]]; then
  reasons_json=$(printf '"%s",' "${reasons[@]}" | sed 's/,$//')
fi
printf '{"timestamp":"%s","status":"%s","disk_pct":%s,"reasons":[%s],"health":%s}\n' \
  "$(ts)" "$status" "${disk_pct:-null}" "$reasons_json" "${health_json:-null}" >> "$ALERT_LOG"

if [[ "$status" != "ok" ]]; then
  echo "[kost-eexam-v2 monitor] $status — ${reasons[*]:-}"
else
  echo "[kost-eexam-v2 monitor] ok — disque ${disk_pct}%"
fi
