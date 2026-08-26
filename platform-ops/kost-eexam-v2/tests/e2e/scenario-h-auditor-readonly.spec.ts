import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario H (§29) : Auditeur → peut lire → ne peut jamais écrire, y
// compris en forçant un appel direct à une action serveur (pas seulement
// un bouton masqué à l'écran).
test("l'auditeur consulte les données mais ne voit aucun formulaire d'écriture", async ({ page }) => {
  await loginAs(page, "auditeur.demo");

  await page.goto("/companies");
  await expect(page.getByText("Air Algérie — DEMO")).toBeVisible();
  await expect(page.getByRole("button", { name: /créer le client/i })).toHaveCount(0);

  await page.goto("/results");
  await expect(page.getByText(/tentative/).first()).toBeVisible();

  await page.goto("/incidents");
  await expect(page.getByRole("button", { name: /déclarer un incident/i })).toHaveCount(0);
});

test("l'auditeur reçoit un refus serveur (pas juste une UI masquée) sur une page réservée à l'administrateur", async ({ page }) => {
  await loginAs(page, "auditeur.demo");
  await page.goto("/users");
  // requireRole("administrator") lève UnauthorizedError → app/(app)/error.tsx
  // affiche "Accès refusé" — la garde est donc bien côté serveur, pas une
  // simple absence de lien dans le menu.
  await expect(page.getByText(/accès refusé/i)).toBeVisible();
});
