// Interrupteurs plateforme (addendum §9-11 — actions immédiates
// d'incident : mode maintenance, blocage des nouvelles connexions, blocage
// des nouvelles tentatives). Table à une ligne par clé (platform_settings).
// Le mode maintenance implique les deux blocages (logins + tentatives) ;
// chacun reste aussi actionnable individuellement pour une réponse plus
// chirurgicale (ex. bloquer les nouvelles tentatives sans empêcher un
// responsable de se connecter pour investiguer).
import { getDb } from "./db";
import { audit } from "./audit";
import type { ConsoleRole } from "./session";

export type PlatformSettingKey = "maintenance_mode" | "block_new_logins" | "block_new_attempts";

const LABELS: Record<PlatformSettingKey, string> = {
  maintenance_mode: "Mode maintenance",
  block_new_logins: "Blocage des nouvelles connexions",
  block_new_attempts: "Blocage des nouvelles tentatives",
};

export function getPlatformSetting(key: PlatformSettingKey): boolean {
  const row = getDb().prepare(`SELECT value FROM platform_settings WHERE key = ?`).get(key) as { value: string } | undefined;
  return row?.value === "1";
}

export function setPlatformSetting(key: PlatformSettingKey, value: boolean, actor: { id: number; role: ConsoleRole }): void {
  getDb()
    .prepare(
      `INSERT INTO platform_settings (key, value, updated_at, updated_by) VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'), ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`
    )
    .run(key, value ? "1" : "0", actor.id);
  audit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: `platform_setting_${key}_${value ? "enabled" : "disabled"}`,
    targetType: "platform_settings",
    metadata: { key, label: LABELS[key], value },
  });
}

export function isMaintenanceMode(): boolean {
  return getPlatformSetting("maintenance_mode");
}

/** Bloque les nouvelles connexions — mode maintenance OU blocage dédié.
 * L'administrateur reste TOUJOURS exempté (appelant, pas ici — voir
 * lib/auth.ts) : il doit pouvoir se connecter pour lever le blocage. */
export function isNewLoginsBlocked(): boolean {
  return isMaintenanceMode() || getPlatformSetting("block_new_logins");
}

/** Bloque le démarrage de NOUVELLES tentatives — mode maintenance OU
 * blocage dédié. Une tentative déjà en cours n'est jamais interrompue
 * (voir lib/attempts.ts startAttempt() — le retour anticipé sur tentative
 * existante précède cette vérification, principe de continuité §9-11). */
export function isNewAttemptsBlocked(): boolean {
  return isMaintenanceMode() || getPlatformSetting("block_new_attempts");
}

export interface PlatformStatus {
  maintenanceMode: boolean;
  loginsBlocked: boolean;
  attemptsBlocked: boolean;
}

export function getPlatformStatus(): PlatformStatus {
  return {
    maintenanceMode: isMaintenanceMode(),
    loginsBlocked: isNewLoginsBlocked(),
    attemptsBlocked: isNewAttemptsBlocked(),
  };
}
