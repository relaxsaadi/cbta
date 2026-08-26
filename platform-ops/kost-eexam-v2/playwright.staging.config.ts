import { defineConfig, devices } from "@playwright/test";

// Suite dirigée contre le VRAI serveur de staging (déployé sur
// 102.206.40.221, vhost nginx `staging.kostacademy.com`) — pas un serveur
// local. `--host-resolver-rules` force Chromium à résoudre ce nom vers
// l'IP du serveur SANS dépendre de la propagation DNS publique (en cours) :
// le navigateur envoie exactement le même en-tête Host qu'un vrai
// visiteur une fois le DNS propagé — ce n'est pas un contournement de
// l'application, seulement de la résolution de nom pour ce test.
export default defineConfig({
  testDir: "./tests/staging",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://staging.kostacademy.com",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: {
      args: ["--host-resolver-rules=MAP staging.kostacademy.com 102.206.40.221"],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
