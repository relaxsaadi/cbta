import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Revue pré-auditeur — §"CROSS-COMPANY / CROSS-TENANT ISOLATION". Deux
// clients réels et distincts sur le staging réel :
//   Company A = Air Algérie — DEMO      (company id 1, groupe id 1, examen id 1)
//   Company B = Tassili Airlines — DEMO (company id 2, groupe id 2, examen id 3)
// Chacun avec son propre responsable pédagogique, son propre candidat, et
// pour B une tentative réelle déjà notée (100/100) — voir
// scripts/seed-company-b.ts. Ces identifiants sont ceux réellement créés
// sur staging.kostacademy.com (constatés en base après exécution du script,
// pas des valeurs supposées).
const COMPANY_A_ID = 1;
const GROUP_A_ID = 1;
const ASSESSMENT_A_ID = 1;
const ATTEMPT_A_ID = 15; // candidat1.staging
const COMPANY_A_NAME = "Air Algérie — DEMO";

const COMPANY_B_ID = 2;
const GROUP_B_ID = 2;
const ASSESSMENT_B_ID = 3;
const ATTEMPT_B_ID = 17; // candidat-b.staging
const COMPANY_B_NAME = "Tassili Airlines — DEMO";
const CANDIDATE_B_NAME = "Karim Zerrouki (pilote B)";

test.describe("Isolation UI — navigation normale, jamais l'autre client visible", () => {
  test("responsable A ne voit jamais Company B en naviguant normalement", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));

    await page.goto("/companies");
    await expect(page.getByText(COMPANY_A_NAME)).toBeVisible();
    await expect(page.getByText(COMPANY_B_NAME)).toHaveCount(0);

    await page.goto("/groups");
    await expect(page.getByText(COMPANY_B_NAME)).toHaveCount(0);

    await page.goto("/exam-preparation");
    await expect(page.getByText(/Isolation multi-client \(Company B\)/)).toHaveCount(0);

    await page.goto("/results");
    await expect(page.getByText(CANDIDATE_B_NAME)).toHaveCount(0);
  });

  test("responsable B ne voit jamais Company A en naviguant normalement", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));

    await page.goto("/companies");
    await expect(page.getByText(COMPANY_B_NAME)).toBeVisible();
    await expect(page.getByText(COMPANY_A_NAME)).toHaveCount(0);

    await page.goto("/results");
    await expect(page.getByText("Yasmine Kaced")).toHaveCount(0);
    await expect(page.getByText("Riad Boumediene")).toHaveCount(0);
  });
});

test.describe("Isolation URL directe — identifiant deviné/forgé de l'autre client", () => {
  test("responsable A : chaque ressource Company B répond 404, jamais les données", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));

    for (const path of [
      `/companies/${COMPANY_B_ID}`,
      `/groups/${GROUP_B_ID}`,
      `/exam-preparation/${ASSESSMENT_B_ID}`,
      `/results/${ATTEMPT_B_ID}`,
    ]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} doit répondre 404`).toBe(404);
      await expect(page.getByText(COMPANY_B_NAME)).toHaveCount(0);
      await expect(page.getByText(CANDIDATE_B_NAME)).toHaveCount(0);
    }
  });

  test("responsable B : chaque ressource Company A répond 404, jamais les données", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));

    for (const path of [
      `/companies/${COMPANY_A_ID}`,
      `/groups/${GROUP_A_ID}`,
      `/exam-preparation/${ASSESSMENT_A_ID}`,
      `/results/${ATTEMPT_A_ID}`,
    ]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} doit répondre 404`).toBe(404);
      await expect(page.getByText(COMPANY_A_NAME)).toHaveCount(0);
      await expect(page.getByText("marchandise dangereuse", { exact: false })).toHaveCount(0);
    }
  });
});

test.describe("Isolation serveur/API — paramètre companyId forgé sur l'export CSV", () => {
  async function fetchAsText(page: import("@playwright/test").Page, path: string) {
    return page.evaluate(async (p) => {
      const res = await fetch(p, { credentials: "same-origin" });
      return { status: res.status, body: await res.text() };
    }, path);
  }

  test("responsable A : l'export CSV ne contient jamais Company B, même en forçant ?companyId=B", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));

    // Sans filtre — le périmètre par défaut ne doit déjà montrer que A.
    const own = await fetchAsText(page, "/api/results/export");
    expect(own.status).toBe(200);
    expect(own.body).toContain("Yasmine Kaced");
    expect(own.body).not.toContain(CANDIDATE_B_NAME);
    expect(own.body).not.toContain(COMPANY_B_NAME);

    // ?companyId=<Company B> forgé explicitement — la restriction serveur
    // (restrictToGroupIds, calculée depuis la session) doit primer : ET,
    // jamais OU, avec le paramètre client.
    const forced = await fetchAsText(page, `/api/results/export?companyId=${COMPANY_B_ID}`);
    expect(forced.status).toBe(200);
    expect(forced.body).not.toContain(CANDIDATE_B_NAME);
    expect(forced.body).not.toContain(COMPANY_B_NAME);

    const forcedDetailed = await fetchAsText(page, `/api/results/export-answers?companyId=${COMPANY_B_ID}`);
    expect(forcedDetailed.status).toBe(200);
    expect(forcedDetailed.body).not.toContain(CANDIDATE_B_NAME);
  });

  test("responsable B : l'export CSV ne contient jamais Company A, même en forçant ?companyId=A", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));

    const forced = await fetchAsText(page, `/api/results/export?companyId=${COMPANY_A_ID}`);
    expect(forced.status).toBe(200);
    expect(forced.body).not.toContain("Yasmine Kaced");
    expect(forced.body).not.toContain("Riad Boumediene");
    expect(forced.body).not.toContain(COMPANY_A_NAME);
  });
});

test.describe("Périmètres élargis attendus — administrateur global, auditeur global en lecture", () => {
  test("administrateur voit les deux clients et peut ouvrir les deux directement par URL", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

    await page.goto("/companies");
    await expect(page.getByText(COMPANY_A_NAME)).toBeVisible();
    await expect(page.getByText(COMPANY_B_NAME)).toBeVisible();

    const respA = await page.goto(`/companies/${COMPANY_A_ID}`);
    expect(respA?.status()).toBe(200);
    const respB = await page.goto(`/companies/${COMPANY_B_ID}`);
    expect(respB?.status()).toBe(200);

    const attemptA = await page.goto(`/results/${ATTEMPT_A_ID}`);
    expect(attemptA?.status()).toBe(200);
    const attemptB = await page.goto(`/results/${ATTEMPT_B_ID}`);
    expect(attemptB?.status()).toBe(200);
    // .first() : le rapport individuel enrichi (addendum §3) répète
    // maintenant le nom du candidat dans la carte "Identité" en plus de
    // l'en-tête — deux correspondances légitimes, pas une ambiguïté.
    await expect(page.getByText(CANDIDATE_B_NAME).first()).toBeVisible();
  });

  test("auditeur lit les deux clients (périmètre d'audit global prévu) mais ne peut rien écrire", async ({ page }) => {
    await loginAs(page, env("STAGING_AUDITOR_USER"), env("STAGING_AUDITOR_PASS"));

    await page.goto("/results");
    // getByRole('link', ...) : le <select> "Candidat" (addendum §7) sur
    // /results contient les mêmes noms en sous-chaîne dans ses <option> —
    // un getByText nu matcherait aussi l'option masquée (ambiguïté).
    // .first() : Yasmine a désormais plusieurs tentatives réelles (banque
    // Tier A élargie, plusieurs fonctions) — simple vérification de
    // présence ici, pas d'identité précise.
    await expect(page.getByRole("link", { name: "Yasmine Kaced (pilote)" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: CANDIDATE_B_NAME })).toBeVisible();

    const attemptB = await page.goto(`/results/${ATTEMPT_B_ID}`);
    expect(attemptB?.status()).toBe(200);

    // Lecture seule déjà prouvée en détail par 05-auditor-readonly.spec.ts
    // (absence des contrôles d'écriture + refus serveur sur /users) — ici
    // on confirme seulement que la lecture globale couvre bien les DEUX
    // clients, pas juste le premier.
    await page.goto("/exam-preparation");
    await expect(page.getByRole("button", { name: /créer une évaluation/i })).toHaveCount(0);
  });
});
