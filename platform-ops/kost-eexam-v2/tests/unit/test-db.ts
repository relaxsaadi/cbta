// Utilitaire de test — une base SQLite temporaire, isolée, par fichier de
// test (node --test lance chaque fichier dans son propre process, donc pas
// de collision sur le singleton `db` de lib/db.ts entre fichiers).
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { getDb } from "../../lib/db";

export function setupTestDb(): void {
  const dir = mkdtempSync(join(tmpdir(), "kost-eexam-v2-test-"));
  process.env.DB_PATH = join(dir, "test.db");
  const schema = readFileSync(resolve(import.meta.dirname, "../../lib/schema.sql"), "utf-8");
  const db = getDb();
  db.exec(schema);

  const roles: [string, string][] = [
    ["candidate", "Candidat"],
    ["pedagogical_manager", "Responsable pédagogique"],
    ["administrator", "Administrateur"],
    ["auditor", "Auditeur"],
  ];
  const upsertRole = db.prepare(`INSERT INTO roles (code, label) VALUES (?, ?)`);
  for (const [code, label] of roles) upsertRole.run(code, label);

  const fns = Array.from({ length: 10 }, (_, i) => `7.${i + 1}`);
  const upsertFn = db.prepare(`INSERT INTO functions (code, label) VALUES (?, ?)`);
  for (const code of fns) upsertFn.run(code, `Fonction ${code}`);
}
