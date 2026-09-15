// Interrupteurs plateforme (addendum §9-11 — actions immédiates
// d'incident : mode maintenance, blocage des nouvelles connexions, blocage
// des nouvelles tentatives). Table à une ligne par clé (platform_settings).
// Le mode maintenance implique les deux blocages (logins + tentatives) ;
// chacun reste aussi actionnable individuellement pour une réponse plus
// chirurgicale (ex. bloquer les nouvelles tentatives sans empêcher un
// responsable de se connecter pour investiguer).
import { getDb, transaction } from "./db";
import { audit } from "./audit";
import type { ConsoleRole } from "./session";

export type PlatformSettingKey = "maintenance_mode" | "block_new_logins" | "block_new_attempts";

const SETTING_KEYS = new Set<PlatformSettingKey>(["maintenance_mode", "block_new_logins", "block_new_attempts"]);

const LABELS: Record<PlatformSettingKey, string> = {
  maintenance_mode: "Mode maintenance",
  block_new_logins: "Blocage des nouvelles connexions",
  block_new_attempts: "Blocage des nouvelles tentatives",
};

/**
 * Garde runtime fail-closed. Le type TypeScript protège les appels internes,
 * mais une Server Action/fixture JS ou une future régression ne doit jamais
 * pouvoir introduire silencieusement une nouvelle clé non gouvernée par le
 * même contrat mutation + audit.
 */
function assertPlatformSettingKey(key: string): asserts key is PlatformSettingKey {
  if (!SETTING_KEYS.has(key as PlatformSettingKey)) {
    throw new Error(`Clé de paramètre plateforme non prise en charge: ${key}`);
  }
}

export interface PlatformSettingTransition {
  key: PlatformSettingKey;
  previousValue: boolean;
  value: boolean;
  changed: boolean;
}

export function getPlatformSetting(key: PlatformSettingKey): boolean {
  assertPlatformSettingKey(key);
  const row = getDb().prepare(`SELECT value FROM platform_settings WHERE key = ?`).get(key) as { value: string } | undefined;
  return row?.value === "1";
}

/**
 * Frontière atomique des stop-controls (#71).
 *
 * La mutation et sa preuve d'audit de succès partagent le même
 * BEGIN IMMEDIATE : si l'INSERT d'audit échoue, le paramètre revient à sa
 * valeur précédente. Un retry sur la même valeur ne fabrique pas une fausse
 * transition : il produit uniquement un événement explicite `_noop`, avec
 * `changed: false`, sans réécrire platform_settings.
 *
 * Cette garantie ne ferme pas à elle seule #61/#43/#52/#57 : les parcours
 * startAttempt/login/MFA doivent encore partager une discipline de verrou
 * compatible pour éliminer leurs pré-checks périmés.
 */
export function setPlatformSetting(
  key: PlatformSettingKey,
  value: boolean,
  actor: { id: number; role: ConsoleRole }
): PlatformSettingTransition {
  assertPlatformSettingKey(key);

  return transaction((db) => {
    const row = db.prepare(`SELECT value FROM platform_settings WHERE key = ?`).get(key) as { value: string } | undefined;
    const previousValue = row?.value === "1";

    if (previousValue === value) {
      audit({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: `platform_setting_${key}_noop`,
        targetType: "platform_settings",
        metadata: { key, label: LABELS[key], previousValue, value, changed: false },
      });
      return { key, previousValue, value, changed: false };
    }

    db.prepare(
      `INSERT INTO platform_settings (key, value, updated_at, updated_by) VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'), ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`
    ).run(key, value ? "1" : "0", actor.id);

    // audit() réutilise la même connexion SQLite singleton ; cet INSERT fait
    // donc partie de la transaction BEGIN IMMEDIATE ci-dessus. Toute erreur
    // lève et déclenche le ROLLBACK de la mutation du stop-control.
    audit({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: `platform_setting_${key}_${value ? "enabled" : "disabled"}`,
      targetType: "platform_settings",
      metadata: { key, label: LABELS[key], previousValue, value, changed: true },
    });

    return { key, previousValue, value, changed: true };
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
