import { defineConfig, devices } from "@playwright/test";

// Suite dirigée contre le VRAI serveur de staging (102.206.40.221, vhost
// nginx `staging.kostacademy.com`) — pas un serveur local. Le DNS public
// résout désormais réellement ce nom (certificat Let's Encrypt réel émis,
// COOKIE_SECURE=false retiré — les cookies redeviennent Secure par défaut,
// donc HTTPS est requis pour que la session fonctionne). `--host-resolver-
// rules` reste présent par robustesse (aucun risque de retomber sur une
// résolution DNS différente entre deux exécutions) mais n'est plus la seule
// voie de résolution comme au moment de la propagation initiale.
export default defineConfig({
  testDir: "./tests/staging",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "https://staging.kostacademy.com",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: {
      args: ["--host-resolver-rules=MAP staging.kostacademy.com 102.206.40.221"],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
