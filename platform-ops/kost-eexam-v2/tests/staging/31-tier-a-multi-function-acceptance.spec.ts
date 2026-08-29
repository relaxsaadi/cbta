import { test, expect, type Page } from "@playwright/test";
import { loginAs, env } from "./helpers";

// Mission "RENDRE KOST E-EXAM V2 OPÉRATIONNEL AVEC LES 244 QUESTIONS DGR
// CONFIRMÉES" §15 — scénario d'acceptance "prêt le matin" : au moins deux
// Fonctions AUTRES que 7.1 (celle déjà couverte par 01/02), avec assez de
// questions confirmées grâce au sync Tier A (152 nouvelles + 1 fiche
// nettoyée, voir scripts/sync-tier-a-questions.ts). Prouve, avec le VRAI
// assistant de création (pas un appel direct à lib/assessments.ts) : la
// banque élargie est utilisable, l'isolement par fonction tient, un
// candidat réel peut passer l'examen de bout en bout, la notation/le
// rapport PDF/l'export CSV reflètent ce nouveau contenu.
//
// Fonction 7.3 : 7 → 31 questions admissibles (24 nouvelles).
// Fonction 7.6 : 8 → 31 questions admissibles (23 nouvelles).

const EXAM_73_NAME = "DGR Fonction 7.3 — Acceptance Tier A élargie";
const EXAM_76_NAME = "DGR Fonction 7.6 — Acceptance Tier A élargie";

// Table générée depuis le contenu RÉEL de la base (les 31 questions admissibles
// Fonction 7.3 au 2026-08-29, après import Tier A) — mêmes principes que
// 02-candidate-takes-exam.spec.ts : correspondance par sous-chaîne du STEM (pas
// de position, les choix sont mélangés), couvre la totalité du pool admissible
// pour supporter un tirage aléatoire de N'IMPORTE lesquelles. Note : deux
// entrées portent la réponse anglaise "False" (pas "Faux") — reflet fidèle
// d'un vrai défaut de contenu déjà présent avant cette mission (choix
// True/False anglais sur des questions vrai/faux en français, voir le
// rapport de migration) et non corrigé ici (hors périmètre de cette
// mission, en attente d'autorisation explicite) — le test répond au choix
// RÉELLEMENT affiché, quelle que soit sa langue.
const FN73_CORRECT_TEXT: Record<string, string> = {
  "pour qu'un produit, objet ou substance soit qualifié de « marchandise dangereuse": "Figurer dans la liste des marchandises dangereuses du présent règlement, ou être classé conformément au présent règlement.",
  "un bagage contenant une batterie au lithium installée et non amovible est interd": "0,3 g de lithium métal, ou 2,7 Wh.",
  "laquelle des classes suivantes est explicitement exclue de l'application du Tabl": "Classe 1 (Explosifs).",
  "Vrai ou Faux : selon le cours (Déclaration de l'expéditeur — DGD), une Déclarati": "Faux",
  "Vrai ou Faux : selon le cours (DGR 8.1.6.10 — case « Nature et quantité des marc": "Vrai",
  "lorsqu'une déclaration de marchandises dangereuses (DGD) est requise pour un env": "La mention « Dangerous goods as per associated Shipper's Declaration » (ou « Dangerous Goods as per associated DGD »), et « Cargo Aircraft Only »/« CAO » le cas échéant.",
  "Vrai ou Faux : selon le cours (Remplir la liste de contrôle pour l'acceptation,": "Vrai",
  "les colis de batteries au lithium relevant de l'instruction d'emballage PI 965 o": "Des explosifs (à l'exception de la Division 1.4S), la Division 2.1, la Classe 3, la Division 4.1 et la Division 5.1.",
  "qui doit signaler la découverte de marchandises dangereuses non déclarées ou mal": "L'exploitant, aux autorités compétentes de l'État de l'exploitant et de l'État dans lequel la découverte s'est produite.",
  "quel organisme élabore des procédures recommandées pour le transport de toutes l": "Le Sous-comité d'experts du Conseil économique et social des Nations-Unies (SCoETDG).",
  "Vrai ou Faux : selon le cours (Applicabilité — DGR 1.2.4), le règlement DGR de l": "Vrai",
  "quelle catégorie de marchandises dangereuses ne doit en aucun cas être transport": "Celles susceptibles d'exploser ou de réagir dangereusement, de produire une flamme ou un dégagement dangereux de chaleur, un dégagement de gaz ou de vapeur toxique, ou un gaz inflammable ou corrosif dans des conditions normales de transport.",
  "laquelle des affirmations suivantes concernant les divergences d'exploitant (DGR": "Les divergences de l'exploitant ne doivent pas être moins restrictives que le Règlement, et sont applicables à tous les transports effectués par les exploitants concernés.",
  "à quel groupe d'emballage une matière « moyennement dangereuse » est-elle affect": "Groupe d'emballage II.",
  "l'exploitant doit vérifier que la lettre de la marque de spécification de l'emba": "Aux suremballages.",
  "Vrai ou Faux : selon le cours (Vérifier le type de colis), l'emballage extérieur": "Vrai",
  "Vrai ou Faux : selon le cours (Vérification de l'état du colis), l'exploitant do": "Vrai",
  "quelle est la teneur de la divergence d'État PKG-02 du Pakistan citée en exemple": "Toutes les étiquettes de danger doivent comprendre un texte assez court, rédigé en anglais, indiquant la nature du danger.",
  "lorsqu'un dispositif de chargement unitaire (ULD) contenant des biens de consomm": "Elle n'est pas requise.",
  "Vrai ou Faux : selon le cours (Conserver les documents — DGR 9.8), la période mi": "Faux",
  "Vrai ou Faux : selon le cours (Marquage des emballages de spécification ONU — DG": "False",
  "quelle est la taille de la marque illustrée à la figure 7.1.C, apposée sur un co": "100 mm x 100 mm.",
  "laquelle des règles suivantes ne fait PAS partie des exigences relatives à l'app": "Elle doit être apposée sur une face du colis différente de celle portant la marque de désignation officielle de transport (PSN), afin d'éviter toute confusion visuelle.",
  "Vrai ou Faux : selon le cours (Autre étiquetage), la présence d'une étiquette de": "Faux",
  "Vrai ou Faux : selon le cours (Notification au commandant de bord — DGR 9.5.1.1)": "False",
  "à qui l'exploitant doit-il signaler un accident de marchandises dangereuses ?": "Aux autorités compétentes de l'État de l'exploitant ainsi qu'à celles de l'État dans lequel l'accident s'est produit.",
  "Vrai ou Faux : selon le cours (Signaler les accidents et incidents impliquant de": "Vrai",
  "Vrai ou Faux : selon le cours (Vérifier les marques), l'exploitant doit vérifier": "Vrai",
  "à quelles dispositions l'étiquetage du ou des colis, suremballages ou conteneurs": "DGR 10.7.2 pour les matières radioactives, et DGR 7.2 pour les autres marchandises dangereuses.",
  "Vrai ou Faux : selon le cours (DGR 9.1.3.3), tous les articles de marchandises d": "Faux",
  "Vrai ou Faux : selon le cours (DGR 9.3.2.1), la séparation entre marchandises da": "Vrai",
};

async function createAndPublishExam(page: Page, functionCode: string, name: string, expectedAdmissible: number, questionCount: number) {
  await page.goto("/exam-preparation");
  const alreadyExists = await page.getByText(name).count();
  if (alreadyExists > 0) return { skipped: true as const };

  await page.locator('input[name="type"][value="examen"]').check({ force: true });
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Démonstration" });
  await page.locator('select[name="functionCode"]').selectOption(functionCode);
  await page.locator("#name").fill(name);

  // Isolation par fonction (§8) : le compte admissible affiché doit
  // refléter UNIQUEMENT le pool de cette fonction (31, pas 244) — preuve
  // qu'un examen Fonction 7.X ne peut piocher que dans les questions de
  // cette fonction, jamais un mélange inter-fonctions.
  await expect(page.getByText("Questions admissibles disponibles :")).toBeVisible();
  await expect(page.locator("text=Questions admissibles disponibles :").locator("xpath=..")).toContainText(String(expectedAdmissible));

  await page.locator("#questionCount").fill(String(questionCount));
  await page.locator("#durationMinutes").fill("20");
  await page.locator("#passThresholdPct").fill("80");
  await page.locator("#attemptsAllowed").fill("1");
  await page.locator('input[name="showResult"]').check();

  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await expect(page.getByText("draft")).toBeVisible();

  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();

  return { skipped: false as const };
}

test.describe("Acceptance Tier A — au moins deux Fonctions nouvellement enrichies", () => {
  test("le responsable pédagogique crée et publie deux examens réels (7.3 et 7.6) avec la banque élargie", async ({ page }) => {
    await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));

    const r73 = await createAndPublishExam(page, "7.3", EXAM_73_NAME, 31, 5);
    if (!r73.skipped) {
      await expect(page.getByText(/Suivi des candidats/)).toBeVisible();
    }

    const r76 = await createAndPublishExam(page, "7.6", EXAM_76_NAME, 31, 5);
    if (!r76.skipped) {
      await expect(page.getByText(/Suivi des candidats/)).toBeVisible();
    }
  });
});

async function readStem(page: Page): Promise<string> {
  const stemLocator = page.locator("main p.text-\\[14\\.5px\\]").first();
  return (await stemLocator.textContent()) ?? "";
}

// Certains sujets se répètent plusieurs fois dans une même fonction (ex.
// 4 questions "Notification des pilotes" en 7.6) — leurs 50 premiers
// caractères après le préfixe générique "Selon le cours (...)" sont
// alors IDENTIQUES entre plusieurs entrées de la table. Les clés les plus
// longues/spécifiques doivent être essayées EN PREMIER, sinon .find() sur
// un objet (ordre d'insertion) tombe toujours sur la première entrée
// générique, quelle que soit la question réellement affichée — piège
// constaté en pratique sur Fonction 7.6.
function matchCorrectText(table: Record<string, string>, stemText: string): string {
  const matchKey = Object.keys(table)
    .sort((a, b) => b.length - a.length)
    .find((k) => stemText.includes(k));
  if (!matchKey) throw new Error(`Question non reconnue (contenu inattendu) : ${stemText.slice(0, 90)}`);
  return table[matchKey]!;
}

async function alreadyAttempted(page: Page, examName: string): Promise<boolean> {
  await page.goto("/mes-resultats");
  return (await page.getByText(examName).count()) > 0;
}

test("candidat pilote 1 passe réellement l'examen Fonction 7.3 (banque élargie) — RÉUSSI attendu", async ({ page }) => {
  await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
  test.skip(
    await alreadyAttempted(page, EXAM_73_NAME),
    "Candidat1 a déjà une tentative sur cet examen — déjà prouvé (idempotence)."
  );

  // Déjà authentifié par le loginAs() ci-dessus — alreadyAttempted() a
  // seulement navigué vers /mes-resultats entre-temps, la session tient.
  await page.goto("/mes-examens");
  await expect(page.getByText(EXAM_73_NAME).first()).toBeVisible();
  // Deux examens (7.3 ET 7.6) sont assignés au même candidat — cible
  // explicitement le lien "commencer" DANS la ligne de l'examen 7.3, en
  // remontant depuis le <p>{a.name}</p> exact jusqu'à sa ligne parente
  // (app/(app)/mes-examens/page.tsx : <p> -> div interne -> div ligne),
  // jamais ".first()" sur toute la page (piège constaté : le premier lien
  // "commencer" de la page pouvait appartenir à l'examen 7.6) ni un
  // filtre par classe seule (une classe utilitaire type "border-*" peut
  // aussi matcher la Card englobante, pas seulement la ligne).
  const row73 = page.getByText(EXAM_73_NAME, { exact: true }).locator("xpath=../..");
  await expect(row73).toHaveCount(1);
  await row73.getByRole("link", { name: /commencer/i }).click();

  await page.waitForURL(/\/exam\/\d+\/instructions/);
  await page.getByRole("button", { name: /commencer l'examen/i }).click();
  await page.waitForURL(/\/exam\/\d+\/attempt/);
  await expect(page.locator("text=/\\d{2}:\\d{2}/").first()).toBeVisible();

  const answerCurrent = async () => {
    const stemText = await readStem(page);
    const correctText = matchCorrectText(FN73_CORRECT_TEXT, stemText);
    const input = page.locator("label").filter({ hasText: correctText }).first().locator('input[type="radio"], input[type="checkbox"]');
    await input.check({ force: true });
  };

  await answerCurrent();
  let previousStem = await readStem(page);

  // 5 questions demandées à la création — répond à chacune, avance via
  // "Suivante" jusqu'à la dernière puis "Terminer".
  for (let i = 1; i < 5; i++) {
    await page.getByRole("button", { name: /suivante/i }).click();
    await expect
      .poll(async () => readStem(page), { timeout: 10_000, message: "le stem affiché n'a pas changé après le clic Suivante" })
      .not.toBe(previousStem);
    await answerCurrent();
    previousStem = await readStem(page);
  }

  await page.getByRole("button", { name: /^terminer$/i }).click();
  await page.waitForURL(/\/mes-resultats/);

  await expect(page.getByText(EXAM_73_NAME).first()).toBeVisible();
  await expect(page.getByText("100/100").first()).toBeVisible();
  await expect(page.getByText("Réussi").first()).toBeVisible();
});

// Table Fonction 7.6 (31 questions admissibles, 8 → 31 grâce au sync Tier
// A) — mêmes principes que FN73_CORRECT_TEXT ci-dessus. Deux entrées
// portent une réponse anglaise "True"/"False" (même défaut de contenu
// pré-existant que sur 7.3, voir le rapport de migration).
const FN76_CORRECT_TEXT: Record<string, string> = {
  "les colis de batteries au lithium relevant des instructions d'emballage PI 965 o": "Des explosifs (à l'exception de la Division 1.4S), la Division 2.1, la Classe 3, la Division 4.1 et la Division 5.1.",
  "laquelle des informations suivantes ne fait PAS partie des renseignements que la": "Le nom et les coordonnées personnelles de l'expéditeur.",
  "Vrai ou Faux : selon le cours (Notification des pilotes), les renseignements écr": "True",
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
  "Vrai ou Faux : selon le cours (Notification des pilotes), les renseignements pré": "False",
  "lequel des éléments suivants NE fait PAS partie des facteurs que le cours cite c": "Le groupe d'emballage du colis contenant la glace carbonique.",
  "et le Practice Book, quel document de l'OACI contient les instructions technique": "Doc 9284.",
  "Vrai ou Faux : selon le cours (Responsabilités de l'expéditeur DGR 1.3.1), un ex": "Vrai",
  "Vrai ou Faux : selon le cours (Divergence de l'Exploitant DGR 2.8.3), les diverg": "False",
  "Vrai ou Faux : selon le cours (Les classes des marchandises dangereuses DGR 3.0.": "Vrai",
  "lequel des éléments suivants N'est PAS l'un des critères cités par le cours pour": "Coloré de façon à contraster avec l'étiquette de danger.",
  "Vrai ou Faux : selon le cours (Séparation des marchandises dangereuses), les mar": "Vrai",
  "Vrai ou Faux : selon le cours (Notification des pilotes — accessibilité), les re": "Vrai",
  "en plus des langues que peut exiger l'État de l'exploitant, quelle langue le cou": "L'anglais.",
};

test("candidat pilote 1 termine réellement l'examen Fonction 7.6 (banque élargie) — deuxième fonction, RÉUSSI attendu", async ({ page }) => {
  await loginAs(page, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));

  // Garde d'idempotence basée sur /mes-examens (pas /mes-resultats) :
  // /mes-resultats liste aussi une tentative "in_progress" non terminée
  // (piège constaté : la garde générique alreadyAttempted() la traitait à
  // tort comme "déjà prouvé" et sautait le test sans jamais soumettre la
  // tentative laissée ouverte). "Tentatives épuisées" est le seul état où
  // il n'y a plus rien à faire ; "Reprendre" ou "Commencer" doivent tous
  // deux mener à une soumission réelle.
  await page.goto("/mes-examens");
  const row76 = page.getByText(EXAM_76_NAME, { exact: true }).locator("xpath=../..");
  await expect(row76).toHaveCount(1);
  test.skip(
    (await row76.getByText(/tentatives épuisées/i).count()) > 0,
    "Candidat1 a déjà une tentative soumise sur cet examen — déjà prouvé (idempotence)."
  );
  await row76.getByRole("link", { name: /reprendre|commencer/i }).click();

  // Attendre explicitement la navigation (pas une lecture synchrone de
  // page.url()) avant de décider s'il faut cliquer "Commencer l'examen"
  // — voir le commentaire détaillé dans
  // 32-true-false-fr-normalization.spec.ts (piège de course
  // hydratation React constaté en pratique).
  await page.waitForURL(/\/exam\/\d+\/(instructions|attempt)/);
  if (page.url().includes("/instructions")) {
    await page.getByRole("button", { name: /commencer l'examen/i }).click();
    await page.waitForURL(/\/exam\/\d+\/attempt/);
  }
  await expect(page.locator("text=/\\d{2}:\\d{2}/").first()).toBeVisible();

  const answerCurrent76 = async () => {
    const stemText = await readStem(page);
    const correctText = matchCorrectText(FN76_CORRECT_TEXT, stemText);
    const input = page.locator("label").filter({ hasText: correctText }).first().locator('input[type="radio"], input[type="checkbox"]');
    await input.check({ force: true });
  };

  await answerCurrent76();
  let previousStem76 = await readStem(page);

  for (let i = 1; i < 5; i++) {
    const nextBtn = page.getByRole("button", { name: /suivante/i });
    if ((await nextBtn.count()) === 0) break; // déjà sur la dernière question après reprise
    await nextBtn.click();
    await expect
      .poll(async () => readStem(page), { timeout: 10_000, message: "le stem affiché n'a pas changé après le clic Suivante" })
      .not.toBe(previousStem76);
    await answerCurrent76();
    previousStem76 = await readStem(page);
  }

  await page.getByRole("button", { name: /^terminer$/i }).click();
  await page.waitForURL(/\/mes-resultats/);

  await expect(page.getByText(EXAM_76_NAME).first()).toBeVisible();
});

test("rapport PDF + export CSV reflètent réellement la nouvelle tentative Fonction 7.3", async ({ page }) => {
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

  await page.goto("/results");
  const row = page.locator("a", { hasText: /Yasmine Kaced/i }).first();
  test.skip((await row.count()) === 0, "Aucune tentative Yasmine Kaced trouvée sur /results (test précédent skippé/idempotent).");

  // Prend le lien de résultat le plus proche de la ligne mentionnant
  // l'examen 7.3 — s'il existe plusieurs tentatives Yasmine (pilote 7.1 +
  // celle-ci), on veut spécifiquement l'attemptId de la nouvelle.
  const link73 = page.locator("tr", { hasText: EXAM_73_NAME }).getByRole("link").first();
  const href = (await link73.count()) > 0 ? await link73.getAttribute("href") : await row.getAttribute("href");
  const attemptId = href!.match(/\/results\/(\d+)/)![1];

  const fetchPdf = async (path: string) =>
    page.evaluate(async (p) => {
      const res = await fetch(p, { credentials: "same-origin" });
      const buf = await res.arrayBuffer();
      const magic = new TextDecoder().decode(new Uint8Array(buf).slice(0, 5));
      return { status: res.status, contentType: res.headers.get("content-type"), magic, size: buf.byteLength };
    }, path);

  const simple = await fetchPdf(`/api/reports/individual/${attemptId}?level=simple`);
  expect(simple.status).toBe(200);
  expect(simple.magic).toBe("%PDF-");

  const fetchAsText = async (path: string) =>
    page.evaluate(async (p) => {
      const res = await fetch(p, { credentials: "same-origin" });
      return { status: res.status, body: await res.text() };
    }, path);

  const summary = await fetchAsText("/api/results/export");
  expect(summary.status).toBe(200);
  expect(summary.body).toContain(EXAM_73_NAME);

  const detailed = await fetchAsText("/api/results/export-answers");
  expect(detailed.status).toBe(200);
  expect(detailed.body).toContain(EXAM_73_NAME);
});
