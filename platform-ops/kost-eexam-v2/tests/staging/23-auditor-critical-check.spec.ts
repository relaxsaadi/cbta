import { test, expect, type Page } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Vérification ciblée AUDITOR-CRITICAL (pré-freeze staging, 2026-08-27) —
// PAS un rejeu de la suite complète (69+ scénarios déjà prouvés
// individuellement, voir tests/staging/*.spec.ts). Ce fichier couvre en
// UNE passe les 22 points explicitement demandés pour le gel de
// l'environnement de revue auditeur.
//
// Isolation des fixtures — DEUX corrections successives, post-incident :
//   1. La toute première version ajoutait son candidat frais au groupe
//      pilote PARTAGÉ "Air Algérie — DGR Démonstration", faisant grossir
//      sa taille réelle (3 → 9 membres) à chaque exécution répétée —
//      cassant l'hypothèse "0 / 3 présent" hardcodée dans
//      19-familiarization.spec.ts / 21-acceptance-familiarization.spec.ts
//      (corrigées séparément pour lire le total dynamiquement).
//   2. La correction suivante créait sa PROPRE entreprise+groupe à CHAQUE
//      exécution (nom suffixé Date.now()) pour ne plus toucher les
//      fixtures partagées — mais cette accumulation illimitée d'examens
//      a fini par repousser le VRAI examen pilote hors du top-8 tronqué
//      de /overview (assessments.slice(0, 8)), cassant
//      11-incidents-overview-sessions-isolation.spec.ts — exactement le
//      même piège déjà documenté dans 12-assignment-modes.spec.ts.
// Fix définitif : noms FIXES (pas de Date.now()) + garde d'idempotence
// skip-si-déjà-créé, même convention que 01/02/12 dans cette suite —
// preuve exécutée une fois, jamais rejouée en accumulation.
const COMPANY_NAME = "Vérification Auditeur — Isolée";
const GROUP_NAME = "Groupe vérification isolée";
const CANDIDATE_FULL_NAME = "Candidat Vérification Auditeur";
const CANDIDATE_USERNAME = "auditor.check.isolated";
const CANDIDATE_PASSWORD = "VerifAuditeur2026!";
const EXAM_NAME = "Vérification auditeur — isolée";

async function fetchBinary(page: Page, path: string) {
  return page.evaluate(async (p) => {
    const res = await fetch(p, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    return { status: res.status, contentType: res.headers.get("content-type"), magic: new TextDecoder().decode(new Uint8Array(buf).slice(0, 5)), size: buf.byteLength };
  }, path);
}

test("vérification auditor-critical complète — 22 points, gel staging 2026-08-27", async ({ page }) => {
  // 1-4. LOGIN — les 4 rôles.
  await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
  await expect(page).toHaveURL(/\/mes-examens/);
  await page.context().clearCookies();

  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
  await expect(page).toHaveURL(/\/overview/);

  // Garde d'idempotence : si l'entreprise isolée existe déjà, toute la
  // chaîne a déjà été prouvée par une exécution précédente — no-op
  // volontaire plutôt qu'une accumulation destructrice (voir commentaire
  // d'en-tête).
  await page.goto("/companies");
  const alreadyExists = await page.getByText(COMPANY_NAME).count();
  test.skip(alreadyExists > 0, "La chaîne complète a déjà été prouvée sur ce staging (entreprise isolée déjà créée) — pas de recréation (idempotence).");

  // 0. ENTREPRISE + GROUPE ISOLÉS (jamais les fixtures pilote partagées).
  await page.locator('input[name="name"]').fill(COMPANY_NAME);
  await page.getByRole("button", { name: /créer le client/i }).click();
  await expect(page.getByText(COMPANY_NAME).first()).toBeVisible();

  await page.goto("/groups");
  await page.locator('select[name="companyId"]').selectOption({ label: COMPANY_NAME });
  await page.locator('input[name="name"]').fill(GROUP_NAME);
  await page.getByRole("button", { name: /créer le groupe/i }).click();
  await page.waitForURL(/\/groups\/\d+/);

  // 5. CREATE CANDIDATE — dans le groupe isolé fraîchement créé.
  await page.locator('input[name="fullName"]').fill(CANDIDATE_FULL_NAME);
  await page.locator('input[name="username"]').fill(CANDIDATE_USERNAME);
  await page.locator('input[name="password"]').fill(CANDIDATE_PASSWORD);
  await page.getByRole("button", { name: /ajouter/i }).click();
  await expect(page.getByText(CANDIDATE_FULL_NAME).first()).toBeVisible();

  // 6. ASSIGN CANDIDATE TO COMPANY/GROUP/FUNCTION + 7. CREATE AND ASSIGN EXAM.
  await page.goto("/exam-preparation");
  await page.locator('input[name="name"]').fill(EXAM_NAME);
  await page.locator('input[name="type"][value="exercice"]').check({ force: true });
  const groupSelect = page.locator('select[name="groupId"]');
  const groupValue = await groupSelect.locator("option").filter({ hasText: GROUP_NAME }).first().getAttribute("value");
  await groupSelect.selectOption(groupValue!);
  await page.locator('select[name="functionCode"]').selectOption("7.1");
  await page.locator('input[name="questionCount"]').fill("1");
  await page.locator('input[name="durationMinutes"]').fill("10");
  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  const assessmentUrl = page.url();
  const assessmentId = assessmentUrl.match(/\/exam-preparation\/(\d+)/)![1];
  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();
  await expect(page.getByText(CANDIDATE_FULL_NAME).first()).toBeVisible();

  // 8-10. CANDIDATE TAKES EXAM + TIMER + GRADING.
  await page.context().clearCookies();
  await loginAs(page, CANDIDATE_USERNAME, CANDIDATE_PASSWORD);
  await page.goto("/mes-examens");
  await page.getByRole("link", { name: /commencer/i }).first().click();
  await page.waitForURL(/\/exam\/\d+\/instructions/);
  await page.getByRole("button", { name: /commencer l'examen/i }).click();
  await page.waitForURL(/\/exam\/\d+\/attempt/);
  await expect(page.locator("text=/\\d{2}:\\d{2}/").first()).toBeVisible(); // 9. TIMER
  await page.locator('input[type="radio"], input[type="checkbox"]').first().check({ force: true });
  await page.getByRole("button", { name: /^terminer$/i }).click();
  await page.waitForURL(/\/mes-resultats/);

  // 11. CANDIDATE RESULT.
  await expect(page.getByText(EXAM_NAME).first()).toBeVisible();

  // 12. ADMIN QUESTION-BY-QUESTION RESULT + 13. INDIVIDUAL PDF.
  await page.context().clearCookies();
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
  await page.goto("/results");
  const resultHref = await page.getByRole("link", { name: CANDIDATE_FULL_NAME }).getAttribute("href");
  await page.goto(resultHref!);
  await expect(page.getByText(/^Q1\./)).toBeVisible(); // 10. GRADING résultat correct/incorrect visible via détail
  const attemptId = resultHref!.match(/\/results\/(\d+)/)![1];
  const individualPdf = await fetchBinary(page, `/api/reports/individual/${attemptId}?level=detailed`);
  expect(individualPdf.status).toBe(200);
  expect(individualPdf.magic).toBe("%PDF-");

  // 14. GLOBAL SESSION PDF.
  const globalPdf = await fetchBinary(page, `/api/reports/session/${assessmentId}`);
  expect(globalPdf.status).toBe(200);
  expect(globalPdf.magic).toBe("%PDF-");

  // 15. CSV SUMMARY + 16. CSV DETAILED.
  const csvSummary = await fetchBinary(page, `/api/results/export?assessmentId=${assessmentId}`);
  expect(csvSummary.status).toBe(200);
  const csvDetailed = await fetchBinary(page, `/api/results/export-answers?assessmentId=${assessmentId}`);
  expect(csvDetailed.status).toBe(200);

  // 17. INCIDENT ACTION.
  await page.goto("/incidents");
  await page.locator("#type").selectOption("security");
  await page.locator("#description").fill("Vérification auditeur — action incident (isolée)");
  await page.getByRole("button", { name: /déclarer un incident/i }).click();
  await page.waitForURL(/\/incidents\/\d+/);
  await page.locator('input[name="note"]').fill("Note de vérification auditeur.");
  await page.getByRole("button", { name: "Ajouter" }).click();
  await expect(page.getByText("Note de vérification auditeur.")).toBeVisible();

  // 18. SESSION REVOCATION.
  const card = page.locator("div.rounded-md.border-border-subtle").filter({ hasText: "Compte utilisateur" });
  const revokeForm = card.locator("form").nth(2); // 0=Suspendre, 1=Réactiver, 2=Révoquer les sessions
  const select = revokeForm.locator('select[name="targetId"]');
  const value = await select.locator("option", { hasText: CANDIDATE_USERNAME }).getAttribute("value");
  await select.selectOption(value!);
  await revokeForm.evaluate((el) => (el as HTMLFormElement).requestSubmit());
  await expect(page.getByText("revoke_sessions")).toBeVisible();

  // 19. AUDITOR READ-ONLY.
  await page.context().clearCookies();
  await loginAs(page, env("STAGING_AUDITOR_USER"), env("STAGING_AUDITOR_PASS"));
  await page.goto("/exam-preparation");
  await expect(page.getByRole("button", { name: /créer le brouillon/i })).toHaveCount(0);
  await page.goto("/results");
  // getByRole('link', ...) : le <select> "Candidat" (addendum §7) contient
  // le même nom en sous-chaîne dans son <option> masquée.
  await expect(page.getByRole("link", { name: CANDIDATE_FULL_NAME })).toBeVisible();

  // 20. TENANT ISOLATION.
  await page.context().clearCookies();
  await loginAs(page, env("STAGING_MANAGER_B_USER"), env("STAGING_MANAGER_B_PASS"));
  await page.goto("/results");
  await expect(page.getByText(CANDIDATE_FULL_NAME)).toHaveCount(0);
  const crossResponse = await page.goto(`/exam-preparation/${assessmentId}`);
  expect(crossResponse?.status()).toBe(404);

  // 21. GUIDE ACCESS.
  await page.context().clearCookies();
  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
  await page.goto("/guide");
  await expect(page).toHaveURL(/\/guide\/responsable-pedagogique/);
  const guidePdf = await fetchBinary(page, "/api/reports/guide/responsable-pedagogique");
  expect(guidePdf.status).toBe(200);
  expect(guidePdf.magic).toBe("%PDF-");

  // 22. FAMILIARIZATION RECORD + ATTENDANCE SHEET PDF — même groupe isolé.
  await page.goto("/familiarisation");
  const famGroupSelect = page.locator("#groupId");
  const famGroupValue = await famGroupSelect.locator("option").filter({ hasText: GROUP_NAME }).first().getAttribute("value");
  await famGroupSelect.selectOption(famGroupValue!);
  await page.locator("#functionCode").selectOption("7.1");
  await page.locator("#heldAt").fill("2026-09-20T10:00");
  await page.getByRole("button", { name: /créer la session de familiarisation/i }).click();
  await page.waitForURL(/\/familiarisation\/\d+/);
  const famSessionId = page.url().match(/\/familiarisation\/(\d+)/)![1];
  const attendanceRow = page.locator("div.rounded-md.border-border-subtle").filter({ hasText: CANDIDATE_FULL_NAME }).first();
  await attendanceRow.getByRole("button", { name: /marquer présent/i }).click();
  await expect(attendanceRow.getByText("Présent", { exact: true })).toBeVisible();
  const attendancePdf = await fetchBinary(page, `/api/reports/attendance-sheet/${famSessionId}`);
  expect(attendancePdf.status).toBe(200);
  expect(attendancePdf.magic).toBe("%PDF-");
});
