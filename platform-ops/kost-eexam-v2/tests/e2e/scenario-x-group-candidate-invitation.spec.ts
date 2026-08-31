import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers";

// Scénario X — mission "FIX EMPLOYEE TESTING ISSUES — PDF OVERLAP + GROUP
// CANDIDATE INVITATION DELIVERY" (2026-08-31) §20 A/B/D/E/F/G/I : couverture
// E2E réelle de app/(app)/groups/actions.ts::addCandidateAction — jamais
// seulement la fonction pure, toujours le vrai formulaire "Ajouter un
// candidat" sur /groups/[id] (même discipline que scenario-t-duplicate-
// prevention.spec.ts, dont ce fichier réutilise le même style d'isolation
// par tag unique). EMAIL_MODE=log ici (playwright.config.ts) — CHAQUE
// notification devient SUPPRESSED (raison "EMAIL_MODE=log"), jamais
// DELIVERED : ce fichier prouve donc la MÉCANIQUE (notification créée,
// jeton créé, UI honnête) et la distinction "flux qui fonctionne" vs
// "vraie livraison", pas la livraison réelle elle-même (staging-only,
// §18 de la mission, hors périmètre E2E local).
//
// §10/§14 — bug réel trouvé et corrigé cette mission : un candidat déjà
// existant ET encore 'pending_activation' (ex. réaffecté à un second
// groupe) ne recevait JAMAIS de renvoi d'invitation, quelle que soit la
// méthode choisie — silencieusement, sans que l'UI ne le signale jamais.
process.env.DB_PATH = "./data/e2e-test.db";
// notifyAccountCreated() (appelée directement dans les setups ci-dessous,
// hors processus serveur webServer) a besoin de APP_BASE_URL pour
// construire l'URL d'activation — sans cette ligne, le processus de test
// Playwright (distinct du processus webServer, qui lui reçoit déjà cette
// variable via playwright.config.ts::webServer.env) ne l'a jamais et
// l'appel échoue silencieusement avant l'outbox (voir lib/email/events.ts
// safe()/try-catch — jamais une exception qui remonte, juste `null`).
process.env.APP_BASE_URL = "http://127.0.0.1:3101";

function uniqueTag() {
  return `x${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function importLib() {
  const { createUser, createUserPendingActivation, findUserByUsername, findUserById } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup } = await import("../../lib/groups");
  const { getDb } = await import("../../lib/db");
  return { createUser, createUserPendingActivation, findUserByUsername, findUserById, createCompany, createGroup, getDb };
}

// Insère directement la ligne notification_log "d'origine" par SQL brut —
// jamais via notifyAccountCreated()/render() ici : appeler le pipeline
// React Email depuis LE PROCESSUS DE TEST Playwright (distinct du process
// webServer) provoque une erreur de sérialisation propre à l'instrumentation
// Playwright ("Objects are not valid as a React child... __pw_type"),
// jamais rencontrée quand ce même code tourne dans le process serveur
// (voir le test A/B/D/E ci-dessous, qui exerce le VRAI pipeline via l'UI
// réelle et le process webServer — la seule différence est le processus
// appelant). Insertion minimale mais fidèle aux colonnes réellement
// utilisées par queueAndSendEmail (lib/email/send.ts) pour ne jamais
// fausser un COUNT(*) ultérieur.
function seedPriorInvitation(db: ReturnType<Awaited<ReturnType<typeof importLib>>["getDb"]>, userId: number, companyId: number) {
  db.prepare(
    `INSERT INTO notification_log
       (tenant_company_id, user_id, recipient_email, event_type, template_id, template_version, subject,
        provider, idempotency_key, status, created_at, queued_at)
     VALUES (?, ?, 'seed@example.test', 'ACCOUNT_CREATED', 'account-created', 1, 'Bienvenue', 'resend', ?, 'SUPPRESSED', datetime('now'), datetime('now'))`
  ).run(companyId, userId, `account-created/${userId}`);
}

function notifCount(db: ReturnType<Awaited<ReturnType<typeof importLib>>["getDb"]>, userId: number): number {
  return (db.prepare(`SELECT COUNT(*) n FROM notification_log WHERE user_id = ?`).get(userId) as { n: number }).n;
}
function tokenCount(db: ReturnType<Awaited<ReturnType<typeof importLib>>["getDb"]>, userId: number): number {
  return (db.prepare(`SELECT COUNT(*) n FROM activation_tokens WHERE user_id = ? AND purpose = 'account_setup'`).get(userId) as { n: number }).n;
}

test.describe.configure({ mode: "serial" });

// §20 A/B/D/E — nouveau candidat, invitation sécurisée : notification
// ACCOUNT_CREATED + jeton créés, statut réellement SUPPRESSED (EMAIL_MODE=
// log), et le message affiché le dit honnêtement — jamais "envoyée" sans
// condition.
test("A/B/D/E — nouveau candidat via invitation sécurisée : notification + jeton créés, UI honnête sur le blocage EMAIL_MODE=log", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const companyId = lib.createCompany({ name: `Invit Co ${t}`, scope: "test", createdBy: admin.id });
  const groupId = lib.createGroup({ companyId, name: `Invit Grp ${t}`, scope: "test", createdBy: admin.id });

  await loginAs(page, "admin");
  await page.goto(`/groups/${groupId}`);
  await page.getByLabel("Nom complet").fill(`Nouveau Candidat ${t}`);
  await page.getByLabel("Identifiant").fill(`${t}.nouveau`);
  await page.getByLabel("Email (invitation)").fill(`${t}.nouveau@example.test`);
  await page.getByRole("button", { name: /^ajouter$/i }).click();

  // §12 — jamais "envoyée" sans condition : EMAIL_MODE=log bloque
  // TOUJOURS l'envoi réel en local, le message doit le dire honnêtement.
  await expect(page.getByText(/créé\./i)).toBeVisible();
  await expect(page.getByText(/envoi bloqué par la politique/i)).toBeVisible();
  await expect(page.getByText(/^.*invitation envoyée à/i)).toHaveCount(0);

  const candidate = lib.findUserByUsername(`${t}.nouveau`)!;
  expect(candidate.status).toBe("pending_activation");
  expect(notifCount(lib.getDb(), candidate.id)).toBe(1);
  expect(tokenCount(lib.getDb(), candidate.id)).toBe(1);
  const notif = lib.getDb().prepare(`SELECT event_type, status FROM notification_log WHERE user_id = ?`).get(candidate.id) as { event_type: string; status: string };
  expect(notif.event_type).toBe("ACCOUNT_CREATED");
  expect(notif.status).toBe("SUPPRESSED");
});

// §20 F — candidat existant PENDING_ACTIVATION réaffecté à un second
// groupe : l'invitation est réellement RENVOYÉE (nouveau jeton, nouvelle
// ligne notification), jamais un silence. Aucun doublon de compte.
test("F — candidat existant pending_activation réaffecté à un second groupe : invitation réellement renvoyée, aucun doublon", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const companyId = lib.createCompany({ name: `Reinvite Co ${t}`, scope: "test", createdBy: admin.id });
  const groupOrigin = lib.createGroup({ companyId, name: `Reinvite Grp Origin ${t}`, scope: "test", createdBy: admin.id });
  const groupTarget = lib.createGroup({ companyId, name: `Reinvite Grp Target ${t}`, scope: "test", createdBy: admin.id });
  const candidateId = lib.createUserPendingActivation({ username: `${t}.pending`, fullName: `Pending Candidat ${t}`, role: "candidate", email: `${t}.pending@example.test` });
  const { addCandidateToGroup } = await import("../../lib/groups");
  addCandidateToGroup(groupOrigin, candidateId, admin.id);
  // Simule l'invitation d'origine (1 notification + 1 jeton déjà présents,
  // comme le ferait addCandidateAction lors de la création initiale).
  const { createActivationToken } = await import("../../lib/activation-tokens");
  createActivationToken({ userId: candidateId, purpose: "account_setup", createdBy: admin.id });
  seedPriorInvitation(lib.getDb(), candidateId, companyId);
  const usersBefore = (lib.getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;

  await loginAs(page, "admin");
  await page.goto(`/groups/${groupTarget}`);
  await page.getByLabel("Nom complet").fill(`Pending Candidat ${t}`);
  await page.getByLabel("Identifiant").fill(`${t}.pending`);
  await page.getByLabel("Email (invitation)").fill(`${t}.pending@example.test`);
  await page.getByRole("button", { name: /^ajouter$/i }).click();

  await expect(page.getByText(/en attente d'activation.*ajouté au groupe/i)).toBeVisible();
  // §12 — même honnêteté que pour un nouveau candidat.
  await expect(page.getByText(/envoi bloqué par la politique/i)).toBeVisible();

  const usersAfter = (lib.getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;
  expect(usersAfter).toBe(usersBefore); // jamais un doublon de compte
  expect(notifCount(lib.getDb(), candidateId)).toBe(2); // original + renvoi réel
  expect(tokenCount(lib.getDb(), candidateId)).toBe(2); // nouveau jeton émis, jamais réutilisé
  const membership = lib.getDb().prepare(`SELECT 1 FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).get(groupTarget, candidateId);
  expect(membership).toBeTruthy();
});

// §20 G — candidat existant déjà ACTIF réaffecté à un second groupe :
// jamais de nouvelle invitation d'activation (n'aurait plus de sens),
// jamais de doublon, message honnête ("déjà actif").
test("G — candidat existant déjà actif réaffecté à un second groupe : aucune invitation renvoyée, aucun doublon", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const companyId = lib.createCompany({ name: `Active Co ${t}`, scope: "test", createdBy: admin.id });
  const groupOrigin = lib.createGroup({ companyId, name: `Active Grp Origin ${t}`, scope: "test", createdBy: admin.id });
  const groupTarget = lib.createGroup({ companyId, name: `Active Grp Target ${t}`, scope: "test", createdBy: admin.id });
  const candidateId = lib.createUser({ username: `${t}.active`, password: "x".repeat(10), fullName: `Active Candidat ${t}`, role: "candidate", email: `${t}.active@example.test` });
  const { addCandidateToGroup } = await import("../../lib/groups");
  addCandidateToGroup(groupOrigin, candidateId, admin.id);
  const usersBefore = (lib.getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;

  await loginAs(page, "admin");
  await page.goto(`/groups/${groupTarget}`);
  await page.getByLabel("Nom complet").fill(`Active Candidat ${t}`);
  await page.getByLabel("Identifiant").fill(`${t}.active`);
  await page.getByLabel("Email (invitation)").fill(`${t}.active@example.test`);
  await page.getByRole("button", { name: /^ajouter$/i }).click();

  await expect(page.getByText(/déjà actif.*ajouté au groupe/i)).toBeVisible();
  await expect(page.getByText(/aucune invitation d'activation n'est nécessaire/i)).toBeVisible();

  const usersAfter = (lib.getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;
  expect(usersAfter).toBe(usersBefore);
  expect(notifCount(lib.getDb(), candidateId)).toBe(0); // jamais d'invitation pour un compte déjà actif
  const membership = lib.getDb().prepare(`SELECT 1 FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).get(groupTarget, candidateId);
  expect(membership).toBeTruthy();
});

// §20 I — même flux, en tant qu'Administrateur : la correction du chemin
// Responsable ne casse jamais le chemin Administrateur (même action
// serveur pour les deux rôles, mais vérifié réellement, jamais supposé).
test("I — régression Administrateur : candidat existant pending_activation réaffecté, invitation renvoyée identiquement", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const companyId = lib.createCompany({ name: `AdminRegr Co ${t}`, scope: "test", createdBy: admin.id });
  const groupOrigin = lib.createGroup({ companyId, name: `AdminRegr Grp Origin ${t}`, scope: "test", createdBy: admin.id });
  const groupTarget = lib.createGroup({ companyId, name: `AdminRegr Grp Target ${t}`, scope: "test", createdBy: admin.id });
  const candidateId = lib.createUserPendingActivation({ username: `${t}.adminpending`, fullName: `Admin Pending ${t}`, role: "candidate", email: `${t}.adminpending@example.test` });
  const { addCandidateToGroup } = await import("../../lib/groups");
  addCandidateToGroup(groupOrigin, candidateId, admin.id);
  const { createActivationToken } = await import("../../lib/activation-tokens");
  createActivationToken({ userId: candidateId, purpose: "account_setup", createdBy: admin.id });
  seedPriorInvitation(lib.getDb(), candidateId, companyId);

  await loginAs(page, "admin");
  await page.goto(`/groups/${groupTarget}`);
  await page.getByLabel("Nom complet").fill(`Admin Pending ${t}`);
  await page.getByLabel("Identifiant").fill(`${t}.adminpending`);
  await page.getByLabel("Email (invitation)").fill(`${t}.adminpending@example.test`);
  await page.getByRole("button", { name: /^ajouter$/i }).click();

  await expect(page.getByText(/en attente d'activation.*ajouté au groupe/i)).toBeVisible();
  expect(notifCount(lib.getDb(), candidateId)).toBe(2);
  expect(tokenCount(lib.getDb(), candidateId)).toBe(2);
});

// §15 — sélectionner "Invitation sécurisée" n'exécute jamais "Accès
// temporaire" et vice versa, même pour un candidat existant
// pending_activation : vérifié en choisissant explicitement la méthode B
// pour un candidat existant et en s'assurant qu'un mot de passe temporaire
// (jamais une invitation classique) est bien ce qui est produit.
test("§15 — candidat existant pending_activation + méthode 'Accès temporaire' : accès temporaire créé, jamais une invitation classique", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const companyId = lib.createCompany({ name: `TempExisting Co ${t}`, scope: "test", createdBy: admin.id });
  const groupOrigin = lib.createGroup({ companyId, name: `TempExisting Grp Origin ${t}`, scope: "test", createdBy: admin.id });
  const groupTarget = lib.createGroup({ companyId, name: `TempExisting Grp Target ${t}`, scope: "test", createdBy: admin.id });
  const candidateId = lib.createUserPendingActivation({ username: `${t}.temppending`, fullName: `Temp Pending ${t}`, role: "candidate", email: `${t}.temppending@example.test` });
  const { addCandidateToGroup } = await import("../../lib/groups");
  addCandidateToGroup(groupOrigin, candidateId, admin.id);

  await loginAs(page, "admin");
  await page.goto(`/groups/${groupTarget}`);
  await page.getByLabel("Nom complet").fill(`Temp Pending ${t}`);
  await page.getByLabel("Identifiant").fill(`${t}.temppending`);
  await page.getByLabel("Email (invitation)").fill(`${t}.temppending@example.test`);
  await page.getByLabel(/créer un accès temporaire/i).check();
  await page.getByRole("button", { name: /confirmer cette méthode/i }).click();
  await page.getByRole("button", { name: /^ajouter$/i }).click();

  await expect(page.getByText("Affichage unique")).toBeVisible();
  await expect(page.getByText("Mot de passe temporaire", { exact: true })).toBeVisible();
  expect(tokenCount(lib.getDb(), candidateId)).toBe(0); // jamais de jeton d'invitation classique émis
});
