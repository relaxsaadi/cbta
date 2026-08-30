// Réinitialise la base de test SQLite dédiée (jamais la base de dev/prod)
// puis applique le schéma + le jeu de démo, avant que le serveur webServer
// de Playwright ne démarre dessus.
import { execSync } from "node:child_process";
import { rmSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

export default async function globalSetup() {
  const root = resolve(import.meta.dirname, "../..");
  const dbPath = resolve(root, "data/e2e-test.db");
  rmSync(dbPath, { force: true });
  rmSync(`${dbPath}-wal`, { force: true });
  rmSync(`${dbPath}-shm`, { force: true });
  mkdirSync(resolve(root, "data"), { recursive: true });

  const env = { ...process.env, DB_PATH: "./data/e2e-test.db" };
  execSync("node --import tsx scripts/migrate.ts", { cwd: root, env, stdio: "inherit" });
  execSync("node --import tsx scripts/seed-demo.ts", { cwd: root, env, stdio: "inherit" });
  // Fixtures dédiées au sous-système email (mission email §61-69) — voir
  // scripts/seed-email-demo.ts. Doit tourner APRÈS seed-demo.ts (réutilise
  // son admin/responsable/groupe démo). APP_BASE_URL requis pour que
  // notifyAccountCreated() construise un lien réel (même valeur que le
  // webServer Playwright ci-dessous) — sans, l'appel resterait silencieux
  // (voir safe() dans lib/email/events.ts) et la fixture n'aurait aucune
  // ligne notification_log à afficher dans les tests d'isolation.
  const emailEnv = { ...env, APP_BASE_URL: "http://127.0.0.1:3101", EMAIL_MODE: "log" };
  execSync("node --import tsx scripts/seed-email-demo.ts", { cwd: root, env: emailEnv, stdio: "inherit" });
  // Fixture "1 réponse en attente de correction" (mission "ADMIN/CLIENT/
  // CANDIDATE UX IMPROVEMENTS" §42, 2026-08-30) — voir
  // scripts/seed-grading-demo.ts. Assemblée sur une évaluation DÉDIÉE
  // (jamais celle de seed-demo.ts) avec questionSource:"manual", donc
  // sans impact sur le nombre/type de questions attendu par les
  // scénarios E2E existants qui dépendent de "DGR Fonction 7.1 — Test
  // démo". candidat1.demo (déjà démo, aucune PII réelle).
  execSync("node --import tsx scripts/seed-grading-demo.ts", { cwd: root, env, stdio: "inherit" });
}
