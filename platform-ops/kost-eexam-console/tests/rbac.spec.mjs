import { test, expect } from '@playwright/test';
import 'dotenv/config';

// Rebuilt equivalent of the lost scratchpad's authz-test.mjs / auditor-role-test.mjs.
// Tests SERVER-SIDE authorization (real login attempts + real redirects/errors
// returned by the live app), not merely whether a UI element is hidden.
//
// Findings recorded here (2026-08-25 provisioning pass, see
// docs/PLATFORM_READINESS_REPORT.md Gate C for full evidence):
// - The console's authorization has TWO independent server-side gates: (1) the
//   logged-in Moodle user must hold a recognized console role, and (2) the
//   user must be explicitly present in the Moodle external service
//   "KOST E-EXAM Console" (kost_eexam_console, restrictedusers=1) authorized
//   list (mdl_external_services_users). Both are enforced; neither alone is
//   sufficient. This is a genuine defense-in-depth control, not a bug.
// - Only two console roles are actually implemented and functional today:
//   kost_console_admin_role (full access) and kost_console_auditor_role
//   (intended read-only). The login page's own copy claims four tiers
//   ("administrator, exam manager, instructor and auditor"), but granting a
//   test account the generic Moodle 'manager' or 'editingteacher' role (at
//   system context, plus explicit external-service whitelisting) does NOT
//   grant console access — confirmed empirically below. "Exam manager" and
//   "instructor/reviewer" are therefore NOT YET separately implemented
//   authorization tiers; this is recorded as an open product gap, not
//   asserted as a security defect.

async function login(page, user, pass) {
  // NOTE: 'networkidle' is unreliable here — the console keeps some
  // background network activity alive (analytics/polling) that never fully
  // quiesces, so networkidle waits can hang to the test timeout even after
  // a successful, fully-rendered login. Wait for navigation away from
  // /login (or the error banner appearing) instead.
  await page.goto('/login');
  await page.fill('#username', user);
  await page.fill('#password', pass);
  await page.click('button[type=submit]');
  await Promise.race([
    page.waitForURL(u => !u.pathname.includes('/login'), { timeout: 15000 }),
    page.getByText('Invalid credentials').waitFor({ timeout: 15000 }),
  ]).catch(() => {});
  await page.waitForLoadState('domcontentloaded');
}

test.describe('RBAC / authorization (live, server-side)', () => {
  test('admin role reaches console and sees full nav', async ({ page }) => {
    await login(page, process.env.RBAC_ADMIN_USER, process.env.RBAC_ADMIN_PASS);
    expect(page.url()).toContain('/overview');
    const navCount = await page.locator('a[href^="/"]').count();
    expect(navCount).toBeGreaterThan(5);
  });

  test('auditor role reaches console (read-only intent)', async ({ page }) => {
    await login(page, process.env.RBAC_AUDITOR_USER, process.env.RBAC_AUDITOR_PASS);
    expect(page.url()).toContain('/overview');
  });

  test('candidate (student) role is refused console access with exact server message', async ({ page }) => {
    await login(page, process.env.RBAC_CANDIDATE_USER, process.env.RBAC_CANDIDATE_PASS);
    expect(page.url()).toContain('/login');
    await expect(page.locator('body')).toContainText(
      'Invalid credentials, or this account is not authorized for console access'
    );
  });

  test('GAP FINDING: generic Moodle "manager" role does not grant console access', async ({ page }) => {
    await login(page, process.env.RBAC_MANAGER_USER, process.env.RBAC_MANAGER_PASS);
    // Documents current behavior — the console's "exam manager" tier is not
    // implemented against this role yet. If this test starts failing (i.e.
    // login starts succeeding), that means the tier was implemented and
    // this spec/comment block should be updated, not treated as a regression.
    expect(page.url()).toContain('/login');
  });

  test('GAP FINDING: generic Moodle "editingteacher" role does not grant console access', async ({ page }) => {
    await login(page, process.env.RBAC_TEACHER_USER, process.env.RBAC_TEACHER_PASS);
    expect(page.url()).toContain('/login');
  });

  test('direct API/URL access to a protected route without auth redirects, does not leak data', async ({ page }) => {
    const resp = await page.goto('/question-bank');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');
    // the redirected/login page must not contain question-bank content
    await expect(page.locator('body')).not.toContainText('Function 7.1');
  });
});
