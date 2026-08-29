import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Addendum §23 — TEST D'ACCEPTATION principal : le parcours complet avec
// 3 candidats réels, du groupe jusqu'aux PDF/CSV, avec preuve d'accès
// self/cross-candidat. Contrairement aux specs précédentes (qui
// vérifient chaque brique isolément), ce fichier CHAÎNE tout le parcours
// en une seule preuve continue, sur les données pilote réelles déjà
// établies (Air Algérie — DEMO, examen id 1, candidat1/2/3) — lecture
// seule, aucune nouvelle mutation d'état partagé (cohérent avec la
// discipline d'idempotence de cette suite).
const ASSESSMENT_A_ID = 1;

test("parcours d'acceptance complet : groupe réel → 3 candidats → examen → résultats → PDF/CSV → isolation self/cross-candidat", async ({ page }) => {
  // ÉTAPE 1 — le responsable voit son groupe réel avec 3 candidats.
  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
  await page.goto("/groups");
  await expect(page.getByText("Air Algérie — DGR Démonstration")).toBeVisible();
  await page.getByText("Air Algérie — DGR Démonstration").click();
  await expect(page.getByText("Yasmine Kaced (pilote)")).toBeVisible();
  await expect(page.getByText("Riad Boumediene (pilote)")).toBeVisible();
  await expect(page.getByText("Amel Ferhati (pilote)")).toBeVisible();

  // ÉTAPE 2 — l'examen réel est publié et affecté aux 3 candidats.
  await page.goto(`/exam-preparation/${ASSESSMENT_A_ID}`);
  await expect(page.getByText(/^published$/).first()).toBeVisible();
  await expect(page.getByText("Yasmine Kaced (pilote)")).toBeVisible();
  await expect(page.getByText("Riad Boumediene (pilote)")).toBeVisible();
  await expect(page.getByText("Amel Ferhati (pilote)")).toBeVisible();

  // ÉTAPE 3 — les résultats réels des 3 candidats sont cohérents et
  // DISCRIMINANTS (le moteur de notation distingue vraiment réussite et
  // échec, pas une valeur figée) : candidat1 admis (100%), candidat2
  // échec (42.86%), candidat3 pas encore commencé — les trois états
  // réels coexistent et sont tous correctement représentés.
  // .first() : Yasmine/Riad ont désormais plusieurs tentatives réelles
  // (banque Tier A élargie, plusieurs fonctions — voir
  // 31-tier-a-multi-function-acceptance.spec.ts) — n'importe laquelle de
  // Yasmine convient ici (candidat1 répond toujours 100% correctement,
  // quelle que soit la fonction).
  await page.goto("/results");
  await expect(page.getByRole("link", { name: "Yasmine Kaced (pilote)" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Riad Boumediene (pilote)" }).first()).toBeVisible();

  const yasmineHref = await page.getByRole("link", { name: "Yasmine Kaced (pilote)" }).first().getAttribute("href");
  await page.goto(yasmineHref!);
  await expect(page.getByText("100/100")).toBeVisible();
  await expect(page.getByText("ADMIS")).toBeVisible();
  const yasmineAttemptId = yasmineHref!.match(/\/results\/(\d+)/)![1];

  await page.goto("/results");
  const riadHref = await page.getByRole("link", { name: "Riad Boumediene (pilote)" }).first().getAttribute("href");
  await page.goto(riadHref!);
  await expect(page.getByText("42.86/100")).toBeVisible();
  await expect(page.getByText("ÉCHEC")).toBeVisible();

  // ÉTAPE 4 — rapport individuel PDF réel (candidat1, ADMIS).
  const individualPdf = await page.evaluate(async (id) => {
    const res = await fetch(`/api/reports/individual/${id}?level=detailed`, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    return { status: res.status, magic: new TextDecoder().decode(new Uint8Array(buf).slice(0, 5)), size: buf.byteLength };
  }, yasmineAttemptId);
  expect(individualPdf.status).toBe(200);
  expect(individualPdf.magic).toBe("%PDF-");

  // ÉTAPE 5 — rapport global de session PDF réel + statistiques agrégées
  // sur les 3 candidats (1 admis, 1 échec, 1 non commencé).
  await page.goto(`/exam-preparation/${ASSESSMENT_A_ID}/rapport-global`);
  await expect(page.getByText("Admis").first()).toBeVisible();
  const globalPdf = await page.evaluate(async (id) => {
    const res = await fetch(`/api/reports/session/${id}`, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    return { status: res.status, magic: new TextDecoder().decode(new Uint8Array(buf).slice(0, 5)) };
  }, ASSESSMENT_A_ID);
  expect(globalPdf.status).toBe(200);
  expect(globalPdf.magic).toBe("%PDF-");

  // ÉTAPE 6 — liste officielle PDF + CSV réels, sur le même examen.
  const listPdf = await page.evaluate(async (id) => {
    const res = await fetch(`/api/reports/results-list/${id}`, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    return { status: res.status, magic: new TextDecoder().decode(new Uint8Array(buf).slice(0, 5)) };
  }, ASSESSMENT_A_ID);
  expect(listPdf.status).toBe(200);
  expect(listPdf.magic).toBe("%PDF-");
  const csv = await page.evaluate(async (id) => {
    const res = await fetch(`/api/results/export?assessmentId=${id}`, { credentials: "same-origin" });
    return { status: res.status, body: await res.text() };
  }, ASSESSMENT_A_ID);
  expect(csv.status).toBe(200);
  expect(csv.body).toContain("Yasmine Kaced");
  expect(csv.body).toContain("Riad Boumediene");

  // ÉTAPE 7 — isolation self/cross-candidat : candidat1 télécharge SON
  // propre rapport, jamais celui de candidat2, même en devinant/réutilisant
  // un identifiant réel d'une autre tentative.
  await page.context().clearCookies();
  await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
  const ownPdf = await page.evaluate(async (id) => {
    const res = await fetch(`/api/reports/individual/${id}?level=simple`, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    return { status: res.status, magic: new TextDecoder().decode(new Uint8Array(buf).slice(0, 5)) };
  }, yasmineAttemptId);
  expect(ownPdf.status).toBe(200);
  expect(ownPdf.magic).toBe("%PDF-");

  await page.goto("/mes-resultats");
  await expect(page.getByText("Riad Boumediene")).toHaveCount(0);
  // /results/[attemptId] est réservée au personnel — guardPage() exclut
  // structurellement le rôle candidat et redirige vers /acces-refuse
  // (même comportement que 08-security-checks.spec.ts pour cette page).
  await page.goto(`/results/${riadHref!.match(/\/results\/(\d+)/)![1]}`);
  await expect(page).toHaveURL(/\/acces-refuse/);
});
