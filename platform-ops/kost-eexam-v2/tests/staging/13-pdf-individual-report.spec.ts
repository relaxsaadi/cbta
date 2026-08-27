import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Addendum §4 — rapport individuel PDF (simple + détaillé), généré depuis
// les données réelles (lib/results.ts getAttemptDetail(), les mêmes que
// l'écran). Vérifie un vrai PDF binaire (en-tête %PDF-), pas juste un
// statut 200 — et l'isolation candidat (jamais le rapport d'un autre).
async function fetchPdf(page: import("@playwright/test").Page, path: string) {
  return page.evaluate(async (p) => {
    const res = await fetch(p, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf).slice(0, 5);
    const magic = new TextDecoder().decode(bytes);
    return { status: res.status, contentType: res.headers.get("content-type"), magic, size: buf.byteLength };
  }, path);
}

test.describe("Rapport individuel PDF — personnel (responsable/admin/auditeur)", () => {
  test("l'administrateur télécharge un vrai PDF, simple et détaillé, pour une tentative réelle", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

    // Récupère un attemptId réel via l'écran de résultats plutôt que de
    // coder un id en dur — reste valide même si le pilote évolue.
    await page.goto("/results");
    const href = await page.getByRole("link", { name: /Yasmine Kaced/i }).first().getAttribute("href");
    const attemptId = href!.match(/\/results\/(\d+)/)![1];

    const simple = await fetchPdf(page, `/api/reports/individual/${attemptId}?level=simple`);
    expect(simple.status).toBe(200);
    expect(simple.contentType).toContain("application/pdf");
    expect(simple.magic).toBe("%PDF-");
    expect(simple.size).toBeGreaterThan(1000);

    const detailed = await fetchPdf(page, `/api/reports/individual/${attemptId}?level=detailed`);
    expect(detailed.status).toBe(200);
    expect(detailed.magic).toBe("%PDF-");
    // Le détaillé (questions incluses) doit être significativement plus
    // volumineux que le simple — preuve indirecte qu'il contient
    // vraiment le contenu des questions, pas juste un paramètre ignoré.
    expect(detailed.size).toBeGreaterThan(simple.size);
  });
});

test.describe("Rapport individuel PDF — isolation candidat", () => {
  test("un candidat peut télécharger SON propre rapport mais jamais celui d'un autre", async ({ page, context }) => {
    await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
    await page.goto("/mes-resultats");
    const ownHref = await page.getByRole("link", { name: "PDF" }).first().getAttribute("href");
    expect(ownHref).toBeTruthy();
    const own = await fetchPdf(page, ownHref!);
    expect(own.status).toBe(200);
    expect(own.magic).toBe("%PDF-");

    // L'attemptId de candidat1 extrait de son propre lien — tentative de
    // le réutiliser en tant que candidat2 doit échouer.
    const ownAttemptId = ownHref!.match(/\/individual\/(\d+)/)![1];

    await context.clearCookies();
    await loginAs(page, env("STAGING_CANDIDATE2_USER"), env("STAGING_CANDIDATE2_PASS"));
    const cross = await fetchPdf(page, `/api/reports/individual/${ownAttemptId}?level=simple`);
    expect(cross.status).not.toBe(200);
    expect(cross.magic).not.toBe("%PDF-");
  });
});
