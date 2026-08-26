import { defineConfig, devices } from "@playwright/test";

// Suite E2E locale — à la différence de la suite V1 (qui cible la
// production live, voir docs §16), V2 n'a pas encore d'environnement de
// staging déployé : chaque run démarre son propre serveur de dev local sur
// une base SQLite de test dédiée (voir globalSetup), jetée après le run.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: "http://127.0.0.1:3101",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    // Build de production, pas `next dev` : le mode dev de Next 16 affiche
    // sa propre surcouche d'erreur (React eval() requis pour le debug, en
    // conflit avec notre CSP stricte) qui masque app/(app)/error.tsx avant
    // que le test ne puisse l'observer — un artefact du mode dev, pas un
    // vrai bug. Le build de prod est aussi plus représentatif du
    // comportement réel déployé.
    // Appelle `next` directement (pas `pnpm start --`) : pnpm 9 ne retire
    // pas le séparateur `--` avant de le transmettre au script, ce qui fait
    // interpréter `--port` comme le répertoire positionnel par `next start`.
    command: "npx next build && npx next start --port 3101",
    url: "http://127.0.0.1:3101/login",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DB_PATH: "./data/e2e-test.db",
      SESSION_SECRET: "e2e-test-session-secret-at-least-32-chars",
      NODE_ENV: "production",
      // Build de prod servi en clair sur 127.0.0.1 pour les tests locaux —
      // voir le commentaire dans lib/session.ts. Ne JAMAIS définir cette
      // variable en déploiement réel (HTTPS).
      COOKIE_SECURE: "false",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
