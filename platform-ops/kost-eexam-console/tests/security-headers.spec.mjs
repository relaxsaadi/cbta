import { test, expect } from '@playwright/test';

// Rebuilt equivalent of the lost scratchpad's csp-test.mjs / cookie-audit.mjs.
// Checks response headers on both live domains. Run once per browser project
// is redundant (headers are server-side, not browser-dependent) but harmless;
// kept in the default project set for simplicity.

test.describe('Security response headers (live)', () => {
  test('console.kostacademy.com sends hardened headers', async ({ page }) => {
    const resp = await page.goto('https://console.kostacademy.com/login');
    const headers = resp.headers();
    expect(headers['strict-transport-security']).toContain('max-age');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBeTruthy();
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  });

  test('exam.kostacademy.com (Moodle) sends the Nginx-layer headers added 2026-08-25', async ({ page }) => {
    const resp = await page.goto('https://exam.kostacademy.com/login/index.php');
    const headers = resp.headers();
    expect(headers['strict-transport-security']).toContain('max-age');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBeTruthy();
    expect(headers['content-security-policy']).toContain("frame-ancestors 'self'");
    // Moodle's own PHP-level header, must still be present (not duplicated/broken
    // by the Nginx add_header directives added alongside it)
    expect(headers['x-frame-options']?.toLowerCase()).toBe('sameorigin');
  });

  test('no debug/stack-trace leakage on a bad Moodle URL', async ({ page }) => {
    const resp = await page.goto('https://exam.kostacademy.com/this-route-does-not-exist-xyz');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.toLowerCase()).not.toContain('stack trace');
    expect(body.toLowerCase()).not.toContain('debug info');
  });
});
