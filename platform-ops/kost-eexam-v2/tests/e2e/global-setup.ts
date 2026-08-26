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
}
