import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Mission "PRODUCTION READINESS" §3 — édition, import CSV en masse,
// export, recherche. Groupe isolé dédié (jamais le groupe pilote partagé
// — même discipline que 23-auditor-critical-check.spec.ts après son
// incident de pollution) + garde d'idempotence sur nom fixe.
const COMPANY_NAME = "Vérification Auditeur — Isolée";
const GROUP_NAME = "Groupe vérification isolée";
const RUN_TAG = "candidate-mgmt-check";

test("édition, import CSV en masse, export et recherche — cycle complet", async ({ page }) => {
  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));

  // Ce test réutilise l'entreprise/groupe isolés déjà créés par
  // 23-auditor-critical-check.spec.ts (garantis exister après un premier
  // run complet de la suite) — jamais le groupe pilote partagé.
  await page.goto("/groups");
  await page.getByText(GROUP_NAME).click();
  await page.waitForURL(/\/groups\/\d+/);
  const groupUrl = page.url();

  // ÉTAPE 1 — import CSV en masse : 2 candidats réels, un valide, un avec
  // mot de passe trop court (preuve que le rapport ligne par ligne
  // distingue vraiment succès/erreur, pas un succès supposé en bloc).
  await page.getByRole("button", { name: /import csv en masse/i }).click();
  const csvContent = [
    "full_name,username,password",
    `Test Import Un ${RUN_TAG},import.un.${RUN_TAG},MotDePasse2026!`,
    `Test Import Deux ${RUN_TAG},import.deux.${RUN_TAG},court`,
  ].join("\n");
  await page.locator('textarea[name="csv"]').fill(csvContent);
  await page.getByRole("button", { name: /^importer$/i }).click();
  // "1 créé" à la première exécution, "1 déjà membre" à toute
  // réexécution (le compte/l'appartenance persistent d'un run à
  // l'autre, username fixe) — les deux sont un succès légitime, jamais
  // une erreur ; seule la ligne au mot de passe trop court doit rester
  // une erreur à CHAQUE exécution (ce compte n'est jamais créé).
  await expect(page.getByText(/1 créé|1 déjà membre/)).toBeVisible();
  await expect(page.getByText(/1 erreur/)).toBeVisible();
  await expect(page.getByText(`import.un.${RUN_TAG}`).first()).toBeVisible();

  // Regex plutôt qu'un texte exact : à partir de la 2e exécution, le nom
  // porte déjà " Modifié" (persistant, posé par l'étape 2 d'un run
  // précédent — jamais réécrasé par un réimport CSV d'un compte déjà
  // existant, volontairement — voir bulkImportCandidatesAction).
  const importedNamePattern = new RegExp(`Test Import Un (Modifié )?${RUN_TAG}`);
  await page.goto(groupUrl);
  await expect(page.getByText(importedNamePattern).first()).toBeVisible();
  await expect(page.getByText(`Test Import Deux ${RUN_TAG}`)).toHaveCount(0);

  // ÉTAPE 2 — édition inline : nom complet mis à jour, affiché
  // immédiatement (revalidatePath, pas seulement en mémoire côté client).
  const row = page.locator("div.rounded-md.border-border-subtle").filter({ hasText: importedNamePattern }).first();
  await row.getByRole("button", { name: /modifier/i }).click();
  await row.locator('input[name="fullName"]').fill(`Test Import Un Modifié ${RUN_TAG}`);
  await row.getByRole("button", { name: /enregistrer/i }).click();
  await expect(page.getByText(`Test Import Un Modifié ${RUN_TAG}`)).toBeVisible();

  // ÉTAPE 3 — recherche : filtre le roster côté serveur, pas seulement
  // masqué côté client.
  await page.goto(groupUrl);
  await page.locator('input[name="q"]').fill(RUN_TAG);
  await page.locator('input[name="q"]').press("Enter");
  await expect(page).toHaveURL(new RegExp(`q=${RUN_TAG}`));
  await expect(page.getByText(`Test Import Un Modifié ${RUN_TAG}`)).toBeVisible();
  // Vérifie qu'un candidat existant HORS recherche (le fixture isolé
  // lui-même) n'apparaît pas dans les résultats filtrés.
  await expect(page.getByText("Candidat Vérification Auditeur", { exact: true })).toHaveCount(0);

  // ÉTAPE 4 — export CSV réel, contenu vérifié (pas juste 200).
  const csv = await page.evaluate(async (url) => {
    const res = await fetch(url, { credentials: "same-origin" });
    return { status: res.status, body: await res.text() };
  }, `${new URL(groupUrl).pathname.replace("/groups/", "/api/groups/")}/candidates-export`);
  expect(csv.status).toBe(200);
  expect(csv.body).toContain(`Test Import Un Modifié ${RUN_TAG}`);
  expect(csv.body).toContain(`import.un.${RUN_TAG}`);
});

test("isolation tenant : le responsable B ne peut pas éditer/exporter le roster du responsable A", async ({ page }) => {
  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
  await page.goto("/groups");
  await page.getByText(GROUP_NAME).click();
  await page.waitForURL(/\/groups\/\d+/);
  const groupId = page.url().match(/\/groups\/(\d+)/)![1];

  await page.context().clearCookies();
  await loginAs(page, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));
  const exportResp = await page.evaluate(async (id) => {
    const res = await fetch(`/api/groups/${id}/candidates-export`, { credentials: "same-origin" });
    return { status: res.status };
  }, groupId);
  expect(exportResp.status).not.toBe(200);

  const directUrl = await page.goto(`/groups/${groupId}`);
  expect(directUrl?.status()).toBe(404);
});
