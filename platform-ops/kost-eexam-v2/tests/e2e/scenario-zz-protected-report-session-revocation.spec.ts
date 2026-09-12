import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// #62 — direct route-level proof that the migrated protected report GETs
// revalidate the authoritative DB session/lifecycle on every request.
// This deliberately mutates only the disposable E2E SQLite database; no
// production/session data is touched.
process.env.DB_PATH = "./data/e2e-test.db";

async function testLib() {
  const { getDb } = await import("../../lib/db");
  const { findUserByUsername } = await import("../../lib/users");
  const { revokeDbSession } = await import("../../lib/sessions-registry");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup } = await import("../../lib/groups");
  const { createFamiliarizationSession } = await import("../../lib/familiarization");
  return { getDb, findUserByUsername, revokeDbSession, createCompany, createGroup, createFamiliarizationSession };
}

function latestActiveSessionId(db: ReturnType<Awaited<ReturnType<typeof testLib>>["getDb"]>, userId: number): number {
  const row = db
    .prepare(`SELECT id FROM sessions WHERE user_id = ? AND revoked_at IS NULL ORDER BY id DESC LIMIT 1`)
    .get(userId) as { id: number } | undefined;
  if (!row) throw new Error(`No active DB session found for E2E user ${userId}`);
  return row.id;
}

test.describe.configure({ mode: "serial" });

test("candidate own individual PDF stops immediately after DB-session revocation", async ({ page }) => {
  const lib = await testLib();
  const db = lib.getDb();
  const candidate = lib.findUserByUsername("candidat1.demo")!;
  const admin = lib.findUserByUsername("admin")!;

  // Scenario C (which runs earlier with one worker) leaves a real completed
  // demo attempt. Pick only an attempt whose result is actually releasable
  // now, so the first 200 proves the candidate-own route is valid before
  // we revoke the server-side session.
  const attempt = db
    .prepare(
      `SELECT at.id
       FROM attempts at
       JOIN assessments a ON a.id = at.assessment_id
       JOIN results r ON r.attempt_id = at.id
       WHERE at.candidate_user_id = ?
         AND at.status IN ('submitted','auto_submitted')
         AND a.show_result = 1
         AND (a.feedback_mode != 'deferred' OR a.close_at IS NULL OR a.close_at <= ?)
       ORDER BY at.id DESC
       LIMIT 1`
    )
    .get(candidate.id, new Date().toISOString()) as { id: number } | undefined;
  if (!attempt) throw new Error("Expected a releasable completed attempt for candidat1.demo");

  await loginAs(page, "candidat1.demo");
  const before = await page.request.get(`/api/reports/individual/${attempt.id}`);
  expect(before.status()).toBe(200);
  expect(before.headers()["content-type"]).toContain("application/pdf");

  const dbSessionId = latestActiveSessionId(db, candidate.id);
  lib.revokeDbSession(dbSessionId, admin.id);

  const after = await page.request.get(`/api/reports/individual/${attempt.id}`);
  expect(after.status()).toBe(403);
  expect(after.headers()["content-type"] ?? "").not.toContain("application/pdf");
});

test("attendance PDF preserves tenant scope, then stops immediately after manager DB-session revocation", async ({ page }) => {
  const lib = await testLib();
  const db = lib.getDb();
  const manager = lib.findUserByUsername("responsable.demo")!;
  const admin = lib.findUserByUsername("admin")!;

  const ownGroup = db
    .prepare(`SELECT id FROM groups WHERE pedagogical_manager_id = ? ORDER BY id LIMIT 1`)
    .get(manager.id) as { id: number } | undefined;
  if (!ownGroup) throw new Error("Expected a demo group managed by responsable.demo");

  const ownSessionId = lib.createFamiliarizationSession({
    groupId: ownGroup.id,
    functionCode: "7.1",
    heldAt: new Date().toISOString(),
    location: "E2E #62",
    organizedBy: manager.id,
    organizerRole: "pedagogical_manager",
    audience: "candidats",
  });

  // A distinct group with no pedagogical manager is outside the manager's
  // tenant scope. The shared DB-backed auth guard must not weaken this
  // pre-existing resource-scope denial.
  const outsiderCompanyId = lib.createCompany({ name: `#62 outsider ${Date.now()}`, scope: "test", createdBy: admin.id });
  const outsiderGroupId = lib.createGroup({
    companyId: outsiderCompanyId,
    name: `#62 outsider group ${Date.now()}`,
    scope: "test",
    createdBy: admin.id,
  });
  const outsiderSessionId = lib.createFamiliarizationSession({
    groupId: outsiderGroupId,
    functionCode: "7.1",
    heldAt: new Date().toISOString(),
    location: "E2E #62 outsider",
    organizedBy: admin.id,
    organizerRole: "administrator",
    audience: "candidats",
  });

  await loginAs(page, "responsable.demo");

  const ownBefore = await page.request.get(`/api/reports/attendance-sheet/${ownSessionId}`);
  expect(ownBefore.status()).toBe(200);
  expect(ownBefore.headers()["content-type"]).toContain("application/pdf");

  const crossTenant = await page.request.get(`/api/reports/attendance-sheet/${outsiderSessionId}`);
  expect(crossTenant.status()).toBe(404);

  const dbSessionId = latestActiveSessionId(db, manager.id);
  lib.revokeDbSession(dbSessionId, admin.id);

  const ownAfter = await page.request.get(`/api/reports/attendance-sheet/${ownSessionId}`);
  expect(ownAfter.status()).toBe(403);
  expect(ownAfter.headers()["content-type"] ?? "").not.toContain("application/pdf");
});

test("staff-only operational PDF rejects a still-unrevoked cookie as soon as the account is suspended", async ({ page }) => {
  const lib = await testLib();
  const db = lib.getDb();
  const admin = lib.findUserByUsername("admin")!;

  await loginAs(page, "admin");
  const before = await page.request.get("/api/reports/server-characteristics");
  expect(before.status()).toBe(200);
  expect(before.headers()["content-type"]).toContain("application/pdf");

  // Intentionally leave the sessions row unrevoked: this is the exact
  // defense-in-depth case from #62/#52. requireRole() must re-read the
  // current user lifecycle and reject the otherwise still-valid cookie.
  db.prepare(`UPDATE users SET status = 'suspended' WHERE id = ?`).run(admin.id);
  try {
    const after = await page.request.get("/api/reports/server-characteristics");
    expect(after.status()).toBe(403);
    expect(after.headers()["content-type"] ?? "").not.toContain("application/pdf");
  } finally {
    // Restore the seed account in the disposable test DB even though this
    // zz spec normally runs last; keeps the test self-contained on retries.
    db.prepare(`UPDATE users SET status = 'active' WHERE id = ?`).run(admin.id);
  }
});
