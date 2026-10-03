// Playwright config for black-box E2E/RBAC/security testing of the LIVE
// KOST E-EXAM console (console.kostacademy.com) and Moodle exam engine
// (exam.kostacademy.com). There is no local dev server here — every test
// targets the real production URLs with dedicated TEST accounts. See
// docs/AI_HANDOFF.md and docs/PLATFORM_READINESS_REPORT.md for context.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // shared live test accounts/sessions; avoid cross-test races
  // Root-caused 2026-08-25 (sixth pass): running all 5 browser/device
  // projects with Playwright's default worker count (CPU-based, up to ~5+
  // concurrent) hammers the single, modest-capacity live VPS hard enough to
  // cause real timeouts (including this suite's own SSH-based DB
  // verification calls) that had nothing to do with browser-engine
  // differences — confirmed by re-running the exact same "failing"
  // Firefox test in isolation and having it pass cleanly. Capping workers
  // keeps load on the live production server reasonable and removes this
  // source of false-negative cross-browser failures.
  workers: 2,
  retries: 1, // one retry absorbs genuine transient network blips (SSH/VPS), not real defects

  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'https://console.kostacademy.com',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    // WebKit-family engines (webkit-desktop, tablet-safari) were observed
    // this pass to be consistently, genuinely slower against this live VPS
    // than Chromium/Firefox (20-40s for operations that take 1-3s
    // elsewhere) while still eventually succeeding — not a functional
    // defect, just real latency (plausibly WebKit's TLS/connection-reuse
    // behavior). A longer per-assertion timeout for these two projects
    // removes false-negative failures without masking genuine bugs (the
    // assertions themselves are unchanged).
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] }, expect: { timeout: 25_000 } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'tablet-safari', use: { ...devices['iPad (gen 7)'] }, expect: { timeout: 25_000 } },
  ],
});
