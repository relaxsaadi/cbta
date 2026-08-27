import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Addendum auditeur §1-2 — preuve réelle des deux modes d'affectation
// via l'UI: création d'un exercice (pas un "examen", pour ne jamais
// affecter la sémantique "1 tentative" du pilote officiel) sur le groupe
// réel Air Algérie — DGR Démonstration, publié en mode INDIVIDUEL vers
// candidat3.staging exclusivement — jamais candidat1/candidat2 (déjà
// utilisés par le pilote principal).
test("publication en mode individuel : seul le candidat ciblé voit l'examen, jamais les autres membres du groupe", async ({ page, context }) => {
  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));

  await page.goto("/exam-preparation");
  const name = `Test affectation individuelle ${Date.now()}`;
  await page.locator('input[name="name"]').fill(name);
  // Type = exercice (sr-only, comme le radio "examen" déjà rencontré dans
  // ce même wizard — cible l'input directement avec check({force:true})).
  await page.locator('input[name="type"][value="exercice"]').check({ force: true });

  const groupSelect = page.locator('select[name="groupId"]');
  const groupValue = await groupSelect.locator("option").filter({ hasText: "Air Algérie" }).first().getAttribute("value");
  await groupSelect.selectOption(groupValue!);
  await page.locator('select[name="functionCode"]').selectOption("7.1");
  await page.locator('input[name="questionCount"]').fill("1");
  await page.locator('input[name="durationMinutes"]').fill("10");
  await page.getByRole("button", { name: /créer le brouillon/i }).click();

  await page.waitForURL(/\/exam-preparation\/\d+/);

  // Formulaire de publication — mode "Un candidat individuel", cible
  // candidat3.staging exclusivement. Ces radios sont des <input> visibles
  // normaux (contrairement au radio "type" plus haut, sr-only) — un
  // .click() standard suffit.
  const modeIndividualRadio = page.locator('input[name="mode"][value="individual"]');
  await modeIndividualRadio.click();
  await expect(modeIndividualRadio).toBeChecked();
  const candidateRadio = page.locator("label").filter({ hasText: "candidat3.staging" }).locator('input[type="radio"]');
  await candidateRadio.click();
  await expect(candidateRadio).toBeChecked();
  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText("published")).toBeVisible({ timeout: 10_000 });

  // Suivi des candidats : un seul candidat listé, candidat3 uniquement.
  // Scope au tableau de suivi précisément (pas à la page entière) : la
  // carte "Affecter d'autres candidats", juste en dessous, liste À
  // DESSEIN les autres membres du groupe PAR NOM comme candidats
  // ajoutables (comportement correct, pas une fuite — voir
  // AssignMoreCandidatesForm.tsx) ; une assertion pleine page les
  // confondrait avec le tableau de suivi.
  const trackingTable = page.locator("table").filter({ has: page.locator("th", { hasText: "Candidat" }) });
  await expect(trackingTable.getByText("Amel Ferhati")).toBeVisible();
  await expect(trackingTable.getByText("Yasmine Kaced")).toHaveCount(0);
  await expect(trackingTable.getByText("Riad Boumediene")).toHaveCount(0);

  // Preuve côté candidat : candidat3 voit l'exercice, candidat1 ne le voit jamais.
  await context.clearCookies();
  await loginAs(page, env("STAGING_CANDIDATE3_USER"), env("STAGING_CANDIDATE3_PASS"));
  await page.goto("/mes-examens");
  await expect(page.getByText(name)).toBeVisible();

  await context.clearCookies();
  await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
  await page.goto("/mes-examens");
  await expect(page.getByText(name)).toHaveCount(0);
});
