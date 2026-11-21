import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import 'dotenv/config';

// Rebuilt equivalent of the lost scratchpad's a11y-smoke.mjs. Runs axe-core
// against key live pages. Flags only serious/critical violations as test
// failures — moderate/minor findings are logged for visibility without
// failing the build, since a first accessibility pass on an unfamiliar app
// commonly surfaces a long tail of minor issues that don't block readiness.

async function loginAdmin(page) {
  await page.goto('/login');
  await page.fill('#username', process.env.RBAC_ADMIN_USER);
  await page.fill('#password', process.env.RBAC_ADMIN_PASS);
  await page.click('button[type=submit]');
  await page.waitForURL(u => !u.pathname.includes('/login'), { timeout: 15000 });
}

test.describe('Accessibility smoke (axe-core)', () => {
  test('console login page', async ({ page }) => {
    await page.goto('/login');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(v => ['serious', 'critical'].includes(v.impact));
    console.log(`/login: ${results.violations.length} total violations, ${serious.length} serious/critical`);
    results.violations.forEach(v => console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`));
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test('console overview page (authenticated)', async ({ page }) => {
    await loginAdmin(page);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(v => ['serious', 'critical'].includes(v.impact));
    console.log(`/overview: ${results.violations.length} total violations, ${serious.length} serious/critical`);
    results.violations.forEach(v => console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`));
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test('Moodle login page (exam.kostacademy.com)', async ({ page }) => {
    await page.goto('https://exam.kostacademy.com/login/index.php');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(v => ['serious', 'critical'].includes(v.impact));
    console.log(`moodle /login: ${results.violations.length} total violations, ${serious.length} serious/critical`);
    results.violations.forEach(v => console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`));
    // Moodle core is third-party code we don't control; record findings but
    // don't fail the suite on it the way we do for the console we can fix.
    test.info().annotations.push({ type: 'note', description: `${serious.length} serious/critical findings on third-party Moodle core UI` });
  });
});
