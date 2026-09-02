import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  APP_TIME_ZONE,
  formatAlgeriaDateTime,
  formatAlgeriaDate,
  formatAlgeriaTime,
  formatAlgeriaDateTimeLong,
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
