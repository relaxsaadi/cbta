import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario Z — mission "URGENT AUDITOR FOLLOW-UP — ALGERIA TIMEZONE +
// SERVER CHARACTERISTICS" (2026-09-02) §14 : périmètre du nouveau
// document "Caractéristiques serveur" — même RBAC que /system dont il
// dépend (administrator + auditeur lecture seule), jamais responsable
// pédagogique/candidat (hors de leur périmètre métier).
process.env.DB_PATH = "./data/e2e-test.db";

test("administrateur peut télécharger le PDF caractéristiques serveur, depuis /system", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/system");
  await expect(page.getByRole("link", { name: "Caractéristiques serveur — PDF" })).toBeVisible();
  const resp = await page.request.get("/api/reports/server-characteristics");
  expect(resp.status()).toBe(200);
  expect(resp.headers()["content-type"]).toContain("application/pdf");
  const buf = await resp.body();
  expect(buf.subarray(0, 4).toString("ascii")).toBe("%PDF");
});

test("auditeur peut télécharger le PDF caractéristiques serveur (lecture seule)", async ({ page }) => {
  await loginAs(page, "auditeur.demo");
  const resp = await page.request.get("/api/reports/server-characteristics");
  expect(resp.status()).toBe(200);
});

test("responsable pédagogique et candidat n'ont pas accès au PDF caractéristiques serveur (hors de leur périmètre)", async ({ page }) => {
  await loginAs(page, "responsable.demo");
  const respManager = await page.request.get("/api/reports/server-characteristics");
  expect(respManager.status()).toBe(403);

  await page.request.post("/api/auth/logout");
  await loginAs(page, "candidat1.demo");
  const respCandidate = await page.request.get("/api/reports/server-characteristics");
  expect(respCandidate.status()).toBe(403);
});
