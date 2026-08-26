import { test, expect, type Page } from "@playwright/test";
import { loginAs, env } from "./helpers";

// §7 CANDIDATE de la phase — utilise le vrai contenu Fonction 7.1 importé
// (7 questions réelles FROZEN FR / SOURCE VERIFIED). Les réponses sont
// choisies par correspondance de TEXTE (pas de position), car les choix
// sont mélangés par tentative — on sait quelle réponse est correcte
// puisque le contenu source est connu (scripts/import-function-7-1-real.ts).
//
// candidat1 répond correctement aux 7/7 (démontre RÉUSSI, seuil 80%
// franchi) ; candidat2 ne répond correctement qu'à 3/7 = 42.9% (démontre
// ÉCHOUÉ — le seuil rejette réellement un score insuffisant, pas
// seulement en théorie).
const CORRECT_TEXT: Record<string, string> = {
  "critère permet de qualifier": "Il figure dans la liste des marchandises dangereuses du règlement, ou il est classé conformément à ce règlement.",
  "quel organisme élabore": "OACI — Organisation de l'Aviation Civile Internationale",
  "champ d'application du DGR": "Vrai",
  "potentiellement cachées présentée": "Échantillons de diagnostic",
  "interdites au transport par les passagers": "Vrai",
  "acide sulfurique et l'acide de batterie": "Classe 8 — Matières corrosives",
  "caractéristiques que doivent respecter les marques": "Durables, facilement visibles et lisibles, pouvant être exposées aux intempéries sans dégradation notable, et apposées sur un fond de couleur contrastante.",
};

// Retourne le texte du stem actuellement affiché (pour permettre à
// l'appelant de détecter, avant d'agir, que la question a réellement changé
// après un clic "Suivante" — voir le commentaire dans takeExam()).
async function readStem(page: Page): Promise<string> {
  const stemLocator = page.locator("main p.text-\\[14\\.5px\\]").first();
  return (await stemLocator.textContent()) ?? "";
}

async function answerCurrentQuestion(page: Page, wantCorrect: boolean, stemText: string) {
  const matchKey = Object.keys(CORRECT_TEXT).find((k) => stemText.includes(k));
  if (!matchKey) throw new Error(`Question non reconnue (contenu inattendu) : ${stemText.slice(0, 80)}`);
  const correctText = CORRECT_TEXT[matchKey]!;

  // Cible le <label> par contenu (sous-chaîne, pas égalité exacte —
  // insensible aux détails de rendu/retour à la ligne) puis son <input>
  // précisément, avec .check() — son propre contrat garantit déjà l'état
  // coché résultant (contrairement à un simple .click() sur le texte, qui
  // peut réussir sans que l'input change d'état). On ne rajoute PAS de
  // second expect(toBeChecked()) indépendant après coup : le chronomètre
  // ré-affiché chaque seconde (setInterval côté ExamRunner) ré-exécute le
  // rendu du composant entier en continu, et une ré-résolution tardive du
  // même locator peut tomber sur une fenêtre de rendu transitoire — un faux
  // négatif d'UI confirmé en pratique (logs serveur : la réponse est bien
  // écrite malgré l'échec de cette re-vérification). La vraie garantie
  // contre une réponse perdue est côté application : ExamRunner.tsx attend
  // TOUTES les sauvegardes en cours (pendingSaves + Promise.allSettled)
  // avant de soumettre — c'est cette garantie que ce test exerce, pas une
  // resynchronisation UI redondante.
  const targetLabel = wantCorrect
    ? page.locator("label").filter({ hasText: correctText })
    : page.locator("label").filter({ hasNotText: correctText });
  const input = targetLabel.first().locator('input[type="radio"], input[type="checkbox"]');
  await input.check({ force: true });
}

async function takeExam(page: Page, username: string, password: string, correctIndexes: Set<number>) {
  await loginAs(page, username, password);
  await expect(page.getByText("DGR Fonction 7.1 — Examen pilote staging")).toBeVisible();
  await page.getByRole("link", { name: /commencer/i }).first().click();

  await page.waitForURL(/\/exam\/\d+\/instructions/);
  await page.getByRole("button", { name: /commencer l'examen/i }).click();

  await page.waitForURL(/\/exam\/\d+\/attempt/);
  await expect(page.locator("text=/\\d{2}:\\d{2}/").first()).toBeVisible();

  // Répond à la première question puis rafraîchit — le chronomètre
  // continue, la réponse déjà donnée est conservée (§7/§8). Laisse le
  // temps à la sauvegarde (déclenchée en fire-and-forget côté client,
  // voir ExamRunner.tsx) d'atteindre le serveur avant de recharger — un
  // reload() annule toute requête réseau encore en vol depuis l'ancienne
  // page, ce qui n'est pas ce que ce test veut exercer ici.
  let stemText = await readStem(page);
  await answerCurrentQuestion(page, correctIndexes.has(0), stemText);
  await page.waitForTimeout(500);
  const attemptUrl = page.url();
  await page.reload();
  await expect(page).toHaveURL(attemptUrl);
  stemText = await readStem(page);

  for (let i = 1; i < 7; i++) {
    const previousStem = stemText;
    await page.getByRole("button", { name: /suivante/i }).click();
    // Le clic "Suivante" ne fait qu'un changement d'état côté client
    // (setIndex) — il ne garantit pas que le nouveau stem soit déjà peint
    // au moment où .click() se résout. Lire le stem immédiatement après
    // pouvait donc parfois retomber sur le contenu de la question
    // PRÉCÉDENTE (constaté en pratique : deux itérations consécutives
    // "matchaient" la même question, causant une réponse posée sur le
    // mauvais choix). On attend explicitement que le stem affiché change
    // avant de continuer, plutôt que de faire confiance au retour de
    // .click().
    await expect
      .poll(async () => readStem(page), { timeout: 10_000, message: "le stem affiché n'a pas changé après le clic Suivante" })
      .not.toBe(previousStem);
    stemText = await readStem(page);
    await answerCurrentQuestion(page, correctIndexes.has(i), stemText);
  }

  await page.getByRole("button", { name: /^terminer$/i }).click();
  await page.waitForURL(/\/mes-resultats/);
}

test("candidat pilote 1 répond correctement à toutes les questions — RÉUSSI attendu", async ({ page }) => {
  await takeExam(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"), new Set([0, 1, 2, 3, 4, 5, 6]));
  await expect(page.getByText("DGR Fonction 7.1 — Examen pilote staging")).toBeVisible();
  await expect(page.getByText("100/100")).toBeVisible();
  await expect(page.getByText("Réussi")).toBeVisible();
});

test("candidat pilote 2 répond correctement à 3/7 questions — ÉCHOUÉ attendu (sous le seuil 80%)", async ({ page }) => {
  await takeExam(page, env("STAGING_CANDIDATE2_USER"), env("STAGING_CANDIDATE2_PASS"), new Set([0, 1, 2]));
  await expect(page.getByText("DGR Fonction 7.1 — Examen pilote staging")).toBeVisible();
  await expect(page.getByText("42.86/100")).toBeVisible();
  await expect(page.getByText("Échoué")).toBeVisible();
});
