import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { loginAs, logout, env } from "./helpers";

// Mission "CREATE AUDITOR DEMONSTRATION WITH SCREENSHOTS" (2026-08-30) —
// capture des VRAIS écrans de https://staging.kostacademy.com via un
// Chromium Playwright ISOLÉ (playwright.staging.config.ts — jamais le
// chrome-devtools MCP partagé, qui saturait sous la charge concurrente de
// cette machine). Aucune donnée fabriquée à l'écran : tout ce qui est
// photographié est rendu par l'application réelle à partir de données
// réelles (démo/pilote clairement étiquetées, jamais confondues avec les
// 244 questions réglementaires — voir scripts/provision-demo-questions.ts,
// exécuté une fois séparément, jamais committé).
//
// Ne modifie JAMAIS Brahimi (compte réel, historique réel) — utilise
// exclusivement les comptes pilotes candidat1-3.staging et le tenant démo
// "Air Algérie — DEMO" déjà établis.
const SCREENSHOT_DIR = resolve(import.meta.dirname, "../../docs/auditor-demo/screenshots");
mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function shot(page: Page, name: string) {
  // "networkidle" est déconseillé par Playwright lui-même (une activité
  // réseau de fond — heartbeat/polling — peut l'empêcher indéfiniment de
  // se déclencher, constaté ici en pratique) : "load" + une pause fixe
  // suffit largement pour une capture d'écran statique, jamais une
  // assertion fonctionnelle.
  await page.waitForLoadState("load").catch(() => {});
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, `${name}.png`), fullPage: false });
}

// Corrigé le 2026-08-30 (revue manuelle des captures) : la carte "Affecter
// d'autres candidats" de /exam-preparation/[id] liste TOUS les membres du
// groupe pas encore affectés à CET examen précis — y compris "fethi
// amrani" (id=18), un membre réel du groupe démo sans étiquette
// "(pilote)"/"(démo)", jamais créé par ce script (voir la note en Phase
// 4bis). Contrairement à /results (filtrable par examen), cette carte n'a
// pas de filtre : la seule façon de retirer ce nom sans y affecter
// réellement ce compte réel (effet de bord permanent et non consenti sur
// un vrai utilisateur, hors sujet ici) est de masquer la carte dans le
// DOM du navigateur juste avant la capture — une pure mutation visuelle
// côté client, jamais une écriture en base de données.
async function hideUnassignedCandidatesPanel(page: Page) {
  // Attend le rendu réel (jamais juste le changement d'URL) — sinon la
  // carte ciblée peut ne pas encore exister dans le DOM et l'évaluation
  // ci-dessous ne masquerait silencieusement rien.
  await page.waitForLoadState("load").catch(() => {});
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const heading = [...document.querySelectorAll("h2")].find((el) => el.textContent?.trim() === "Affecter d'autres candidats");
    const card = heading?.closest(".rounded-lg") as HTMLElement | null;
    if (card) card.style.display = "none";
  });
}

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 1440, height: 900 } });

// ---------------------------------------------------------------------
// PHASE 1 — ADMIN : login, dashboard, utilisateurs, création candidat,
// affectation, fiche candidat.
// ---------------------------------------------------------------------
test("Phase 1 — Admin : login / dashboard / utilisateurs / création / affectation / fiche", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  await shot(page, "01-login");

  await page.getByLabel("Nom d'utilisateur").fill(env("STAGING_ADMIN_USER"));
  await page.getByLabel("Mot de passe").fill(env("STAGING_ADMIN_PASS"));
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
  await shot(page, "02-admin-dashboard");

  await page.goto("/users");
  // Filtre sur le tenant démo pour un écran propre (évite les comptes de
  // charge/rate-limit d'autres suites de tests staging).
  await page.getByLabel("Recherche").fill("staging");
  await page.getByRole("button", { name: /filtrer/i }).click();
  await shot(page, "03-users-directory");

  await page.goto("/users/nouveau");
  const tag = `demo${Date.now().toString().slice(-8)}`;
  await page.getByLabel("Nom complet").fill("Karim Belhadj (démo)");
  await page.getByLabel("Identifiant de connexion").fill(`${tag}.particulier`);
  await shot(page, "04-create-user");

  await page.getByRole("button", { name: /créer sans envoyer maintenant/i }).click();
  await expect(page.getByText(/en attente d'activation/i)).toBeVisible();

  // Deuxième candidat (Entreprise) — capture l'étape d'affectation
  // client/groupe/fonction avec le tenant démo réel.
  await page.goto("/users/nouveau");
  const tagE = `demoe${Date.now().toString().slice(-8)}`;
  await page.getByLabel("Nom complet").fill("Sonia Meziane (démo)");
  await page.getByLabel("Identifiant de connexion").fill(`${tagE}.entreprise`);
  await page.getByText("B. Entreprise — rattaché à une organisation cliente").click();
  await page.locator("#companyId").selectOption({ label: "Air Algérie — DEMO" });
  await page.waitForTimeout(300);
  await page.locator("#groupId").selectOption({ label: "Air Algérie — DGR Démonstration (Pilote Fonction 7.1 — staging)" });
  await shot(page, "05-company-group-assignment");
  await page.getByRole("button", { name: /créer sans envoyer maintenant/i }).click();
  await expect(page.getByText(/en attente d'activation/i)).toBeVisible();

  // Fiche détaillée d'un candidat pilote déjà établi (historique réel :
  // examens affectés, activation complétée) — plus représentatif pour
  // l'auditeur qu'un compte tout juste créé et vide.
  await page.goto("/users");
  await page.getByLabel("Recherche").fill("candidat1.staging");
  await page.getByRole("button", { name: /filtrer/i }).click();
  await page.getByRole("link", { name: /Yasmine Kaced/i }).click();
  await page.waitForURL(/\/users\/\d+/);
  await shot(page, "06-user-detail");
});

// ---------------------------------------------------------------------
// PHASE 2 — Banque de questions : vue d'ensemble, détail, sélecteur des
// 8 types.
// ---------------------------------------------------------------------
test("Phase 2 — Banque de questions et 8 types", async ({ page }) => {
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

  await page.goto("/question-bank");
  await shot(page, "07-question-bank");

  // Détail d'une question réglementaire réelle (Fonction 7.1) — preuve de
  // traçabilité source, jamais une question DEMO pour cet écran précis.
  // Mission "COMPLETE MISSING FILTERS + NORMALIZE QUESTION COUNTS"
  // (2026-08-30) : /question-bank est désormais un tableau filtrable à
  // plat (compteurs réglementaire/DEMO/total + panneau de filtres),
  // chaque question est une <tr>, plus une carte <div class=
  // "flex items-center justify-between"> — l'ancien sélecteur ne matchait
  // plus rien (silencieusement 0 résultat, capture manquante). Filtre
  // explicitement Fonction=7.1 + Classification=Réglementaire pour cibler
  // une ligne source-vérifiée sans dépendre de l'ordre alphabétique du
  // tableau non filtré (où "DEMO-*" trie avant "Q-7.1-*").
  await page.goto("/question-bank?filterFunctionCode=7.1&filterClassification=regulatory");
  const firstRealQuestion = page.locator("table tbody tr").first();
  if ((await firstRealQuestion.count()) > 0) {
    await firstRealQuestion.getByRole("link", { name: /modifier/i }).click();
    await page.waitForURL(/\/question-bank\/\d+\/edit/);
    await shot(page, "08-question-detail");
    await page.goBack();
  }

  // Sélecteur de type — les 8 valeurs dans l'ordre exact, capturé sur le
  // formulaire de création réel (jamais soumis pour cet écran).
  await page.goto("/question-bank");
  await page.locator("#qtype").selectOption("scenario");
  await page.waitForTimeout(200);
  await shot(page, "09-eight-question-types");
});

// ---------------------------------------------------------------------
// PHASE 3 — Préparation d'examen : constructeur, examen publié,
// reprogrammation.
// ---------------------------------------------------------------------
test("Phase 3 — Constructeur d'examen / examen publié / reprogrammation", async ({ page }) => {
  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));

  await page.goto("/exam-preparation");
  await page.locator('input[name="type"][value="examen"]').check({ force: true });
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Démonstration" });
  await page.locator('select[name="functionCode"]').selectOption("7.1");
  await page.locator("#name").fill("DGR Fonction 7.1 — Démonstration constructeur (aperçu, non publié)");
  await expect(page.getByText(/Questions admissibles disponibles/)).toBeVisible();
  await shot(page, "10-exam-builder");

  // Examen déjà publié (le pilote historique, stable d'un run à l'autre).
  await page.goto("/exam-preparation");
  await page.getByRole("link", { name: "DGR Fonction 7.1 — Examen pilote staging" }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await hideUnassignedCandidatesPanel(page);
  await shot(page, "11-published-exam");

  const rescheduleSection = page.getByRole("heading", { name: "Reprogrammer l'examen" });
  if ((await rescheduleSection.count()) > 0) {
    await hideUnassignedCandidatesPanel(page);
    await rescheduleSection.scrollIntoViewIfNeeded();
    await shot(page, "12-reschedule");
  }
});

// ---------------------------------------------------------------------
// PHASE 4 — Parcours candidat (examen démo 8 types, candidat3.staging) :
// tableau de bord, instructions, examen en cours, types de question,
// reprise, révision finale, soumission.
// ---------------------------------------------------------------------
test("Phase 4 — Parcours candidat complet (8 types, autosave, soumission)", async ({ page }) => {
  await loginAs(page, env("STAGING_CANDIDATE3_USER"), env("STAGING_CANDIDATE3_PASS"));

  await page.goto("/mes-examens");
  const demoRow = page.locator("div.flex.items-center.justify-between", { hasText: "Démonstration auditeur (8 types)" });
  await expect(demoRow).toBeVisible();
  await shot(page, "13-candidate-dashboard");

  await demoRow.getByRole("link", { name: /commencer/i }).click();
  await page.waitForURL(/\/exam\/\d+\/instructions/);
  await shot(page, "14-exam-instructions");

  await page.getByRole("button", { name: /commencer l'examen/i }).click();
  await page.waitForURL(/\/exam\/\d+\/attempt/);
  await shot(page, "15-exam-in-progress");

  const card = page.getByTestId("exam-question-card");

  async function goNext() {
    const before = await card.getAttribute("data-qtype");
    await page.getByRole("button", { name: /suivante/i }).click();
    await expect.poll(() => card.getAttribute("data-qtype")).not.toBe(before);
  }

  let guard = 0;
  let capturedBasic = false;
  let capturedMatchOrder = false;
  let capturedScenario = false;
  while (guard < 20) {
    guard++;
    const qtype = await card.getAttribute("data-qtype");
    if (qtype === "true_false") {
      await card.getByLabel("Vrai").check();
    } else if (qtype === "mcq_single") {
      await card.getByRole("radio").first().check().catch(async () => {
        await card.locator('input[type="radio"]').first().check();
      });
    } else if (qtype === "mcq_multi") {
      const boxes = card.locator('input[type="checkbox"]');
      await boxes.nth(0).check();
      await boxes.nth(1).check();
      if (!capturedBasic) {
        await shot(page, "16-vrai-faux-qcm");
        capturedBasic = true;
      }
    } else if (qtype === "numeric") {
      await card.locator('input[type="number"]').fill("9");
      await card.locator('input[type="number"]').press("Tab");
    } else if (qtype === "short_answer") {
      await card.locator('input[type="text"]').fill("IATA");
      await card.locator('input[type="text"]').press("Tab");
    } else if (qtype === "matching") {
      const selects = card.locator("select");
      const count = await selects.count();
      for (let i = 0; i < count; i++) await selects.nth(i).selectOption({ index: 1 });
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      if (!capturedMatchOrder) await shot(page, "17-matching-ordering");
    } else if (qtype === "ordering") {
      // Un aller-retour Monter/Descendre suffit pour déclencher une
      // sauvegarde explicite (voir tests/e2e — même garde qu'en local).
      const rows = card.locator('[data-testid="ordering-row"]');
      if ((await rows.count()) > 1) {
        await rows.nth(1).getByRole("button", { name: /^Monter :/ }).click();
        await rows.nth(0).getByRole("button", { name: /^Descendre :/ }).click();
      }
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      if (!capturedMatchOrder) {
        await shot(page, "17-matching-ordering");
        capturedMatchOrder = true;
      }
    } else if (qtype === "scenario") {
      if (!capturedScenario) await shot(page, "18-scenario");
      const sub0 = page.getByTestId("scenario-answer-subquestion-0");
      await sub0.locator('input[type="radio"], input[type="checkbox"]').first().check();
      const sub1 = page.getByTestId("scenario-answer-subquestion-1");
      await sub1.locator('input[type="text"]').fill("Notification immédiate au responsable HSE et aux autorités compétentes.");
      await sub1.locator('input[type="text"]').press("Tab");
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      if (!capturedScenario) {
        await shot(page, "18-scenario");
        capturedScenario = true;
      }
    }
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

    // Reprise après rafraîchissement — au milieu du parcours, une seule fois.
    if (guard === 3) {
      const url = page.url();
      await page.reload();
      await expect(page).toHaveURL(url);
      await page.goto("/mes-examens");
      await expect(page.locator("div.flex.items-center.justify-between", { hasText: "Démonstration auditeur (8 types)" }).getByText("EN COURS")).toBeVisible();
      await shot(page, "19-resume-autosave");
      await page.goto(url);
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      continue; // revenu à la question 1 (déjà répondue) — la boucle la retraverse.
    }

    if ((await page.getByRole("button", { name: /suivante/i }).count()) > 0) await goNext();
    else break;
  }

  await page.getByRole("button", { name: /vérifier avant d'envoyer/i }).click();
  await expect(page.getByText("Résumé de l'examen")).toBeVisible();
  await shot(page, "20-final-review");

  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: /^terminer et envoyer l'examen$/i }).click();
  await page.waitForURL(/\/mes-resultats\?justSubmitted=/);
  await shot(page, "21-submission-confirmation");
});

// ---------------------------------------------------------------------
// PHASE 4bis — Candidat (compte pilote SÉPARÉ, candidat2.staging) démarre
// l'examen DÉMO (id=34, scope="demo", attempts_allowed=20) SANS le
// terminer — laisse une vraie tentative "en cours" pour la Phase 5
// (jamais le même compte que le parcours complet en Phase 4, pour ne
// jamais mélanger les deux démonstrations).
//
// Corrigé le 2026-08-30 (revue manuelle des captures) : la version
// précédente ciblait l'examen PILOTE RÉEL "DGR Fonction 7.1 — Examen
// pilote staging" (assessment id=1, scope="production", attempts_allowed=1)
// — déjà épuisé pour candidat2.staging depuis une exécution antérieure,
// donc ce test ne créait plus aucune tentative "en cours" (silencieusement
// no-op) et les captures 22/30 ne montraient plus que des résultats déjà
// disponibles, ce qui contredit l'exigence même de ces captures ("jamais
// un résultat prématuré affiché" suppose qu'une tentative en cours existe
// à montrer). Cible désormais l'examen DÉMO dédié, qui a toujours de la
// marge (20 tentatives autorisées) et ne touche jamais un examen/scope de
// production.
// ---------------------------------------------------------------------
test("Phase 4bis — Tentative laissée en cours (candidat2.staging, examen démo)", async ({ page }) => {
  // L'examen démo (id=34) n'affecte QUE candidat3.staging à sa création
  // (scripts/provision-demo-questions.ts, exécuté pour le parcours complet
  // de la Phase 4) — candidat2.staging n'y a donc jamais accès tant qu'il
  // n'est pas explicitement affecté. Utilise le vrai formulaire admin
  // "Affecter la sélection" (AssignMoreCandidatesForm — action serveur
  // réelle, jamais une écriture SQL directe) pour l'ajouter, exactement
  // comme le ferait un responsable pédagogique dans l'application.
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
  await page.goto("/exam-preparation/34");
  const assignCheckbox = page.locator("label", { hasText: "Riad Boumediene (pilote)" }).locator('input[type="checkbox"]');
  if ((await assignCheckbox.count()) > 0) {
    await assignCheckbox.check();
    await page.getByRole("button", { name: /affecter la sélection/i }).click();
    await page.waitForLoadState("load").catch(() => {});
  }
  await logout(page);

  await loginAs(page, env("STAGING_CANDIDATE2_USER"), env("STAGING_CANDIDATE2_PASS"));
  await page.goto("/mes-examens");
  const pilotRow = page.locator("div.flex.items-center.justify-between", { hasText: "Démonstration auditeur (8 types)" });
  if ((await pilotRow.count()) > 0) {
    const startBtn = pilotRow.getByRole("link", { name: /commencer/i });
    if ((await startBtn.count()) > 0) {
      await startBtn.click();
      await page.waitForURL(/\/exam\/\d+\/instructions/);
      await page.getByRole("button", { name: /commencer l'examen/i }).click();
      await page.waitForURL(/\/exam\/\d+\/attempt/);
      // Répond à UNE question (preuve d'autosave) puis abandonne
      // délibérément SANS soumettre — la tentative reste "en cours".
      const card = page.getByTestId("exam-question-card");
      const qtype = await card.getAttribute("data-qtype");
      if (qtype === "true_false") await card.getByLabel("Vrai").check().catch(() => {});
      else if (qtype === "mcq_single") await card.locator('input[type="radio"]').first().check().catch(() => {});
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    }
  }
});

// ---------------------------------------------------------------------
// PHASE 5 — Admin : suivi d'une tentative en cours, correction manuelle,
// résultat final.
// ---------------------------------------------------------------------
test("Phase 5 — Suivi en cours / correction manuelle / résultat final", async ({ page }) => {
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

  // Tentative encore EN COURS (candidat2.staging, Phase 4bis) — jamais un
  // résultat prématuré affiché. FILTRÉ sur le groupe démo ET sur l'examen
  // démo précis (id=34) — jamais la liste complète non filtrée, qui
  // contient aussi : le compte réel de Brahimi (historique réel, hors
  // sujet ici), et "fethi amrani" (id=18, membre réel du groupe démo sans
  // étiquette "(pilote)"/"(démo)" — probablement un testeur réel antérieur
  // à cette mission, jamais créé par ce script). Exposer un nom/résultat
  // réel non étiqueté dans une capture destinée à un auditeur externe
  // serait une fuite d'information personnelle inutile (§3/§21 de la
  // mission), même si la donnée elle-même reste inchangée. Le filtre
  // combiné groupe+examen ne laisse apparaître que les tentatives sur
  // l'examen démo lui-même, dont tous les participants sont des comptes
  // pilote/démo créés et étiquetés pour cette démonstration.
  await page.goto("/results");
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Démonstration" }).catch(() => {});
  await page.locator('select[name="assessmentId"]').selectOption({ value: "34" }).catch(() => {});
  await page.getByRole("button", { name: /filtrer/i }).click();
  await page.waitForLoadState("load").catch(() => {});
  const inProgressRow = page.locator("tr", { hasText: "En cours" }).first();
  if ((await inProgressRow.count()) > 0) {
    await inProgressRow.scrollIntoViewIfNeeded();
  }
  await shot(page, "22-in-progress-admin-view");

  await page.goto("/grading");
  await shot(page, "23-manual-grading");

  const pendingItem = page.locator("div.rounded-md.border", { hasText: "Décrivez la procédure de notification." });
  if ((await pendingItem.count()) > 0) {
    const correctBtn = pendingItem.getByRole("button", { name: /^correcte$/i });
    if ((await correctBtn.count()) > 0) {
      await correctBtn.click();
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    }
  }

  await logout(page);
  await loginAs(page, env("STAGING_CANDIDATE3_USER"), env("STAGING_CANDIDATE3_PASS"));
  await page.goto("/mes-resultats");
  await shot(page, "24-final-result");

  const pdfLink = page.getByRole("link", { name: "PDF" }).first();
  if ((await pdfLink.count()) > 0) {
    await shot(page, "25-report-export");
  }
});

// ---------------------------------------------------------------------
// PHASE 6 — Admin : historique email, communications, journal d'audit,
// MFA/sécurité.
// ---------------------------------------------------------------------
test("Phase 6 — Email / communications / audit / MFA", async ({ page }) => {
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

  // L'historique réel de /notifications sur staging ne contient QUE deux
  // adresses destinataires à ce jour : l'email personnel réel de Brahimi
  // et l'adresse propriétaire — jamais montrables telles quelles à un
  // auditeur externe (§3/§13 de la mission). Génère une notification
  // propre et sûre : un candidat démo avec une adresse RFC 2606 réservée
  // aux tests (example.test, jamais délivrable, jamais une vraie
  // personne), invité réellement — EMAIL_MODE=allowlist la classera
  // SUPPRESSED (adresse hors liste), ce qui démontre AUSSI le
  // mécanisme de sécurité lui-même, pas seulement l'historique.
  const tagN = `demonotif${Date.now().toString().slice(-8)}`;
  await page.goto("/users/nouveau");
  await page.getByLabel("Nom complet").fill("Nadia Chérif (démo notification)");
  await page.getByLabel("Identifiant de connexion").fill(`${tagN}.particulier`);
  await page.getByLabel("Email").fill(`${tagN}@example.test`);
  await page.getByRole("button", { name: /créer et envoyer l'invitation/i }).click();
  await page.waitForLoadState("load").catch(() => {});

  await page.goto("/notifications");
  await page.getByLabel("Email destinataire").fill("example.test");
  await page.getByRole("button", { name: /filtrer/i }).click();
  await page.waitForLoadState("load").catch(() => {});
  await shot(page, "26-email-history");

  await page.goto("/users");
  await page.getByLabel("Recherche").fill("candidat1.staging");
  await page.getByRole("button", { name: /filtrer/i }).click();
  await page.getByRole("link", { name: /Yasmine Kaced/i }).click();
  await page.waitForURL(/\/users\/\d+/);
  const commSection = page.getByText(/communications/i).first();
  if ((await commSection.count()) > 0) await commSection.scrollIntoViewIfNeeded();
  await shot(page, "27-user-communication");

  await page.goto("/audit-logs");
  await shot(page, "28-audit-log");

  // MFA/sécurité — écran "Mon compte" du responsable pédagogique
  // (rôle éligible MFA ; les candidats n'y ont structurellement pas accès).
  await logout(page);
  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));
  await page.goto("/mon-compte");
  await shot(page, "29-mfa-security");
});

// ---------------------------------------------------------------------
// PHASE 7 — Auditeur (lecture seule) et isolation tenant.
// ---------------------------------------------------------------------
test("Phase 7 — Rôle auditeur / isolation tenant", async ({ page }) => {
  await loginAs(page, env("STAGING_AUDITOR_USER"), env("STAGING_AUDITOR_PASS"));

  // Filtré sur le groupe démo ET sur l'examen démo précis (id=34) —
  // jamais la liste complète non filtrée, qui contient aussi le compte
  // réel de Brahimi et "fethi amrani" (voir la même remarque en Phase 5).
  await page.goto("/results");
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Démonstration" }).catch(() => {});
  await page.locator('select[name="assessmentId"]').selectOption({ value: "34" }).catch(() => {});
  await page.getByRole("button", { name: /filtrer/i }).click();
  await page.waitForLoadState("load").catch(() => {});
  await shot(page, "30-auditor-role");

  // Isolation : le tenant démo isolé "Vérification Auditeur — Isolée"
  // reste visible pour l'auditeur (accès global légitime) mais un
  // responsable pédagogique du tenant "Air Algérie" ne le verrait jamais
  // — capture le tableau de bord "Clients" tel que vu par l'auditeur,
  // qui montre plusieurs tenants distincts côte à côte SANS mélanger
  // leurs données internes (preuve de séparation, pas de données privées
  // d'un tenant exposées à un autre rôle).
  await page.goto("/companies");
  await shot(page, "31-tenant-isolation");
});
