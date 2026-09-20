import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Issue #95 — preuve E2E de la vraie frontière formulaire -> Server Action
// -> SQLite pour l'import candidat. Les tests unitaires de parseCsv()
// prouvent la grammaire CSV ; ce fichier prouve surtout que les entrées
// invalides/malformées n'ont AUCUN effet de provisioning et que les gardes
// tenant restent actives sur le nouveau chemin bulk.
process.env.DB_PATH = "./data/e2e-test.db";
process.env.APP_BASE_URL = "http://127.0.0.1:3101";

function uniqueTag() {
  return `ab${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function importLib() {
  const { createUser, findUserByUsername } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { getDb } = await import("../../lib/db");
  return { createUser, findUserByUsername, createCompany, createGroup, addCandidateToGroup, getDb };
}

type Db = ReturnType<Awaited<ReturnType<typeof importLib>>["getDb"]>;

function provisioningCounts(db: Db) {
  const count = (table: string) => (db.prepare(`SELECT COUNT(*) n FROM ${table}`).get() as { n: number }).n;
  return {
    users: count("users"),
    userRoles: count("user_roles"),
    groupMembers: count("group_members"),
    activationTokens: count("activation_tokens"),
    notifications: count("notification_log"),
  };
}

async function openBulkImporter(page: import("@playwright/test").Page, groupId: number) {
  await page.goto(`/groups/${groupId}`);
  await page.getByRole("button", { name: /import csv en masse/i }).click();
  return page.locator('textarea[name="csv"]');
}

test.describe.configure({ mode: "serial" });

test("#95 — email invalide : zéro user/rôle/membership/token/notification", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const companyId = lib.createCompany({ name: `CSV Invalid Co ${t}`, scope: "test", createdBy: admin.id });
  const groupId = lib.createGroup({ companyId, name: `CSV Invalid Grp ${t}`, scope: "test", createdBy: admin.id });
  const before = provisioningCounts(lib.getDb());

  await loginAs(page, "admin");
  const textarea = await openBulkImporter(page, groupId);
  await textarea.fill(`full_name,username,email\nInvalid Candidate ${t},${t}.invalid,not-an-email`);
  await page.getByRole("button", { name: /^importer$/i }).click();

  await expect(page.getByText(/adresse email invalide/i)).toBeVisible();
  expect(provisioningCounts(lib.getDb())).toEqual(before);
  expect(lib.findUserByUsername(`${t}.invalid`)).toBeUndefined();
});

test("#95 — CSV malformé (guillemet non fermé) : zéro effet de provisioning", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const companyId = lib.createCompany({ name: `CSV Malformed Co ${t}`, scope: "test", createdBy: admin.id });
  const groupId = lib.createGroup({ companyId, name: `CSV Malformed Grp ${t}`, scope: "test", createdBy: admin.id });
  const before = provisioningCounts(lib.getDb());

  await loginAs(page, "admin");
  const textarea = await openBulkImporter(page, groupId);
  await textarea.fill(`full_name,username,email\n"Broken Candidate ${t},${t}.broken,${t}.broken@example.test`);
  await page.getByRole("button", { name: /^importer$/i }).click();

  await expect(page.getByText(/guillemet csv non fermé/i)).toBeVisible();
  expect(provisioningCounts(lib.getDb())).toEqual(before);
  expect(lib.findUserByUsername(`${t}.broken`)).toBeUndefined();
});

test("#95 — nom avec virgule cité : identité exacte, membership, token et notification créés", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const companyId = lib.createCompany({ name: `CSV Quoted Co ${t}`, scope: "test", createdBy: admin.id });
  const groupId = lib.createGroup({ companyId, name: `CSV Quoted Grp ${t}`, scope: "test", createdBy: admin.id });

  await loginAs(page, "admin");
  const textarea = await openBulkImporter(page, groupId);
  await textarea.fill(`full_name,username,email\n"Benali, Amina",${t}.quoted,${t}.quoted@example.test`);
  await page.getByRole("button", { name: /^importer$/i }).click();

  await expect(page.getByText(/créé et ajouté/i)).toBeVisible();
  const candidate = lib.findUserByUsername(`${t}.quoted`)!;
  expect(candidate).toBeTruthy();
  expect(candidate.full_name).toBe("Benali, Amina");

  const db = lib.getDb();
  const membership = db.prepare(`SELECT 1 FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).get(groupId, candidate.id);
  expect(membership).toBeTruthy();
  const tokens = (db.prepare(`SELECT COUNT(*) n FROM activation_tokens WHERE user_id = ? AND purpose = 'account_setup'`).get(candidate.id) as { n: number }).n;
  const notifications = (db.prepare(`SELECT COUNT(*) n FROM notification_log WHERE user_id = ? AND event_type = 'ACCOUNT_CREATED'`).get(candidate.id) as { n: number }).n;
  expect(tokens).toBe(1);
  expect(notifications).toBe(1);
});

test("#95 — conflit cross-tenant via bulk : message générique, aucun rattachement ni nouveau compte", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;

  const managerA = lib.createUser({ username: `${t}.mgrA`, password: "x".repeat(10), fullName: `Manager A ${t}`, role: "pedagogical_manager" });
  const companyA = lib.createCompany({ name: `CSV Cross A ${t}`, scope: "test", createdBy: admin.id });
  const groupA = lib.createGroup({ companyId: companyA, name: `CSV Cross Grp A ${t}`, scope: "test", pedagogicalManagerId: managerA, createdBy: admin.id });
  const candidateA = lib.createUser({ username: `${t}.candidate`, password: "x".repeat(10), fullName: `Cross Candidate ${t}`, role: "candidate", email: `${t}.candidate@example.test` });
  lib.addCandidateToGroup(groupA, candidateA, admin.id);

  const managerB = lib.createUser({ username: `${t}.mgrB`, password: "x".repeat(10), fullName: `Manager B ${t}`, role: "pedagogical_manager" });
  const companyB = lib.createCompany({ name: `CSV Cross B ${t}`, scope: "test", createdBy: admin.id });
  const groupB = lib.createGroup({ companyId: companyB, name: `CSV Cross Grp B ${t}`, scope: "test", pedagogicalManagerId: managerB, createdBy: admin.id });
  const usersBefore = (lib.getDb().prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;

  await loginAs(page, `${t}.mgrB`, "x".repeat(10));
  const textarea = await openBulkImporter(page, groupB);
  await textarea.fill(`full_name,username,email\nCross Candidate ${t},${t}.candidate,${t}.candidate@example.test`);
  await page.getByRole("button", { name: /^importer$/i }).click();

  await expect(page.getByText("Un compte utilisant cet identifiant ou cette adresse existe déjà. Contactez l'administrateur.")).toBeVisible();
  await expect(page.getByText(`CSV Cross A ${t}`)).toHaveCount(0);
  await expect(page.getByText(`CSV Cross Grp A ${t}`)).toHaveCount(0);

  const db = lib.getDb();
  const membership = db.prepare(`SELECT 1 FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).get(groupB, candidateA);
  expect(membership).toBeFalsy();
  const usersAfter = (db.prepare(`SELECT COUNT(*) n FROM users`).get() as { n: number }).n;
  expect(usersAfter).toBe(usersBefore);
});
