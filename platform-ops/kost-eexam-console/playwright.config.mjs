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
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'https://console.kostacademy.com',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'tablet-safari', use: { ...devices['iPad (gen 7)'] } },
  ],
});
