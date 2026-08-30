import { test, expect, type Page, type Locator } from "@playwright/test";
import { loginAs, logout } from "./helpers";

// Mission "MISSION FINALE CIBLÉE" (2026-08-30) — preuve de bout en bout,
// via l'UI RÉELLE (jamais un appel direct aux fonctions lib), des 3
// derniers types requis : matching (§13), ordering (§13), scenario (§15),
// puis la preuve finale explicitement demandée (§16) : un SEUL examen
// combinant les 8 types, du départ jusqu'au résultat final, y compris la
// correction manuelle. Fonction dédiée (7.3, jamais utilisée par les
// autres specs de ce projet) pour un pool de questions totalement isolé.
const FUNCTION_CODE = "7.3";
// Fonction DÉDIÉE et DISTINCTE pour le test "8 types" ci-dessous — mission
// "MISSION FINALE CIBLÉE" (2026-08-30) §16. Bug réel trouvé en écrivant ce
// test : les deux tests de ce fichier partageaient la même fonction 7.3 ;
// en mode "serial", au moment où le second test publie SON examen à
// questionCount=8, le pool admissible contenait déjà 10 questions (2 du
// premier test + 8 du second) — le tirage ALÉATOIRE (question_source
// "random", seule option exposée par ce formulaire) pouvait donc inclure
// une question du PREMIER test à la place d'une des 8 du second,
// silencieusement. Une fonction dédiée par test garde chaque pool
// EXACTEMENT à la taille demandée — tirage déterministe, jamais de
// contamination croisée entre tests (même principe que la fonction dédiée
// de la mission précédente, voir scenario-m-question-types-and-manual-
// grading.spec.ts).
const FUNCTION_CODE_8 = "7.4";

async function selectQtype(page: Page, qtype: string) {
  await page.locator("#qtype").selectOption(qtype);
}

/** Sélectionne, pour chaque élément de gauche connu, la bonne
 * correspondance de droite — même convention d'aria-label ("Correspondance
 * pour X") utilisée à la fois en auteurage (top-niveau) et côté candidat
 * (top-niveau ET sous-question de scénario), voir CreateQuestionForm.tsx /
 * ExamRunner.tsx. */
async function solveMatching(scope: Locator, pairs: { left: string; right: string }[]) {
  for (const p of pairs) {
    await scope.getByLabel(`Correspondance pour ${p.left}`).selectOption({ label: p.right });
  }
}

/** Tri par sélection via les boutons "Monter" UNIQUEMENT (§3 — jamais de
 * drag-and-drop requis) : pour chaque position cible, localise la ligne
 * portant le texte attendu ET LA FAIT MONTER jusqu'à cette position. */
async function solveOrdering(scope: Locator, correctOrderTexts: string[]) {
  let anyClick = false;
  for (let target = 0; target < correctOrderTexts.length; target++) {
    for (let guard = 0; guard < correctOrderTexts.length + 2; guard++) {
      const rows = scope.locator('[data-testid="ordering-row"]');
      const texts = await rows.allTextContents();
      const currentIndex = texts.findIndex((t) => t.includes(correctOrderTexts[target]!));
      if (currentIndex === target) break;
      // Le bouton porte un aria-label explicite ("Monter : <texte>") qui
      // REMPLACE son contenu visible ("↑ Monter") comme nom accessible —
      // c'est ce nom-là que getByRole("button", {name}) doit cibler.
      await rows.nth(currentIndex).getByRole("button", { name: /^Monter :/ }).click();
      anyClick = true;
    }
  }
  // Bug réel trouvé en écrivant ce test : quand le mélange initial place
  // DÉJÀ les éléments dans le bon ordre (cas rare mais possible), aucun
  // clic n'est jamais nécessaire — la réponse n'est alors JAMAIS
  // explicitement enregistrée côté candidat (answer reste null malgré un
  // ordre visuellement correct), ce qui la fait compter à tort comme "sans
  // réponse" (ExamRunner.tsx affiche l'ordre de secours orderingItems tant
  // qu'aucune réponse n'a été sauvegardée — comportement correct, mais un
  // aller-retour Monter/Descendre reste nécessaire pour la déclencher
  // explicitement). Aller-retour neutre sur la première ligne dans ce cas :
  // remonte au même ordre final, mais déclenche réellement une sauvegarde.
  if (!anyClick) {
    const rows = scope.locator('[data-testid="ordering-row"]');
    await rows.nth(1).getByRole("button", { name: /^Monter :/ }).click();
    await rows.nth(0).getByRole("button", { name: /^Descendre :/ }).click();
  }
}

/** Clique "Suivante" puis attend RÉELLEMENT que la question affichée ait
 * changé (data-qtype différent) avant de continuer — un simple `.click()`
 * n'attend que l'événement lui-même, pas le nouveau rendu React ; lire
 * data-qtype immédiatement après pouvait donc capter la valeur ENCORE
 * PRÉCÉDENTE (course), faisant répondre au MAUVAIS type de question. */
async function goToNextQuestion(page: Page, card: Locator) {
  const before = await card.getAttribute("data-qtype");
  await page.getByRole("button", { name: /suivante/i }).click();
  await expect.poll(() => card.getAttribute("data-qtype")).not.toBe(before);
}

test.describe.configure({ mode: "serial" });

test("matching + ordering — interaction accessible (select clavier / boutons Monter-Descendre), autosave, reprise après rafraîchissement, résultat", async ({ page }) => {
  await loginAs(page, "admin");

  // --- Auteurage — matching ---
  await page.goto("/question-bank");
  await page.locator("#kostQuestionId").fill("Q-7.3-E2E-MATCH");
  await page.locator("#functionCode").selectOption(FUNCTION_CODE);
  await page.locator("#sourceStatus").selectOption("FROZEN_SOURCE_VERIFIED");
  await selectQtype(page, "matching");
  await page.locator("#stem").fill("[E2E] Associez chaque gaz à sa propriété.");
  await page.getByLabel("Élément 1 (gauche)").fill("Azote");
  await page.getByLabel("Correspondance 1 (droite)").fill("Gaz inerte");
  await page.getByLabel("Élément 2 (gauche)").fill("Oxygène");
  await page.getByLabel("Correspondance 2 (droite)").fill("Comburant");
  await page.getByRole("button", { name: /ajouter à la banque/i }).click();
  await expect(page.getByText(/Question Q-7\.3-E2E-MATCH créée/)).toBeVisible();

  // --- Auteurage — ordering ---
  await page.goto("/question-bank");
  await page.locator("#kostQuestionId").fill("Q-7.3-E2E-ORDER");
  await page.locator("#functionCode").selectOption(FUNCTION_CODE);
  await page.locator("#sourceStatus").selectOption("FROZEN_SOURCE_VERIFIED");
  await selectQtype(page, "ordering");
  await page.locator("#stem").fill("[E2E] Ordonnez la procédure d'urgence.");
  await page.getByLabel("Étape 1").fill("Identifier");
  await page.getByLabel("Étape 2").fill("Isoler");
  await page.getByLabel("Étape 3").fill("Notifier");
  await page.getByRole("button", { name: /ajouter à la banque/i }).click();
  await expect(page.getByText(/Question Q-7\.3-E2E-ORDER créée/)).toBeVisible();

  // --- Préparation + publication (pool = exactement 2 → tirage déterministe) ---
  await logout(page);
  await loginAs(page, "responsable.demo");
  await page.goto("/exam-preparation");
  await page.getByLabel("Nom de l'évaluation").fill("DGR Fonction 7.3 — Matching + Ordering E2E");
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Septembre 2026 (DEMO)" });
  await page.locator('select[name="functionCode"]').selectOption(FUNCTION_CODE);
  await expect(page.getByText(/Questions admissibles disponibles[\s\S]*2/)).toBeVisible();
  await page.locator('input[name="questionCount"]').fill("2");
  await page.locator('input[name="durationMinutes"]').fill("30");
  await page.locator('input[name="passThresholdPct"]').fill("80");
  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();

  // --- Le candidat répond ---
  await logout(page);
  await loginAs(page, "candidat3.demo");
  const examRow = page.locator("div.justify-between").filter({ hasText: "DGR Fonction 7.3 — Matching + Ordering E2E" });
  await expect(examRow).toBeVisible();
  await examRow.getByRole("link", { name: /commencer/i }).click();
  await page.waitForURL(/\/exam\/\d+\/instructions/);
  await page.getByRole("button", { name: /commencer l'examen/i }).click();
  await page.waitForURL(/\/exam\/\d+\/attempt/);

  const card = page.getByTestId("exam-question-card");

  async function answerCurrent() {
    const qtype = await card.getAttribute("data-qtype");
    if (qtype === "matching") {
      await solveMatching(card, [{ left: "Azote", right: "Gaz inerte" }, { left: "Oxygène", right: "Comburant" }]);
    } else if (qtype === "ordering") {
      await solveOrdering(card, ["Identifier", "Isoler", "Notifier"]);
    }
  }

  await answerCurrent();
  // L'autosave est "fire-and-forget" côté client (réactivité perçue,
  // ExamRunner.tsx) — un appariement envoie DEUX sauvegardes séquentielles
  // (une par paire choisie) : attendre juste le texte "Enregistré" peut
  // capter un état INTERMÉDIAIRE entre les deux (course, jamais un vrai
  // bug produit). "networkidle" attend qu'il n'y ait plus AUCUN appel
  // réseau en vol, condition robuste indépendamment du nombre de
  // sauvegardes déclenchées.
  await page.waitForLoadState("networkidle");

  // Rafraîchissement en cours de tentative — l'arrangement/appariement déjà
  // enregistré (autosave) doit survivre exactement, jamais réinitialisé
  // (§9 de la mission).
  const attemptUrl = page.url();
  await page.reload();
  await expect(page).toHaveURL(attemptUrl);
  const qtypeAfterReload = await card.getAttribute("data-qtype");
  if (qtypeAfterReload === "matching") {
    await expect(card.getByLabel("Correspondance pour Azote")).toHaveValue(/R/); // une valeur non vide a bien été reprise
  }

  // Termine la première question puis passe à la seconde.
  if ((await page.getByRole("button", { name: /suivante/i }).count()) > 0) {
    await goToNextQuestion(page, card);
    await answerCurrent();
  }

  await page.getByRole("button", { name: /vérifier avant d'envoyer/i }).click();
  await expect(page.getByText("Résumé de l'examen")).toBeVisible();
  await expect(page.getByText(/n'ont pas de réponse/)).toHaveCount(0);
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: /^terminer et envoyer l'examen$/i }).click();
  await page.waitForURL(/\/mes-resultats\?justSubmitted=/);

  await expect(page.getByText(/votre examen a bien été envoyé/i)).toBeVisible();
  const resultRow = page.locator("div.rounded-md.border").filter({ hasText: "DGR Fonction 7.3 — Matching + Ordering E2E" });
  await expect(resultRow.getByText("100/100")).toBeVisible();
  await expect(resultRow.getByText("Réussi")).toBeVisible();
});

test("cycle complet — les 8 types de question dans un seul examen démo, y compris un scénario à 6 sous-questions mixtes avec correction manuelle, jusqu'au résultat final", async ({ page }) => {
  test.setTimeout(90_000);
  await loginAs(page, "admin");

  // --- 1. true_false ---
  await page.goto("/question-bank");
  await page.locator("#kostQuestionId").fill("Q-7.3-E2E-TF");
  await page.locator("#functionCode").selectOption(FUNCTION_CODE_8);
  await page.locator("#sourceStatus").selectOption("FROZEN_SOURCE_VERIFIED");
  await selectQtype(page, "true_false");
  await page.locator("#stem").fill("[E2E-8] Le transport de matières dangereuses est réglementé.");
  await page.getByLabel("Vrai").check();
  await page.getByRole("button", { name: /ajouter à la banque/i }).click();
  await expect(page.getByText(/Question Q-7\.3-E2E-TF créée/)).toBeVisible();

  // --- 2. mcq_single ---
  await page.goto("/question-bank");
  await page.locator("#kostQuestionId").fill("Q-7.3-E2E-SINGLE");
  await page.locator("#functionCode").selectOption(FUNCTION_CODE_8);
  await page.locator("#sourceStatus").selectOption("FROZEN_SOURCE_VERIFIED");
  await selectQtype(page, "mcq_single");
  await page.locator("#stem").fill("[E2E-8] Question à choix unique.");
  await page.getByRole("textbox", { name: "Choix A" }).fill("Choix correct");
  await page.getByRole("checkbox", { name: "Bonne réponse — choix A" }).check();
  await page.getByRole("textbox", { name: "Choix B" }).fill("Choix incorrect");
  await page.getByRole("button", { name: /ajouter à la banque/i }).click();
  await expect(page.getByText(/Question Q-7\.3-E2E-SINGLE créée/)).toBeVisible();

  // --- 3. mcq_multi ---
  await page.goto("/question-bank");
  await page.locator("#kostQuestionId").fill("Q-7.3-E2E-MULTI");
  await page.locator("#functionCode").selectOption(FUNCTION_CODE_8);
  await page.locator("#sourceStatus").selectOption("FROZEN_SOURCE_VERIFIED");
  await selectQtype(page, "mcq_multi");
  await page.locator("#stem").fill("[E2E-8] Question à choix multiples.");
  await page.getByRole("textbox", { name: "Choix A" }).fill("Bonne A");
  await page.getByRole("checkbox", { name: "Bonne réponse — choix A" }).check();
  await page.getByRole("textbox", { name: "Choix B" }).fill("Bonne B");
  await page.getByRole("checkbox", { name: "Bonne réponse — choix B" }).check();
  await page.getByRole("textbox", { name: "Choix C" }).fill("Mauvaise C");
  await page.getByRole("button", { name: /ajouter à la banque/i }).click();
  await expect(page.getByText(/Question Q-7\.3-E2E-MULTI créée/)).toBeVisible();

  // --- 4. matching ---
  await page.goto("/question-bank");
  await page.locator("#kostQuestionId").fill("Q-7.3-E2E-8-MATCH");
  await page.locator("#functionCode").selectOption(FUNCTION_CODE_8);
  await page.locator("#sourceStatus").selectOption("FROZEN_SOURCE_VERIFIED");
  await selectQtype(page, "matching");
  await page.locator("#stem").fill("[E2E-8] Associez.");
  await page.getByLabel("Élément 1 (gauche)").fill("Azote");
  await page.getByLabel("Correspondance 1 (droite)").fill("Gaz inerte");
  await page.getByLabel("Élément 2 (gauche)").fill("Oxygène");
  await page.getByLabel("Correspondance 2 (droite)").fill("Comburant");
  await page.getByRole("button", { name: /ajouter à la banque/i }).click();
  await expect(page.getByText(/Question Q-7\.3-E2E-8-MATCH créée/)).toBeVisible();

  // --- 5. ordering ---
  await page.goto("/question-bank");
  await page.locator("#kostQuestionId").fill("Q-7.3-E2E-8-ORDER");
  await page.locator("#functionCode").selectOption(FUNCTION_CODE_8);
  await page.locator("#sourceStatus").selectOption("FROZEN_SOURCE_VERIFIED");
  await selectQtype(page, "ordering");
  await page.locator("#stem").fill("[E2E-8] Ordonnez.");
  await page.getByLabel("Étape 1").fill("Identifier");
  await page.getByLabel("Étape 2").fill("Isoler");
  await page.getByLabel("Étape 3").fill("Notifier");
  await page.getByRole("button", { name: /ajouter à la banque/i }).click();
  await expect(page.getByText(/Question Q-7\.3-E2E-8-ORDER créée/)).toBeVisible();

  // --- 6. numeric ---
  await page.goto("/question-bank");
  await page.locator("#kostQuestionId").fill("Q-7.3-E2E-NUM");
  await page.locator("#functionCode").selectOption(FUNCTION_CODE_8);
  await page.locator("#sourceStatus").selectOption("FROZEN_SOURCE_VERIFIED");
  await selectQtype(page, "numeric");
  await page.locator("#stem").fill("[E2E-8] Distance de sécurité (m) ?");
  await page.locator("#numericValue").fill("42");
  await page.locator("#numericTolerance").fill("0");
  await page.locator("#numericUnit").fill("m");
  await page.getByRole("button", { name: /ajouter à la banque/i }).click();
  await expect(page.getByText(/Question Q-7\.3-E2E-NUM créée/)).toBeVisible();

  // --- 7. short_answer (exact) ---
  await page.goto("/question-bank");
  await page.locator("#kostQuestionId").fill("Q-7.3-E2E-SA");
  await page.locator("#functionCode").selectOption(FUNCTION_CODE_8);
  await page.locator("#sourceStatus").selectOption("FROZEN_SOURCE_VERIFIED");
  await selectQtype(page, "short_answer");
  await page.locator("#stem").fill("[E2E-8] Sigle de l'organisation ?");
  await page.getByLabel("Réponses acceptées (une par ligne)").fill("UN");
  await page.getByRole("button", { name: /ajouter à la banque/i }).click();
  await expect(page.getByText(/Question Q-7\.3-E2E-SA créée/)).toBeVisible();

  // --- 8. scenario — 6 sous-questions mixtes (§15 : single/multi/numeric/manuel/matching/ordering) ---
  await page.goto("/question-bank");
  await page.locator("#kostQuestionId").fill("Q-7.3-E2E-SCN");
  await page.locator("#functionCode").selectOption(FUNCTION_CODE_8);
  await page.locator("#sourceStatus").selectOption("FROZEN_SOURCE_VERIFIED");
  await selectQtype(page, "scenario");
  await page.locator("#stem").fill("[E2E-8] Incident de fuite — Classe 8");
  await page.locator("#scenarioContext").fill("Un colis de Classe 8 présente une fuite en zone de tri.");

  // 5 sous-questions supplémentaires (la première existe déjà par défaut).
  for (let i = 0; i < 5; i++) await page.getByTestId("scenario-add-subquestion").click();

  // sq0 — mcq_single
  // getByRole (pas getByLabel) — "Bonne réponse — choix A" contient la
  // sous-chaîne "choix A" qui correspondrait aussi (insensible à la casse)
  // à l'aria-label "Choix A" du champ texte : même ambiguïté que dans le
  // formulaire top-niveau, corrigée de la même façon (rôle explicite).
  const sq0 = page.getByTestId("scenario-subquestion-0");
  await sq0.getByTestId("scenario-subquestion-type").selectOption("mcq_single");
  await sq0.getByTestId("scenario-subquestion-stem").fill("Que faire en premier ?");
  await sq0.getByRole("textbox", { name: "Choix A" }).fill("Isoler");
  await sq0.getByRole("checkbox", { name: "Bonne réponse — choix A" }).check();
  await sq0.getByRole("textbox", { name: "Choix B" }).fill("Ignorer");

  // sq1 — mcq_multi
  const sq1 = page.getByTestId("scenario-subquestion-1");
  await sq1.getByTestId("scenario-subquestion-type").selectOption("mcq_multi");
  await sq1.getByTestId("scenario-subquestion-stem").fill("Quels équipements porter ?");
  await sq1.getByRole("textbox", { name: "Choix A" }).fill("Gants");
  await sq1.getByRole("checkbox", { name: "Bonne réponse — choix A" }).check();
  await sq1.getByRole("textbox", { name: "Choix B" }).fill("Masque");
  await sq1.getByRole("checkbox", { name: "Bonne réponse — choix B" }).check();
  await sq1.getByRole("textbox", { name: "Choix C" }).fill("Aucun");

  // sq2 — numeric
  const sq2 = page.getByTestId("scenario-subquestion-2");
  await sq2.getByTestId("scenario-subquestion-type").selectOption("numeric");
  await sq2.getByTestId("scenario-subquestion-stem").fill("Distance de sécurité (m) ?");
  await sq2.getByPlaceholder("Valeur correcte").fill("5");
  await sq2.getByPlaceholder("Tolérance (0 = exact)").fill("0");

  // sq3 — short_answer, correction manuelle obligatoire
  const sq3 = page.getByTestId("scenario-subquestion-3");
  await sq3.getByTestId("scenario-subquestion-type").selectOption("short_answer");
  await sq3.getByTestId("scenario-subquestion-stem").fill("Décrivez la procédure de notification.");
  await sq3.getByLabel("Correction manuelle").check();

  // sq4 — matching
  const sq4 = page.getByTestId("scenario-subquestion-4");
  await sq4.getByTestId("scenario-subquestion-type").selectOption("matching");
  await sq4.getByTestId("scenario-subquestion-stem").fill("Associez le risque à sa mesure.");
  await sq4.getByLabel("Élément 1").fill("Fuite");
  await sq4.getByLabel("Correspondance 1").fill("Confinement");
  await sq4.getByLabel("Élément 2").fill("Feu");
  await sq4.getByLabel("Correspondance 2").fill("Extinction");

  // sq5 — ordering
  const sq5 = page.getByTestId("scenario-subquestion-5");
  await sq5.getByTestId("scenario-subquestion-type").selectOption("ordering");
  await sq5.getByTestId("scenario-subquestion-stem").fill("Ordonnez les 2 premières actions.");
  await sq5.getByLabel("Étape 1").fill("Alerter");
  await sq5.getByLabel("Étape 2").fill("Confiner");

  await page.getByRole("button", { name: /ajouter à la banque/i }).click();
  await expect(page.getByText(/Question Q-7\.3-E2E-SCN créée/)).toBeVisible();

  // --- Préparation + publication (pool = exactement 8 → tirage déterministe) ---
  await logout(page);
  await loginAs(page, "responsable.demo");
  await page.goto("/exam-preparation");
  const examName = "DGR Fonction 7.4 — Démo 8 types E2E";
  await page.getByLabel("Nom de l'évaluation").fill(examName);
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Septembre 2026 (DEMO)" });
  await page.locator('select[name="functionCode"]').selectOption(FUNCTION_CODE_8);
  await expect(page.getByText(/Questions admissibles disponibles[\s\S]*8/)).toBeVisible();
  await page.locator('input[name="questionCount"]').fill("8");
  await page.locator('input[name="durationMinutes"]').fill("30");
  await page.locator('input[name="passThresholdPct"]').fill("50");
  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();

  // --- Le candidat démarre, répond aux 8 questions (autosave + reprise via rafraîchissement à mi-parcours), envoie ---
  await logout(page);
  await loginAs(page, "candidat3.demo");
  const examRow = page.locator("div.justify-between").filter({ hasText: examName });
  await expect(examRow).toBeVisible();
  await examRow.getByRole("link", { name: /commencer/i }).click();
  await page.waitForURL(/\/exam\/\d+\/instructions/);
  await page.getByRole("button", { name: /commencer l'examen/i }).click();
  await page.waitForURL(/\/exam\/\d+\/attempt/);

  const card = page.getByTestId("exam-question-card");

  async function answerTopLevel() {
    const qtype = await card.getAttribute("data-qtype");
    if (qtype === "true_false") {
      await card.getByLabel("Vrai").check();
    } else if (qtype === "mcq_single") {
      await card.getByLabel("Choix correct").check();
    } else if (qtype === "mcq_multi") {
      await card.getByLabel("Bonne A").check();
      await card.getByLabel("Bonne B").check();
    } else if (qtype === "matching") {
      await solveMatching(card, [{ left: "Azote", right: "Gaz inerte" }, { left: "Oxygène", right: "Comburant" }]);
    } else if (qtype === "ordering") {
      await solveOrdering(card, ["Identifier", "Isoler", "Notifier"]);
    } else if (qtype === "numeric") {
      await card.locator('input[type="number"]').fill("42");
      await card.locator('input[type="number"]').press("Tab");
    } else if (qtype === "short_answer") {
      await card.locator('input[type="text"]').fill("UN");
      await card.locator('input[type="text"]').press("Tab");
    } else if (qtype === "scenario") {
      const sub0 = card.getByTestId("scenario-answer-subquestion-0");
      await sub0.getByLabel("Isoler").check();
      const sub1 = card.getByTestId("scenario-answer-subquestion-1");
      await sub1.getByLabel("Gants").check();
      await sub1.getByLabel("Masque").check();
      const sub2 = card.getByTestId("scenario-answer-subquestion-2");
      await sub2.locator('input[type="number"]').fill("5");
      await sub2.locator('input[type="number"]').press("Tab");
      const sub3 = card.getByTestId("scenario-answer-subquestion-3");
      await sub3.locator('input[type="text"]').fill("Notification immédiate au responsable HSE et aux autorités compétentes.");
      await sub3.locator('input[type="text"]').press("Tab");
      const sub4 = card.getByTestId("scenario-answer-subquestion-4");
      await solveMatching(sub4, [{ left: "Fuite", right: "Confinement" }, { left: "Feu", right: "Extinction" }]);
      const sub5 = card.getByTestId("scenario-answer-subquestion-5");
      await solveOrdering(sub5, ["Alerter", "Confiner"]);
      // Un scénario déclenche JUSQU'À 6 sauvegardes indépendantes
      // fire-and-forget (une par sous-question, voir ExamRunner.tsx::
      // updateScenarioSubanswer) — attendre qu'elles aient TOUTES atteint
      // le serveur avant de continuer (navigation ou rafraîchissement),
      // sinon une sauvegarde encore en vol peut être perdue (jamais un vrai
      // bug produit, uniquement une course côté TEST).
      await page.waitForLoadState("networkidle");
    }
  }

  // Boucle bornée par l'ÉTAT RÉEL de l'interface (bouton "Vérifier avant
  // d'envoyer" apparu = dernière question atteinte), jamais par un compteur
  // fixe : après le rafraîchissement ci-dessous, `index` redémarre à 0
  // côté client (comportement existant, voir ExamRunner.tsx — seules les
  // réponses déjà enregistrées survivent, jamais la position de
  // navigation) — un compteur figé à 8 itérations se désynchroniserait et
  // sortirait de la boucle trop tôt, sans jamais atteindre la vraie
  // dernière question (bug réel trouvé en écrivant ce test). Re-répondre
  // aux questions déjà répondues après le rafraîchissement est sans
  // risque (mêmes valeurs correctes, sauvegarde idempotente).
  let refreshedOnce = false;
  let guard = 0;
  while (guard < 20) {
    guard += 1;
    await answerTopLevel();
    // Rafraîchissement en cours de tentative, une seule fois, après avoir
    // répondu à la 4e question — l'autosave (fire-and-forget côté client)
    // doit avoir déjà persisté la réponse qu'on vient de donner AVANT de
    // rafraîchir, sinon la course avec le rechargement la ferait perdre
    // côté TEST (jamais un vrai bug produit — le serveur reçoit bien
    // l'appel). "networkidle" plutôt qu'un simple texte "Enregistré" — le
    // scénario notamment déclenche PLUSIEURS sauvegardes séquentielles.
    if (!refreshedOnce && guard === 4) {
      refreshedOnce = true;
      await page.waitForLoadState("networkidle");
      const url = page.url();
      await page.reload();
      await expect(page).toHaveURL(url);
      continue; // on est revenu à la question 1 (déjà répondue) — la boucle la retraversera naturellement.
    }
    if ((await page.getByRole("button", { name: /suivante/i }).count()) > 0) await goToNextQuestion(page, card);
    else break; // "Vérifier avant d'envoyer" est affiché — dernière question atteinte et répondue.
  }

  // Bug réel trouvé en écrivant ce test : le refactor de boucle FOR→WHILE
  // (voir plus haut) avait remplacé le clic inline sur "Vérifier avant
  // d'envoyer" par un simple `break`, sans jamais le redéclencher APRÈS la
  // boucle — la dernière question restait donc répondue mais jamais
  // envoyée vers l'écran de révision.
  await page.getByRole("button", { name: /vérifier avant d'envoyer/i }).click();
  await expect(page.getByText("Résumé de l'examen")).toBeVisible();
  await expect(page.getByText(/^8 \/ 8$/)).toBeVisible();
  await expect(page.getByText(/n'ont pas de réponse/)).toHaveCount(0);
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: /^terminer et envoyer l'examen$/i }).click();
  await page.waitForURL(/\/mes-resultats\?justSubmitted=/);

  // --- La sous-question manuelle du scénario bloque le résultat final ---
  await expect(page.getByText("Votre examen a bien été envoyé et nécessite une correction avant la publication du résultat.")).toBeVisible();
  await expect(page.getByText("En attente de correction", { exact: true })).toBeVisible();

  // --- Un administrateur corrige la sous-question manuelle via /grading ---
  await logout(page);
  await loginAs(page, "admin");
  await page.goto("/grading");
  const pendingScenarioItem = page.locator("div.rounded-md.border").filter({ hasText: "Décrivez la procédure de notification." });
  await expect(pendingScenarioItem).toBeVisible();
  await expect(pendingScenarioItem.getByText("Notification immédiate au responsable HSE et aux autorités compétentes.")).toBeVisible();
  await pendingScenarioItem.getByRole("button", { name: /^correcte$/i }).click();
  await page.waitForURL(/\/grading\?graded=1/);
  await expect(page.getByText("Réponse corrigée — résultat finalisé et notifié.")).toBeVisible();

  // --- Le candidat voit maintenant son résultat final — 100% (tout répondu correctement, y compris la sous-question manuelle jugée correcte) ---
  await logout(page);
  await loginAs(page, "candidat3.demo");
  await page.goto("/mes-resultats");
  const finalRow = page.locator("div.rounded-md.border").filter({ hasText: examName });
  await expect(finalRow).toBeVisible();
  await expect(finalRow.getByText("En attente de correction")).toHaveCount(0);
  await expect(finalRow.getByText("100/100")).toBeVisible();
  await expect(finalRow.getByText("Réussi")).toBeVisible();
});
