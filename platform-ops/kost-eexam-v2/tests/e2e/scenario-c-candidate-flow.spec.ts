import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario C (§29) : Candidat → login → begin → timer → answer → refresh →
// continue → submit → result. Utilise l'examen TEST publié par seed-demo
// (3 questions, 15 min, affecté à candidat1.demo).
test("le candidat passe l'examen démo de bout en bout, y compris un rafraîchissement en cours de route", async ({ page }) => {
  await loginAs(page, "candidat1.demo");

  // Ciblage précis de l'examen démo — le scénario B (ordre alphabétique
  // des specs) a publié entre-temps un autre examen affecté au même
  // groupe, donc "premier lien Commencer trouvé" n'est plus fiable. On cible
  // la div de ligne elle-même (classe "justify-between", unique à ce niveau
  // de la mise en page) plutôt que ".last()" sur un filtre texte générique
  // — qui, en présence de divs imbriqués partageant le même texte, peut
  // résoudre vers un enfant trop profond ne contenant pas le lien.
  const demoRow = page.locator("div.justify-between").filter({ hasText: "DGR Fonction 7.1 — Test démo" });
  await expect(demoRow).toBeVisible();
  await demoRow.getByRole("link", { name: /commencer/i }).click();

  await page.waitForURL(/\/exam\/\d+\/instructions/);
  await expect(page.getByText(/questions/)).toBeVisible();
  await page.getByRole("button", { name: /commencer l'examen/i }).click();

  await page.waitForURL(/\/exam\/\d+\/attempt/);
  // Le chronomètre serveur doit être visible et décompter.
  await expect(page.locator("text=/\\d{2}:\\d{2}/").first()).toBeVisible();

  // Répond à la première question.
  await page.locator('input[type="radio"], input[type="checkbox"]').first().check();

  // Rafraîchissement en cours de tentative — doit reprendre EXACTEMENT la
  // même tentative (même chronomètre, pas redémarré à 15:00, réponse déjà
  // enregistrée conservée), pas un nouvel essai.
  const attemptUrl = page.url();
  await page.reload();
  await expect(page).toHaveURL(attemptUrl);
  await expect(page.locator('input[type="radio"], input[type="checkbox"]').first()).toBeChecked();

  // Répond au reste des questions puis termine.
  const nextButtons = page.getByRole("button", { name: /suivante/i });
  while (await nextButtons.count()) {
    const choice = page.locator('input[type="radio"], input[type="checkbox"]').first();
    if (!(await choice.isChecked())) await choice.check();
    if ((await page.getByRole("button", { name: /^terminer$/i }).count()) > 0) break;
    await nextButtons.click();
  }
  const lastChoice = page.locator('input[type="radio"], input[type="checkbox"]').first();
  if (!(await lastChoice.isChecked())) await lastChoice.check();
  await page.getByRole("button", { name: /^terminer$/i }).click();

  await page.waitForURL(/\/mes-resultats/);
  await expect(page.getByText("DGR Fonction 7.1 — Test démo")).toBeVisible();
  // Le TEST démo affiche le résultat directement (feedback_mode différé
  // seulement si close_at est fixé, ce qui n'est pas le cas ici).
  await expect(page.getByText(/\/100/)).toBeVisible();
});
