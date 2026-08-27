import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Addendum §5-6 — rapport global de session/examen : écran + PDF, données
// réelles (lib/assessments.ts getSessionReport(), pas recalculées). Utilise
// l'examen pilote réel Company A (id 1 : candidat1 100/100 admis, candidat2
// 42.86/100 échec — voir 09-cross-tenant-isolation.spec.ts pour les ids).
const ASSESSMENT_A_ID = 1;
const ASSESSMENT_B_ID = 3; // Company B — hors périmètre du responsable A

async function fetchPdf(page: import("@playwright/test").Page, path: string) {
  return page.evaluate(async (p) => {
    const res = await fetch(p, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf).slice(0, 5);
    const magic = new TextDecoder().decode(bytes);
    return { status: res.status, contentType: res.headers.get("content-type"), magic, size: buf.byteLength };
  }, path);
}

test.describe("Rapport global de session — écran", () => {
  test("le responsable voit les statistiques réelles et l'avertissement petit échantillon", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto(`/exam-preparation/${ASSESSMENT_A_ID}/rapport-global`);

    // < 5 tentatives terminées (2) — avertissement obligatoire (addendum
    // §6 : ne jamais présenter des stats trompeuses avec trop peu de
    // candidats).
    await expect(page.getByText(/Moins de 5 tentatives terminées/)).toBeVisible();

    await expect(page.getByText("Yasmine Kaced (pilote)")).toBeVisible();
    await expect(page.getByText("Riad Boumediene (pilote)")).toBeVisible();

    // Statistiques agrégées réelles : 1 admis / 1 échec / 50% de réussite /
    // moyenne (100 + 42.86) / 2 = 71.43.
    const kpis = page.locator("div").filter({ hasText: /^Admis/ });
    await expect(page.getByText("50%")).toBeVisible();
    await expect(page.getByText("71.43/100")).toBeVisible();
  });

  test("un responsable d'une autre entreprise reçoit 404 sur ce rapport (URL directe)", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));
    const response = await page.goto(`/exam-preparation/${ASSESSMENT_A_ID}/rapport-global`);
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Yasmine Kaced")).toHaveCount(0);
  });
});

test.describe("Rapport global de session — PDF", () => {
  test("le responsable télécharge un vrai PDF avec les vraies statistiques", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    const pdf = await fetchPdf(page, `/api/reports/session/${ASSESSMENT_A_ID}`);
    expect(pdf.status).toBe(200);
    expect(pdf.contentType).toContain("application/pdf");
    expect(pdf.magic).toBe("%PDF-");
    expect(pdf.size).toBeGreaterThan(1000);
  });

  test("l'administrateur peut télécharger le rapport de N'IMPORTE QUEL client (périmètre global)", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    const pdfA = await fetchPdf(page, `/api/reports/session/${ASSESSMENT_A_ID}`);
    expect(pdfA.status).toBe(200);
    expect(pdfA.magic).toBe("%PDF-");
    const pdfB = await fetchPdf(page, `/api/reports/session/${ASSESSMENT_B_ID}`);
    expect(pdfB.status).toBe(200);
    expect(pdfB.magic).toBe("%PDF-");
  });

  test("isolation serveur/API : le responsable A ne peut pas télécharger le rapport de Company B", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    const cross = await fetchPdf(page, `/api/reports/session/${ASSESSMENT_B_ID}`);
    expect(cross.status).not.toBe(200);
    expect(cross.magic).not.toBe("%PDF-");
  });

  test("un candidat ne peut pas accéder au rapport global (document réservé responsable/admin/auditeur)", async ({ page }) => {
    await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
    const cross = await fetchPdf(page, `/api/reports/session/${ASSESSMENT_A_ID}`);
    expect(cross.status).toBe(403);
  });
});
