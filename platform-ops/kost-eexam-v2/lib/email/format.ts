// Formatage date/heure pour email (mission §19) — jamais un timestamp UTC
// brut présenté à un candidat. Exemple attendu : "Samedi 5 septembre 2026
// à 09:00" avec le fuseau explicite en dessous.
import { getDefaultTimezone } from "./config";

export function formatCandidateDateTime(isoString: string, timeZone?: string): string {
  const tz = timeZone ?? getDefaultTimezone();
  const date = new Date(isoString);
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(date);
  // Intl produit "samedi 5 septembre 2026 à 09:00" (déjà avec "à") — mise
  // en majuscule de la première lettre pour un rendu email plus soigné.
  const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  return `${capitalized} (${tz})`;
}

export function formatCandidateDate(isoString: string, timeZone?: string): string {
  const tz = timeZone ?? getDefaultTimezone();
  const date = new Date(isoString);
  const formatted = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
