// Test de restauration RÉEL — §21 de la mission : « une documentation seule
// ne suffit pas ». Restaure la dernière sauvegarde dans un répertoire
// temporaire isolé et jetable (jamais un chemin partagé avec la production),
// vérifie l'intégrité SQLite native + compte les lignes des tables clés, PUIS
// supprime la copie — que le test réussisse ou échoue. Suit exactement la
// même méthodologie que le test V1 documenté dans
// AUDIT_ANAC_2026-08-26/_source/04_rapport_restauration.md.
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { getDb, closeDb } from "../lib/db";
import { recordBackupEvent } from "../lib/backup";

const KEY_TABLES = ["users", "companies", "groups", "questions", "assessments", "attempts", "results", "audit_logs"];

function latestBackupFile(backupDir: string): string | null {
  let files: string[];
  try {
    files = readdirSync(backupDir).filter((f) => f.endsWith(".db"));
  } catch {
    return null;
  }
  if (files.length === 0) return null;
  files.sort((a, b) => statSync(join(backupDir, b)).mtimeMs - statSync(join(backupDir, a)).mtimeMs);
  return join(backupDir, files[0]!);
}

function main() {
  const backupDir = resolve(process.cwd(), process.env.BACKUP_DIR ?? "./data/backups");
  const backupFile = latestBackupFile(backupDir);

  const start = Date.now();
  let status: "success" | "failure" = "success";
  let detail = "";
  let isolatedDir: string | null = null;

  try {
    if (!backupFile) throw new Error(`Aucune sauvegarde trouvée dans ${backupDir} — exécuter 'pnpm backup' d'abord.`);

    // Répertoire isolé, jetable, aucun volume partagé avec la production —
    // même garantie que le test V1 (§04_rapport_restauration.md).
    isolatedDir = mkdtempSync(join(tmpdir(), "kost-eexam-v2-restore-test-"));
    const restoredPath = join(isolatedDir, "restored.db");
    // Copie physique du fichier de sauvegarde dans l'environnement isolé —
    // pas d'ouverture directe du fichier de sauvegarde original.
    copyFileSync(backupFile, restoredPath);

    const restored = new DatabaseSync(restoredPath);
    const integrity = restored.prepare("PRAGMA integrity_check").get() as { integrity_check: string };
    if (integrity.integrity_check !== "ok") throw new Error(`PRAGMA integrity_check a échoué : ${integrity.integrity_check}`);

    const counts: Record<string, number> = {};
    for (const table of KEY_TABLES) {
      const row = restored.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number };
      counts[table] = row.n;
    }
    restored.close();

    detail = `Intégrité OK. Lignes restaurées : ${Object.entries(counts).map(([t, n]) => `${t}=${n}`).join(", ")}`;
    console.log("Test de restauration réussi.");
    console.log(detail);
  } catch (err) {
    status = "failure";
    detail = err instanceof Error ? err.message : String(err);
    console.error("Échec du test de restauration :", detail);
  } finally {
    // Nettoyage systématique — succès ou échec, jamais laissé sur disque.
    if (isolatedDir) rmSync(isolatedDir, { recursive: true, force: true });
  }

  const durationSeconds = (Date.now() - start) / 1000;
  recordBackupEvent({ type: "restore_test", status, size_bytes: null, sha256: null, duration_seconds: durationSeconds, detail });
  closeDb();
  if (status === "failure") process.exit(1);
}

main();
