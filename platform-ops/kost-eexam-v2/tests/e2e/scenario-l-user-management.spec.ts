import { test, expect } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { loginAs, logout } from "./helpers";
import { hashPassword } from "../../lib/passwords";

// Scénario L — mission "COMPLETE USER MANAGEMENT + CLIENT/GROUP
// AFFILIATION + EMAIL COMMUNICATION UX" (2026-08-29). Self-contained comme
// les scénarios J/K : crée ses propres comptes/entreprises/groupes/examens
// plutôt que de muter les comptes démo partagés (candidat1-3.demo sont déjà
// destructivement utilisés par scenario-e/scenario-i) — même discipline
// d'isolation entre fichiers de spec déjà établie dans ce projet.
function uniqueTag() {
  return `l${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

test("A — l'admin crée un candidat Particulier sans envoyer l'invitation ; la fiche reflète correctement l'état", async ({ page }) => {
  const t = uniqueTag();
  await loginAs(page, "admin");
  await page.goto("/users/nouveau");

  await page.getByLabel("Nom complet").fill(`Particulier Test ${t}`);
  await page.getByLabel("Identifiant de connexion").fill(`${t}.particulier`);
  // Particulier est déjà sélectionné par défaut — pas de client/groupe à choisir.
  await page.getByRole("button", { name: /créer sans envoyer maintenant/i }).click();

  await expect(page.getByText(/en attente d'activation.*invitation n'a pas été envoyée/i)).toBeVisible();

  await page.goto("/users");
  await page.getByLabel("Recherche").fill(`${t}.particulier`);
  await page.getByRole("button", { name: /filtrer/i }).click();
  const row = page.getByTestId(`user-row-${t}.particulier`);
  await expect(row).toBeVisible();
  await expect(row.getByText("En attente d'activation")).toBeVisible();

  await page.getByRole("link", { name: `Particulier Test ${t}` }).click();
  await page.waitForURL(/\/users\/\d+/);
  await expect(page.getByText(`${t}.particulier`)).toBeVisible();
  await expect(page.getByText("Particulier", { exact: true })).toBeVisible();
  // Jamais envoyée -> le libellé d'action est "Envoyer le lien d'activation", pas "Renvoyer".
  await expect(page.getByRole("button", { name: /envoyer le lien d'activation/i })).toBeVisible();
});

test("B — l'admin crée un candidat Entreprise via + Nouveau client / + Nouveau groupe, affecte une fonction DGR, envoie l'invitation", async ({ page }) => {
  const t = uniqueTag();
  await loginAs(page, "admin");
  await page.goto("/users/nouveau");

  await page.getByLabel("Nom complet").fill(`Entreprise Test ${t}`);
  await page.getByLabel("Identifiant de connexion").fill(`${t}.entreprise`);
  await page.getByLabel("Email").fill(`${t}.entreprise@example.test`);
  await page.getByLabel(/B\. Entreprise/).check();

  // + Nouveau client
  await page.getByRole("button", { name: "+ Nouveau" }).first().click();
  await page.getByPlaceholder("Nom du client").fill(`Client E2E ${t}`);
  await page.getByRole("button", { name: /créer le client/i }).click();
  await page.waitForURL(/\/users\/nouveau\?companyId=\d+/);

  // Le nom complet a été perdu au rechargement (formulaire non persistant
  // entre la redirection quick-create) — comportement attendu de la
  // simplification "formulaire unique" documentée ; on ressaisit.
  await page.getByLabel("Nom complet").fill(`Entreprise Test ${t}`);
  await page.getByLabel("Identifiant de connexion").fill(`${t}.entreprise`);
  await page.getByLabel("Email").fill(`${t}.entreprise@example.test`);
  await page.getByLabel(/B\. Entreprise/).check();

  // + Nouveau groupe (rattaché au client déjà présélectionné)
  await page.getByRole("button", { name: "+ Nouveau" }).nth(1).click();
  await page.getByPlaceholder("Nom du groupe").fill(`Groupe E2E ${t}`);
  await page.getByRole("button", { name: /créer le groupe/i }).click();
  await page.waitForURL(/\/users\/nouveau\?companyId=\d+&groupId=\d+/);

  await page.getByLabel("Nom complet").fill(`Entreprise Test ${t}`);
  await page.getByLabel("Identifiant de connexion").fill(`${t}.entreprise`);
  await page.getByLabel("Email").fill(`${t}.entreprise@example.test`);
  await page.getByLabel(/B\. Entreprise/).check();
  await page.getByLabel("7.1", { exact: true }).check();

  await page.getByRole("button", { name: /créer et envoyer l'invitation/i }).click();
  await expect(page.getByText(/invitation envoyée/i)).toBeVisible();

  await page.goto("/users");
  await page.getByLabel("Recherche").fill(`${t}.entreprise`);
  await page.getByRole("button", { name: /filtrer/i }).click();
  await expect(page.getByRole("cell", { name: `Client E2E ${t}` })).toBeVisible();

  await page.getByRole("link", { name: `Entreprise Test ${t}` }).click();
  await page.waitForURL(/\/users\/\d+/);
  await expect(page.getByText(`Client E2E ${t}`)).toBeVisible();
  await expect(page.getByText(`Groupe E2E ${t}`)).toBeVisible();
  await expect(page.getByTestId("function-chip-7.1")).toBeVisible();
});

test("C — archiver puis restaurer un compte via l'UI change réellement le statut affiché, aller-retour complet", async ({ page }) => {
  const t = uniqueTag();
  await loginAs(page, "admin");
  await page.goto("/users/nouveau");
  await page.getByLabel("Nom complet").fill(`Archive Test ${t}`);
  await page.getByLabel("Identifiant de connexion").fill(`${t}.archive`);
  await page.getByRole("button", { name: /créer sans envoyer maintenant/i }).click();

  await page.goto("/users");
  await page.getByLabel("Recherche").fill(`${t}.archive`);
  await page.getByRole("button", { name: /filtrer/i }).click();
  await page.getByRole("link", { name: `Archive Test ${t}` }).click();
  await page.waitForURL(/\/users\/\d+/);

  await page.getByRole("button", { name: /^archiver$/i }).click();
  await expect(page.getByText("Archivé", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /^restaurer$/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^suspendre$/i })).toHaveCount(0);

  // Ce compte a été créé via "Créer sans envoyer maintenant" — AUCUN jeton
  // d'activation n'a jamais été émis. hasCompletedActivation() traite ce
  // cas comme "jamais passé par le flux d'invitation par jeton" (même
  // exception documentée que les comptes de démo legacy, voir
  // lib/activation-tokens.ts) et restaure donc directement vers 'active',
  // jamais 'pending_activation' — comportement attendu, pas un bug.
  await page.getByRole("button", { name: /^restaurer$/i }).click();
  await expect(page.getByText("Actif", { exact: true }).first()).toBeVisible();
});

test("D — suppression définitive : un compte inutilisé est réellement supprimable (SUPPRIMER + confirmation), disparaît de la liste", async ({ page }) => {
  const t = uniqueTag();
  await loginAs(page, "admin");
  await page.goto("/users/nouveau");
  await page.getByLabel("Nom complet").fill(`Delete Safe ${t}`);
  await page.getByLabel("Identifiant de connexion").fill(`${t}.delsafe`);
  await page.getByRole("button", { name: /créer sans envoyer maintenant/i }).click();

  await page.goto("/users");
  await page.getByLabel("Recherche").fill(`${t}.delsafe`);
  await page.getByRole("button", { name: /filtrer/i }).click();
  await page.getByRole("link", { name: `Delete Safe ${t}` }).click();
  await page.waitForURL(/\/users\/\d+/);

  await page.getByRole("button", { name: /supprimer définitivement/i }).click();
  await page.locator('input[name="confirmText"]').fill("SUPPRIMER");
  await page.getByRole("button", { name: /confirmer la suppression définitive/i }).click();
  await page.waitForURL(/\/users$/);

  await page.getByLabel("Recherche").fill(`${t}.delsafe`);
  await page.getByRole("button", { name: /filtrer/i }).click();
  await expect(page.getByText(`Delete Safe ${t}`)).toHaveCount(0);
});

test("E — suppression définitive : un candidat avec un examen affecté est BLOQUÉ avec le message exact requis, aucune saisie de confirmation proposée", async ({ page }) => {
  const t = uniqueTag();
  await loginAs(page, "admin");

  // Candidat Entreprise rattaché au groupe démo existant (ajout pur, non
  // destructif pour les autres specs — ne retire/modifie aucun membre
  // existant).
  await page.goto("/users/nouveau");
  await page.getByLabel("Nom complet").fill(`Delete Blocked ${t}`);
  await page.getByLabel("Identifiant de connexion").fill(`${t}.delblocked`);
  await page.getByLabel(/B\. Entreprise/).check();
  await page.locator("#companyId").selectOption({ label: "Air Algérie — DEMO" });
  await page.locator("#groupId").selectOption({ label: "Air Algérie — DGR Septembre 2026 (DEMO) (Session démo)" });
  await page.getByRole("button", { name: /créer sans envoyer maintenant/i }).click();

  // Examen frais dédié à ce test (self-contained, comme scénario K).
  await page.goto("/exam-preparation");
  await page.getByLabel("Nom de l'évaluation").fill(`Examen Delete Blocked ${t}`);
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Septembre 2026 (DEMO)" });
  await page.locator('select[name="functionCode"]').selectOption("7.1");
  await expect(page.getByText(/Questions admissibles disponibles/)).toBeVisible();
  await page.locator('input[name="questionCount"]').fill("1");
  await page.locator('input[name="durationMinutes"]').fill("15");
  await page.locator('input[name="passThresholdPct"]').fill("80");
  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();

  // La publication affecte automatiquement tout le groupe (comportement
  // existant, non modifié par cette mission) — le candidat créé ci-dessus
  // est donc déjà affecté, sans étape "Affecter d'autres candidats"
  // supplémentaire nécessaire ici (réservée aux membres ajoutés au groupe
  // APRÈS la publication).
  await expect(page.getByRole("cell", { name: `Delete Blocked ${t}` })).toBeVisible();

  await page.goto("/users");
  await page.getByLabel("Recherche").fill(`${t}.delblocked`);
  await page.getByRole("button", { name: /filtrer/i }).click();
  await page.getByRole("link", { name: `Delete Blocked ${t}` }).click();
  await page.waitForURL(/\/users\/\d+/);

  await expect(
    page.getByText("Cet utilisateur possède un historique d'examen et ne peut pas être supprimé définitivement. Vous pouvez archiver son compte.")
  ).toBeVisible();
  await expect(page.locator('input[name="confirmText"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: /supprimer définitivement/i })).toHaveCount(0);
});

// Régression du bug réel corrigé dans lib/auth.ts::login() (compte 'archived'
// non couvert par la garde initiale) — non testable au niveau lib/ car
// lib/auth.ts porte "server-only" (voir tests/unit/user-archive-lifecycle.test.ts).
// Le compte est créé DIRECTEMENT en base avec un mot de passe réel connu
// (hashPassword() — même format que lib/users.ts::createUser) car aucun
// chemin UI ne permet de faire choisir un mot de passe réel à un compte
// qui sera ensuite archivé sans jamais passer par le flux d'activation —
// exception délibérée à "toujours passer par l'UI", documentée ici.
test("F — un compte archivé est structurellement refusé à la connexion réelle, même avec un mot de passe valide (régression du bug réel corrigé dans lib/auth.ts)", async ({ page }) => {
  const t = uniqueTag();
  const username = `${t}.archivedlogin`;
  const password = "MotDePasseValideE2E123!";
  const dbPath = resolve(import.meta.dirname, "../../data/e2e-test.db");
  const db = new DatabaseSync(dbPath);
  const roleRow = db.prepare(`SELECT id FROM roles WHERE code = 'candidate'`).get() as { id: number };
  const result = db
    .prepare(`INSERT INTO users (username, password_hash, full_name, status) VALUES (?, ?, ?, 'archived')`)
    .run(username, hashPassword(password), `Archivé Login ${t}`);
  const userId = Number(result.lastInsertRowid);
  db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(userId, roleRow.id);
  db.close();

  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(username);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page.getByText(/archivé/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("G — /users, /users/nouveau et /users/[id] sont strictement réservés à l'administrateur (responsable pédagogique, auditeur ET candidat refusés)", async ({ page }) => {
  await loginAs(page, "responsable.demo");
  await page.goto("/users");
  await expect(page.getByText(/accès refusé/i)).toBeVisible();
  await page.goto("/users/nouveau");
  await expect(page.getByText(/accès refusé/i)).toBeVisible();

  await logout(page);
  await loginAs(page, "auditeur.demo");
  await page.goto("/users");
  await expect(page.getByText(/accès refusé/i)).toBeVisible();

  await logout(page);
  await loginAs(page, "candidat1.demo");
  await page.goto("/users");
  await expect(page.getByText(/accès refusé/i)).toBeVisible();
});

test("H — « Envoyer un message » : le message apparaît réellement dans l'historique Communications de la fiche", async ({ page }) => {
  const t = uniqueTag();
  await loginAs(page, "admin");
  await page.goto("/users/nouveau");
  await page.getByLabel("Nom complet").fill(`Message Test ${t}`);
  await page.getByLabel("Identifiant de connexion").fill(`${t}.msg`);
  await page.getByLabel("Email").fill(`${t}.msg@example.test`);
  await page.getByRole("button", { name: /créer sans envoyer maintenant/i }).click();

  await page.goto("/users");
  await page.getByLabel("Recherche").fill(`${t}.msg`);
  await page.getByRole("button", { name: /filtrer/i }).click();
  await page.getByRole("link", { name: `Message Test ${t}` }).click();
  await page.waitForURL(/\/users\/\d+/);

  await page.getByRole("button", { name: /^envoyer un message$/i }).click();
  await page.locator('input[name="subject"]').fill(`Sujet E2E ${t}`);
  await page.locator('textarea[name="bodyText"]').fill("Corps du message envoyé depuis le test E2E.");
  await page.getByRole("button", { name: /^envoyer$/i }).click();

  await expect(page.getByText(/message envoyé/i)).toBeVisible();
  await expect(page.getByText(`Sujet E2E ${t}`)).toBeVisible();
  await expect(page.getByText("ADMIN_MESSAGE")).toBeVisible();
});
