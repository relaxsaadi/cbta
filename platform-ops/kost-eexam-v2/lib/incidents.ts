import { getDb } from "./db";
import { audit } from "./audit";
import { setUserStatus, reactivateUserSafely } from "./users";
import { revokeAllSessionsForUser } from "./sessions-registry";
import { suspendAssessment, reopenAssessment } from "./assessments";
import { setPlatformSetting } from "./platform-settings";
import type { ConsoleRole } from "./session";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "open" | "investigating" | "resolved" | "closed";
export type IncidentActionType =
  | "suspend_account"
  | "reactivate_account"
  | "force_logout"
  | "revoke_sessions"
  | "suspend_assessment"
  | "reopen_assessment"
  | "attach_evidence"
  | "note"
  | "corrective_measure"
  | "close"
  | "enable_maintenance_mode"
  | "disable_maintenance_mode"
  | "block_new_logins"
  | "unblock_new_logins"
  | "block_new_attempts"
  | "unblock_new_attempts";

export interface IncidentRow {
  id: number;
  type: string;
  severity: IncidentSeverity;
  occurred_at: string;
  description: string;
  system_concerned: string | null;
  people_concerned: string | null;
  responsible_user_id: number | null;
  group_id: number | null;
  status: IncidentStatus;
  created_by: number | null;
  created_at: string;
}

/** Frontière multi-client (lib/tenant-scope.ts) — `restrictToGroupIdsOrNull`
 * vient de la session serveur, jamais d'un paramètre client. `null` = pas
 * de restriction (administrator/auditor). Un tableau (même vide) filtre
 * aux incidents PLATEFORME (group_id NULL, visibles de tous) UNIS aux
 * incidents des groupes listés — jamais les incidents d'un autre client. */
export function listIncidents(restrictToGroupIdsOrNull: number[] | null = null): IncidentRow[] {
  if (restrictToGroupIdsOrNull === null) {
    return getDb().prepare(`SELECT * FROM incidents ORDER BY created_at DESC`).all() as unknown as IncidentRow[];
  }
  if (restrictToGroupIdsOrNull.length === 0) {
    return getDb().prepare(`SELECT * FROM incidents WHERE group_id IS NULL ORDER BY created_at DESC`).all() as unknown as IncidentRow[];
  }
  const placeholders = restrictToGroupIdsOrNull.map(() => "?").join(",");
  return getDb()
    .prepare(`SELECT * FROM incidents WHERE group_id IS NULL OR group_id IN (${placeholders}) ORDER BY created_at DESC`)
    .all(...restrictToGroupIdsOrNull) as unknown as IncidentRow[];
}

export function getIncident(id: number): IncidentRow | undefined {
  return getDb().prepare(`SELECT * FROM incidents WHERE id = ?`).get(id) as IncidentRow | undefined;
}

export function declareIncident(params: {
  type: string;
  severity: IncidentSeverity;
  description: string;
  systemConcerned?: string;
  peopleConcerned?: string;
  responsibleUserId?: number;
  groupId?: number;
  createdBy: number;
  createdByRole: ConsoleRole;
}): number {
  const result = getDb()
    .prepare(
      `INSERT INTO incidents (type, severity, description, system_concerned, people_concerned, responsible_user_id, group_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      params.type,
      params.severity,
      params.description,
      params.systemConcerned ?? null,
      params.peopleConcerned ?? null,
      params.responsibleUserId ?? null,
      params.groupId ?? null,
      params.createdBy
    );
  const incidentId = Number(result.lastInsertRowid);
  audit({ actorUserId: params.createdBy, actorRole: params.createdByRole, action: "incident_declare", targetType: "incident", targetId: incidentId, metadata: { type: params.type, severity: params.severity, groupId: params.groupId ?? null } });
  return incidentId;
}

export function listIncidentActions(incidentId: number) {
  return getDb()
    .prepare(`SELECT * FROM incident_actions WHERE incident_id = ? ORDER BY created_at`)
    .all(incidentId);
}

function recordAction(incidentId: number, actionType: IncidentActionType, actorUserId: number, actorRole: ConsoleRole, targetType?: string, targetId?: number, detail?: string) {
  getDb()
    .prepare(`INSERT INTO incident_actions (incident_id, action_type, target_type, target_id, actor_user_id, detail) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(incidentId, actionType, targetType ?? null, targetId ?? null, actorUserId, detail ?? null);
  audit({ actorUserId, actorRole, action: `incident_action_${actionType}`, targetType: targetType ?? "incident", targetId: targetId ?? incidentId, metadata: { incidentId } });
}

// Chaque action ci-dessous fait DEUX choses dans le même appel : l'effet
// réel (suspendre le compte, révoquer les sessions…) ET la trace
// (incident_actions + audit_logs) — jamais un bouton qui ne fait que du
// texte (§18 de la mission : « une capacité réelle d'action »).

export function actionSuspendAccount(incidentId: number, targetUserId: number, actor: { id: number; role: ConsoleRole }) {
  setUserStatus(targetUserId, "suspended");
  revokeAllSessionsForUser(targetUserId, actor.id);
  recordAction(incidentId, "suspend_account", actor.id, actor.role, "user", targetUserId, "Compte suspendu + sessions révoquées");
}

/** Même correctif que quickReactivateAction (app/(app)/users/actions.ts,
 * mission "FIX ACCOUNT LIFECYCLE GUARDS" 2026-08-29) — jamais 'active'
 * directement pour un compte jamais réellement activé. Retourne l'état
 * restauré pour que l'appelant (reactivateAccountAction) sache s'il doit
 * notifier ACCOUNT_REACTIVATED (uniquement si redevenu 'active'). */
export function actionReactivateAccount(incidentId: number, targetUserId: number, actor: { id: number; role: ConsoleRole }): "active" | "pending_activation" | null {
  const { changed, newStatus } = reactivateUserSafely(targetUserId);
  if (!changed) return null;
  recordAction(incidentId, "reactivate_account", actor.id, actor.role, "user", targetUserId, newStatus === "active" ? undefined : "Compte jamais activé — restauré vers 'en attente d'activation', pas 'actif'.");
  return newStatus;
}

export function actionRevokeSessions(incidentId: number, targetUserId: number, actor: { id: number; role: ConsoleRole }) {
  const n = revokeAllSessionsForUser(targetUserId, actor.id);
  recordAction(incidentId, "revoke_sessions", actor.id, actor.role, "user", targetUserId, `${n} session(s) révoquée(s)`);
}

export function actionSuspendExam(incidentId: number, assessmentId: number, actor: { id: number; role: ConsoleRole }) {
  suspendAssessment(assessmentId, actor.id, `Incident #${incidentId}`);
  recordAction(incidentId, "suspend_assessment", actor.id, actor.role, "assessment", assessmentId);
}

export function actionReopenExam(incidentId: number, assessmentId: number, actor: { id: number; role: ConsoleRole }) {
  reopenAssessment(assessmentId, actor.id);
  recordAction(incidentId, "reopen_assessment", actor.id, actor.role, "assessment", assessmentId);
}

export function actionAddNote(incidentId: number, note: string, actor: { id: number; role: ConsoleRole }) {
  recordAction(incidentId, "note", actor.id, actor.role, undefined, undefined, note);
}

export function actionCorrectiveMeasure(incidentId: number, measure: string, actor: { id: number; role: ConsoleRole }) {
  recordAction(incidentId, "corrective_measure", actor.id, actor.role, undefined, undefined, measure);
}

// Actions plateforme (addendum §9-11 — actions immédiates) : mode
// maintenance, blocage des connexions, blocage des nouvelles tentatives.
// Chacune fait deux choses comme les actions ci-dessus : l'effet réel
// (lib/platform-settings.ts, appliqué immédiatement à la prochaine requête
// de connexion/démarrage de tentative — voir lib/auth.ts et
// lib/attempts.ts) ET la trace (incident_actions + audit_logs).
export function actionEnableMaintenanceMode(incidentId: number, actor: { id: number; role: ConsoleRole }) {
  setPlatformSetting("maintenance_mode", true, actor);
  recordAction(incidentId, "enable_maintenance_mode", actor.id, actor.role, undefined, undefined, "Nouvelles connexions et nouvelles tentatives bloquées ; tentatives en cours préservées.");
}
export function actionDisableMaintenanceMode(incidentId: number, actor: { id: number; role: ConsoleRole }) {
  setPlatformSetting("maintenance_mode", false, actor);
  recordAction(incidentId, "disable_maintenance_mode", actor.id, actor.role);
}
export function actionBlockNewLogins(incidentId: number, actor: { id: number; role: ConsoleRole }) {
  setPlatformSetting("block_new_logins", true, actor);
  recordAction(incidentId, "block_new_logins", actor.id, actor.role, undefined, undefined, "Administrateur toujours exempté (nécessaire pour lever le blocage).");
}
export function actionUnblockNewLogins(incidentId: number, actor: { id: number; role: ConsoleRole }) {
  setPlatformSetting("block_new_logins", false, actor);
  recordAction(incidentId, "unblock_new_logins", actor.id, actor.role);
}
export function actionBlockNewAttempts(incidentId: number, actor: { id: number; role: ConsoleRole }) {
  setPlatformSetting("block_new_attempts", true, actor);
  recordAction(incidentId, "block_new_attempts", actor.id, actor.role, undefined, undefined, "Tentatives déjà en cours préservées, jamais interrompues.");
}
export function actionUnblockNewAttempts(incidentId: number, actor: { id: number; role: ConsoleRole }) {
  setPlatformSetting("block_new_attempts", false, actor);
  recordAction(incidentId, "unblock_new_attempts", actor.id, actor.role);
}
export function actionAttachEvidence(incidentId: number, description: string, actor: { id: number; role: ConsoleRole }) {
  recordAction(incidentId, "attach_evidence", actor.id, actor.role, undefined, undefined, description);
}

export function closeIncident(incidentId: number, actor: { id: number; role: ConsoleRole }) {
  getDb().prepare(`UPDATE incidents SET status = 'closed' WHERE id = ?`).run(incidentId);
  recordAction(incidentId, "close", actor.id, actor.role);
}

export function setIncidentStatus(incidentId: number, status: IncidentStatus, actor: { id: number; role: ConsoleRole }) {
  getDb().prepare(`UPDATE incidents SET status = ? WHERE id = ?`).run(status, incidentId);
  audit({ actorUserId: actor.id, actorRole: actor.role, action: "incident_status_change", targetType: "incident", targetId: incidentId, metadata: { status } });
}
