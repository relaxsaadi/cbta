import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers";

// Scénario T — mission "FIX NESRINE/FETHI STAGING DELIVERY + PREVENT
// DUPLICATE CANDIDATE CREATION" (2026-08-30) §10 A-H : couverture E2E
// réelle de lib/duplicate-check.ts à travers les vrais points d'entrée
// (assistant /users/nouveau, "Ajouter un candidat" sur /groups/[id],
// édition de profil sur /users/[id]) — jamais seulement la fonction pure
// (déjà couverte par tests/unit/duplicate-account-detection.test.ts) ni
// seulement "les contrôles existent" (§10 : "Do not claim PASS merely
// because controls render"). Même discipline DB_PATH que scenario-q/r/s
// (voir leur commentaire d'en-tête).
process.env.DB_PATH = "./data/e2e-test.db";

function uniqueTag() {
  return `t${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function importLib() {
  const { createUser, findUserByUsername, findUserById } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { getDb } = await import("../../lib/db");
  return { createUser, findUserByUsername, findUserById, createCompany, createGroup, addCandidateToGroup, getDb };
}

test.describe.configure({ mode: "serial" });

test("A — /users/nouveau : même identifiant normalisé (casse/espaces différents) refusé avec message + lien, aucun second compte créé", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const originalId = lib.createUser({ username: `${t}.original`, password: "x".repeat(10), fullName: `Original ${t}`, role: "candidate" });

  const before = (lib.getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;

  await loginAs(page, "admin");
  await page.goto("/users/nouveau");
  await page.getByLabel("Nom complet").fill(`Duplicate Attempt ${t}`);
  // Même identifiant, casse ET espaces de bord différents.
  await page.getByLabel("Identifiant de connexion").fill(`  ${t.toUpperCase()}.ORIGINAL  `);
  await page.getByRole("button", { name: /créer sans envoyer maintenant/i }).click();

  await expect(page.getByText("Un compte correspondant existe déjà.")).toBeVisible();
  await expect(page.getByRole("link", { name: /voir le compte/i })).toHaveAttribute("href", `/users/${originalId}`);

  const after = (lib.getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;
  expect(after).toBe(before);
});

test("B — /users/nouveau : même email normalisé (identifiant totalement différent) refusé, aucun second compte créé", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const originalId = lib.createUser({ username: `${t}.userB`, password: "x".repeat(10), fullName: `User B ${t}`, role: "candidate", email: `${t}.shared@example.test` });
  const before = (lib.getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;

  await loginAs(page, "admin");
  await page.goto("/users/nouveau");
  await page.getByLabel("Nom complet").fill(`Duplicate Email Attempt ${t}`);
  await page.getByLabel("Identifiant de connexion").fill(`${t}.completelydifferent`);
  await page.getByLabel("Email").fill(`  ${t.toUpperCase()}.SHARED@EXAMPLE.TEST  `);
  await page.getByRole("button", { name: /créer sans envoyer maintenant/i }).click();

  await expect(page.getByText("Un compte correspondant existe déjà.")).toBeVisible();
  await expect(page.getByRole("link", { name: /voir le compte/i })).toHaveAttribute("href", `/users/${originalId}`);

  const after = (lib.getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;
  expect(after).toBe(before);
});

test("C — /groups/[id] Ajouter un candidat : identifiant d'un candidat déjà existant réutilise le compte, ne le recrée jamais", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const companyId = lib.createCompany({ name: `Reuse Co ${t}`, scope: "test", createdBy: admin.id });
  const groupOrigin = lib.createGroup({ companyId, name: `Reuse Grp Origin ${t}`, scope: "test", createdBy: admin.id });
  const groupTarget = lib.createGroup({ companyId, name: `Reuse Grp Target ${t}`, scope: "test", createdBy: admin.id });
  const candidateId = lib.createUser({ username: `${t}.reuse`, password: "x".repeat(10), fullName: `Reuse Candidat ${t}`, role: "candidate", email: `${t}.reuse@example.test` });
  lib.addCandidateToGroup(groupOrigin, candidateId, admin.id);
  const before = (lib.getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;

  await loginAs(page, "admin");
  await page.goto(`/groups/${groupTarget}`);
  await page.getByLabel("Nom complet").fill(`Reuse Candidat ${t}`);
  await page.getByLabel("Identifiant").fill(`${t}.reuse`);
  await page.getByLabel("Email (invitation)").fill(`${t}.reuse@example.test`);
  await page.getByRole("button", { name: /^ajouter$/i }).click();

  await expect(page.getByText(/compte existant.*ajouté au groupe/i)).toBeVisible();

  const after = (lib.getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;
  expect(after).toBe(before);
  const membership = lib.getDb().prepare(`SELECT 1 FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).get(groupTarget, candidateId);
  expect(membership).toBeTruthy();
});

test("D — /groups/[id] Ajouter un candidat : conflit cross-tenant refusé avec un message générique, aucune fuite, aucune affectation silencieuse", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;

  // Tenant A — candidat réel géré par managerA.
  const managerA = lib.createUser({ username: `${t}.mgrA`, password: "x".repeat(10), fullName: `Manager A ${t}`, role: "pedagogical_manager" });
  const companyA = lib.createCompany({ name: `Cross Co A ${t}`, scope: "test", createdBy: admin.id });
  const groupA = lib.createGroup({ companyId: companyA, name: `Cross Grp A ${t}`, scope: "test", pedagogicalManagerId: managerA, createdBy: admin.id });
  const candidateA = lib.createUser({ username: `${t}.crossCand`, password: "x".repeat(10), fullName: `Cross Candidat A ${t}`, role: "candidate", email: `${t}.crosscand@example.test` });
  lib.addCandidateToGroup(groupA, candidateA, admin.id);

  // Tenant B — managerB gère un groupe totalement distinct, aucune visibilité sur candidateA.
  const managerB = lib.createUser({ username: `${t}.mgrB`, password: "x".repeat(10), fullName: `Manager B ${t}`, role: "pedagogical_manager" });
  const companyB = lib.createCompany({ name: `Cross Co B ${t}`, scope: "test", createdBy: admin.id });
  const groupB = lib.createGroup({ companyId: companyB, name: `Cross Grp B ${t}`, scope: "test", pedagogicalManagerId: managerB, createdBy: admin.id });

  await loginAs(page, `${t}.mgrB`, "x".repeat(10));
  await page.goto(`/groups/${groupB}`);
  await page.getByLabel("Nom complet").fill(`Cross Candidat A ${t}`);
  // Même identifiant EXACT que candidateA — managerB ne devrait jamais
  // pouvoir le rattacher silencieusement à SON groupe.
  await page.getByLabel("Identifiant").fill(`${t}.crossCand`);
  await page.getByLabel("Email (invitation)").fill(`${t}.crosscand@example.test`);
  await page.getByRole("button", { name: /^ajouter$/i }).click();

  await expect(page.getByText("Un compte utilisant cet identifiant ou cette adresse existe déjà. Contactez l'administrateur.")).toBeVisible();
  // Jamais de fuite : ni le nom de l'entreprise A, ni celui du groupe A
  // ne doivent jamais apparaître sur cette page pour managerB.
  await expect(page.getByText(`Cross Co A ${t}`)).toHaveCount(0);
  await expect(page.getByText(`Cross Grp A ${t}`)).toHaveCount(0);

  const membership = lib.getDb().prepare(`SELECT 1 FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).get(groupB, candidateA);
  expect(membership).toBeFalsy();
  const stillOnlyInA = lib.getDb().prepare(`SELECT COUNT(*) n FROM group_members WHERE candidate_user_id = ?`).get(candidateA) as { n: number };
  expect(stillOnlyInA.n).toBe(1);
});

test("G — /users/[id] Modifier : un changement d'email réel est audité distinctement (emailChanged, ancien/nouveau)", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const targetId = lib.createUser({ username: `${t}.editme`, password: "x".repeat(10), fullName: `Edit Me ${t}`, role: "candidate", email: `${t}.old@example.test` });

  await loginAs(page, "admin");
  await page.goto(`/users/${targetId}`);
  await page.getByRole("button", { name: /^modifier$/i }).click();
  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill(`${t}.new@example.test`);
  await page.getByRole("button", { name: /^enregistrer$/i }).click();
  await expect(page.getByText("Fiche mise à jour.")).toBeVisible();

  const row = lib.getDb()
    .prepare(`SELECT metadata_json FROM audit_logs WHERE target_type = 'user' AND target_id = ? AND action = 'user_edited' ORDER BY id DESC LIMIT 1`)
    .get(targetId) as { metadata_json: string } | undefined;
  expect(row).toBeTruthy();
  const metadata = JSON.parse(row!.metadata_json);
  expect(metadata.emailChanged).toBe(true);
  expect(metadata.oldEmail).toBe(`${t}.old@example.test`);
  expect(metadata.newEmail).toBe(`${t}.new@example.test`);
  // Note : EMAIL_FORMAT_RE côté serveur (editUserAction) est une défense
  // en profondeur pour un appel direct de la Server Action (jamais
  // testable via ce formulaire réel — <input type="email"> refuse déjà
  // "pas-un-email" au niveau du navigateur avant toute soumission,
  // constaté en écrivant ce test).
});
