// Fuseau horaire officiel d'affichage de KOST E-EXAM V2 (mission "URGENT
// AUDITOR FOLLOW-UP — ALGERIA TIMEZONE", 2026-09-02) — SOURCE UNIQUE DE
// VÉRITÉ pour tout horodatage présenté à un utilisateur (écrans, PDF,
// emails). Ne change JAMAIS le stockage — les instants restent en UTC en
// base (voir lib/db.ts, colonnes TEXT ISO 8601) et ne sont jamais réécrits
// pour "corriger" leur affichage ; seul le RENDU passe systématiquement
// par ce fuseau IANA.
//
// Pourquoi Africa/Algiers et jamais Europe/Paris : l'Algérie reste à
// UTC+1 toute l'année (aucun changement d'heure), alors que Europe/Paris
// bascule à UTC+2 pendant l'heure d'été européenne (dernier dimanche de
// mars à fin octobre) — d'où le décalage d'1h constaté par l'auditeur sur
// tout rendu qui utilisait encore Europe/Paris. Jamais non plus un
// décalage arithmétique manuel ("+1h") : la conversion doit passer par ce
// fuseau IANA (Intl.DateTimeFormat gère lui-même les règles réelles,
// y compris un futur changement réglementaire éventuel).
export const APP_TIME_ZONE = "Africa/Algiers";

// Étiquette explicite pour les documents imprimés/archivés (mission §5) —
// jamais un horodatage nu sans indication de fuseau sur un rapport/PDF.
export const ALGERIA_TZ_LABEL = "heure d'Algérie (UTC+1)";

const LOCALE = "fr-FR";

function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

/** Date + heure courtes (ex. "02/09/2026 11:30"), fuseau Africa/Algiers. */
export function formatAlgeriaDateTime(value: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  }).format(toDate(value));
}

/** Date courte seule (ex. "02/09/2026"), fuseau Africa/Algiers. */
export function formatAlgeriaDate(value: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...opts,
  }).format(toDate(value));
}

/** Heure courte seule (ex. "11:30"), fuseau Africa/Algiers. */
export function formatAlgeriaTime(value: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  }).format(toDate(value));
}

/** Date + heure en toutes lettres (ex. "Samedi 5 septembre 2026 à
 * 09:00"), fuseau Africa/Algiers — reprend le rendu déjà utilisé par les
 * emails candidat (lib/email/format.ts) avant cette mission, migré sur le
 * fuseau canonique au lieu du défaut Europe/Paris précédent. */
export function formatAlgeriaDateTimeLong(value: string | Date): string {
  const formatted = new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  }).format(toDate(value));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Date seule en toutes lettres (ex. "Samedi 5 septembre 2026"), fuseau
 * Africa/Algiers. */
export function formatAlgeriaDateLong(value: string | Date): string {
  const formatted = new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(toDate(value));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
