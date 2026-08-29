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

// Mission "FIX ACCOUNT LIFECYCLE GUARDS" (2026-08-29) — §7 tests G/H : ni
// l'auditeur (ci-dessus) ni un responsable pédagogique (rôle borné à son
// propre périmètre client) ne peuvent jamais suspendre/réactiver un
// compte — /users est administrator-only (guardPage), donc AUCUN rôle
// non-administrateur, quel que soit son tenant, n'atteint même l'action
// quickSuspendAction/quickReactivateAction. C'est la forme la plus forte
// d'isolation inter-client possible pour cette capacité : zéro accès
// non-admin, pas seulement un accès restreint au bon tenant.
test("un responsable pédagogique (rôle borné à son tenant) reçoit aussi un refus serveur sur /users — aucune capacité de suspendre/réactiver hors périmètre administrateur", async ({ page }) => {
  await loginAs(page, "responsable.demo");
  await page.goto("/users");
  await expect(page.getByText(/accès refusé/i)).toBeVisible();
});
