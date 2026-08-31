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
  /** §25-26 de la mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF"
   * (2026-08-31) — tentative auto-associée quand déclaré depuis un examen. */
  attempt_id: number | null;
  /** Calculé (jamais une colonne figée qui pourrait diverger du rôle réel
   * de created_by) — voir INCIDENT_ORIGIN_SUBQUERY plus bas. 1 = déclaré
   * par un compte candidat, 0 sinon (y compris created_by NULL). */
  reported_by_candidate: number;
}

/** Sous-requête partagée (§29 "clairement labellisé « Déclaré par le
 * candidat »") — même patron déjà établi ailleurs pour résoudre un rôle
 * depuis user_roles/roles (lib/users.ts::getRoleForUser, lib/
 * sessions-registry.ts, lib/user-directory.ts) : jamais une colonne
 * dupliquée qui pourrait diverger si le rôle d'un compte changeait après
 * coup — toujours recalculé depuis la source de vérité (user_roles). */
const INCIDENT_ORIGIN_SUBQUERY = `
  (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = i.created_by AND r.code = 'candidate'
  )) AS reported_by_candidate`;

/** Frontière multi-client (lib/tenant-scope.ts) — `restrictToGroupIdsOrNull`
 * vient de la session serveur, jamais d'un paramètre client. `null` = pas
 * de restriction (administrator/auditor). Un tableau (même vide) filtre
 * aux incidents PLATEFORME (group_id NULL, visibles de tous) UNIS aux
 * incidents des groupes listés — jamais les incidents d'un autre client. */
export function listIncidents(restrictToGroupIdsOrNull: number[] | null = null): IncidentRow[] {
  if (restrictToGroupIdsOrNull === null) {
    return getDb().prepare(`SELECT i.*, ${INCIDENT_ORIGIN_SUBQUERY} FROM incidents i ORDER BY i.created_at DESC`).all() as unknown as IncidentRow[];
  }
  if (restrictToGroupIdsOrNull.length === 0) {
    return getDb()
      .prepare(`SELECT i.*, ${INCIDENT_ORIGIN_SUBQUERY} FROM incidents i WHERE i.group_id IS NULL ORDER BY i.created_at DESC`)
      .all() as unknown as IncidentRow[];
  }
  const placeholders = restrictToGroupIdsOrNull.map(() => "?").join(",");
  return getDb()
    .prepare(`SELECT i.*, ${INCIDENT_ORIGIN_SUBQUERY} FROM incidents i WHERE i.group_id IS NULL OR i.group_id IN (${placeholders}) ORDER BY i.created_at DESC`)
    .all(...restrictToGroupIdsOrNull) as unknown as IncidentRow[];
}

export function getIncident(id: number): IncidentRow | undefined {
  return getDb().prepare(`SELECT i.*, ${INCIDENT_ORIGIN_SUBQUERY} FROM incidents i WHERE i.id = ?`).get(id) as IncidentRow | undefined;
}

export interface IncidentsFilter {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  companyId?: number;
  groupId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  /** Frontière multi-client — vient TOUJOURS de la session serveur (jamais
   * d'un paramètre client), même garde que listIncidents() ci-dessus :
   * `null` = pas de restriction (administrator/auditor) ; un tableau (même
   * vide) restreint aux incidents plateforme (group_id NULL) unis à ceux
   * des groupes listés. */
  restrictToGroupIdsOrNull?: number[] | null;
}

/** Version filtrée pour /incidents (§9). Pas de filtre "Assessment/exam" :
 * `incidents` n'a aucune colonne assessment_id (le lien à un examen
 * n'existe qu'au niveau d'une ACTION ponctuelle — incident_actions de type
 * suspend_assessment/reopen_assessment — jamais une propriété stable de
 * l'incident lui-même) ; l'inventer produirait une relation qui n'existe
 * pas réellement à ce niveau. */
export function listIncidentsFiltered(filter: IncidentsFilter = {}): IncidentRow[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  const restrict = filter.restrictToGroupIdsOrNull;
  if (restrict !== undefined && restrict !== null) {
    if (restrict.length === 0) {
      clauses.push(`i.group_id IS NULL`);
    } else {
      clauses.push(`(i.group_id IS NULL OR i.group_id IN (${restrict.map(() => "?").join(",")}))`);
      params.push(...restrict);
    }
  }
  if (filter.status) {
    clauses.push(`i.status = ?`);
    params.push(filter.status);
  }
  if (filter.severity) {
    clauses.push(`i.severity = ?`);
    params.push(filter.severity);
  }
  if (filter.companyId) {
    // Un client donné ne concerne que les incidents de SES groupes —
    // jamais les incidents plateforme (group_id NULL) quand ce filtre
    // précis est actif : l'utilisateur a explicitement demandé "ce
    // client", pas "ce client + tout le reste".
    clauses.push(`i.group_id IN (SELECT id FROM groups WHERE company_id = ?)`);
    params.push(filter.companyId);
  }
  if (filter.groupId) {
    clauses.push(`i.group_id = ?`);
    params.push(filter.groupId);
  }
  if (filter.dateFrom) {
    clauses.push(`i.occurred_at >= ?`);
    params.push(`${filter.dateFrom}T00:00:00.000Z`);
  }
  if (filter.dateTo) {
    clauses.push(`i.occurred_at <= ?`);
    params.push(`${filter.dateTo}T23:59:59.999Z`);
  }
  if (filter.search) {
    clauses.push(`(LOWER(i.type) LIKE ? OR LOWER(i.description) LIKE ?)`);
    const needle = `%${filter.search.toLowerCase()}%`;
    params.push(needle, needle);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db.prepare(`SELECT i.*, ${INCIDENT_ORIGIN_SUBQUERY} FROM incidents i ${where} ORDER BY i.created_at DESC`).all(...params) as unknown as IncidentRow[];
}

export function declareIncident(params: {
  type: string;
  severity: IncidentSeverity;
  description: string;
  systemConcerned?: string;
  peopleConcerned?: string;
  responsibleUserId?: number;
  groupId?: number;
  /** §25-26 — tentative concernée (auto-associée côté candidat, choix
   * explicite possible côté admin/responsable plus tard si le besoin se
   * présente — non exposé dans DeclareIncidentForm.tsx pour l'instant). */
  attemptId?: number;
  createdBy: number;
  createdByRole: ConsoleRole;
}): number {
  const result = getDb()
    .prepare(
      `INSERT INTO incidents (type, severity, description, system_concerned, people_concerned, responsible_user_id, group_id, created_by, attempt_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      params.type,
      params.severity,
      params.description,
      params.systemConcerned ?? null,
      params.peopleConcerned ?? null,
      params.responsibleUserId ?? null,
      params.groupId ?? null,
      params.createdBy,
      params.attemptId ?? null
    );
  const incidentId = Number(result.lastInsertRowid);
  audit({ actorUserId: params.createdBy, actorRole: params.createdByRole, action: "incident_declare", targetType: "incident", targetId: incidentId, metadata: { type: params.type, severity: params.severity, groupId: params.groupId ?? null, attemptId: params.attemptId ?? null } });
  return incidentId;
}

export class CandidateIncidentError extends Error {}

/** §24-33 — déclaration candidat, wrapper CONTRAINT autour de
 * declareIncident() (jamais un second point d'écriture divergent) :
 *   - severity JAMAIS fournie par le candidat (§25 — classification
 *     réservée à l'admin) : toujours 'low', l'admin réévalue/escalade
 *     ensuite via le workflow incident existant s'il y a lieu.
 *   - attemptId, s'il est fourni, DOIT appartenir à ce candidat — jamais
 *     une confiance aveugle dans une valeur venue du client (§37 "cannot
 *     spoof another attempt ID").
 *   - groupId dérivé SERVEUR (tentative→examen→groupe, ou 1ère
 *     affiliation du candidat si aucune tentative) — jamais fourni par le
 *     candidat, garantit que l'incident reste dans le même périmètre
 *     tenant que tout le reste (lib/tenant-scope.ts) pour la visibilité
 *     responsable/admin (§29/§33).
 *   - audit DÉDIÉ candidate_incident_declared en plus de incident_declare
 *     (déjà tiré par declareIncident ci-dessus) — §31 "au moins
 *     CANDIDATE_INCIDENT_CREATED (ou nommage existant cohérent)" : nommage
 *     snake_case aligné sur la convention déjà établie de ce fichier
 *     (incident_declare, incident_action_*, incident_status_change),
 *     jamais la casse ad-hoc suggérée littéralement par la mission. */
export function declareCandidateIncident(params: {
  type: string;
  description: string;
  attemptId?: number;
  candidateUserId: number;
}): number {
  const db = getDb();
  let groupId: number | undefined;

  if (params.attemptId !== undefined) {
    const attempt = db
      .prepare(`SELECT at.candidate_user_id, a.group_id FROM attempts at JOIN assessments a ON a.id = at.assessment_id WHERE at.id = ?`)
      .get(params.attemptId) as { candidate_user_id: number; group_id: number } | undefined;
    if (!attempt || attempt.candidate_user_id !== params.candidateUserId) {
      throw new CandidateIncidentError("Tentative introuvable.");
    }
    groupId = attempt.group_id;
  } else {
    const membership = db.prepare(`SELECT group_id FROM group_members WHERE candidate_user_id = ? LIMIT 1`).get(params.candidateUserId) as { group_id: number } | undefined;
    groupId = membership?.group_id;
  }

  const incidentId = declareIncident({
    type: params.type,
    severity: "low",
    description: params.description,
    groupId,
    attemptId: params.attemptId,
    createdBy: params.candidateUserId,
    createdByRole: "candidate",
  });

  audit({
    actorUserId: params.candidateUserId,
    actorRole: "candidate",
    action: "candidate_incident_declared",
    targetType: "incident",
    targetId: incidentId,
    metadata: { type: params.type, attemptId: params.attemptId ?? null, groupId: groupId ?? null },
  });

  return incidentId;
}

/** §28 — le candidat voit UNIQUEMENT ses propres incidents déclarés
 * (created_by = lui-même), jamais ceux d'un autre candidat, jamais les
 * notes/preuves internes (incident_actions n'est jamais lu ici — voir
 * app/(app)/mes-examens/page.tsx, qui n'affiche que type/statut/date). */
export function listMyIncidents(candidateUserId: number): IncidentRow[] {
  return getDb()
    .prepare(`SELECT i.*, ${INCIDENT_ORIGIN_SUBQUERY} FROM incidents i WHERE i.created_by = ? ORDER BY i.created_at DESC`)
    .all(candidateUserId) as unknown as IncidentRow[];
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
