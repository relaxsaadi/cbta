import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Mission "AUTHORIZED P1 FIX — LOGOUT REDIRECT" (2026-08-30) §6 —
// vérification RÉELLE sur staging (Chromium Playwright isolé) que le
// correctif fonctionne en conditions réelles derrière nginx, jamais
// seulement en local où APP_BASE_URL == baseURL du serveur de test (donc
// où le bug d'origine ne pouvait pas se manifester).
test("Staging réel — Se déconnecter (admin) aboutit à https://staging.kostacademy.com/login, jamais localhost", async ({ page }) => {
  const responses: { url: string; status: number; location: string | null }[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/api/auth/logout")) {
      responses.push({ url: response.url(), status: response.status(), location: response.headers()["location"] ?? null });
    }
  });

  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
  await page.getByRole("button", { name: /se déconnecter/i }).click();
  await page.waitForURL(/\/login/, { timeout: 15000 });

  expect(responses.length).toBeGreaterThan(0);
  expect(responses[0]!.status).toBe(303);
  expect(responses[0]!.location).toBe("https://staging.kostacademy.com/login");
  expect(responses[0]!.location).not.toContain("localhost");
  expect(responses[0]!.location).not.toContain("127.0.0.1");
  expect(responses[0]!.location).not.toContain("0.0.0.0");

  await expect(page).toHaveURL("https://staging.kostacademy.com/login");
  await expect(page.getByLabel("Nom d'utilisateur")).toBeVisible();

  // Retour arrière / page protégée après déconnexion — authentification exigée.
  await page.goto("/overview");
  await expect(page).toHaveURL(/\/login/);
});

test("Staging réel — Se déconnecter (auditeur) — même correctif, rôle différent", async ({ page }) => {
  const responses: { url: string; status: number; location: string | null }[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/api/auth/logout")) {
      responses.push({ url: response.url(), status: response.status(), location: response.headers()["location"] ?? null });
    }
  });

  await loginAs(page, env("STAGING_AUDITOR_USER"), env("STAGING_AUDITOR_PASS"));
  await page.getByRole("button", { name: /se déconnecter/i }).click();
  await page.waitForURL(/\/login/, { timeout: 15000 });

  expect(responses[0]!.status).toBe(303);
  expect(responses[0]!.location).toBe("https://staging.kostacademy.com/login");

  await page.goto("/audit-logs");
  await expect(page).toHaveURL(/\/login/);
});
