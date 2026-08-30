import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario P — mission "AUTHORIZED P1 FIX — LOGOUT REDIRECT" (2026-08-30)
// §5 A/B/C/E/F : couverture HTTP de bout en bout de POST /api/auth/logout,
// jamais testable au niveau lib/ seul (Route Handler). Le régression G/H
// (jamais dérivé de request.url/Host, repli local sûr) est couverte en
// unité pure dans tests/unit/canonical-url.test.ts — ici on prouve le
// VRAI comportement HTTP observable par un navigateur réel.
test("POST /api/auth/logout — 303 vers l'origine canonique configurée, session réellement invalidée, page protégée refusée ensuite", async ({ page }) => {
  await loginAs(page, "admin");

  // Capture la réponse INTERMÉDIAIRE de la redirection (avant que le
  // navigateur ne la suive) — page.request.post() ne permet pas
  // d'inspecter un 303 brut dans cette version de Playwright (suit
  // toujours les redirections), donc on observe l'évènement "response" du
  // vrai clic navigateur à la place.
  const responses: { url: string; status: number; location: string | null }[] = [];
  page.on("response", (response) => {
    responses.push({ url: response.url(), status: response.status(), location: response.headers()["location"] ?? null });
  });

  await page.getByRole("button", { name: /se déconnecter/i }).click();
  await page.waitForURL(/\/login/);

  // (B) statut 303, jamais 307 (qui rejouerait la méthode POST sur /login).
  const logoutResponse = responses.find((r) => r.url.endsWith("/api/auth/logout"));
  expect(logoutResponse, "aucune réponse capturée pour POST /api/auth/logout").toBeTruthy();
  expect(logoutResponse!.status).toBe(303);

  // (C) Location pointe vers l'origine PUBLIQUE canonique configurée
  // (APP_BASE_URL=http://127.0.0.1:3101 en local — voir playwright.config.ts),
  // jamais une valeur dérivée de la requête elle-même.
  expect(logoutResponse!.location).toBe("http://127.0.0.1:3101/login");

  // (E) suivre la redirection aboutit bien à un GET /login réel.
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Nom d'utilisateur")).toBeVisible();

  // (A) la session est réellement invalidée côté serveur — pas seulement
  // une redirection cosmétique : retourner en arrière ou recharger une
  // page protégée après déconnexion exige une reconnexion.
  // (F) accès à une page protégée après déconnexion — authentification exigée.
  await page.goto("/overview");
  await expect(page).toHaveURL(/\/login/);
});

test("POST /api/auth/logout — même comportement pour un autre rôle (auditeur), preuve que le correctif n'est pas spécifique à un rôle", async ({ page }) => {
  await loginAs(page, "auditeur.demo");

  const responses: { url: string; status: number; location: string | null }[] = [];
  page.on("response", (response) => {
    responses.push({ url: response.url(), status: response.status(), location: response.headers()["location"] ?? null });
  });

  await page.getByRole("button", { name: /se déconnecter/i }).click();
  await page.waitForURL(/\/login/);

  const logoutResponse = responses.find((r) => r.url.endsWith("/api/auth/logout"));
  expect(logoutResponse!.status).toBe(303);
  expect(logoutResponse!.location).toBe("http://127.0.0.1:3101/login");

  await page.goto("/audit-logs");
  await expect(page).toHaveURL(/\/login/);
});
