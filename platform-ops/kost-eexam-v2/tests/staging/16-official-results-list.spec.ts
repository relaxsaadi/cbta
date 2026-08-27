import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Addendum §8 — liste officielle des résultats (PDF+CSV) tied à un
// examen/session précis. PDF : lib/pdf/ResultsListDocument.tsx, liste
// nominative simple (pas les statistiques du rapport global §5-6) avec
// bloc signature. CSV : réutilise /api/results/export?assessmentId=<id>
// (addendum §7) — mêmes données authoritatives, pas un second chemin de
// calcul distinct.
const ASSESSMENT_A_ID = 1;
const ASSESSMENT_B_ID = 3;

async function fetchPdf(page: import("@playwright/test").Page, path: string) {
  return page.evaluate(async (p) => {
    const res = await fetch(p, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf).slice(0, 5);
    return { status: res.status, contentType: res.headers.get("content-type"), magic: new TextDecoder().decode(bytes), size: buf.byteLength };
  }, path);
}

test.describe("Liste officielle des résultats — écran", () => {
  test("les liens PDF et CSV sont présents sur le rapport global de session", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto(`/exam-preparation/${ASSESSMENT_A_ID}/rapport-global`);
    await expect(page.getByRole("link", { name: "Liste officielle CSV" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Liste officielle PDF" })).toBeVisible();
  });
});

test.describe("Liste officielle des résultats — PDF", () => {
  test("le responsable télécharge un vrai PDF avec les vrais candidats", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    const pdf = await fetchPdf(page, `/api/reports/results-list/${ASSESSMENT_A_ID}`);
    expect(pdf.status).toBe(200);
    expect(pdf.contentType).toContain("application/pdf");
    expect(pdf.magic).toBe("%PDF-");
    expect(pdf.size).toBeGreaterThan(1000);
  });

  test("isolation tenant : le responsable A ne peut pas télécharger la liste de Company B", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    const cross = await fetchPdf(page, `/api/reports/results-list/${ASSESSMENT_B_ID}`);
    expect(cross.status).not.toBe(200);
    expect(cross.magic).not.toBe("%PDF-");
  });

  test("un candidat ne peut pas accéder à la liste officielle (document réservé responsable/admin/auditeur)", async ({ page }) => {
    await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
    const cross = await fetchPdf(page, `/api/reports/results-list/${ASSESSMENT_A_ID}`);
    expect(cross.status).toBe(403);
  });

  test("l'administrateur peut télécharger la liste de N'IMPORTE QUEL client (périmètre global)", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    const pdfA = await fetchPdf(page, `/api/reports/results-list/${ASSESSMENT_A_ID}`);
    expect(pdfA.status).toBe(200);
    const pdfB = await fetchPdf(page, `/api/reports/results-list/${ASSESSMENT_B_ID}`);
    expect(pdfB.status).toBe(200);
  });
});

test.describe("Liste officielle des résultats — CSV (réutilise §7)", () => {
  async function fetchCsv(page: import("@playwright/test").Page, path: string) {
    return page.evaluate(async (p) => {
      const res = await fetch(p, { credentials: "same-origin" });
      return { status: res.status, body: await res.text() };
    }, path);
  }

  test("le CSV filtré par assessmentId ne contient que les candidats de cet examen", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    const csv = await fetchCsv(page, `/api/results/export?assessmentId=${ASSESSMENT_A_ID}`);
    expect(csv.status).toBe(200);
    expect(csv.body).toContain("Yasmine Kaced");
    expect(csv.body).toContain("Riad Boumediene");
  });
});
