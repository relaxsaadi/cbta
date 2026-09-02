import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  APP_TIME_ZONE,
  formatAlgeriaDateTime,
  formatAlgeriaDate,
  formatAlgeriaTime,
  formatAlgeriaDateTimeLong,
  parseAlgeriaLocalDateTimeToUtc,
  formatAlgeriaDateTimeInputValue,
} from "../../lib/timezone";

// Mission "URGENT AUDITOR FOLLOW-UP — ALGERIA TIMEZONE" (2026-09-02) §7 —
// preuve qu'un instant UTC connu s'affiche correctement en Africa/Algiers
// (UTC+1 toute l'année, jamais de changement d'heure), et PAS comme
// Europe/Paris pendant l'heure d'été européenne (qui aurait décalé
// l'affichage d'1h de plus). 09:00 UTC en septembre (période d'heure
// d'été européenne, Europe/Paris = UTC+2) doit afficher 10:00 en Algérie
// (UTC+1), jamais 11:00 (ce qu'aurait donné Europe/Paris).
describe("Fuseau horaire canonique Africa/Algiers (lib/timezone.ts)", () => {
  test("APP_TIME_ZONE est bien Africa/Algiers, jamais Europe/Paris", () => {
    assert.equal(APP_TIME_ZONE, "Africa/Algiers");
  });

  test("09:00 UTC (période d'heure d'été européenne) affiche 10:00 heure d'Algérie, jamais 11:00 (Europe/Paris)", () => {
    const instant = "2026-09-02T09:00:00.000Z";
    assert.equal(formatAlgeriaTime(instant), "10:00");
    // Preuve négative explicite (§7) : Europe/Paris aurait donné 11:00 ici
    // (UTC+2 en septembre) — jamais l'affichage attendu par l'auditeur.
    const parisTime = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(new Date(instant));
    assert.equal(parisTime, "11:00");
    assert.notEqual(formatAlgeriaTime(instant), parisTime);
  });

  test("09:00 UTC en plein hiver (hors DST européenne) affiche aussi 10:00 heure d'Algérie — l'Algérie ne change jamais d'heure", () => {
    const instant = "2026-01-15T09:00:00.000Z";
    assert.equal(formatAlgeriaTime(instant), "10:00");
    // En janvier, Europe/Paris = UTC+1, donc coïncide avec l'Algérie —
    // ce cas prouve que le fuseau canonique reste correct même quand
    // Europe/Paris donnerait accidentellement la même heure (le bug ne
    // se voit qu'en été, d'où l'audit explicite des deux saisons).
    const parisTime = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(new Date(instant));
    assert.equal(parisTime, "10:00");
  });

  test("formatAlgeriaDateTime rend une date+heure complète cohérente avec le fuseau Algérie", () => {
    const instant = "2026-09-02T23:30:00.000Z"; // 00:30 le lendemain à Alger
    assert.equal(formatAlgeriaDateTime(instant), "03/09/2026 00:30");
  });

  test("formatAlgeriaDate rend uniquement la date, sans dérive de jour au passage minuit UTC/Algérie", () => {
    const instant = "2026-09-02T23:30:00.000Z"; // 23:30 UTC == 00:30 le 3 à Alger
    assert.equal(formatAlgeriaDate(instant), "03/09/2026");
  });

  test("formatAlgeriaDateTimeLong capitalise et inclut le fuseau attendu (heure d'été européenne)", () => {
    const instant = "2026-09-02T09:00:00.000Z";
    const rendered = formatAlgeriaDateTimeLong(instant);
    assert.match(rendered, /^Mercredi 2 septembre 2026 à 10:00$/);
  });

  test("accepte un objet Date en plus d'une chaîne ISO", () => {
    const instant = new Date("2026-09-02T09:00:00.000Z");
    assert.equal(formatAlgeriaTime(instant), "10:00");
  });
});

// Mission "URGENT — FIX ONLY EXAM SCHEDULING +1H BUG" (2026-09-02) —
// preuve du sens WRITE (formulaire → UTC stocké), symétrique de la preuve
// DISPLAY ci-dessus (UTC stocké → écran). Bug réel : une valeur
// <input type="datetime-local"> ("2026-09-02T11:30", SANS fuseau) passait
// jusqu'ici brute à new Date(), interprétée comme l'heure locale du
// PROCESSUS Node (UTC sur le conteneur) plutôt que comme une heure
// murale d'Alger — un responsable saisissant 11:30 programmait en réalité
// un examen à 12:30 heure d'Algérie.
describe("Analyse WRITE : datetime-local → UTC via parseAlgeriaLocalDateTimeToUtc (lib/timezone.ts)", () => {
  test("11:30 saisi (Alger) → 10:30:00.000Z stocké — jamais 11:30Z (l'ancien bug) ni 12:30Z", () => {
    assert.equal(parseAlgeriaLocalDateTimeToUtc("2026-09-02T11:30"), "2026-09-02T10:30:00.000Z");
  });

  test("15:00 saisi (Alger) → 14:00:00.000Z stocké", () => {
    assert.equal(parseAlgeriaLocalDateTimeToUtc("2026-09-02T15:00"), "2026-09-02T14:00:00.000Z");
  });

  test("round-trip complet : saisie 11:30 → stockage UTC → réaffichage Africa/Algiers redonne exactement 11:30, jamais 12:30", () => {
    const storedUtc = parseAlgeriaLocalDateTimeToUtc("2026-09-02T11:30");
    assert.equal(formatAlgeriaTime(storedUtc), "11:30");
  });

  test("accepte les secondes explicites (format datetime-local complet)", () => {
    assert.equal(parseAlgeriaLocalDateTimeToUtc("2026-09-02T11:30:00"), "2026-09-02T10:30:00.000Z");
  });

  test("un passage de minuit (23:30 Alger → 22:30Z, jour inchangé côté UTC ici) reste correct", () => {
    assert.equal(parseAlgeriaLocalDateTimeToUtc("2026-09-02T23:30"), "2026-09-02T22:30:00.000Z");
  });

  test("une valeur illisible lève une erreur explicite, jamais un instant faux silencieux", () => {
    assert.throws(() => parseAlgeriaLocalDateTimeToUtc("pas-une-date"));
  });

  test("le fuseau utilisé est bien Africa/Algiers, jamais Europe/Paris (l'écart resterait +1h même en été si Europe/Paris était encore utilisé par erreur)", () => {
    // Si le bug consistait à utiliser Europe/Paris (UTC+2 en septembre)
    // au lieu d'Africa/Algiers (UTC+1 toute l'année), 11:30 saisi aurait
    // donné 09:30Z au lieu du 10:30Z attendu — cette assertion échouerait.
    assert.notEqual(parseAlgeriaLocalDateTimeToUtc("2026-09-02T11:30"), "2026-09-02T09:30:00.000Z");
    assert.equal(parseAlgeriaLocalDateTimeToUtc("2026-09-02T11:30"), "2026-09-02T10:30:00.000Z");
  });

  test("formatAlgeriaDateTimeInputValue est l'inverse exact de parseAlgeriaLocalDateTimeToUtc — re-ouvrir le formulaire réaffiche la valeur saisie à l'origine, jamais l'heure UTC brute", () => {
    const stored = parseAlgeriaLocalDateTimeToUtc("2026-09-02T11:30");
    assert.equal(formatAlgeriaDateTimeInputValue(stored), "2026-09-02T11:30");
  });

  test("formatAlgeriaDateTimeInputValue(null/vide) → chaîne vide, jamais 'Invalid Date'", () => {
    assert.equal(formatAlgeriaDateTimeInputValue(null), "");
    assert.equal(formatAlgeriaDateTimeInputValue(undefined), "");
    assert.equal(formatAlgeriaDateTimeInputValue(""), "");
  });
});
