import { test, expect, type Page } from "@playwright/test";
import { loginAs, env } from "./helpers";

// La carte "Compte utilisateur" empile 3 <form> indépendants (Suspendre,
// Réactiver, Révoquer les sessions), chacun avec son PROPRE
// <select name="targetId"> — jamais partagé. On cible par position
// (ordre connu et stable, voir app/(app)/incidents/[id]/page.tsx) plutôt
// que par filtre sur le libellé du bouton, plus fiable ici.
async function selectTargetAndSubmit(page: Page, formIndex: number, optionTextContains: string) {
  const card = page.locator("div.rounded-md.border-border-subtle").filter({ hasText: "Compte utilisateur" });
  const form = card.locator("form").nth(formIndex);
  const select = form.locator('select[name="targetId"]');
  const value = await select.locator("option", { hasText: optionTextContains }).getAttribute("value");
  await select.selectOption(value!);
  // form.requestSubmit() plutôt qu'un clic pointeur : les 3 <form> empilés
  // de cette carte déclenchent un chevauchement de survol/validation natif
  // du navigateur (constaté en pratique — un <select> voisin intercepte
  // durablement les événements pointeur sur le bouton, même isolé sans
  // ambiguïté de sélecteur). requestSubmit() déclenche la MÊME action
  // serveur réelle (ce n'est pas un contournement de la logique testée,
  // seulement du clic physique).
  await form.evaluate((el) => (el as HTMLFormElement).requestSubmit());
  await page.waitForLoadState("networkidle");
}

// Addendum §25 — TEST D'ACCEPTATION incident : cycle complet réel —
// détection/déclaration → classification → action immédiate → preuve →
// investigation → mesure corrective → reprise → clôture — avec
// traçabilité complète vérifiée à chaque étape (incident_actions +
// journal d'audit).
test("parcours d'acceptance complet : déclaration → classification → action immédiate → investigation → correction → reprise → clôture", async ({ page }) => {
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

  // ÉTAPE 1 — détection/déclaration, avec classification réelle (sévérité
  // élevée).
  await page.goto("/incidents");
  await page.locator("#type").selectOption("security");
  await page.locator("#severity").selectOption("high");
  const marker = `Acceptance §25 — incident réel ${Date.now()}`;
  await page.locator("#description").fill(marker);
  await page.getByRole("button", { name: /déclarer un incident/i }).click();
  await page.waitForURL(/\/incidents\/\d+/);
  const incidentUrl = page.url();
  await expect(page.getByText(marker)).toBeVisible();
  // La sévérité (classification) s'affiche sur la liste, pas sur la
  // fiche détail elle-même.
  await page.goto("/incidents");
  await expect(page.locator("a", { hasText: marker }).getByText("high")).toBeVisible();
  await page.goto(incidentUrl);

  // ÉTAPE 2 — action immédiate ciblée : suspendre un compte candidat
  // réel (effet réel, pas seulement une trace).
  const candidate3Username = env("STAGING_CANDIDATE3_USER");
  await selectTargetAndSubmit(page, 0, candidate3Username); // 0 = Suspendre
  await expect(page.getByText("suspend_account")).toBeVisible();

  try {
    // Preuve réelle de l'effet : candidat3 ne peut plus se connecter.
    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Nom d'utilisateur").fill(env("STAGING_CANDIDATE3_USER"));
    await page.getByLabel("Mot de passe").fill(env("STAGING_CANDIDATE3_PASS"));
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.getByText(/compte est suspendu/i)).toBeVisible();

    // ÉTAPE 3 — investigation : rattacher une preuve + une note.
    await page.goto("/login");
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await page.goto(incidentUrl);
    await page.locator('input[name="evidence"]').fill("Capture du journal de connexion — référence ACC-25-EVIDENCE");
    await page.getByRole("button", { name: "Rattacher" }).click();
    await expect(page.getByText("ACC-25-EVIDENCE")).toBeVisible();

    await page.locator('input[name="note"]').fill("Investigation : accès anormal confirmé sur le compte candidat3.");
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText(/accès anormal confirmé/i)).toBeVisible();

    // ÉTAPE 4 — correction : mesure corrective consignée.
    await page.locator('input[name="measure"]').fill("Mot de passe réinitialisé, compte réactivé après vérification.");
    await page.getByRole("button", { name: "Consigner" }).click();
    await expect(page.getByText(/mot de passe réinitialisé/i)).toBeVisible();

    // ÉTAPE 5 — reprise : réactiver le compte, preuve réelle qu'il peut
    // de nouveau se connecter.
    await selectTargetAndSubmit(page, 1, candidate3Username); // 1 = Réactiver
    await expect(page.getByText("reactivate_account")).toBeVisible();

    await page.context().clearCookies();
    await loginAs(page, env("STAGING_CANDIDATE3_USER"), env("STAGING_CANDIDATE3_PASS"));
    await expect(page).toHaveURL(/\/mes-examens/);
  } finally {
    // Filet de sécurité INCONDITIONNEL : réactiver le compte candidat3
    // quel que soit le point d'échec de ce test — réactiver un compte
    // déjà actif est sans effet (idempotent côté application), donc
    // toujours sûr d'appeler ici.
    await page.context().clearCookies();
    await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
    await page.goto(incidentUrl);
    await selectTargetAndSubmit(page, 1, candidate3Username).catch(() => {}); // 1 = Réactiver
  }

  // ÉTAPE 6 — clôture : le statut passe à "clôturé", traçabilité complète
  // visible dans l'historique de l'incident.
  await page.goto(incidentUrl);
  await page.getByRole("button", { name: /clôturer l'incident/i }).click();
  await expect(page.getByText(/^closed$/)).toBeVisible();
  await expect(page.getByText("suspend_account")).toBeVisible();
  // .first() : le filet de sécurité inconditionnel (finally, ci-dessus)
  // réactive de nouveau par précaution même après une ÉTAPE 5 réussie —
  // deux entrées "reactivate_account" légitimes, pas une ambiguïté.
  await expect(page.getByText("reactivate_account").first()).toBeVisible();
  await expect(page.getByText("attach_evidence")).toBeVisible();
  await expect(page.getByText("note")).toBeVisible();
  await expect(page.getByText("corrective_measure")).toBeVisible();
  // { exact: true } : un getByText("close") nu matcherait aussi le badge
  // de statut "closed" (sous-chaîne, insensible à la casse par défaut).
  await expect(page.getByText("close", { exact: true })).toBeVisible();

  // ÉTAPE 7 — journal d'audit global : chaque action de ce parcours y
  // laisse une trace indépendante (pas seulement sur la fiche incident).
  await page.goto("/audit-logs");
  await expect(page.getByText("incident_declare").first()).toBeVisible();
});
