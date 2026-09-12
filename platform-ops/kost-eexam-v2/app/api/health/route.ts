import { NextResponse } from "next/server";
import { getDb, nowIso } from "@/lib/db";
import { latestOfType, BACKUP_POLICY } from "@/lib/backup";

// Mission "PRODUCTION READINESS" §12 — endpoint de santé public (aucune
// session requise, exempté du proxy — voir proxy.ts). Il expose uniquement
// l'état opérationnel nécessaire à la supervision externe : santé globale,
// disponibilité/latence DB et fraîcheur des preuves backup/restore. Les
// détails de configuration applicative (email, secrets configurés, mode
// d'envoi, destinataires, etc.) restent hors de cette surface publique.
// Consommé par deploy/monitor.sh et utilisable par un outil de supervision
// externe ; jamais de chemin de fichier, version interne ou message d'erreur
// brut dans la réponse.
export async function GET() {
  const startedAt = Date.now();
  let dbOk = false;
  let dbLatencyMs: number | null = null;
  try {
    const dbStart = Date.now();
    getDb().prepare("SELECT 1").get();
    dbLatencyMs = Date.now() - dbStart;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const lastBackup = dbOk ? latestOfType("full_db") : undefined;
  const lastRestoreTest = dbOk ? latestOfType("restore_test") : undefined;

  const now = Date.now();
  const backupAgeHours = lastBackup ? (now - new Date(lastBackup.created_at).getTime()) / 3_600_000 : null;
  const restoreTestAgeHours = lastRestoreTest ? (now - new Date(lastRestoreTest.created_at).getTime()) / 3_600_000 : null;

  // Marge de grâce sur les cibles de politique (§10) : cron backup à 2h,
  // cron restore-test hebdomadaire — un léger retard d'exécution cron ne
  // doit pas déclencher une fausse alerte au moment exact du seuil.
  const backupStale = backupAgeHours === null || backupAgeHours > BACKUP_POLICY.rpoHours + 2;
  const restoreTestStale = restoreTestAgeHours === null || restoreTestAgeHours > 7 * 24 + 24;

  const healthy = dbOk && !backupStale && !restoreTestStale && (lastBackup?.status ?? "failure") === "success";

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: nowIso(),
      checkDurationMs: Date.now() - startedAt,
      db: { ok: dbOk, latencyMs: dbLatencyMs },
      backup: {
        lastStatus: lastBackup?.status ?? "never_run",
        ageHours: backupAgeHours !== null ? Math.round(backupAgeHours * 10) / 10 : null,
        stale: backupStale,
      },
      restoreTest: {
        lastStatus: lastRestoreTest?.status ?? "never_run",
        ageHours: restoreTestAgeHours !== null ? Math.round(restoreTestAgeHours * 10) / 10 : null,
        stale: restoreTestStale,
      },
      uptimeSeconds: Math.round(process.uptime()),
    },
    { status: healthy ? 200 : 503 }
  );
}
