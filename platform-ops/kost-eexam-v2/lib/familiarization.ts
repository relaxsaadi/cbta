// Module de familiarisation (addendum §18-21) — sessions de
// familiarisation à la plateforme AVANT l'examen réel, distinctes des
// évaluations. Chaque session porte sur un groupe et une fonction DGR ;
// chaque candidat du groupe y a une ligne de présence.
import { getDb, transaction, nowIso } from "./db";
import { audit } from "./audit";
import { listGroupMembers } from "./groups";
import type { ConsoleRole } from "./session";

export interface FamiliarizationSessionRow {
  id: number;
  group_id: number;
  function_code: string;
  held_at: string;
  location: string | null;
  notes: string | null;
  organized_by: number | null;
  created_at: string;
}

export interface FamiliarizationSessionWithContext extends FamiliarizationSessionRow {
  group_name: string;
  company_name: string;
  organizer_name: string | null;
}

export interface AttendanceRow {
  candidate_user_id: number;
  full_name: string;
  username: string;
  present: number;
  marked_at: string | null;
}

export function listFamiliarizationSessions(restrictToGroupIdsOrNull: number[] | null = null): FamiliarizationSessionWithContext[] {
  const db = getDb();
  if (restrictToGroupIdsOrNull && restrictToGroupIdsOrNull.length === 0) return [];
  const where = restrictToGroupIdsOrNull ? `WHERE fs.group_id IN (${restrictToGroupIdsOrNull.map(() => "?").join(",")})` : "";
  return db
    .prepare(
      `SELECT fs.*, g.name AS group_name, c.name AS company_name, u.full_name AS organizer_name
       FROM familiarization_sessions fs
       JOIN groups g ON g.id = fs.group_id
       JOIN companies c ON c.id = g.company_id
       LEFT JOIN users u ON u.id = fs.organized_by
       ${where}
       ORDER BY fs.held_at DESC`
    )
    .all(...(restrictToGroupIdsOrNull ?? [])) as unknown as FamiliarizationSessionWithContext[];
}

export function getFamiliarizationSession(id: number): FamiliarizationSessionWithContext | undefined {
  return getDb()
    .prepare(
      `SELECT fs.*, g.name AS group_name, c.name AS company_name, u.full_name AS organizer_name
       FROM familiarization_sessions fs
       JOIN groups g ON g.id = fs.group_id
       JOIN companies c ON c.id = g.company_id
       LEFT JOIN users u ON u.id = fs.organized_by
       WHERE fs.id = ?`
    )
    .get(id) as FamiliarizationSessionWithContext | undefined;
}

/** Crée la session ET une ligne de présence (absent par défaut) pour
 * chaque membre actuel du groupe — évite d'avoir à ressaisir la liste
 * des candidats séparément (même source que le groupe réel). */
export function createFamiliarizationSession(params: {
  groupId: number;
  functionCode: string;
  heldAt: string;
  location?: string;
  notes?: string;
  organizedBy: number;
  organizerRole: ConsoleRole;
}): number {
  const members = listGroupMembers(params.groupId);
  return transaction((db) => {
    const result = db
      .prepare(
        `INSERT INTO familiarization_sessions (group_id, function_code, held_at, location, notes, organized_by)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(params.groupId, params.functionCode, params.heldAt, params.location ?? null, params.notes ?? null, params.organizedBy);
    const sessionId = Number(result.lastInsertRowid);
    const insertAttendance = db.prepare(
      `INSERT INTO familiarization_attendance (session_id, candidate_user_id, present) VALUES (?, ?, 0)`
    );
    for (const m of members) insertAttendance.run(sessionId, m.candidate_user_id);
    audit({
      actorUserId: params.organizedBy,
      actorRole: params.organizerRole,
      action: "familiarization_session_create",
      targetType: "familiarization_session",
      targetId: sessionId,
      metadata: { groupId: params.groupId, functionCode: params.functionCode, heldAt: params.heldAt, candidateCount: members.length },
    });
    return sessionId;
  });
}

export function listAttendance(sessionId: number): AttendanceRow[] {
  return getDb()
    .prepare(
      `SELECT fa.candidate_user_id, u.full_name, u.username, fa.present, fa.marked_at
       FROM familiarization_attendance fa
       JOIN users u ON u.id = fa.candidate_user_id
       WHERE fa.session_id = ?
       ORDER BY u.full_name`
    )
    .all(sessionId) as unknown as AttendanceRow[];
}

export function markAttendance(sessionId: number, candidateUserId: number, present: boolean, actor: { id: number; role: ConsoleRole }): void {
  getDb()
    .prepare(
      `UPDATE familiarization_attendance SET present = ?, marked_at = ?, marked_by = ?
       WHERE session_id = ? AND candidate_user_id = ?`
    )
    .run(present ? 1 : 0, nowIso(), actor.id, sessionId, candidateUserId);
  audit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: present ? "familiarization_attendance_present" : "familiarization_attendance_absent",
    targetType: "familiarization_session",
    targetId: sessionId,
    metadata: { candidateUserId },
  });
}

export interface CandidateFamiliarizationRecord {
  session_id: number;
  held_at: string;
  function_code: string;
  group_name: string;
  present: number;
}

/** Historique de familiarisation d'un candidat (addendum §18-21 —
 * « familiarization records tied to user history ») — toutes les
 * sessions où ce candidat a une ligne de présence, quel que soit le
 * groupe (utile après un transfert de groupe), triées les plus
 * récentes d'abord. */
export function getCandidateFamiliarizationHistory(candidateUserId: number): CandidateFamiliarizationRecord[] {
  return getDb()
    .prepare(
      `SELECT fs.id AS session_id, fs.held_at, fs.function_code, g.name AS group_name, fa.present
       FROM familiarization_attendance fa
       JOIN familiarization_sessions fs ON fs.id = fa.session_id
       JOIN groups g ON g.id = fs.group_id
       WHERE fa.candidate_user_id = ?
       ORDER BY fs.held_at DESC`
    )
    .all(candidateUserId) as unknown as CandidateFamiliarizationRecord[];
}
