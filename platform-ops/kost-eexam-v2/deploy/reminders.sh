#!/bin/sh
# Rappels d'examen optionnels (EXAM_OPENS_SOON / EXAM_NOW_AVAILABLE /
# EXAM_DEADLINE_REMINDER, mission email §22-23) — même convention que
# deploy/sweep.sh : le jeton est lu depuis .env par ce script wrapper
# plutôt qu'une substitution de variable d'environnement crontab (crontab
# n'a pas accès aux variables du shell de connexion). NON ENCORE INSTALLÉ
# sur staging à la différence de sweep.sh — voir docs/
# KOST_EEXAM_V2_RESEND_OPERATIONS.md pour l'étape d'installation restante
# (copier ce fichier vers /root/kost-eexam-v2-stack/reminders.sh puis
# ajouter la ligne crontab correspondante, voir crontab.example).
set -e
TOKEN=$(grep '^SWEEP_TOKEN=' /root/kost-eexam-v2-stack/.env | cut -d= -f2-)
curl -fsS -X POST http://127.0.0.1:3200/api/notifications/reminders -H "Authorization: Bearer ${TOKEN}"
echo
