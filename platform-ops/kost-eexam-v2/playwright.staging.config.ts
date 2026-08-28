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
  // Mission "PRODUCTION READINESS" §12 — device/viewport (jamais testé
  // avant cette session). "chromium" reste le projet par défaut qui
  // exécute la suite COMPLÈTE (toute la logique métier, déjà prouvée en
  // profondeur) — les 3 projets suivants n'exécutent QUE
  // tests/staging/27-responsive-smoke.spec.ts (via `testMatch`), qui
  // vérifie l'utilisabilité de la mise en page (pas de redite de la
  // logique métier). Mapping desktop/tablette/mobile/WebKit demandé par
  // la mission : desktop = chromium (par défaut) ; WebKit = Safari
  // desktop (moteur WebKit, viewport large) ; tablette = iPad ; mobile =
  // iPhone (les deux derniers sur moteur WebKit aussi — cohérent avec de
  // vrais iPad/iPhone, la plateforme mobile la plus probable pour un
  // candidat DGR hors salle d'examen dédiée).
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "desktop-webkit", testMatch: /27-responsive-smoke\.spec\.ts/, use: { ...devices["Desktop Safari"] } },
    { name: "tablet", testMatch: /27-responsive-smoke\.spec\.ts/, use: { ...devices["iPad (gen 7)"] } },
    { name: "mobile-safari", testMatch: /27-responsive-smoke\.spec\.ts/, use: { ...devices["iPhone 14"] } },
  ],
});
