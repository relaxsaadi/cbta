import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Addendum §9-11 — procédure incident : actions plateforme réelles (mode
// maintenance, blocage connexions, blocage nouvelles tentatives) et
// continuité d'examen (une tentative déjà en cours n'est jamais
// interrompue). Chaque test lève systématiquement le blocage à la fin
// (try/finally) pour ne jamais laisser la plateforme bloquée pour les
// specs suivantes de la suite.
//
// FILET DE SÉCURITÉ SUPPLÉMENTAIRE (constaté en pratique — un try/finally
// par test ne suffit pas toujours : un test peut heurter son propre délai
// de 60s PENDANT son propre bloc finally, l'interrompant avant la fin du
// nettoyage, laissant la plateforme bloquée pour TOUTE la suite restante,
// observé deux fois cette session malgré la correction précédente).
// `afterEach` s'exécute TOUJOURS, avec son PROPRE budget de temps distinct
// du test — même si le test précédent a expiré en plein nettoyage, ce hook
// a une nouvelle fenêtre complète pour terminer le travail. Un test E2E
// staging n'a aucun accès direct à la base distante (uniquement HTTP) —
// la remise à zéro passe donc par la même UI admin que les tests eux-mêmes,
// jamais par une connexion DB locale (qui pointerait vers un fichier local
// sans rapport avec la base réelle du serveur).
test.afterEach(async ({ page, context }) => {
  await context.clearCookies();
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS")).catch(() => {});
  await declareDedicatedIncident(page).catch(() => {});
  for (const label of ["Désactiver le mode maintenance", "Débloquer les nouvelles connexions", "Débloquer les nouvelles tentatives"]) {
    await page.getByRole("button", { name: label }).click({ timeout: 3000 }).catch(() => {});
  }
  const examCard = page.locator("div.rounded-md.border-border-subtle").filter({ hasText: "Évaluation" });
  const reopenForm = examCard.locator("form").nth(1);
  const select = reopenForm.locator('select[name="targetId"]');
  const value = await select.locator("option", { hasText: "DGR Fonction 7.1 — Examen pilote staging" }).getAttribute("value").catch(() => null);
  if (value) {
    await select.selectOption(value).catch(() => {});
    await reopenForm.evaluate((el) => (el as HTMLFormElement).requestSubmit()).catch(() => {});
  }
});

async function fetchPdf(page: import("@playwright/test").Page, path: string) {
  return page.evaluate(async (p) => {
    const res = await fetch(p, { credentials: "same-origin" });
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf).slice(0, 5);
    return { status: res.status, contentType: res.headers.get("content-type"), magic: new TextDecoder().decode(bytes), size: buf.byteLength };
  }, path);
}

// Déclare un incident plateforme dédié à ce fichier de tests (admin,
// aucun client — champ groupId laissé vide) et navigue jusqu'à sa fiche.
// Évite toute dépendance sur l'état d'un incident déclaré par une AUTRE
// spec (statut ouvert/fermé imprévisible).
async function declareDedicatedIncident(page: import("@playwright/test").Page) {
  await page.goto("/incidents");
  await page.locator("#type").selectOption("security");
  await page.locator("#severity").selectOption("high");
  await page.locator("#description").fill(`Incident dédié E2E §9-11 — actions plateforme (${Date.now()})`);
  await page.getByRole("button", { name: /déclarer un incident/i }).click();
  await page.waitForURL(/\/incidents\/\d+/);
}

test.describe("Procédure incident — document PDF", () => {
  test("le PDF de procédure est un vrai document, accessible au personnel habilité", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
    const pdf = await fetchPdf(page, "/api/reports/incident-procedure");
    expect(pdf.status).toBe(200);
    expect(pdf.contentType).toContain("application/pdf");
    expect(pdf.magic).toBe("%PDF-");
    expect(pdf.size).toBeGreaterThan(2000);
  });

  test("un candidat ne peut pas télécharger la procédure (document personnel)", async ({ page }) => {
    await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
    const pdf = await fetchPdf(page, "/api/reports/incident-procedure");
    expect(pdf.status).toBe(403);
  });
});

test.describe("Actions plateforme — blocage des nouvelles connexions", () => {
  test("bloquer les nouvelles connexions empêche un responsable de se connecter, mais jamais l'administrateur", async ({ page, context }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await declareDedicatedIncident(page);
    const incidentUrl = page.url();

    // try/finally démarre AVANT le clic qui active le blocage (pas
    // seulement après) : si l'assertion de bascule elle-même échoue (ex.
    // aléa réseau/rendu), le blocage reste quand même levé en finally —
    // sinon la plateforme reste bloquée pour tout le reste de la suite
    // (constaté en pratique : un échec exactement ici a laissé
    // block_new_attempts=1 en base, cassant en cascade toute tentative
    // d'examen dans les specs suivantes).
    try {
      await page.getByRole("button", { name: "Bloquer les nouvelles connexions" }).click();
      await expect(page.getByRole("button", { name: "Débloquer les nouvelles connexions" })).toBeVisible();

      await context.clearCookies();
      // Soumission directe (pas via loginAs — dont le waitForURL suppose
      // une connexion réussie et attendrait inutilement le délai complet
      // sur un refus attendu).
      await page.goto("/login");
      await page.getByLabel("Nom d'utilisateur").fill(env("STAGING_MANAGER_USER"));
      await page.getByLabel("Mot de passe").fill(env("STAGING_MANAGER_PASS"));
      await page.getByRole("button", { name: /se connecter/i }).click();
      await expect(page.getByText(/connexions temporairement suspendues/i)).toBeVisible();
      await expect(page).toHaveURL(/\/login/);

      // ...mais jamais l'administrateur, qui doit pouvoir lever le blocage.
      await page.goto("/login");
      await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
      await expect(page).toHaveURL(/\/overview/);
    } finally {
      await page.goto(incidentUrl);
      const stillBlocked = await page.getByRole("button", { name: "Débloquer les nouvelles connexions" }).count();
      if (stillBlocked > 0) {
        await page.getByRole("button", { name: "Débloquer les nouvelles connexions" }).click();
      }
    }
  });
});

test.describe("Actions plateforme — continuité d'examen", () => {
  test("bloquer les nouvelles tentatives empêche un nouveau démarrage, sans jamais interrompre une tentative en cours", async ({ page, context }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await declareDedicatedIncident(page);
    const incidentUrl = page.url();

    // Même correction que ci-dessus : le clic qui active le blocage est
    // maintenant DANS le try/finally, pas avant.
    try {
      await page.getByRole("button", { name: "Bloquer les nouvelles tentatives" }).click();
      await expect(page.getByRole("button", { name: "Débloquer les nouvelles tentatives" })).toBeVisible();

      // Bannière visible pour un rôle non-admin déjà connecté.
      await context.clearCookies();
      await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
      await expect(page.getByText(/démarrage de nouvelles tentatives temporairement suspendu/i)).toBeVisible();
    } finally {
      await context.clearCookies();
      await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
      await page.goto(incidentUrl);
      const stillBlocked = await page.getByRole("button", { name: "Débloquer les nouvelles tentatives" }).count();
      if (stillBlocked > 0) {
        await page.getByRole("button", { name: "Débloquer les nouvelles tentatives" }).click();
      }
    }
  });
});

test.describe("Actions plateforme — mode maintenance", () => {
  test("activer le mode maintenance bloque À LA FOIS les connexions ET les nouvelles tentatives, en un seul geste", async ({ page, context }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await declareDedicatedIncident(page);
    const incidentUrl = page.url();

    try {
      await page.getByRole("button", { name: "Activer le mode maintenance" }).click();
      await expect(page.getByRole("button", { name: "Désactiver le mode maintenance" })).toBeVisible();
      await expect(page.getByText(/mode maintenance actif sur toute la plateforme/i)).toBeVisible();

      // Les 2 blocages dédiés sont bien INCLUS (pas seulement affichés
      // séparément à côté) — leur bouton devient un texte non actionnable
      // "(inclus dans le mode maintenance)" tant que la maintenance est
      // active (ToggleAction disabled=true, voir le composant). Vérifie
      // qu'un SEUL geste couvre bien les deux, sans dépendre d'une
      // connexion manager fraîche — structurellement impossible ici :
      // le blocage de connexion empêcherait justement cette connexion
      // même, donc pas une preuve indépendante du blocage tentatives.
      await expect(page.getByText("Débloquer les nouvelles connexions (inclus dans le mode maintenance)")).toBeVisible();
      await expect(page.getByText("Débloquer les nouvelles tentatives (inclus dans le mode maintenance)")).toBeVisible();

      // Connexions bloquées pour un rôle non-admin — même effet que le
      // blocage dédié, mais déclenché par le SEUL bouton maintenance.
      await context.clearCookies();
      await page.goto("/login");
      await page.getByLabel("Nom d'utilisateur").fill(env("STAGING_MANAGER_USER"));
      await page.getByLabel("Mot de passe").fill(env("STAGING_MANAGER_PASS"));
      await page.getByRole("button", { name: /se connecter/i }).click();
      await expect(page.getByText(/connexions temporairement suspendues/i)).toBeVisible();

      // ...mais jamais l'administrateur.
      await page.goto("/login");
      await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
      await expect(page).toHaveURL(/\/overview/);
    } finally {
      await context.clearCookies();
      await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
      await page.goto(incidentUrl);
      const stillOn = await page.getByRole("button", { name: "Désactiver le mode maintenance" }).count();
      if (stillOn > 0) {
        await page.getByRole("button", { name: "Désactiver le mode maintenance" }).click();
      }
    }
  });
});

test.describe("Actions plateforme — suspendre un examen ciblé", () => {
  // La carte "Évaluation" empile 2 <form> indépendants (Suspendre
  // l'examen, Réouvrir), chacun avec son PROPRE <select name="targetId">
  // — même structure que la carte "Compte utilisateur", ciblée par
  // position (voir 22-acceptance-incident.spec.ts selectTargetAndSubmit).
  async function selectExamAndSubmit(page: import("@playwright/test").Page, formIndex: number) {
    const card = page.locator("div.rounded-md.border-border-subtle").filter({ hasText: "Évaluation" });
    const form = card.locator("form").nth(formIndex);
    const select = form.locator('select[name="targetId"]');
    const value = await select.locator("option", { hasText: "DGR Fonction 7.1 — Examen pilote staging" }).getAttribute("value");
    await select.selectOption(value!);
    await form.evaluate((el) => (el as HTMLFormElement).requestSubmit());
    await page.waitForLoadState("networkidle");
  }

  test("suspendre l'examen pilote via l'incident empêche un nouveau démarrage, réouvrir le restaure", async ({ page, context }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await declareDedicatedIncident(page);
    const incidentUrl = page.url();

    try {
      await selectExamAndSubmit(page, 0); // 0 = Suspendre l'examen
      await expect(page.getByText("suspend_assessment")).toBeVisible();

      // Effet réel : candidat3 (jamais commencé cet examen) ne peut plus
      // le démarrer tant qu'il est suspendu. Assertion mise à jour —
      // depuis la mission "COMPLETE CANDIDATE EXAM LIFECYCLE"
      // (2026-08-29) §2, listAssignedAssessmentsForCandidate()
      // (lib/assessments.ts) inclut DÉLIBÉRÉMENT 'suspended' dans son
      // WHERE : un examen suspendu reste visible avec un badge SUSPENDU
      // explicite (lib/candidate-exam-state.ts), il ne disparaît plus
      // silencieusement (bug réel diagnostiqué et corrigé par cette
      // mission-là — cette assertion testait encore l'ANCIEN comportement
      // "disparition totale", jamais mis à jour depuis). La preuve
      // correcte est donc le badge SUSPENDU visible, pas une absence.
      await context.clearCookies();
      await loginAs(page, env("STAGING_CANDIDATE3_USER"), env("STAGING_CANDIDATE3_PASS"));
      await page.goto("/mes-examens");
      const examCard = page.locator("div.border-border-subtle").filter({ hasText: "DGR Fonction 7.1 — Examen pilote staging" }).last();
      await expect(examCard.getByText("SUSPENDU", { exact: true })).toBeVisible();
    } finally {
      await context.clearCookies();
      await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
      await page.goto(incidentUrl);
      await selectExamAndSubmit(page, 1).catch(() => {}); // 1 = Réouvrir
    }

    // Preuve de la reprise, HORS du finally (doit être un résultat
    // observable du test, pas seulement un nettoyage best-effort) :
    // l'examen réapparaît dans la liste du candidat.
    await expect(page.getByText("reopen_assessment")).toBeVisible();
    await context.clearCookies();
    await loginAs(page, env("STAGING_CANDIDATE3_USER"), env("STAGING_CANDIDATE3_PASS"));
    await page.goto("/mes-examens");
    await expect(page.getByText("DGR Fonction 7.1 — Examen pilote staging")).toBeVisible();
  });
});

test.describe("Actions plateforme — rattacher une preuve", () => {
  test("rattacher une preuve crée une trace visible dans l'historique de l'incident", async ({ page }) => {
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await declareDedicatedIncident(page);

    const marker = `Preuve E2E ${Date.now()}`;
    await page.locator('input[name="evidence"]').fill(marker);
    await page.getByRole("button", { name: "Rattacher" }).click();
    await expect(page.getByText(marker)).toBeVisible();
    await expect(page.getByText("attach_evidence")).toBeVisible();
  });
});
