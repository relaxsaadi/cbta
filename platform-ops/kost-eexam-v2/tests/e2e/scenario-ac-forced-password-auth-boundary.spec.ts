import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Issue #56 — preuve E2E de la vraie frontière stale page -> Server Action
// -> SQLite. Le navigateur charge d'abord une page autorisée, puis l'état DB
// courant bascule must_change_password=1 AVANT le POST de l'action. Une
// simple protection de layout serait alors contournable ; requireRole() doit
// au contraire relire l'état autoritatif au moment exact de l'opération.
process.env.DB_PATH = "./data/e2e-test.db";
process.env.APP_BASE_URL = "http://127.0.0.1:3101";

function uniqueTag() {
  return `ac${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function importLib() {
  const { findUserByUsername, findUserById } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup } = await import("../../lib/groups");
  const { getDb } = await import("../../lib/db");
  return { findUserByUsername, findUserById, createCompany, createGroup, getDb };
}

function importAuditCount(db: ReturnType<Awaited<ReturnType<typeof importLib>>["getDb"]>, groupId: number) {
  return (
    db
      .prepare(
        `SELECT COUNT(*) AS n
         FROM audit_logs
         WHERE target_type = 'group'
           AND target_id = ?
           AND action IN ('candidate_bulk_import', 'candidate_bulk_import_denied')`
      )
      .get(groupId) as { n: number }
  ).n;
}

test("#56 — stale page cannot POST a protected Server Action after must_change_password becomes current DB state", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const db = lib.getDb();
  const admin = lib.findUserByUsername("admin")!;
  const companyId = lib.createCompany({
    name: `Forced Authz Co ${t}`,
    scope: "test",
    createdBy: admin.id,
  });
  const groupId = lib.createGroup({
    companyId,
    name: `Forced Authz Group ${t}`,
    scope: "test",
    createdBy: admin.id,
  });
  const candidateUsername = `${t}.must-not-exist`;

  await loginAs(page, "admin");
  await page.goto(`/groups/${groupId}`);
  await page.getByRole("button", { name: /import csv en masse/i }).click();
  const textarea = page.locator('textarea[name="csv"]');
  await expect(textarea).toBeVisible();

  const usersBefore = (db.prepare(`SELECT COUNT(*) AS n FROM users`).get() as { n: number }).n;
  const membersBefore = (db.prepare(`SELECT COUNT(*) AS n FROM group_members`).get() as { n: number }).n;
  const auditsBefore = importAuditCount(db, groupId);

  // Simule un état concurrent/administratif devenu vrai APRÈS le rendu de la
  // page. C'est précisément le cas qu'un redirect de layout ne peut protéger.
  db.prepare(`UPDATE users SET must_change_password = 1 WHERE id = ?`).run(admin.id);

  try {
    await textarea.fill(
      `full_name,username,email\nBlocked ${t},${candidateUsername},${candidateUsername}@example.test`
    );

    const post = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === `/groups/${groupId}`
    );
    await page.getByRole("button", { name: /^importer$/i }).click();
    await post;

    // La garde doit échouer AVANT toute logique métier/audit de l'import.
    expect(lib.findUserByUsername(candidateUsername)).toBeUndefined();
    expect((db.prepare(`SELECT COUNT(*) AS n FROM users`).get() as { n: number }).n).toBe(usersBefore);
    expect((db.prepare(`SELECT COUNT(*) AS n FROM group_members`).get() as { n: number }).n).toBe(
      membersBefore
    );
    expect(importAuditCount(db, groupId)).toBe(auditsBefore);
    expect(lib.findUserById(admin.id)?.must_change_password).toBe(1);

    // La session n'est volontairement PAS détruite pour cet état : la surface
    // minimale de contrôle (logout et changement obligatoire) doit rester
    // atteignable. Le logout API ne passe pas par requireRole().
    const logoutResponse = await page.request.post("/api/auth/logout");
    expect(logoutResponse.ok()).toBeTruthy();
  } finally {
    // Ne pas contaminer les autres scénarios E2E qui partagent la base jetable.
    db.prepare(`UPDATE users SET must_change_password = 0, temp_password_expires_at = NULL WHERE id = ?`).run(
      admin.id
    );
  }
});
