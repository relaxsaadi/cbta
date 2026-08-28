import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Mission "PRODUCTION READINESS" §12 — device/viewport (jamais testé avant
// cette session, seul Chromium desktop existait). Ce fichier est
// délibérément un SOUS-ENSEMBLE ciblé des parcours les plus critiques —
// pas la suite complète de 78 tests, qui prouve déjà toute la logique
// métier une fois sur Chromium desktop. Ici on vérifie autre chose : que
// la mise en page reste UTILISABLE (pas de recouvrement, pas de débordement
// horizontal, éléments cliquables atteignables) sur mobile/tablette/WebKit.
// Exécuté via playwright.staging.config.ts sur 3 projets dédiés
// (mobile-safari, tablet, desktop-webkit) EN PLUS de chromium (suite
// complète) — voir la config pour le mapping desktop/tablette/mobile/WebKit
// demandé par la mission.

test("connexion — le formulaire est utilisable et rien ne déborde horizontalement", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Nom d'utilisateur")).toBeVisible();
  await expect(page.getByLabel("Mot de passe")).toBeVisible();
  const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(bodyWidth, "aucun débordement horizontal sur /login").toBeLessThanOrEqual(viewportWidth + 1);
});

test("responsable pédagogique — connexion + navigation, menu mobile fonctionnel, pas de débordement", async ({ page }) => {
  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
  await expect(page).toHaveURL(/\/overview/);

  // Sur mobile/tablette, le menu latéral est masqué par défaut (voir
  // Sidebar.tsx, `mobileOpen`) — le bouton hamburger du Topbar doit
  // l'ouvrir. Sur desktop-webkit (viewport large), la sidebar est déjà
  // visible en permanence — le bouton n'existe alors pas (masqué par
  // `md:hidden`), ce qui est le comportement attendu, pas une erreur.
  const menuButton = page.getByRole("button", { name: "Ouvrir le menu" });
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
    await expect(page.getByRole("link", { name: "Groupes" })).toBeVisible();
  } else {
    await expect(page.getByRole("link", { name: "Groupes" })).toBeVisible();
  }

  for (const path of ["/overview", "/companies", "/results"]) {
    await page.goto(path);
    const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth, `aucun débordement horizontal sur ${path}`).toBeLessThanOrEqual(viewportWidth + 1);
  }
});

test("candidat — /mes-examens et /mes-resultats restent utilisables (le rôle le plus critique)", async ({ page }) => {
  // Volontairement PAS de démarrage/soumission réel de tentative ici — ce
  // fichier tourne sur PLUSIEURS projets navigateur/viewport (voir
  // playwright.staging.config.ts) ; consommer une tentative unique du
  // compte de démo sur le premier projet casserait les suivants (garantie
  // anti-double-tentative, prouvée par ailleurs dans tests/unit), et
  // l'historique réel de ce compte varie au fil des exécutions de la suite
  // complète (aucun examen "à commencer" garanti disponible à tout moment).
  // La preuve fonctionnelle du parcours complet (démarrage→réponse→
  // rafraîchissement→soumission) est déjà apportée une fois, en profondeur,
  // par scenario-c-candidate-flow / 20-acceptance-main-workflow (Chromium
  // desktop) — ici on vérifie uniquement l'UTILISABILITÉ de la mise en page
  // sur d'autres appareils, pas la logique métier (déjà prouvée ailleurs).
  await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
  await expect(page).toHaveURL(/\/mes-examens/);

  for (const path of ["/mes-examens", "/mes-resultats"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth, `aucun débordement horizontal sur ${path}`).toBeLessThanOrEqual(viewportWidth + 1);
  }
});
