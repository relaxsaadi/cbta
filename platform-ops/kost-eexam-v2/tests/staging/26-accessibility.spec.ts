import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { loginAs, env } from "./helpers";

// Mission "PRODUCTION READINESS" §12 — passe accessibilité (jamais faite
// avant cette session). axe-core, standard WCAG 2.1 AA. Seuil : 0
// violation "serious"/"critical" sur les parcours critiques listés
// ci-dessous — "minor"/"moderate" sont rapportées (console.log) mais ne
// font pas échouer le test, pour ne pas confondre un vrai blocage
// d'accessibilité avec un défaut cosmétique mineur.
function assertNoSeriousViolations(results: Awaited<ReturnType<AxeBuilder["analyze"]>>, label: string) {
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const minor = results.violations.filter((v) => v.impact !== "serious" && v.impact !== "critical");
  if (minor.length > 0) {
    console.log(`[a11y][${label}] ${minor.length} violation(s) mineure(s)/modérée(s) (non bloquantes) : ${minor.map((v) => v.id).join(", ")}`);
  }
  if (serious.length > 0) {
    const detail = serious.map((v) => `${v.id} (${v.impact}, ${v.nodes.length} nœud(s)) — ${v.help}`).join("\n  ");
    throw new Error(`[a11y][${label}] ${serious.length} violation(s) serious/critical :\n  ${detail}`);
  }
}

test.describe("Accessibilité — pages publiques", () => {
  test("/login", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page }).analyze();
    assertNoSeriousViolations(results, "/login");
  });
});

test.describe("Accessibilité — parcours administrateur", () => {
  test("/overview, /users, /mon-compte, /groups, /question-bank, /incidents", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    for (const path of ["/overview", "/users", "/mon-compte", "/groups", "/question-bank", "/incidents", "/audit-logs", "/system"]) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      assertNoSeriousViolations(results, path);
    }
  });
});

test.describe("Accessibilité — parcours responsable pédagogique", () => {
  test("/overview, /companies, /exam-preparation, /results", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    for (const path of ["/overview", "/companies", "/exam-preparation", "/results", "/familiarisation", "/guide"]) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      assertNoSeriousViolations(results, path);
    }
  });
});

test.describe("Accessibilité — parcours candidat (le plus critique — public réel de l'examen)", () => {
  test("/mes-examens, /mes-resultats, /guide", async ({ page }) => {
    await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
    for (const path of ["/mes-examens", "/mes-resultats", "/guide"]) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      assertNoSeriousViolations(results, path);
    }
  });
});
