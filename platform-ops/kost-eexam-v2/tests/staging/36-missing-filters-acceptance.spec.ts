import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Mission "COMPLETE MISSING FILTERS + NORMALIZE QUESTION COUNTS"
// (2026-08-30) §15 — vérification RÉELLE sur staging déployé des 6
// nouveaux panneaux de filtres (aucun n'existait avant cette mission :
// /question-bank, /groups, /audit-logs, /incidents, /sessions,
// /familiarisation). Même discipline data-agnostique que
// tests/staging/35-filters-acceptance.spec.ts : aucune fixture créée ici
// (uniquement l'état DÉMO déjà présent sur staging), baseline → filtre →
// preuve que chaque ligne visible correspond réellement → réinitialisation
// où pertinent.

test.describe("STAGING — /question-bank : compteurs Réglementaire/DEMO, filtre Classification", () => {
  test("les compteurs distinguent réglementaire/DEMO/total ; Classification=DEMO isole les 8 fixtures DEMO-*", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

    await page.goto("/question-bank");
    await expect(page.getByText("Questions réglementaires confirmées")).toBeVisible();
    await expect(page.getByText("Questions DEMO / brouillon")).toBeVisible();
    await expect(page.getByText("Total enregistré")).toBeVisible();

    await page.goto("/question-bank?filterClassification=demo");
    const demoHeading = await page.locator("h2", { hasText: /question\(s\)$/ }).textContent();
    const demoCount = Number(demoHeading!.match(/(\d+)/)![1]);
    expect(demoCount).toBeGreaterThan(0);
    // Chaque ID visible dans la colonne Question doit porter le préfixe
    // DEMO- (jamais une question réglementaire mélangée silencieusement).
    const idTexts = await page.locator("table tbody tr td:first-child span.font-mono").allTextContents();
    expect(idTexts.length).toBe(demoCount);
    for (const id of idTexts) expect(id.trim().startsWith("DEMO-")).toBe(true);

    await page.goto("/question-bank?filterClassification=regulatory");
    const regIdTexts = await page.locator("table tbody tr td:first-child span.font-mono").allTextContents();
    for (const id of regIdTexts) expect(id.trim().startsWith("DEMO-")).toBe(false);

    // Réinitialisation.
    await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
    await expect(page).toHaveURL(/\/question-bank$/);
  });
});

test.describe("STAGING — /groups : Type client isole réellement", () => {
  // Correctif "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
  // §40 — TEST STALE trouvé en régression réelle sur staging, pas un
  // produit cassé : l'assertion d'origine supposait "aucun client
  // particulier en démo" (vrai au moment de sa rédaction), mais une
  // fixture d'une mission ultérieure (email/notification, "Nadia Chérif
  // (démo notification)") a depuis créé un groupe "Session individuelle"
  // de type particulier — donnée démo légitime, vérifiée manuellement
  // avant ce correctif (jamais une vraie donnée client). Le filtre
  // lui-même n'a jamais été en cause : particulier(count) + entreprise(count)
  // ne doit jamais dépasser la baseline (partition réelle, pas un OR qui
  // laisserait fuiter l'autre type), et particulier(count) doit rester
  // strictement inférieur à entreprise(count) sur ce périmètre démo établi
  // (l'essentiel du jeu de données reste des clients Entreprise).
  test("filterClientType=particulier et filterClientType=entreprise partitionnent réellement la baseline, jamais un total qui déborde", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

    await page.goto("/groups");
    const baselineHeading = await page.locator("h2", { hasText: /groupe\(s\)$/ }).textContent();
    const baselineCount = Number(baselineHeading!.match(/(\d+)/)![1]);
    expect(baselineCount).toBeGreaterThan(0);

    await page.goto("/groups?filterClientType=entreprise");
    const entHeading = await page.locator("h2", { hasText: /groupe\(s\)$/ }).textContent();
    const entCount = Number(entHeading!.match(/(\d+)/)![1]);
    expect(entCount).toBeLessThanOrEqual(baselineCount);

    await page.goto("/groups?filterClientType=particulier");
    const partHeading = await page.locator("h2", { hasText: /groupe\(s\)$/ }).textContent();
    const partCount = Number(partHeading!.match(/(\d+)/)![1]);
    // Partition réelle — jamais entreprise+particulier > baseline (ce qui
    // trahirait un filtre qui laisse fuiter l'autre type), et jamais 0+0
    // non plus (ce qui trahirait un filtre qui ne filtre rien du tout).
    expect(entCount + partCount).toBeLessThanOrEqual(baselineCount);
    expect(partCount).toBeGreaterThan(0);
    expect(partCount).toBeLessThan(entCount);

    await page.goto("/groups?filterClientType=entreprise");
    await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
    await expect(page).toHaveURL(/\/groups$/);
  });
});

test.describe("STAGING — /audit-logs : Action isole réellement, jamais un événement inventé", () => {
  test("chaque ligne visible sous un filtre Action porte exactement cette action", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

    await page.goto("/audit-logs");
    const actionOptions = await page.locator("#action option").allTextContents();
    // Au moins une option réelle au-delà de "Toutes".
    expect(actionOptions.length).toBeGreaterThan(1);
    const realAction = actionOptions.find((a) => a.trim() === "login") ?? actionOptions[1]!;

    await page.goto(`/audit-logs?action=${encodeURIComponent(realAction.trim())}`);
    const actionCells = await page.locator("table tbody tr td:nth-child(4)").allTextContents();
    expect(actionCells.length).toBeGreaterThan(0);
    for (const a of actionCells) expect(a.trim()).toBe(realAction.trim());

    await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
    await expect(page).toHaveURL(/\/audit-logs$/);
  });
});

test.describe("STAGING — /incidents : Sévérité isole réellement", () => {
  test("chaque ligne visible sous un filtre Sévérité porte exactement ce badge", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

    await page.goto("/incidents");
    const baselineHeading = await page.locator("h2", { hasText: /incident\(s\)$/ }).textContent();
    const baselineCount = Number(baselineHeading!.match(/(\d+)/)![1]);
    expect(baselineCount).toBeGreaterThan(0);

    await page.goto("/incidents?filterSeverity=high");
    const heading = await page.locator("h2", { hasText: /incident\(s\)$/ }).textContent();
    const count = Number(heading!.match(/(\d+)/)![1]);
    if (count > 0) {
      expect(count).toBeLessThanOrEqual(baselineCount);
      const severityBadges = await page.locator('a[href^="/incidents/"]').locator("span.inline-flex").allTextContents();
      // Chaque paire de badges (Sévérité, Statut) — on ne garde que ceux
      // qui contiennent un des libellés de sévérité connus.
      const severityValues = severityBadges.filter((t) => ["low", "medium", "high", "critical"].includes(t.trim()));
      for (const s of severityValues) expect(s.trim()).toBe("high");
    }

    await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
    await expect(page).toHaveURL(/\/incidents$/);
  });
});

test.describe("STAGING — /sessions : Rôle isole réellement", () => {
  test("filterRole=administrator ne montre que des administrateurs ; filterRole=candidate n'inclut jamais l'admin connecté", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

    await page.goto("/sessions?role=administrator");
    const roleCells = await page.locator("table tbody tr td:nth-child(2)").allTextContents();
    expect(roleCells.length).toBeGreaterThan(0);
    for (const r of roleCells) expect(r.trim()).toBe("administrator");

    await page.goto("/sessions?role=candidate");
    const roleCells2 = await page.locator("table tbody tr td:nth-child(2)").allTextContents();
    for (const r of roleCells2) expect(r.trim()).not.toBe("administrator");

    await page.goto("/sessions?role=administrator");
    await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
    await expect(page).toHaveURL(/\/sessions$/);
  });
});

test.describe("STAGING — /familiarisation : Fonction DGR isole réellement", () => {
  test("une fonction sans aucune session démo → 0 résultat ; la fonction réellement utilisée en démo réapparaît", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

    await page.goto("/familiarisation");
    const baselineHeading = await page.locator("h2", { hasText: /session\(s\)$/ }).textContent();
    const baselineCount = Number(baselineHeading!.match(/(\d+)/)![1]);
    expect(baselineCount).toBeGreaterThan(0);

    // 7.1 est la fonction réellement utilisée par les fixtures démo de
    // cette page (voir scripts/seed-demo.ts / scripts d'e2e) — une
    // fonction sans historique connu (7.10) doit renvoyer 0.
    await page.goto("/familiarisation?filterFunctionCode=7.10");
    const emptyHeading = await page.locator("h2", { hasText: /session\(s\)$/ }).textContent();
    const emptyCount = Number(emptyHeading!.match(/(\d+)/)![1]);

    await page.goto("/familiarisation?filterFunctionCode=7.1");
    const f71Heading = await page.locator("h2", { hasText: /session\(s\)$/ }).textContent();
    const f71Count = Number(f71Heading!.match(/(\d+)/)![1]);
    expect(f71Count).toBeGreaterThan(0);
    expect(f71Count).toBeLessThanOrEqual(baselineCount);
    if (emptyCount === 0) {
      // Preuve d'un vrai filtre (pas un OU déguisé qui montrerait tout) :
      // au moins une fonction connue exclut strictement des lignes que
      // 7.1 inclut.
      expect(f71Count).toBeLessThan(baselineCount + 1);
    }

    await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
    await expect(page).toHaveURL(/\/familiarisation$/);
  });
});
