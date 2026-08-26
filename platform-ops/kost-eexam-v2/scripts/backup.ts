// Sauvegarde complète — §21 de la mission. `VACUUM INTO` produit une copie
// cohérente du fichier SQLite (même pendant une écriture WAL en cours) en
// un seul fichier autonome, horodaté, avec somme de contrôle. Prévu pour
// tourner via cron en production (voir Dockerfile / docs déploiement).
import { createHash } from "node:crypto";
import { readFileSync, statSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { getDb, closeDb } from "../lib/db";
import { recordBackupEvent } from "../lib/backup";

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function main() {
  const backupDir = resolve(process.cwd(), process.env.BACKUP_DIR ?? "./data/backups");
  mkdirSync(backupDir, { recursive: true });
  const outFile = resolve(backupDir, `kost-eexam-v2_${timestamp()}.db`);

  const start = Date.now();
  const db = getDb();
  let status: "success" | "failure" = "success";
  let detail = "";
  let sizeBytes: number | null = null;
  let sha256: string | null = null;

  try {
    db.exec(`VACUUM INTO '${outFile.replace(/'/g, "''")}'`);
    const buf = readFileSync(outFile);
    sizeBytes = statSync(outFile).size;
    sha256 = createHash("sha256").update(buf).digest("hex");
    detail = `Sauvegarde écrite : ${outFile}`;
    console.log(`Sauvegarde réussie : ${outFile} (${sizeBytes} octets, sha256=${sha256.slice(0, 12)}…)`);
  } catch (err) {
    status = "failure";
    detail = err instanceof Error ? err.message : String(err);
    console.error("Échec de la sauvegarde :", detail);
  }

  const durationSeconds = (Date.now() - start) / 1000;
  recordBackupEvent({ type: "full_db", status, size_bytes: sizeBytes, sha256, duration_seconds: durationSeconds, detail });
  closeDb();
  if (status === "failure") process.exit(1);
}

main();
