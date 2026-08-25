import { test, expect } from '@playwright/test';
import 'dotenv/config';

// Rebuilt equivalent of the lost scratchpad's smoke-test-prod.mjs (see
// docs/AI_HANDOFF.md fifth-pass session log for why it needed rebuilding).
// Targets the LIVE console — no destructive actions; every test that logs
// in also logs out to avoid leaving sessions open.

test.describe('Console smoke test (live)', () => {
  test('unauthenticated direct navigation redirects to /login', async ({ page }) => {
    await page.goto('/overview');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/login');
  });

  test('invalid credentials are rejected', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'nonexistent_user_xyz');
    await page.fill('#password', 'wrong-password');
    await page.click('button[type=submit]');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText('Invalid credentials');
  });

  test('admin login succeeds, session persists, logout destroys session', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', process.env.RBAC_ADMIN_USER);
    await page.fill('#password', process.env.RBAC_ADMIN_PASS);
    await page.click('button[type=submit]');
    // NOTE: login redirects via a client-side router push (React Server
    // Action), not a full browser navigation, so waitForLoadState resolves
    // too early. Poll the URL instead.
    await page.waitForURL(u => !u.pathname.includes('/login'), { timeout: 15000 });
    expect(page.url()).toContain('/overview');

    // session persists across navigation/refresh
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/overview');

    // cookie hardening (re-check of docs/PLATFORM_READINESS_REPORT.md Gate G)
    const cookies = await page.context().cookies();
    const session = cookies.find(c => c.name.toLowerCase().includes('session'));
    expect(session).toBeTruthy();
    expect(session.httpOnly).toBe(true);
    expect(session.secure).toBe(true);
    expect(['Strict', 'Lax']).toContain(session.sameSite);

    // logout
    const logoutLink = page.getByText('Log out', { exact: true });
    await logoutLink.click();
    await page.waitForURL(u => u.pathname.includes('/login'), { timeout: 15000 });
    expect(page.url()).toContain('/login');

    // post-logout: direct nav to a protected page must bounce back to login,
    // not serve cached/stale content
    await page.goto('/overview');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/login');
  });
});
