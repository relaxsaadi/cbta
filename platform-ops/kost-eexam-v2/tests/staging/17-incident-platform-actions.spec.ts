import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Addendum §9-11 — procédure incident : actions plateforme réelles (mode
// maintenance, blocage connexions, blocage nouvelles tentatives) et
// continuité d'examen (une tentative déjà en cours n'est jamais
// interrompue). Chaque test lève systématiquement le blocage à la fin
// (try/finally) pour ne jamais laisser la plateforme bloquée pour les
// specs suivantes de la suite.

async function fetchPdf(page: import("@playwright/test").Page, path: string) {
  return page.evaluate(async (p) => {
    const res = await fetch(p, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf).slice(0, 5);
    return { status: res.status, contentType: res.headers.get("content-type"), magic: new TextDecoder().decode(bytes), size: buf.byteLength };
  }, path);
}

// Déclare un incident plateforme dédié à ce fichier de tests (admin,
// aucun client — champ groupId laissé vide) et navigue jusqu'à sa fiche.
// Évite toute dépendance sur l'état d'un incident déclaré par une AUTRE
// spec (statut ouvert/fermé imprévisible).
async function declareDedicatedIncident(page: import("@playwright/test").Page) {
  await page.goto("/incidents");
  await page.locator("#type").selectOption("security");
  await page.locator("#severity").selectOption("high");
  await page.locator("#description").fill(`Incident dédié E2E §9-11 — actions plateforme (${Date.now()})`);
  await page.getByRole("button", { name: /déclarer un incident/i }).click();
  await page.waitForURL(/\/incidents\/\d+/);
}

test.describe("Procédure incident — document PDF", () => {
  test("le PDF de procédure est un vrai document, accessible au personnel habilité", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    const pdf = await fetchPdf(page, "/api/reports/incident-procedure");
    expect(pdf.status).toBe(200);
    expect(pdf.contentType).toContain("application/pdf");
    expect(pdf.magic).toBe("%PDF-");
    expect(pdf.size).toBeGreaterThan(2000);
  });

  test("un candidat ne peut pas télécharger la procédure (document personnel)", async ({ page }) => {
    await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
    const pdf = await fetchPdf(page, "/api/reports/incident-procedure");
    expect(pdf.status).toBe(403);
  });
});

test.describe("Actions plateforme — blocage des nouvelles connexions", () => {
  test("bloquer les nouvelles connexions empêche un responsable de se connecter, mais jamais l'administrateur", async ({ page, context }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await declareDedicatedIncident(page);
    const incidentUrl = page.url();

    // try/finally démarre AVANT le clic qui active le blocage (pas
    // seulement après) : si l'assertion de bascule elle-même échoue (ex.
    // aléa réseau/rendu), le blocage reste quand même levé en finally —
    // sinon la plateforme reste bloquée pour tout le reste de la suite
    // (constaté en pratique : un échec exactement ici a laissé
    // block_new_attempts=1 en base, cassant en cascade toute tentative
    // d'examen dans les specs suivantes).
    try {
      await page.getByRole("button", { name: "Bloquer les nouvelles connexions" }).click();
      await expect(page.getByRole("button", { name: "Débloquer les nouvelles connexions" })).toBeVisible();

      await context.clearCookies();
      // Soumission directe (pas via loginAs — dont le waitForURL suppose
      // une connexion réussie et attendrait inutilement le délai complet
      // sur un refus attendu).
      await page.goto("/login");
      await page.getByLabel("Nom d'utilisateur").fill(env("STAGING_MANAGER_USER"));
      await page.getByLabel("Mot de passe").fill(env("STAGING_MANAGER_PASS"));
      await page.getByRole("button", { name: /se connecter/i }).click();
      await expect(page.getByText(/connexions temporairement suspendues/i)).toBeVisible();
      await expect(page).toHaveURL(/\/login/);

      // ...mais jamais l'administrateur, qui doit pouvoir lever le blocage.
      await page.goto("/login");
      await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
      await expect(page).toHaveURL(/\/overview/);
    } finally {
      await page.goto(incidentUrl);
      const stillBlocked = await page.getByRole("button", { name: "Débloquer les nouvelles connexions" }).count();
      if (stillBlocked > 0) {
        await page.getByRole("button", { name: "Débloquer les nouvelles connexions" }).click();
      }
    }
  });
});

test.describe("Actions plateforme — continuité d'examen", () => {
  test("bloquer les nouvelles tentatives empêche un nouveau démarrage, sans jamais interrompre une tentative en cours", async ({ page, context }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await declareDedicatedIncident(page);
    const incidentUrl = page.url();

    // Même correction que ci-dessus : le clic qui active le blocage est
    // maintenant DANS le try/finally, pas avant.
    try {
      await page.getByRole("button", { name: "Bloquer les nouvelles tentatives" }).click();
      await expect(page.getByRole("button", { name: "Débloquer les nouvelles tentatives" })).toBeVisible();

      // Bannière visible pour un rôle non-admin déjà connecté.
      await context.clearCookies();
      await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
      await expect(page.getByText(/démarrage de nouvelles tentatives temporairement suspendu/i)).toBeVisible();
    } finally {
      await context.clearCookies();
      await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
      await page.goto(incidentUrl);
      const stillBlocked = await page.getByRole("button", { name: "Débloquer les nouvelles tentatives" }).count();
      if (stillBlocked > 0) {
        await page.getByRole("button", { name: "Débloquer les nouvelles tentatives" }).click();
      }
    }
  });
});

test.describe("Actions plateforme — rattacher une preuve", () => {
  test("rattacher une preuve crée une trace visible dans l'historique de l'incident", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await declareDedicatedIncident(page);

    const marker = `Preuve E2E ${Date.now()}`;
    await page.locator('input[name="evidence"]').fill(marker);
    await page.getByRole("button", { name: "Rattacher" }).click();
    await expect(page.getByText(marker)).toBeVisible();
    await expect(page.getByText("attach_evidence")).toBeVisible();
  });
});
