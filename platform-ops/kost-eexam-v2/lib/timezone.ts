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

/** Décalage (en ms) de `timeZone` par rapport à UTC, TEL QU'IL S'APPLIQUE
 * à l'instant UTC donné — calculé via Intl (jamais une constante "+1h"
 * codée en dur), pour rester correct même si la règle du fuseau
 * changeait un jour. Positif si `timeZone` est en avance sur UTC (cas de
 * Africa/Algiers, UTC+1 toute l'année). */
function timeZoneOffsetMs(utcInstant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(utcInstant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  // Lit les composants de date/heure TELS QU'AFFICHÉS dans `timeZone`,
  // puis les réinterprète comme s'ils étaient déjà de l'UTC — l'écart
  // avec l'instant UTC d'origine EST le décalage du fuseau à cet instant.
  const asIfUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asIfUtc - utcInstant.getTime();
}

/** Parse strictement les composants civils produits par datetime-local.
 *
 * Important : `Date.parse()` seul n'est PAS un validateur de calendrier.
 * JavaScript normalise certaines dates impossibles (par exemple
 * `2026-02-31` devient mars) au lieu de retourner NaN. Comme cette valeur
 * pilote l'ouverture réelle d'un examen, une requête Server Action forgée
 * doit échouer plutôt que programmer silencieusement un autre jour.
 */
function parseStrictLocalDateTime(localValue: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(localValue);
  if (!match) {
    throw new Error(`Date/heure invalide : "${localValue}".`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");

  if (
    year < 1 ||
    month < 1 || month > 12 ||
    day < 1 || day > 31 ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59 ||
    second < 0 || second > 59
  ) {
    throw new Error(`Date/heure invalide : "${localValue}".`);
  }

  // Utiliser setUTCFullYear évite le comportement historique de Date.UTC
  // qui traite les années 0..99 comme 1900..1999. Le round-trip des
  // composants rejette ensuite toute normalisation de calendrier
  // (31 février, 29 février hors année bissextile, etc.).
  const asIfUtc = new Date(0);
  asIfUtc.setUTCHours(0, 0, 0, 0);
  asIfUtc.setUTCFullYear(year, month - 1, day);
  asIfUtc.setUTCHours(hour, minute, second, 0);

  if (
    asIfUtc.getUTCFullYear() !== year ||
    asIfUtc.getUTCMonth() !== month - 1 ||
    asIfUtc.getUTCDate() !== day ||
    asIfUtc.getUTCHours() !== hour ||
    asIfUtc.getUTCMinutes() !== minute ||
    asIfUtc.getUTCSeconds() !== second
  ) {
    throw new Error(`Date/heure invalide : "${localValue}".`);
  }

  return asIfUtc;
}

/** Convertit une valeur SANS fuseau saisie par un formulaire (ex. un
 * `<input type="datetime-local">`, "2026-09-02T11:30" — un navigateur ne
 * lui attache JAMAIS de fuseau) en instant UTC réel, en interprétant
 * EXPLICITEMENT cette valeur comme une heure murale d'Africa/Algiers —
 * jamais Europe/Paris, jamais un `new Date(valeur)` brut (qui
 * l'interpréterait comme l'heure locale du PROCESSUS Node, c'est-à-dire
 * UTC sur le conteneur de production — bug réel corrigé par cette
 * fonction, mission "URGENT — FIX ONLY EXAM SCHEDULING +1H BUG",
 * 2026-09-02 : un responsable saisissant 11:30 se retrouvait avec un
 * examen programmé à 12:30 affiché). Jamais un décalage arithmétique
 * manuel — le décalage réel d'Africa/Algiers est calculé via Intl
 * (timeZoneOffsetMs), pas codé en dur.
 *
 * Retourne une chaîne ISO 8601 UTC (même format que nowIso(), lib/db.ts)
 * — ce que la couche de stockage attend déjà pour toute autre colonne
 * horodatée.
 *
 * @throws si `localValue` n'est pas un datetime-local civil réellement
 * valide (jamais de normalisation silencieuse d'une date impossible).
 */
export function parseAlgeriaLocalDateTimeToUtc(localValue: string): string {
  const trimmed = localValue.trim();
  const asIfUtc = parseStrictLocalDateTime(trimmed);
  const asIfUtcMs = asIfUtc.getTime();
  const offsetMs = timeZoneOffsetMs(asIfUtc, APP_TIME_ZONE);
  // La valeur saisie représente l'heure murale À Alger ; l'instant UTC
  // réel est donc en RETARD de ce décalage (Alger = UTC + offsetMs).
  return new Date(asIfUtcMs - offsetMs).toISOString();
}

/** Sens INVERSE de parseAlgeriaLocalDateTimeToUtc — reconvertit un
 * instant UTC stocké (ex. "2026-09-02T10:30:00.000Z") en la chaîne SANS
 * fuseau qu'un `<input type="datetime-local">` attend comme
 * `defaultValue`/`value` ("2026-09-02T11:30"), en heure murale
 * Africa/Algiers. Contrepartie obligatoire du correctif WRITE ci-dessus :
 * sans elle, RE-OUVRIR le formulaire de reprogrammation après une
 * sauvegarde désormais correcte réafficherait quand même la mauvaise
 * heure préremplie (l'heure UTC brute au lieu de l'heure d'Alger saisie).
 * `null`/vide → chaîne vide (aucune borne définie). */
export function formatAlgeriaDateTimeInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(toDate(value));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
