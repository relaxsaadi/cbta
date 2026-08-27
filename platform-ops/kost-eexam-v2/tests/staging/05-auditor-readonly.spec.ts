import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// §7 AUDITOR — lecture seule réelle : groupe, examen, tentative, réponses
// détaillées, résultats, journal d'audit, incidents ; ne peut jamais
// modifier. Vérifie l'UI (pas de formulaire d'écriture) ET l'application
// serveur (refus sur une page réservée admin).
test("l'auditeur consulte le pilote réel en lecture seule uniquement", async ({ page }) => {
  await loginAs(page, env("STAGING_AUDITOR_USER"), env("STAGING_AUDITOR_PASS"));

  await page.goto("/groups");
  await expect(page.getByText("Air Algérie — DGR Démonstration")).toBeVisible();

  await page.goto("/exam-preparation");
  // .first() : les exécutions répétées de 01-responsable-creates-exam
  // (non idempotent) peuvent laisser plusieurs examens du même nom —
  // simple vérification de présence, pas d'identité.
  await expect(page.getByText("DGR Fonction 7.1 — Examen pilote staging").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /créer le brouillon/i })).toHaveCount(0);

  await page.goto("/results");
  // getByRole('link', ...) : le <select> "Candidat" (addendum §7) contient
  // le même nom en sous-chaîne dans son <option> — ambiguïté avec un
  // getByText nu (même raison qu'ailleurs dans la suite).
  await expect(page.getByRole("link", { name: "Yasmine Kaced (pilote)" })).toBeVisible();
  await page.getByRole("link", { name: "Yasmine Kaced (pilote)" }).first().click();
  await page.waitForURL(/\/results\/\d+/);
  await expect(page.getByText(/marchandise dangereuse/i).first()).toBeVisible();

  await page.goto("/audit-logs");
  await expect(page.getByRole("heading", { name: /journal d'audit/i })).toBeVisible();

  await page.goto("/incidents");
  await expect(page.getByRole("button", { name: /déclarer un incident/i })).toHaveCount(0);

  // Refus serveur réel sur une page réservée administrateur — pas
  // seulement un lien absent du menu.
  await page.goto("/users");
  await expect(page.getByText(/accès refusé/i)).toBeVisible();
});
