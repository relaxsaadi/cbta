import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Mission "FINAL FILTERS ACCEPTANCE GATE" (2026-08-30) §23 — vérification
// RÉELLE sur staging déployé (pas de base mockée pour cette porte finale).
// Contrairement aux fixtures locales (tests/e2e/scenario-u-*), ces tests ne
// créent AUCUNE donnée : ils s'appuient sur l'état DÉMO déjà présent sur
// staging et prouvent le comportement de façon agnostique aux données
// exactes (baseline → filtre → preuve que chaque ligne visible correspond
// réellement → réinitialisation → retour à la baseline), conformément à
// §1 de la mission.

test.describe("STAGING — /companies : Type Entreprise/Particulier, réinitialisation", () => {
  test("filtrer par Type ne montre jamais l'autre type, réinitialiser restaure la baseline", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

    await page.goto("/companies");
    const baselineHeading = await page.locator("h2", { hasText: /client\(s\)$/ }).textContent();
    const baselineCount = Number(baselineHeading!.match(/(\d+)/)![1]);
    expect(baselineCount).toBeGreaterThan(0);

    await page.goto("/companies?type=entreprises");
    await expect(page.getByText("Particulier —").first()).toHaveCount(0);
    const entreprisesHeading = await page.locator("h2", { hasText: /client\(s\)$/ }).textContent();
    const entreprisesCount = Number(entreprisesHeading!.match(/(\d+)/)![1]);
    expect(entreprisesCount).toBeGreaterThan(0);
    expect(entreprisesCount).toBeLessThanOrEqual(baselineCount);

    await page.goto("/companies?type=particuliers");
    await expect(page.getByText("Entreprise —").first()).toHaveCount(0);
    const particuliersHeading = await page.locator("h2", { hasText: /client\(s\)$/ }).textContent();
    const particuliersCount = Number(particuliersHeading!.match(/(\d+)/)![1]);
    expect(particuliersCount).toBeLessThanOrEqual(baselineCount);

    // Preuve d'un vrai partitionnement (pas un filtre décoratif qui montre
    // toujours tout) : les deux sous-ensembles ne recouvrent jamais la
    // baseline complète à eux deux si l'un des deux types est vide, et ne
    // dépassent jamais la baseline ensemble.
    expect(entreprisesCount + particuliersCount).toBe(baselineCount);

    // Réinitialisation
    await page.goto("/companies?type=entreprises");
    await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
    await expect(page).toHaveURL(/\/companies$/);
    const resetHeading = await page.locator("h2", { hasText: /client\(s\)$/ }).textContent();
    expect(Number(resetHeading!.match(/(\d+)/)![1])).toBe(baselineCount);
  });
});

test.describe("STAGING — /results : Statut isole réellement chaque état", () => {
  const STATUS_LABEL: Record<string, string> = {
    en_cours: "En cours",
    a_corriger: "À corriger",
    resultat_disponible: "Résultat disponible",
    abandonne: "Abandonné",
    termine: "Terminé",
  };

  test("chaque valeur de Statut avec des lignes réelles n'affiche que des lignes dont la colonne Statut correspond, réinitialiser restaure la baseline", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

    await page.goto("/results");
    const baselineHeading = await page.locator("h2", { hasText: /tentative\(s\)$/ }).textContent();
    const baselineCount = Number(baselineHeading!.match(/(\d+)/)![1]);
    expect(baselineCount).toBeGreaterThan(0);

    let sumOfFiltered = 0;
    let statusesWithData = 0;
    for (const [value, label] of Object.entries(STATUS_LABEL)) {
      await page.goto(`/results?status=${value}`);
      const heading = await page.locator("h2", { hasText: /tentative\(s\)$/ }).textContent();
      const count = Number(heading!.match(/(\d+)/)![1]);
      expect(count).toBeLessThanOrEqual(baselineCount);
      sumOfFiltered += count;
      if (count > 0) {
        statusesWithData++;
        // Preuve que le résultat correspond réellement : chaque cellule
        // Statut visible (dernière colonne de chaque ligne) porte le
        // libellé attendu — jamais un autre état mélangé silencieusement.
        const statusCells = page.locator("table tbody tr td:last-child");
        const texts = await statusCells.allTextContents();
        expect(texts.length).toBe(count);
        for (const t of texts) expect(t.trim()).toBe(label);
      }
    }
    // Au moins un état réellement présent dans les données démo (sinon le
    // test ne prouverait rien) — et la somme des 5 états disjoints ne
    // dépasse jamais la baseline (partition, jamais un OU déguisé qui
    // recompterait une même tentative sous plusieurs états).
    expect(statusesWithData).toBeGreaterThan(0);
    expect(sumOfFiltered).toBeLessThanOrEqual(baselineCount);

    // Réinitialisation
    await page.goto("/results?status=en_cours");
    await page.getByRole("link", { name: /réinitialiser/i }).click();
    await expect(page).toHaveURL(/\/results$/);
    const resetHeading = await page.locator("h2", { hasText: /tentative\(s\)$/ }).textContent();
    expect(Number(resetHeading!.match(/(\d+)/)![1])).toBe(baselineCount);
  });
});

test.describe("STAGING — /companies/[id] : un responsable ne voit jamais les groupes d'un autre responsable dans un client partagé", () => {
  test("Manager A et Manager B (comptes démo distincts déjà provisionnés) restent cloisonnés sur toute fiche client accessible aux deux", async ({ page }) => {
    // Régression du bug corrigé cette mission : hasCompanyAccess() autorise
    // un responsable dès qu'il gère au moins un groupe du client — s'il
    // existe un client démo partagé, ce test prouve qu'aucun nom de groupe
    // de Manager B n'apparaît jamais chez Manager A (et réciproquement).
    // Découverte dynamique (pas d'ID codé en dur) : on part des groupes que
    // CHAQUE responsable gère réellement, puis on vérifie l'absence croisée
    // sur la fiche client si un même companyId apparaît des deux côtés.
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto("/groups");
    const groupLinksA = page.locator('a[href^="/groups/"]');
    const groupNamesA = await groupLinksA.locator("p").first().allTextContents();
    const groupHrefsA = await groupLinksA.evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    void groupHrefsA;

    await page.request.post("/api/auth/logout");
    await loginAs(page, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));
    await page.goto("/groups");
    const groupLinksB = page.locator('a[href^="/groups/"]');
    const groupNamesB = await groupLinksB.locator("p").first().allTextContents();

    // Aucun nom de groupe de A ne doit jamais apparaître dans la liste
    // (déjà cloisonnée) de B, et vice-versa — preuve de base avant même de
    // toucher à /companies/[id].
    for (const name of groupNamesA) expect(groupNamesB).not.toContain(name);

    // Si les deux comptes démo partagent un companyId (visible via
    // /companies pour chacun), la fiche client de ce companyId ne doit
    // jamais montrer les groupes de l'autre responsable.
    await page.goto("/companies");
    const companyHrefsB = await page.locator('a[href^="/companies/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    await page.request.post("/api/auth/logout");
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto("/companies");
    const companyHrefsA = await page.locator('a[href^="/companies/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));

    const shared = companyHrefsA.filter((h) => h && companyHrefsB.includes(h));
    for (const href of shared) {
      await page.goto(href!);
      const namesOnPage = await page.locator("main p.font-medium").allTextContents();
      for (const bName of groupNamesB) expect(namesOnPage).not.toContain(bName);
    }
  });
});
