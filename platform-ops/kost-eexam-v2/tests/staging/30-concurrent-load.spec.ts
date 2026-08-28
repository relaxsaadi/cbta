import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Mission "PRODUCTION READINESS" §19/§20 — mesure de charge concurrente
// DÉDIÉE, séparée de 29-acceptance-simulation-full.spec.ts : ce dernier
// réutilise des comptes dont la tentative unique peut déjà avoir été
// consommée par une exécution de débogage précédente (voir ses
// commentaires "already-done"), ce qui fausserait une mesure de temps
// réel. Ici, un groupe et 10 comptes strictement dédiés à CETTE mesure —
// jamais réutilisés pour autre chose, jamais le pilote partagé.
const COMPANY_NAME = "Charge — Mesure dédiée";
const GROUP_NAME = "Charge — Groupe dédié";
const ASSESSMENT_NAME = "DGR Fonction 7.1 — Mesure de charge";
const PASSWORD = "ChargeTest2026!";
const CONCURRENCY = 10;
const CANDIDATES = Array.from({ length: CONCURRENCY }, (_, i) => ({
  fullName: `Charge Candidat ${String(i + 1).padStart(2, "0")}`,
  username: `charge.candidat${i + 1}.staging`,
}));

test("mesure de charge concurrente dédiée — 10 candidats complètent un examen réel simultanément", async ({ browser }) => {
  test.setTimeout(180_000);
  const setupPage = await browser.newPage();
  await loginAs(setupPage, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));

  await setupPage.goto("/companies");
  if (!(await setupPage.getByText(COMPANY_NAME, { exact: true }).isVisible().catch(() => false))) {
    await setupPage.locator("#name").fill(COMPANY_NAME);
    await setupPage.locator("#scope").selectOption("test");
    await setupPage.getByRole("button", { name: /créer le client/i }).click();
    await expect(setupPage.getByText(COMPANY_NAME, { exact: true })).toBeVisible();
  }

  await setupPage.goto("/groups");
  if (!(await setupPage.getByText(GROUP_NAME, { exact: true }).isVisible().catch(() => false))) {
    const companySelect = setupPage.locator("#companyId");
    const companyValue = await companySelect.locator("option", { hasText: COMPANY_NAME }).getAttribute("value");
    await companySelect.selectOption(companyValue!);
    await setupPage.locator("#name").fill(GROUP_NAME);
    await setupPage.locator("#scope").selectOption("test");
    await setupPage.getByRole("button", { name: /créer le groupe/i }).click();
    await setupPage.waitForURL(/\/groups\/\d+/);
  } else {
    await setupPage.getByText(GROUP_NAME, { exact: true }).click();
    await setupPage.waitForURL(/\/groups\/\d+/);
  }

  if (!(await setupPage.getByText(CANDIDATES[CONCURRENCY - 1]!.fullName).isVisible().catch(() => false))) {
    await setupPage.getByRole("button", { name: /import csv en masse/i }).click();
    const csv = ["full_name,username,password", ...CANDIDATES.map((c) => `${c.fullName},${c.username},${PASSWORD}`)].join("\n");
    await setupPage.locator('textarea[name="csv"]').fill(csv);
    await setupPage.getByRole("button", { name: /^importer$/i }).click();
    await expect(setupPage.getByText(CANDIDATES[CONCURRENCY - 1]!.fullName).first()).toBeVisible({ timeout: 15_000 });
  }

  let needsFreshAssessment = true;
  await setupPage.goto("/exam-preparation");
  if (await setupPage.getByText(ASSESSMENT_NAME, { exact: true }).isVisible().catch(() => false)) {
    // Un examen existe déjà — s'il a déjà des tentatives consommées par
    // les 10 comptes dédiés, on ne peut pas remesurer dessus (tentative
    // unique). On en republie un nouveau (nom identique toléré, jamais
    // affiché comme un doublon gênant — seule la mesure de charge compte
    // ici) plutôt que de fausser silencieusement le résultat.
    needsFreshAssessment = false;
  }
  if (needsFreshAssessment) {
    await setupPage.locator('input[name="type"][value="examen"]').check({ force: true });
    const groupSelect = setupPage.locator('select[name="groupId"]');
    const gv = await groupSelect.locator("option").filter({ hasText: GROUP_NAME }).getAttribute("value");
    await groupSelect.selectOption(gv!);
    await setupPage.locator('select[name="functionCode"]').selectOption("7.1");
    await setupPage.locator('input[name="name"]').fill(ASSESSMENT_NAME);
    await setupPage.locator('input[name="questionCount"]').fill("5");
    await setupPage.locator('input[name="durationMinutes"]').fill("15");
    await setupPage.locator('select[name="scope"]').selectOption("test");
    await setupPage.getByRole("button", { name: /créer le brouillon/i }).click();
    await setupPage.waitForURL(/\/exam-preparation\/\d+/);
    await setupPage.getByRole("button", { name: /^publier$/i }).click();
    await expect(setupPage.getByText(/^published$/).first()).toBeVisible({ timeout: 10_000 });
  }
  await setupPage.close();

  const started = Date.now();
  const results = await Promise.all(
    CANDIDATES.map(async (c) => {
      const context = await browser.newContext();
      const p = await context.newPage();
      const t0 = Date.now();
      try {
        await loginAs(p, c.username, PASSWORD);
        const tLoggedIn = Date.now();
        await p.goto("/mes-examens");
        const row = p.locator("div.justify-between").filter({ hasText: ASSESSMENT_NAME });
        const link = row.getByRole("link", { name: /commencer|reprendre/i });
        if (!(await link.isVisible().catch(() => false))) {
          return { username: c.username, ok: true, skipped: true, totalMs: Date.now() - t0 };
        }
        await link.click();
        await p.waitForURL(/\/exam\/\d+\/(instructions|attempt)/);
        if (p.url().includes("/instructions")) {
          await p.getByRole("button", { name: /commencer l'examen/i }).click();
          await p.waitForURL(/\/exam\/\d+\/attempt/);
        }
        const tAttemptStarted = Date.now();
        const headerText = await p.locator("p", { hasText: /^Question \d+ \/ \d+$/ }).textContent();
        const total = Number(headerText?.match(/\/\s*(\d+)/)?.[1] ?? 0);
        for (let i = 1; i <= total; i++) {
          await p.getByRole("button", { name: String(i), exact: true }).click();
          const choice = p.locator('input[type="radio"], input[type="checkbox"]').first();
          if (!(await choice.isChecked())) await choice.check();
        }
        await p.getByRole("button", { name: /^terminer$/i }).click();
        await p.waitForURL(/\/mes-resultats/, { timeout: 30_000 });
        const tDone = Date.now();
        return {
          username: c.username,
          ok: true,
          skipped: false,
          totalMs: tDone - t0,
          loginMs: tLoggedIn - t0,
          startExamMs: tAttemptStarted - tLoggedIn,
          answerSubmitMs: tDone - tAttemptStarted,
        };
      } catch (err) {
        return { username: c.username, ok: false, totalMs: Date.now() - t0, error: String(err) };
      } finally {
        await context.close();
      }
    })
  );
  const wallClockMs = Date.now() - started;

  const failures = results.filter((r) => !r.ok);
  const succeeded = results.filter((r) => r.ok && !("skipped" in r && r.skipped));
  const durations = succeeded.map((r) => r.totalMs).sort((a, b) => a - b);
  const p50 = durations[Math.floor(durations.length / 2)] ?? 0;
  const max = durations[durations.length - 1] ?? 0;

  // eslint-disable-next-line no-console
  console.log(
    `[MESURE DE CHARGE — ${CONCURRENCY} candidats concurrents, examen réel 5 questions] ` +
      `mur d'horloge total=${wallClockMs}ms, réussis=${succeeded.length}/${CONCURRENCY}, échecs=${failures.length}, ` +
      `durée par candidat p50=${p50}ms max=${max}ms` +
      (failures.length ? ` | ÉCHECS: ${failures.map((f) => `${f.username}: ${(f as { error?: string }).error}`).join(" ; ")}` : "")
  );

  expect(failures, `tous les ${CONCURRENCY} candidats concurrents doivent réussir : ${JSON.stringify(failures)}`).toHaveLength(0);
});
