import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Suite de la revue pré-auditeur — trois périmètres identifiés ouverts
// après la première passe d'isolation (§tenant-scope.ts) : incidents,
// overview, sessions actives. Mêmes deux clients réels que
// 09-cross-tenant-isolation.spec.ts (Air Algérie — DEMO / Tassili
// Airlines — DEMO).
const COMPANY_A_NAME = "Air Algérie — DEMO";
const COMPANY_B_NAME = "Tassili Airlines — DEMO";

test.describe("Isolation — Incidents", () => {
  test("un incident déclaré par le responsable A pour son groupe reste invisible du responsable B (UI + URL directe)", async ({ page, context }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto("/incidents");

    const marker = `Test isolation incidents ${Date.now()}`;
    await page.locator('select[name="type"]').selectOption("security");
    const groupSelect = page.locator('select[name="groupId"]');
    const groupAValue = await groupSelect.locator("option").filter({ hasText: COMPANY_A_NAME }).first().getAttribute("value");
    await groupSelect.selectOption(groupAValue!);
    await page.locator('textarea[name="description"]').fill(marker);
    await page.getByRole("button", { name: /déclarer un incident/i }).click();
    await page.waitForURL(/\/incidents\/\d+/);
    const incidentUrl = page.url();
    const incidentId = incidentUrl.match(/\/incidents\/(\d+)/)![1];

    // Visible pour A dans la liste.
    await page.goto("/incidents");
    await expect(page.getByText(marker)).toBeVisible();

    // Invisible pour B — ni dans la liste, ni en URL directe.
    await context.clearCookies();
    await loginAs(page, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));
    await page.goto("/incidents");
    await expect(page.getByText(marker)).toHaveCount(0);

    const response = await page.goto(`/incidents/${incidentId}`);
    expect(response?.status(), "l'incident du responsable A doit répondre 404 pour B").toBe(404);
    await expect(page.getByText(marker)).toHaveCount(0);
  });

  test("le sélecteur de groupe du formulaire de déclaration n'offre jamais le groupe d'un autre client", async ({ page }) => {
    // Le formulaire de déclaration d'incident (React, useActionState) ne
    // peut être piloté que via ses propres champs — un <select> n'est pas
    // manipulable en dehors de ses <option> réellement rendues. La preuve
    // "server/API mutation" pertinente ici est donc que l'option n'existe
    // même pas dans le DOM, pas une tentative de POST brut (les Server
    // Actions Next.js utilisent un protocole d'action encodé qu'un fetch()
    // sans le navigateur ne peut pas reproduire) — la garantie server-side
    // équivalente (hasGroupAccess appelé dans declareIncidentAction) est
    // prouvée séparément par tests/unit/tenant-scope-incidents-sessions.test.ts.
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto("/incidents");
    const groupOptions = await page.locator('select[name="groupId"] option').allTextContents();
    expect(groupOptions.some((t) => t.includes(COMPANY_B_NAME))).toBe(false);
    expect(groupOptions.some((t) => t.includes(COMPANY_A_NAME))).toBe(true);
  });
});

test.describe("Isolation — Vue d'ensemble (overview)", () => {
  // Mission "CLOSE STALE /OVERVIEW ISOLATION TEST" (2026-08-30) — les
  // anciennes assertions exigeaient qu'un examen pilote HISTORIQUE
  // (EXAM_A_NAME/EXAM_B_NAME, créés il y a des mois) reste visible dans
  // "Évaluations récentes", un widget qui montre volontairement les 8
  // évaluations les PLUS RÉCENTES tous scopes confondus (voir
  // app/(app)/overview/page.tsx: `assessments.slice(0, 8)`, appliqué
  // APRÈS le scope tenant déjà imposé en SQL par listAssessmentsForManager
  // — jamais l'inverse). Après des mois d'activité de test sur ce
  // staging, cet examen a naturellement quitté la fenêtre des 8 plus
  // récents (confirmé : 11ᵉ/11 pour son responsable) — une conséquence
  // normale de la croissance des données, PAS une fuite tenant. La bonne
  // invariante à tester n'est jamais "cet examen précis reste visible
  // pour toujours", mais : "un responsable voit toujours SON évaluation
  // la plus récente, jamais celle d'un autre client, même quand les deux
  // évaluations sont assez récentes pour être toutes les deux dans une
  // fenêtre de 8". On crée donc ici deux évaluations FRAÎCHES (une par
  // responsable, via le VRAI formulaire de création), volontairement
  // proches dans le temps l'une de l'autre — si le scope tenant était un
  // jour cassé (ex. liste globale au lieu de listAssessmentsForManager),
  // l'évaluation de B serait alors la PLUS RÉCENTE de toutes et
  // apparaîtrait en tête du tableau de bord de A, rendant une régression
  // immédiatement détectable.
  async function createDraftAssessment(page: import("@playwright/test").Page, companyNameFilter: string, uniqueName: string) {
    await page.goto("/exam-preparation");
    const groupSelect = page.locator("#groupId");
    const groupValue = await groupSelect.locator("option").filter({ hasText: companyNameFilter }).first().getAttribute("value");
    await groupSelect.selectOption(groupValue!);
    await page.locator("#name").fill(uniqueName);
    // Attend que le comptage admissible réel remplace le "…" initial —
    // évite la fenêtre de course déjà documentée dans
    // CreateAssessmentForm.tsx (questionCount dépend de cette valeur).
    await expect(page.getByText(/Questions admissibles disponibles :/)).not.toContainText("…");
    await page.getByRole("button", { name: /créer le brouillon/i }).click();
    await page.waitForLoadState("networkidle");
  }

  test("le tableau de bord de chaque responsable ne montre que ses PROPRES évaluations les plus récentes, jamais celles de l'autre client", async ({ page, context }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    const nameA = `Isolation overview A ${Date.now()}`;
    await createDraftAssessment(page, COMPANY_A_NAME, nameA);

    await context.clearCookies();
    await loginAs(page, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));
    const nameB = `Isolation overview B ${Date.now()}`;
    await createDraftAssessment(page, COMPANY_B_NAME, nameB);

    // B (créée en dernier, donc la PLUS RÉCENTE de tout le staging) reste
    // visible pour B lui-même — sa propre évaluation la plus récente.
    await page.goto("/overview");
    await expect(page.getByText(nameB)).toBeVisible();
    await expect(page.getByText(nameA)).toHaveCount(0);
    await expect(page.getByText(COMPANY_A_NAME)).toHaveCount(0);

    // A ne voit toujours QUE la sienne, jamais celle — plus récente — de
    // B : preuve directe que le scope tenant s'applique AVANT la limite
    // de 8, pas après (sinon B, plus récente, aurait mécaniquement
    // évincé A de la fenêtre visible de A).
    await context.clearCookies();
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    await page.goto("/overview");
    await expect(page.getByText(nameA)).toBeVisible();
    await expect(page.getByText(nameB)).toHaveCount(0);
    await expect(page.getByText(COMPANY_B_NAME)).toHaveCount(0);
  });

  test("administrateur voit les évaluations des deux clients sur le tableau de bord", async ({ page, context }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    const nameA = `Isolation overview admin-check A ${Date.now()}`;
    await createDraftAssessment(page, COMPANY_A_NAME, nameA);

    await context.clearCookies();
    await loginAs(page, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));
    const nameB = `Isolation overview admin-check B ${Date.now()}`;
    await createDraftAssessment(page, COMPANY_B_NAME, nameB);

    await context.clearCookies();
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await page.goto("/overview");
    await expect(page.getByText(nameA)).toBeVisible();
    await expect(page.getByText(nameB)).toBeVisible();
  });
});

test.describe("Isolation — Sessions actives", () => {
  test("un responsable ne voit que sa propre session et celles de ses candidats, jamais celles de l'autre client", async ({ browser }) => {
    // Ouvre des sessions réelles pour les deux responsables ET un candidat
    // de chaque côté, puis vérifie ce que /sessions montre à chacun.
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await loginAs(pageA, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await loginAs(pageB, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));

    const ctxCandB = await browser.newContext();
    const pageCandB = await ctxCandB.newPage();
    await loginAs(pageCandB, env("STAGING_CANDIDATE_B_USER"), env("STAGING_CANDIDATE_B_PASS"));

    // .first() : de nombreuses sessions non expirées (8h) se sont
    // accumulées pour ces comptes au fil des tests de cette session de
    // travail — plusieurs lignes portent donc le même nom. On vérifie la
    // PRÉSENCE (au moins une ligne) pour A et l'ABSENCE TOTALE pour B, pas
    // un nombre exact de lignes.
    await pageA.goto("/sessions");
    await expect(pageA.getByText("Responsable Pédagogique Staging").first()).toBeVisible();
    await expect(pageA.getByText("Responsable Pédagogique B — Tassili")).toHaveCount(0);
    await expect(pageA.getByText("Karim Zerrouki")).toHaveCount(0); // candidat B

    await pageB.goto("/sessions");
    await expect(pageB.getByText("Responsable Pédagogique B — Tassili").first()).toBeVisible();
    await expect(pageB.getByText("Karim Zerrouki").first()).toBeVisible(); // son propre candidat
    await expect(pageB.getByText("Responsable Pédagogique Staging")).toHaveCount(0);

    await ctxA.close();
    await ctxB.close();
    await ctxCandB.close();
  });

  test("administrateur voit toutes les sessions actives", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await page.goto("/sessions");
    await expect(page.getByText("Responsable Pédagogique Staging").first()).toBeVisible();
    await expect(page.getByText("Responsable Pédagogique B — Tassili").first()).toBeVisible();
  });
});
