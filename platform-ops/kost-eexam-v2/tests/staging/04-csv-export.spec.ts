import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// §7 EXPORT — export résumé + réponses détaillées, vérifie le contenu réel
// (pas un fichier vide, pas des valeurs de test).
test("export CSV résumé et détaillé — contenu réel vérifié", async ({ page }) => {
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

  const summary = await page.request.get("/api/results/export");
  expect(summary.status()).toBe(200);
  expect(summary.headers()["content-type"]).toContain("text/csv");
  const summaryBody = await summary.text();
  expect(summaryBody).toContain("Yasmine Kaced");
  expect(summaryBody).toContain("Riad Boumediene");
  expect(summaryBody).toContain("Air Algérie — DEMO");
  expect(summaryBody).toContain("100");
  expect(summaryBody).toContain("REUSSI");
  expect(summaryBody).toContain("ECHOUE");

  const detailed = await page.request.get("/api/results/export-answers");
  expect(detailed.status()).toBe(200);
  const detailedBody = await detailed.text();
  // Le vrai texte de question DGR doit apparaître dans l'export détaillé.
  expect(detailedBody).toContain("marchandise dangereuse");
  expect(detailedBody).toContain("CORRECT");
  expect(detailedBody).toContain("INCORRECT");
});
