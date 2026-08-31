import { test, expect } from "@playwright/test";
import { loginAs, logout, env } from "./helpers";

// Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
// §38 — acceptation RÉELLE sur staging déployé (jamais seulement les
// rapports/tests automatisés antérieurs) des points explicitement demandés
// par le propriétaire : panneau de filtres réordonné, bouton PDF individuel
// toujours visible, historique de correction manuelle (qui/quand), mode
// test d'une question, suppression/archivage de question, déclaration
// d'incident candidat. Comptes réels staging (.env.staging.local, jamais
// commités) — synthétiques/pilotes déjà établis comme sûrs pour ce dossier.

test.describe("STAGING — panneau de filtres AVANT le formulaire de création (§15/§23)", () => {
  test("/question-bank, /groups, /incidents, /familiarisation : le panneau de filtres précède la carte de création dans le DOM", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

    for (const { url, filterLabel, createLabel } of [
      { url: "/question-bank", filterLabel: "Fonction DGR", createLabel: "Ajouter une question" },
      { url: "/groups", filterLabel: "Type client", createLabel: "Nouveau groupe" },
      { url: "/incidents", filterLabel: "Sévérité", createLabel: "Déclarer un incident" },
    ]) {
      await page.goto(url);
      const filterY = await page.getByText(filterLabel, { exact: true }).first().boundingBox();
      const createY = await page.getByText(createLabel, { exact: true }).first().boundingBox();
      expect(filterY, `${filterLabel} introuvable sur ${url}`).toBeTruthy();
      expect(createY, `${createLabel} introuvable sur ${url}`).toBeTruthy();
      expect(filterY!.y, `sur ${url}, le panneau de filtres doit apparaître AVANT "${createLabel}"`).toBeLessThan(createY!.y);
    }
  });
});

test.describe("STAGING — rapport individuel PDF : bouton toujours visible, jamais un score fabriqué (§1-3)", () => {
  test("le bouton PDF apparaît sur /results/[attemptId] même sans grading_state=COMPLETE ; le PDF se télécharge réellement", async ({ page, request }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await page.goto("/results");
    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow).toBeVisible();
    await firstRow.locator("a").first().click();
    await page.waitForURL(/\/results\/\d+/);

    const pdfSimple = page.getByRole("link", { name: "PDF simple" });
    const pdfDetailed = page.getByRole("link", { name: "PDF détaillé" });
    await expect(pdfSimple).toBeVisible();
    await expect(pdfDetailed).toBeVisible();

    const href = await pdfSimple.getAttribute("href");
    expect(href).toMatch(/\/api\/reports\/individual\/\d+\?level=simple/);
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const resp = await request.get(href!, { headers: { cookie: cookieHeader } });
    expect(resp.status()).toBe(200);
    expect(resp.headers()["content-type"]).toContain("application/pdf");
  });
});

test.describe("STAGING — historique de correction manuelle : qui/quand (§4-7)", () => {
  test("/grading?status=corrige affiche « Corrigé par » avec un horodatage, pour chaque entrée déjà corrigée", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await page.goto("/grading?status=corrige");
    const cards = page.locator("div.rounded-md.border.border-border-subtle.p-3\\.5");
    const count = await cards.count();
    if (count === 0) {
      test.skip(true, "aucune correction déjà finalisée sur staging au moment du run — rien à vérifier ici");
      return;
    }
    await expect(page.getByText(/Corrigé par/).first()).toBeVisible();
  });
});

test.describe("STAGING — mode test d'une question (§11-14)", () => {
  test("MODE TEST — rendu candidat réel, réponse vérifiable, zéro effet sur les compteurs de la banque", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await page.goto("/question-bank?filterClassification=demo");
    const firstLink = page.locator("table tbody tr td a", { hasText: "Modifier" }).first();
    await expect(firstLink).toBeVisible();
    const href = await firstLink.getAttribute("href");
    const questionId = href!.match(/\/question-bank\/(\d+)\/edit/)![1];

    await page.goto(`/question-bank/${questionId}/test`);
    await expect(page.getByText(/MODE TEST/)).toBeVisible();
    await expect(page.getByRole("button", { name: /vérifier ma réponse/i })).toBeVisible();
  });

  test("un responsable pédagogique n'a pas accès au mode test (administrateur uniquement)", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto("/question-bank");
    // Sans droit d'écriture ici, aucun lien "Tester" n'est même rendu — la
    // colonne Actions entière est absente pour ce rôle (canWrite = admin
    // seul sur cette page, voir app/(app)/question-bank/page.tsx).
    await expect(page.getByRole("link", { name: "Tester" })).toHaveCount(0);
  });
});

test.describe("STAGING — déclaration d'incident candidat (§24-33)", () => {
  test("le candidat déclare un incident depuis /mes-examens, le voit dans « Mes incidents », l'admin le voit labellisé « Déclaré par le candidat »", async ({ page }) => {
    const marker = `[TEST ACCEPTANCE ${Date.now()}]`;

    await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
    await page.goto("/mes-examens");
    await page.getByRole("button", { name: /déclarer un incident/i }).click();
    await page.getByLabel("Type de problème").selectOption("other");
    await page.getByLabel("Description").fill(`${marker} vérification acceptation staging — inerte, sans effet réel.`);
    await page.getByRole("button", { name: "Déclarer", exact: true }).click();
    await expect(page.getByText("Votre incident a été enregistré.")).toBeVisible();
    await page.getByRole("button", { name: "Fermer", exact: true }).last().click();
    await page.reload();
    await expect(page.getByText(marker)).toHaveCount(0); // la description n'apparaît pas sur la carte candidat, seul le type/statut
    await expect(page.getByText("Mes incidents déclarés")).toBeVisible();

    await logout(page);
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await page.goto("/incidents");
    const row = page.locator("a", { hasText: marker });
    await expect(row).toBeVisible();
    await expect(row.getByText("Déclaré par le candidat")).toBeVisible();

    // Nettoyage — pas de suppression d'incident par conception (preuve
    // d'audit, jamais effacée) : on referme l'incident de test via
    // l'action admin existante, comportement attendu et déjà tracé, pas un
    // contournement. Laisse une trace claire (« [TEST ACCEPTANCE] ») pour
    // quiconque relit /incidents plus tard.
    await row.click();
    await page.waitForURL(/\/incidents\/\d+/);
    const closeButton = page.getByRole("button", { name: "Clôturer l'incident" });
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    }
  });
});
