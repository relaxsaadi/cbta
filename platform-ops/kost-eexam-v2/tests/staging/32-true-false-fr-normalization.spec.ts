import { test, expect, type Page } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Mission "GO — FINAL CONTENT UX CLEANUP BEFORE RESEND" §5/§13 — preuve de
// régression réelle après la normalisation True/False -> Vrai/Faux de 24
// questions déjà migrées (voir scripts/sync-tier-a-questions.ts, exécuté
// via un candidat JSON dédié, jamais committé — seuls les changements de
// code/versionnage le sont). Fonction 7.6 contient deux des 24 questions
// corrigées : Q-7.6-004 (ancienne réponse correcte "True" -> "Vrai") et
// Q-7.6-031 (ancienne réponse correcte "False" -> "Faux") — un ex-True et
// un ex-False dans le même examen, comme demandé.
//
// question_count = 31 = la totalité du pool admissible Fonction 7.6 :
// avec question_source="random" sur un pool de taille exactement égale
// au nombre demandé, la sélection est déterministe (garantit d'inclure
// les deux questions ciblées) sans dépendre d'un mode de sélection
// manuelle qui n'existe pas dans l'assistant réel.
const EXAM_NAME = "DGR Fonction 7.6 — Vérification Vrai/Faux (normalisation FR)";

const FN76_CORRECT_TEXT: Record<string, string> = {
  "les colis de batteries au lithium relevant des instructions d'emballage PI 965 o": "Des explosifs (à l'exception de la Division 1.4S), la Division 2.1, la Classe 3, la Division 4.1 et la Division 5.1.",
  "laquelle des informations suivantes ne fait PAS partie des renseignements que la": "Le nom et les coordonnées personnelles de l'expéditeur.",
  "Vrai ou Faux : selon le cours (Notification des pilotes), les renseignements écr": "Vrai",
  "quelle colonne de la liste indique les étiquettes de danger applicables à une ma": "Colonne D.",
  "laquelle des divisions/groupes de compatibilité suivants est seule autorisée à b": "Division 1.4, groupe de compatibilité S.",
  "laquelle des affirmations suivantes décrit correctement la classification des ét": "Il existe deux types d'étiquettes : les étiquettes de danger et les étiquettes de manutention.",
  "Vrai ou Faux : selon le cours (Autres étiquettes), un colis portant une étiquett": "Faux",
  "Vrai ou Faux : selon le cours (Notification des pilotes), un exemplaire lisible": "Vrai",
  "à qui l'exploitant doit-il signaler un accident ou un incident de marchandises d": "Aux autorités compétentes de l'État de l'exploitant ainsi qu'à celles de l'État dans lequel l'accident ou l'incident s'est produit.",
  "Vrai ou Faux : selon le cours (Compte rendu DG non déclarées), l'obligation de l": "Faux",
  "laquelle des caractéristiques suivantes n'est PAS l'un des critères cités par le": "Être susceptible de bénéficier d'une Approbation (DGR 1.2.5) accordée par l'État d'origine ou de l'opérateur au titre d'un niveau de sécurité équivalent.",
  "quel organisme élabore des recommandations pour le transport sécuritaire des mat": "L'Agence internationale de l'énergie atomique (AIEA).",
  "Vrai ou Faux : selon le cours (Applicabilité — Champ d'application DGR 1.2.1), l": "Faux",
  "Vrai ou Faux : selon le cours (MD transportées par les passagers ou l'équipage D": "Vrai",
  "lequel des exemples suivants illustre une divergence d'EXPLOITANT (et non une di": "Air Algérie (AH), codes AH-01, AH-02.",
  "à quel degré de danger correspond le Groupe d'emballage II ?": "Matières moyennement dangereuses.",
  "que représente la lettre « Y » dans ce marquage ?": "Le groupe d'emballage (X = groupe I, Y = groupe II, Z = groupe III).",
  "que doit comprendre la case « Renseignements sur la manutention » de la LTA pour": "La mention « Dangerous goods as per associated Shipper's Declaration » (ou « as per associated DGD »), et « Cargo Aircraft Only » (CAO) le cas échéant.",
  "Vrai ou Faux : selon le cours (Information sur l'intervention d'urgence — Respon": "Vrai",
  "Vrai ou Faux : selon le cours (Base de la séparation des marchandises dangereuse": "Faux",
  "laquelle des marchandises suivantes N'est PAS dispensée de l'obligation de figur": "Un envoi classique de marchandises dangereuses en quantité normale (non exceptée), ne relevant d'aucune des catégories dispensées listées par le cours.",
  "Vrai ou Faux : selon le cours (Notification des pilotes), les renseignements pré": "Faux",
  "lequel des éléments suivants NE fait PAS partie des facteurs que le cours cite c": "Le groupe d'emballage du colis contenant la glace carbonique.",
  "et le Practice Book, quel document de l'OACI contient les instructions technique": "Doc 9284.",
  "Vrai ou Faux : selon le cours (Responsabilités de l'expéditeur DGR 1.3.1), un ex": "Vrai",
  "Vrai ou Faux : selon le cours (Divergence de l'Exploitant DGR 2.8.3), les diverg": "Faux",
  "Vrai ou Faux : selon le cours (Les classes des marchandises dangereuses DGR 3.0.": "Vrai",
  "lequel des éléments suivants N'est PAS l'un des critères cités par le cours pour": "Coloré de façon à contraster avec l'étiquette de danger.",
  "Vrai ou Faux : selon le cours (Séparation des marchandises dangereuses), les mar": "Vrai",
  "Vrai ou Faux : selon le cours (Notification des pilotes — accessibilité), les re": "Vrai",
  "en plus des langues que peut exiger l'État de l'exploitant, quelle langue le cou": "L'anglais.",
};

function matchCorrectText(table: Record<string, string>, stemText: string): string {
  const matchKey = Object.keys(table)
    .sort((a, b) => b.length - a.length)
    .find((k) => stemText.includes(k));
  if (!matchKey) throw new Error(`Question non reconnue (contenu inattendu) : ${stemText.slice(0, 90)}`);
  return table[matchKey]!;
}

async function readStem(page: Page): Promise<string> {
  const stemLocator = page.locator("main p.text-\\[14\\.5px\\]").first();
  return (await stemLocator.textContent()) ?? "";
}

test("le responsable crée un examen 7.6 pleine banque (31/31) et publie", async ({ page }) => {
  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
  await page.goto("/exam-preparation");

  const alreadyExists = await page.getByText(EXAM_NAME).count();
  test.skip(alreadyExists > 0, "Examen déjà créé — idempotence.");

  await page.locator('input[name="type"][value="examen"]').check({ force: true });
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Démonstration" });
  await page.locator('select[name="functionCode"]').selectOption("7.6");
  await page.locator("#name").fill(EXAM_NAME);
  await expect(page.locator("text=Questions admissibles disponibles :").locator("xpath=..")).toContainText("31");

  await page.locator("#questionCount").fill("31");
  await page.locator("#durationMinutes").fill("40");
  await page.locator("#passThresholdPct").fill("80");
  await page.locator("#attemptsAllowed").fill("1");
  await page.locator('input[name="showResult"]').check();

  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();
});

test("candidat pilote 2 passe l'examen pleine banque 7.6 — Vrai/Faux affichés partout, jamais True/False, notation correcte", async ({ page }) => {
  await loginAs(page, env("STAGING_CANDIDATE2_USER"), env("STAGING_CANDIDATE2_PASS"));

  await page.goto("/mes-examens");
  const row = page.getByText(EXAM_NAME, { exact: true }).locator("xpath=../..");
  test.skip((await row.count()) === 0, "Examen non trouvé (étape précédente skippée/pas encore créée).");
  test.skip((await row.getByText(/tentatives épuisées/i).count()) > 0, "Candidat2 a déjà terminé cet examen — déjà prouvé (idempotence).");

  await row.getByRole("link", { name: /reprendre|commencer/i }).click();
  // "Reprendre" mène directement à /attempt ; "Commencer" mène d'abord à
  // /instructions. Attendre EXPLICITEMENT que l'une des deux navigations
  // se termine (waitForURL, pas une simple lecture synchrone de
  // page.url()) avant de décider s'il faut cliquer le bouton
  // "Commencer l'examen" — piège constaté : une lecture immédiate de
  // page.url() juste après le clic peut tomber avant la fin de
  // l'hydratation React de la nouvelle page, laissant le clic suivant
  // sur "Commencer l'examen" atterrir sur un bouton pas encore
  // interactif (la Server Action ne se déclenche jamais, la page reste
  // sur /instructions indéfiniment).
  await page.waitForURL(/\/exam\/\d+\/(instructions|attempt)/);
  if (page.url().includes("/instructions")) {
    await page.getByRole("button", { name: /commencer l'examen/i }).click();
    await page.waitForURL(/\/exam\/\d+\/attempt/);
  }
  await expect(page.locator("text=/\\d{2}:\\d{2}/").first()).toBeVisible();

  let sawFormerTrueItem = false;
  let sawFormerFalseItem = false;

  const answerCurrent = async () => {
    const stemText = await readStem(page);

    // Preuve directe : aucune option "True"/"False" n'est jamais rendue à
    // l'écran, sur AUCUNE des 31 questions — pas seulement les 2 ciblées.
    const optionTexts = await page.locator('main label').allTextContents();
    for (const t of optionTexts) {
      expect(t.trim()).not.toBe("True");
      expect(t.trim()).not.toBe("False");
    }

    if (stemText.includes("Vrai ou Faux : selon le cours (Notification des pilotes), les renseignements écr")) {
      sawFormerTrueItem = true; // Q-7.6-004 — ancienne réponse correcte "True"
      expect(optionTexts.map((t) => t.trim())).toEqual(expect.arrayContaining(["Vrai", "Faux"]));
    }
    if (stemText.includes("Vrai ou Faux : selon le cours (Divergence de l'Exploitant DGR 2.8.3), les diverg")) {
      sawFormerFalseItem = true; // Q-7.6-031 — ancienne réponse correcte "False"
      expect(optionTexts.map((t) => t.trim())).toEqual(expect.arrayContaining(["Vrai", "Faux"]));
    }

    const correctText = matchCorrectText(FN76_CORRECT_TEXT, stemText);
    const input = page.locator("label").filter({ hasText: correctText }).first().locator('input[type="radio"], input[type="checkbox"]');
    await input.check({ force: true });
  };

  await answerCurrent();
  let previousStem = await readStem(page);

  for (let i = 1; i < 31; i++) {
    await page.getByRole("button", { name: /suivante/i }).click();
    await expect
      .poll(async () => readStem(page), { timeout: 10_000, message: "le stem affiché n'a pas changé après le clic Suivante" })
      .not.toBe(previousStem);
    await answerCurrent();
    previousStem = await readStem(page);
  }

  expect(sawFormerTrueItem, "Q-7.6-004 (ex-True) doit apparaître sur un pool complet 31/31").toBe(true);
  expect(sawFormerFalseItem, "Q-7.6-031 (ex-False) doit apparaître sur un pool complet 31/31").toBe(true);

  await page.getByRole("button", { name: /^terminer$/i }).click();
  await page.waitForURL(/\/mes-resultats/);

  await expect(page.getByText(EXAM_NAME).first()).toBeVisible();
  await expect(page.getByText("100/100").first()).toBeVisible();
  await expect(page.getByText("Réussi").first()).toBeVisible();
});
