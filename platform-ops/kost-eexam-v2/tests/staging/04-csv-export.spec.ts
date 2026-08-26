import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// §7 EXPORT — export résumé + réponses détaillées, vérifie le contenu réel
// (pas un fichier vide, pas des valeurs de test).
//
// `page.request` (contrairement à la navigation du navigateur) ne passe PAS
// par les `--host-resolver-rules` de lancement Chromium — c'est un client
// HTTP Node.js séparé qui fait sa propre résolution DNS, et son pot de
// cookies n'associe pas le cookie de session (émis pour le domaine
// staging.kostacademy.com) à une requête envoyée vers l'IP brute même avec
// un en-tête Host forcé (le matching de cookie suit l'autorité réelle de
// l'URL, pas un en-tête usurpé) — d'où un 404 en pratique. On exécute donc
// le fetch DEPUIS le navigateur, déjà authentifié et déjà sur la bonne
// origine (résolue via --host-resolver-rules) : cookies same-origin
// automatiques, aucun contournement nécessaire.
async function fetchAsText(page: import("@playwright/test").Page, path: string): Promise<{ status: number; contentType: string | null; body: string }> {
  return page.evaluate(async (p) => {
    const res = await fetch(p, { credentials: "same-origin" });
    return { status: res.status, contentType: res.headers.get("content-type"), body: await res.text() };
  }, path);
}

test("export CSV résumé et détaillé — contenu réel vérifié", async ({ page }) => {
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

  const summary = await fetchAsText(page, "/api/results/export");
  expect(summary.status).toBe(200);
  expect(summary.contentType).toContain("text/csv");
  expect(summary.body).toContain("Yasmine Kaced");
  expect(summary.body).toContain("Riad Boumediene");
  expect(summary.body).toContain("Air Algérie — DEMO");
  expect(summary.body).toContain("100");
  expect(summary.body).toContain("REUSSI");
  expect(summary.body).toContain("ECHOUE");

  const detailed = await fetchAsText(page, "/api/results/export-answers");
  expect(detailed.status).toBe(200);
  // Le vrai texte de question DGR doit apparaître dans l'export détaillé.
  expect(detailed.body).toContain("marchandise dangereuse");
  expect(detailed.body).toContain("CORRECT");
  expect(detailed.body).toContain("INCORRECT");
});
