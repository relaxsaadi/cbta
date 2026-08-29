// Politique d'envoi du résultat par email (mission email §24) —
// configurable, stockée dans platform_settings (même table que
// lib/platform-settings.ts, clé dédiée non-booléenne — ce fichier reste
// séparé pour ne pas polluer le typage strict booléen de
// PlatformSettingKey). Défaut RESULT_AVAILABLE_ONLY si jamais configuré.
// Pas de garde "server-only" — voir lib/email/audit.ts pour la
// justification (module de domaine, doit rester testable via node:test).
import { getDb } from "../db";
import { audit } from "../audit";
import type { ConsoleRole } from "../session";
import type { ResultEmailPolicy } from "./types";

const SETTING_KEY = "result_email_policy";
const DEFAULT_POLICY: ResultEmailPolicy = "RESULT_AVAILABLE_ONLY";
const VALID_POLICIES: ResultEmailPolicy[] = ["NO_EMAIL", "RESULT_AVAILABLE_ONLY", "RESULT_WITH_SCORE"];

export function getResultEmailPolicy(): ResultEmailPolicy {
  const row = getDb().prepare(`SELECT value FROM platform_settings WHERE key = ?`).get(SETTING_KEY) as { value: string } | undefined;
  if (row && VALID_POLICIES.includes(row.value as ResultEmailPolicy)) return row.value as ResultEmailPolicy;
  return DEFAULT_POLICY;
}

export function setResultEmailPolicy(policy: ResultEmailPolicy, actor: { id: number; role: ConsoleRole }): void {
  getDb()
    .prepare(
      `INSERT INTO platform_settings (key, value, updated_at, updated_by) VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'), ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`
    )
    .run(SETTING_KEY, policy, actor.id);
  audit({ actorUserId: actor.id, actorRole: actor.role, action: "platform_setting_result_email_policy_changed", targetType: "platform_settings", metadata: { policy } });
}
