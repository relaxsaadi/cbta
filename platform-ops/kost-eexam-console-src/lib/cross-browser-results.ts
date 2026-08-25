// Résultats réels de la matrice Playwright cross-navigateur — remplis
// manuellement après exécution du script cross-browser-test.mjs contre la
// production. Ne jamais préremplir avec des valeurs supposées : ce fichier
// est mis à jour uniquement après un run réel dont le résultat est observé.
export interface CrossBrowserResult {
  browser: string;
  version: string;
  timestamp: string;
  testsExecuted: number;
  result: "pass" | "fail";
  notes?: string;
}

// Résultats réels — 2 exécutions consécutives de cross-browser-test.mjs
// contre https://console.kostacademy.com le 2026-08-20, mêmes résultats aux
// deux passages (reproductible, pas un aléa réseau isolé). Parcours testés :
// login, Overview, Exams, Sessions, Question Bank, Audit & Compliance,
// Support, Exam Preparation, Practice Test, Feedback, Results, logout.
export const CROSS_BROWSER_MATRIX: CrossBrowserResult[] = [
  {
    browser: "Chromium",
    version: "151.0.7922.34",
    timestamp: "2026-08-20T07:32:08.362Z",
    testsExecuted: 12,
    result: "pass",
  },
  {
    browser: "Firefox",
    version: "153.0",
    timestamp: "2026-08-20T07:32:24.035Z",
    testsExecuted: 12,
    result: "pass",
    notes:
      "All 12 critical-path checks passed on both runs. A non-blocking console warning was observed on both runs: one bundled IBM Plex Sans font-weight variant failed to download via Firefox's font loader. The resource was independently confirmed reachable (HTTP 200, correct content-type) via a direct request — the page remained fully functional and legible via the font fallback stack.",
  },
  {
    browser: "WebKit",
    version: "26.5",
    timestamp: "2026-08-20T07:32:39.709Z",
    testsExecuted: 12,
    result: "pass",
  },
];
