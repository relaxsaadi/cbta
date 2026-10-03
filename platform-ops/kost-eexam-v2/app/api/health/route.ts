import { NextResponse } from "next/server";
import { getDb, nowIso } from "@/lib/db";
import { latestOfType, BACKUP_POLICY, evaluateBackupRecordHealth } from "@/lib/backup";

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

  // Marge de grâce sur les cibles de politique (§10) : cron backup à 2h,
  // cron restore-test hebdomadaire — un léger retard d'exécution cron ne
  // doit pas déclencher une fausse alerte au moment exact du seuil.
  //
  // Important : fraîcheur et succès sont deux invariants indépendants.
  // Un restore-test récent en échec, ou un timestamp durable invalide/futur,
  // doit dégrader la santé au lieu de passer implicitement pour une preuve
  // de reprise valide.
  const backupHealth = evaluateBackupRecordHealth(
    lastBackup,
    BACKUP_POLICY.rpoHours + 2,
    now,
  );
  const restoreTestHealth = evaluateBackupRecordHealth(
    lastRestoreTest,
    7 * 24 + 24,
    now,
  );

  const healthy =
    dbOk &&
    backupHealth.successful &&
    !backupHealth.stale &&
    restoreTestHealth.successful &&
    !restoreTestHealth.stale;

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: nowIso(),
      checkDurationMs: Date.now() - startedAt,
      db: { ok: dbOk, latencyMs: dbLatencyMs },
      backup: {
        lastStatus: lastBackup?.status ?? "never_run",
        ageHours: backupHealth.ageHours !== null ? Math.round(backupHealth.ageHours * 10) / 10 : null,
        stale: backupHealth.stale,
      },
      restoreTest: {
        lastStatus: lastRestoreTest?.status ?? "never_run",
        ageHours: restoreTestHealth.ageHours !== null ? Math.round(restoreTestHealth.ageHours * 10) / 10 : null,
        stale: restoreTestHealth.stale,
      },
      uptimeSeconds: Math.round(process.uptime()),
    },
    { status: healthy ? 200 : 503 }
  );
}
