import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers";

// Scénario S — mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30)
// §45 : sécurité de l'accès temporaire (Groupe → Ajouter un candidat →
// méthode B). "securely generated; valid first login; forced password
// change; temp password invalid afterward; expired denied; suspended/
// archived denied; plaintext not in DB/logs/audit; email contains
// username+temp password only at creation; admin cannot retrieve
// afterward." Même discipline DB_PATH que scenario-q/r (voir leur
// commentaire d'en-tête).
process.env.DB_PATH = "./data/e2e-test.db";

function uniqueTag() {
  return `s${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function importLib() {
  const { findUserByUsername } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup } = await import("../../lib/groups");
  const { getDb } = await import("../../lib/db");
  return { findUserByUsername, createCompany, createGroup, getDb };
}

test.describe.configure({ mode: "serial" });

test("ACCÈS TEMPORAIRE — génération, première connexion valide, changement forcé, ancien mot de passe invalide ensuite, jamais réaffiché à l'admin, jamais en clair en base", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;

  const companyId = lib.createCompany({ name: `Temp Pwd Co ${t}`, scope: "test", createdBy: admin.id });
  const groupId = lib.createGroup({ companyId, name: `Temp Pwd Grp ${t}`, scope: "test", createdBy: admin.id });

  await loginAs(page, "admin");
  await page.goto(`/groups/${groupId}`);

  await page.getByLabel("Nom complet").fill(`Temp Pwd Candidat ${t}`);
  await page.getByLabel("Identifiant").fill(`${t}.tempuser`);
  await page.getByLabel("Email (invitation)").fill(`${t}.tempuser@example.test`);
  await page.getByLabel(/B\. Créer un accès temporaire/).check();
  await page.getByRole("button", { name: /confirmer cette méthode/i }).click();
  await page.getByRole("button", { name: /^ajouter$/i }).click();

  // --- Affichage unique : mot de passe visible ICI, une seule fois ---
  await expect(page.getByText(/affichage unique/i)).toBeVisible();
  const passwordBlock = page.locator("p.font-mono");
  await expect(passwordBlock).toBeVisible();
  const tempPassword = (await passwordBlock.textContent())!.trim();
  // §45 "securely generated" — vérifie une longueur réelle (jamais un
  // mot de passe trivial/court), sans dépendre d'un format exact.
  expect(tempPassword.length).toBeGreaterThanOrEqual(12);

  // --- "admin cannot retrieve afterward" : un rafraîchissement de la
  // page ne réaffiche plus jamais ce mot de passe nulle part. ---
  await page.reload();
  await expect(page.getByText(tempPassword)).toHaveCount(0);
  await expect(page.getByText(/affichage unique/i)).toHaveCount(0);
  await expect(page.getByText(/voir le mot de passe|afficher le mot de passe plus tard|copier le mot de passe historique/i)).toHaveCount(0);

  // --- "plaintext not in DB/logs/audit" : ni password_hash (par
  // construction, un hash n'est jamais le clair), ni le corps d'email
  // rendu (purgé après un envoi terminal, EMAIL_MODE=log purge dès
  // SENT — voir lib/email/send.ts::purgeRenderedBodyIfTerminal), ni la
  // table d'audit ne contiennent jamais la chaîne en clair. ---
  const userRow = lib.getDb().prepare(`SELECT id, password_hash FROM users WHERE username = ?`).get(`${t}.tempuser`) as { id: number; password_hash: string };
  expect(userRow.password_hash).not.toContain(tempPassword);
  const notifRow = lib.getDb().prepare(`SELECT rendered_html, rendered_text, subject FROM notification_log WHERE event_type = 'TEMPORARY_ACCESS_CREATED' AND user_id = ?`).get(userRow.id) as
    | { rendered_html: string | null; rendered_text: string | null; subject: string }
    | undefined;
  expect(notifRow).toBeTruthy();
  expect(notifRow!.rendered_html).toBeNull();
  expect(notifRow!.rendered_text).toBeNull();
  expect(notifRow!.subject).not.toContain(tempPassword);
  const auditRows = lib.getDb().prepare(`SELECT metadata_json FROM audit_logs WHERE target_type = 'user' AND target_id = ?`).all(userRow.id) as { metadata_json: string | null }[];
  for (const row of auditRows) {
    expect(row.metadata_json ?? "").not.toContain(tempPassword);
  }

  // --- "valid first login" + "forced password change" : le candidat se
  // connecte avec le mot de passe temporaire, est immédiatement redirigé
  // vers le changement obligatoire — AUCUNE autre page n'est accessible
  // avant. ---
  await logout(page);
  await loginAs(page, `${t}.tempuser`, tempPassword);
  await expect(page).toHaveURL(/\/mot-de-passe\/changer-obligatoire/);

  // Une tentative directe vers une autre page protégée reste redirigée
  // ici — l'application centrale (app/(app)/layout.tsx), pas une garde
  // par page qu'on pourrait oublier d'ajouter.
  await page.goto("/mes-examens");
  await expect(page).toHaveURL(/\/mot-de-passe\/changer-obligatoire/);

  const newPassword = "MonNouveauMotDePasse2026!";
  await page.getByLabel("Nouveau mot de passe").fill(newPassword);
  await page.getByLabel("Confirmer").fill(newPassword);
  await page.getByRole("button", { name: /définir mon mot de passe/i }).click();
  await expect(page.getByText(/mot de passe défini/i)).toBeVisible();
  await page.getByRole("link", { name: /continuer/i }).click();
  await expect(page).not.toHaveURL(/\/mot-de-passe\/changer-obligatoire/);

  // --- "temp password invalid afterward" : l'ancien mot de passe
  // temporaire ne fonctionne plus jamais. ---
  await logout(page);
  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(`${t}.tempuser`);
  await page.getByLabel("Mot de passe").fill(tempPassword);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page.getByText(/identifiant ou mot de passe incorrect/i)).toBeVisible();

  // --- Le NOUVEAU mot de passe, lui, fonctionne réellement et ne
  // redirige plus vers le changement obligatoire. ---
  await loginAs(page, `${t}.tempuser`, newPassword);
  await expect(page).not.toHaveURL(/\/mot-de-passe\/changer-obligatoire/);
});

test("ACCÈS TEMPORAIRE — expiré refusé avec un message explicite, jamais un contournement silencieux", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const { createTemporaryAccess } = await import("../../lib/temp-password");
  const { createUser } = await import("../../lib/users");

  const userId = createUser({ username: `${t}.expired`, password: "x".repeat(10), fullName: `Expired ${t}`, role: "candidate" });
  const { plaintext } = createTemporaryAccess(userId);
  // Force l'expiration DIRECTEMENT en base (jamais d'attente réelle de
  // 24h dans un test) — même discipline que d'autres tests de ce projet
  // qui manipulent directement une date d'expiration (voir
  // activation-tokens, MFA reset).
  lib.getDb().prepare(`UPDATE users SET temp_password_expires_at = ? WHERE id = ?`).run(new Date(Date.now() - 60_000).toISOString(), userId);

  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(`${t}.expired`);
  await page.getByLabel("Mot de passe").fill(plaintext);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page.getByText(/mot de passe temporaire a expiré/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("ACCÈS TEMPORAIRE — un compte suspendu ou archivé refuse la connexion même avec un accès temporaire valide (non expiré)", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const { createTemporaryAccess } = await import("../../lib/temp-password");
  const { createUser, setUserStatus } = await import("../../lib/users");

  const suspendedId = createUser({ username: `${t}.susp`, password: "x".repeat(10), fullName: `Suspendu ${t}`, role: "candidate" });
  const { plaintext: suspendedPwd } = createTemporaryAccess(suspendedId);
  setUserStatus(suspendedId, "suspended");

  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(`${t}.susp`);
  await page.getByLabel("Mot de passe").fill(suspendedPwd);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page.getByText(/ce compte est suspendu/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);

  const archivedId = createUser({ username: `${t}.arch`, password: "x".repeat(10), fullName: `Archivé ${t}`, role: "candidate" });
  const { plaintext: archivedPwd } = createTemporaryAccess(archivedId);
  setUserStatus(archivedId, "archived");

  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(`${t}.arch`);
  await page.getByLabel("Mot de passe").fill(archivedPwd);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page.getByText(/ce compte a été archivé/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
