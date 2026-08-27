import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Addendum §7 — filtres CSV complets : entreprise, groupe, fonction, examen,
// date, réussite/échec, candidat. Chaque filtre isolé doit se répercuter
// sur le contenu réel du CSV (pas juste être accepté sans effet), et le
// périmètre tenant doit continuer à s'appliquer en ET par-dessus.
const ASSESSMENT_A_ID = 1;
const ASSESSMENT_B_ID = 3;

async function fetchCsv(page: import("@playwright/test").Page, path: string) {
  return page.evaluate(async (p) => {
    const res = await fetch(p, { credentials: "same-origin" });
    return { status: res.status, body: await res.text() };
  }, path);
}

test.describe("Filtres CSV — écran /results", () => {
  test("le panneau de filtres expose groupe, examen, candidat et dates", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto("/results");
    await expect(page.locator("#groupId")).toBeVisible();
    await expect(page.locator("#assessmentId")).toBeVisible();
    await expect(page.locator("#candidateUserId")).toBeVisible();
    await expect(page.locator("#dateFrom")).toBeVisible();
    await expect(page.locator("#dateTo")).toBeVisible();
    // Le sélecteur candidat ne doit lister QUE les candidats du périmètre
    // du responsable — jamais Company B.
    const candidateOptions = await page.locator("#candidateUserId option").allTextContents();
    expect(candidateOptions.some((t) => t.includes("Zerrouki"))).toBe(false);
  });

  test("filtrer par candidat ne montre que ses propres tentatives", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto("/results");
    const optionLabel = (await page.locator("#candidateUserId option", { hasText: "Yasmine Kaced" }).textContent())!.trim();
    await page.locator("#candidateUserId").selectOption({ label: optionLabel });
    await page.getByRole("button", { name: /filtrer/i }).click();
    // getByRole('link', ...) plutôt que getByText : le libellé de l'option
    // du <select> ("Yasmine Kaced (pilote) (Air Algérie — DEMO)") contient
    // la même sous-chaîne que le nom recherché — un getByText nu
    // matcherait l'<option> masquée du select fermé, jamais visible.
    await expect(page.getByRole("link", { name: "Yasmine Kaced (pilote)" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Riad Boumediene (pilote)" })).toHaveCount(0);
  });

  test("filtrer par date exclut les tentatives hors plage", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    // Plage future — aucune tentative ne peut avoir eu lieu demain.
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    await page.goto(`/results?dateFrom=${tomorrow}`);
    await expect(page.getByText(/0 tentative/)).toBeVisible();
  });
});

test.describe("Filtres CSV — API export (contenu réel, pas juste accepté)", () => {
  test("?candidateUserId isole le CSV résumé à un seul candidat", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    // Récupère l'id réel de Yasmine depuis le select plutôt qu'un id deviné.
    await page.goto("/results");
    const candidateId = await page.locator("#candidateUserId option", { hasText: "Yasmine Kaced" }).getAttribute("value");
    expect(candidateId).toBeTruthy();

    const filtered = await fetchCsv(page, `/api/results/export?candidateUserId=${candidateId}`);
    expect(filtered.status).toBe(200);
    expect(filtered.body).toContain("Yasmine Kaced");
    expect(filtered.body).not.toContain("Riad Boumediene");
  });

  test("?assessmentId isole le CSV détaillé à un seul examen", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    const onlyA = await fetchCsv(page, `/api/results/export-answers?assessmentId=${ASSESSMENT_A_ID}`);
    expect(onlyA.status).toBe(200);
    expect(onlyA.body).toContain("Yasmine Kaced");

    // Isolation tenant toujours active même sur l'export filtré par examen :
    // le responsable A ne doit jamais voir Company B via ?assessmentId forgé.
    await page.context().clearCookies();
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    const forgedB = await fetchCsv(page, `/api/results/export-answers?assessmentId=${ASSESSMENT_B_ID}`);
    expect(forgedB.status).toBe(200);
    expect(forgedB.body.trim().split("\n").length).toBeLessThanOrEqual(1); // en-têtes seulement, aucune ligne
  });

  test("?passed=false isole les échecs uniquement", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    const failedOnly = await fetchCsv(page, `/api/results/export?passed=false`);
    expect(failedOnly.status).toBe(200);
    expect(failedOnly.body).toContain("Riad Boumediene");
    expect(failedOnly.body).not.toContain("Yasmine Kaced");
  });

  test("plage de dates hors pilote renvoie un CSV vide (en-têtes seulement)", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const empty = await fetchCsv(page, `/api/results/export?dateFrom=${future}`);
    expect(empty.status).toBe(200);
    expect(empty.body.trim().split("\n").length).toBeLessThanOrEqual(1);
  });
});
