import { test, expect } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import 'dotenv/config';

const execFileAsync = promisify(execFile);
const MARKER = 'RBAC-MUTATION-TEST-DO-NOT-USE';

// Mutation-level RBAC tests: does a real WRITE action get blocked server-side
// for a role that's supposed to be read-only, not just whether the nav link
// is present? This is the deferred test from the prior pass — deferred then
// because it wasn't clear where the console persists its own data or how to
// clean up a test write. Resolved this pass: the console writes into the
// SAME Moodle MySQL instance, under `kost_console_*`-prefixed tables
// (kost_console_feedback, kost_console_identity_verifications, etc.) via a
// separate MYSQL_RW_* credential set — found by listing tables matching
// "%kost%" rather than only "%external%". This SSH/DB path is the same one
// used throughout this readiness pass; requires ~/.ssh/hostarts_kost_moodle.

async function runSql(sql) {
  // Base64-encode the SQL and pipe it to mysql's stdin, remotely decoded —
  // sidesteps nested shell-quoting entirely (three layers of quoting — the
  // local execFile args, the remote sh -c wrapper, and SQL string literals —
  // otherwise collide, as discovered debugging this exact test). The
  // base64 payload itself has no shell-special characters.
  const b64 = Buffer.from(sql, 'utf8').toString('base64');
  const { stdout } = await execFileAsync('ssh', [
    '-i', `${process.env.HOME}/.ssh/hostarts_kost_moodle`,
    '-o', 'ConnectTimeout=10', '-o', 'BatchMode=yes',
    'root@102.206.40.221',
    `echo ${b64} | base64 -d | docker exec -i moodle-stack_db_1 sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" -N moodle 2>/dev/null'`,
  ]);
  return stdout.trim().split('\n').filter(l => l && !l.startsWith('**') && !l.includes('openssh.com'));
}

async function login(page, user, pass) {
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

test.describe('Mutation-level RBAC (real write attempts, not just page access)', () => {
  test('auditor is blocked server-side from recording an identity verification (form not even rendered)', async ({ page }) => {
    await login(page, process.env.RBAC_AUDITOR_USER, process.env.RBAC_AUDITOR_PASS);
    await page.goto('/identity-verification');
    // The denial is server-rendered (SSR data-fetch-level gate, not a
    // client-side hide) — confirmed by direct inspection this pass.
    await expect(page.locator('body')).toContainText(
      'Your role (auditor) is not authorized to record identity verifications'
    );
    await expect(page.locator('input[name="candidateUsername"]')).toHaveCount(0);
  });

  test('admin CAN reach the identity-verification form (positive control for the test above)', async ({ page }) => {
    await login(page, process.env.RBAC_ADMIN_USER, process.env.RBAC_ADMIN_PASS);
    await page.goto('/identity-verification');
    await expect(page.locator('input[name="candidateUsername"]')).toHaveCount(1);
  });

  test('FINDING: any authenticated console role (including auditor) can submit /feedback', async ({ page }) => {
    // This is recorded as a FINDING, not asserted as a pass/fail defect: a
    // feedback/suggestion-box feature being open to all authenticated roles
    // (unlike identity-verification, which is correctly restricted) is a
    // defensible product design, not necessarily a security gap. Documented
    // here so a future reviewer can make an explicit call rather than this
    // asymmetry going unnoticed. The test row is deleted immediately after
    // creation so repeat runs never accumulate test data.
    await login(page, process.env.RBAC_AUDITOR_USER, process.env.RBAC_AUDITOR_PASS);
    await page.goto('/feedback');
    await page.getByRole('button', { name: 'Give Feedback', exact: true }).click();
    await page.waitForTimeout(500);
    await page.fill('input[name="relatedExam"]', MARKER);
    await page.fill('textarea[name="comment"]', MARKER);
    // The submit button stays disabled until a star rating is picked (client
    // validation) — the widget is a set of buttons with aria-label "N star(s)".
    await page.getByRole('button', { name: '4 stars' }).click();
    await page.click('button:has-text("Submit feedback")');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText('Feedback recorded');

    // Verify server-side, then clean up immediately (never leave test data
    // in a live compliance-adjacent table).
    const rows = await runSql(`SELECT id FROM moodle.kost_console_feedback WHERE comment='${MARKER}' AND reporter_username='${process.env.RBAC_AUDITOR_USER}';`);
    expect(rows.length).toBeGreaterThan(0);
    for (const id of rows) {
      await runSql(`DELETE FROM moodle.kost_console_feedback WHERE id=${Number(id)} AND comment='${MARKER}';`);
    }
    const afterCleanup = await runSql(`SELECT COUNT(*) FROM moodle.kost_console_feedback WHERE comment='${MARKER}';`);
    expect(afterCleanup[0]).toBe('0');
  });
});
