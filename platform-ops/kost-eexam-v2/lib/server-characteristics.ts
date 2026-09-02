// Caractéristiques de l'environnement serveur KOST E-EXAM V2 (mission
// "URGENT AUDITOR FOLLOW-UP — ALGERIA TIMEZONE + SERVER CHARACTERISTICS",
// 2026-09-02, Partie B) — instantané VÉRIFIÉ EN DIRECT sur le VPS de
// staging réel (jamais une valeur reprise d'une documentation ancienne),
// via inspection SSH manuelle (`uname`, `lscpu`, `free`, `df`, `docker`,
// `timedatectl`, `openssl s_client`, `crontab -l`). RAM/disque disponibles
// sont des valeurs AU MOMENT DE L'INSPECTION (varient dans le temps) —
// jamais présentées comme une mesure temps réel de ce document.
//
// AUCUN SECRET NI IDENTIFIANT SENSIBLE ICI (§10 de la mission) : pas
// d'adresse IP publique/privée, pas d'identifiant/clé/empreinte SSH, pas
// de mot de passe, pas de chaîne de connexion, pas de valeur de variable
// d'environnement, pas de règle de pare-feu.
export const SERVER_CHARACTERISTICS_INSPECTION_DATE = "2026-09-02T10:06:35.000Z"; // 11:06 heure d'Algérie

export interface ServerCharacteristic {
  label: string;
  value: string;
}

export const SERVER_CHARACTERISTICS: ServerCharacteristic[] = [
  { label: "Environnement", value: "VPS dédié (hébergement externe), non mutualisé" },
  { label: "Système d'exploitation", value: "Ubuntu 20.04.6 LTS (Focal Fossa)" },
  { label: "Noyau / architecture", value: "Linux 5.4.0-216-generic — x86_64" },
  { label: "Processeur", value: "Intel Xeon (Cascadelake) — 4 vCPU" },
  { label: "Mémoire (RAM)", value: "7,8 Go au total — 5,6 Go disponibles au moment de l'inspection" },
  { label: "Mémoire d'échange (swap)", value: "Aucune configurée" },
  { label: "Stockage", value: "158 Go au total — 84 Go utilisés — 67 Go disponibles (56 %)" },
  { label: "Conteneurisation", value: "Docker 26.1.3 — conteneur applicatif isolé, politique de redémarrage automatique" },
  { label: "Environnement d'exécution", value: "Node.js 24.19.0" },
  { label: "Framework applicatif", value: "Next.js 16.3.1 (App Router)" },
  { label: "Base de données", value: "SQLite 3.53.3 — fichier applicatif dédié, mode WAL" },
  { label: "Reverse proxy / HTTPS", value: "nginx 1.18.0 — certificat TLS Let's Encrypt actif et valide" },
  { label: "Fuseau horaire du serveur (système)", value: "Africa/Algiers (UTC+1)" },
  { label: "Fuseau horaire applicatif (affichage utilisateur)", value: "Africa/Algiers (UTC+1) — voir lib/timezone.ts" },
  { label: "État du conteneur applicatif", value: "En service, redémarrage automatique en cas d'arrêt" },
  {
    label: "Sauvegardes",
    value: "Automatiques quotidiennes sur l'hôte avec test de restauration automatisé hebdomadaire ; copie hors site chiffrée non encore configurée (décision propriétaire en attente)",
  },
];

export const ARCHITECTURE_DESCRIPTION =
  "KOST E-EXAM V2 est exécuté dans un environnement serveur dédié et conteneurisé. La plateforme applique une authentification par rôle, une journalisation des actions, un contrôle serveur des durées d'examen et une conservation persistante des données selon l'architecture actuellement configurée.";

export const SECURITY_DISCLAIMER =
  "Ce document présente les caractéristiques techniques générales de l'environnement d'exécution, à titre d'information pour l'audit. Il ne constitue ni une certification, ni une garantie contractuelle de disponibilité, de performance ou de conformité, et ne contient aucune information d'accès (identifiants, clés, adresses réseau).";
