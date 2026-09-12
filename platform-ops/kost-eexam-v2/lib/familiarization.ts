// Module de familiarisation (addendum §18-21) — sessions de
// familiarisation à la plateforme AVANT l'examen réel, distinctes des
// évaluations. Les lignes de présence candidat ne sont créées que pour les
// sessions qui incluent effectivement les candidats.
import { getDb, transaction, nowIso } from "./db";
import { audit } from "./audit";
import { listGroupMembers } from "./groups";
import type { ConsoleRole } from "./session";
import {
  familiarizationAudienceIncludesCandidates,
  type FamiliarizationAudience,
} from "./familiarization-audience";

export interface FamiliarizationSessionRow {
  id: number;
  group_id: number;
  function_code: string;
  held_at: string;
  location: string | null;
  notes: string | null;
  organized_by: number | null;
  created_at: string;
  /** Mission "CLOSE AUDITOR REMARKS" (2026-08-31) §17 — l'auditeur exige
   * que la familiarisation soit planifiable pour le PERSONNEL et pour les
   * CANDIDATS. Colonnes additives (scripts/migrate.ts) — nullable, jamais
   * rétroactivement complétées pour une session existante. */
  audience: FamiliarizationAudience | null;
  ended_at: string | null;
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

export interface FamiliarizationFilter {
  companyId?: number;
  groupId?: number;
  functionCode?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  restrictToGroupIdsOrNull?: number[] | null;
}

/** Version filtrée pour /familiarisation (§11). Pas de filtre Candidat/
 * Rôle/Statut au niveau de CETTE liste : une session de familiarisation
 * porte sur un GROUPE entier. Pour les audiences candidats/mixte, la table
 * familiarization_attendance porte la granularité candidat et reste
 * consultable dans le détail d'une session via
 * app/(app)/familiarisation/[id]/page.tsx. Une session personnel ne crée
 * volontairement aucune présence candidat. Inventer un filtre
 * Candidat/Statut à ce niveau produirait "une session contient au moins un
 * candidat correspondant", une sémantique différente et non demandée —
 * voir §14/§6 "do not invent relationships that do not exist". "Rôle"
 * n'a pas non plus de colonne réelle correspondante sur une session
 * (organized_by est une personne, pas un rôle stocké séparément). */
export function listFamiliarizationSessionsFiltered(filter: FamiliarizationFilter = {}): FamiliarizationSessionWithContext[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  const restrict = filter.restrictToGroupIdsOrNull;
  if (restrict !== undefined) {
    if (restrict === null) {
      // pas de restriction (administrator/auditor)
    } else if (restrict.length === 0) {
      return [];
    } else {
      clauses.push(`fs.group_id IN (${restrict.map(() => "?").join(",")})`);
      params.push(...restrict);
    }
  }
  if (filter.companyId) {
    clauses.push(`c.id = ?`);
    params.push(filter.companyId);
  }
  if (filter.groupId) {
    clauses.push(`fs.group_id = ?`);
    params.push(filter.groupId);
  }
  if (filter.functionCode) {
    clauses.push(`fs.function_code = ?`);
    params.push(filter.functionCode);
  }
  if (filter.dateFrom) {
    clauses.push(`fs.held_at >= ?`);
    params.push(`${filter.dateFrom}T00:00:00.000Z`);
  }
  if (filter.dateTo) {
    clauses.push(`fs.held_at <= ?`);
    params.push(`${filter.dateTo}T23:59:59.999Z`);
  }
  if (filter.search) {
    clauses.push(`(LOWER(g.name) LIKE ? OR LOWER(c.name) LIKE ? OR LOWER(COALESCE(fs.location, '')) LIKE ?)`);
    const needle = `%${filter.search.toLowerCase()}%`;
    params.push(needle, needle, needle);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
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
    .all(...params) as unknown as FamiliarizationSessionWithContext[];
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

/** Crée la session et, uniquement quand l'audience inclut les candidats,
 * une ligne de présence (absent par défaut) pour chaque membre actuel du
 * groupe. Une audience NULL est traitée comme l'ancien comportement
 * candidat-facing afin de préserver les appels/données historiques. */
export function createFamiliarizationSession(params: {
  groupId: number;
  functionCode: string;
  heldAt: string;
  location?: string;
  notes?: string;
  organizedBy: number;
  organizerRole: ConsoleRole;
  audience?: FamiliarizationAudience;
  endedAt?: string;
}): number {
  const includesCandidates =
    params.audience == null || familiarizationAudienceIncludesCandidates(params.audience);
  const members = includesCandidates ? listGroupMembers(params.groupId) : [];
  return transaction((db) => {
    const result = db
      .prepare(
        `INSERT INTO familiarization_sessions (group_id, function_code, held_at, location, notes, organized_by, audience, ended_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        params.groupId,
        params.functionCode,
        params.heldAt,
        params.location ?? null,
        params.notes ?? null,
        params.organizedBy,
        params.audience ?? null,
        params.endedAt ?? null
      );
    const sessionId = Number(result.lastInsertRowid);
    if (includesCandidates) {
      const insertAttendance = db.prepare(
        `INSERT INTO familiarization_attendance (session_id, candidate_user_id, present) VALUES (?, ?, 0)`
      );
      for (const m of members) insertAttendance.run(sessionId, m.candidate_user_id);
    }
    audit({
      actorUserId: params.organizedBy,
      actorRole: params.organizerRole,
      action: "familiarization_session_create",
      targetType: "familiarization_session",
      targetId: sessionId,
      metadata: {
        groupId: params.groupId,
        functionCode: params.functionCode,
        heldAt: params.heldAt,
        audience: params.audience ?? null,
        candidateCount: members.length,
      },
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
 * « familiarization records tied to user history ») — sessions
 * candidats/mixte où ce candidat a une ligne de présence, quel que soit le
 * groupe (utile après un transfert). Les anciennes sessions sans audience
 * restent visibles. Le filtre personnel est défensif : il empêche aussi
 * d'exposer d'éventuelles lignes candidat créées avant ce correctif. */
export function getCandidateFamiliarizationHistory(candidateUserId: number): CandidateFamiliarizationRecord[] {
  return getDb()
    .prepare(
      `SELECT fs.id AS session_id, fs.held_at, fs.function_code, g.name AS group_name, fa.present
       FROM familiarization_attendance fa
       JOIN familiarization_sessions fs ON fs.id = fa.session_id
       JOIN groups g ON g.id = fs.group_id
       WHERE fa.candidate_user_id = ?
         AND (fs.audience IS NULL OR fs.audience <> 'personnel')
       ORDER BY fs.held_at DESC`
    )
    .all(candidateUserId) as unknown as CandidateFamiliarizationRecord[];
}

// ---------------------------------------------------------------------
// Preuve de familiarisation (mission "CLOSE AUDITOR REMARKS", 2026-08-31,
// §20-21) — une RÉFÉRENCE/description textuelle horodatée, jamais un
// fichier binaire uploadé (même discipline que incident_actions/
// attach_evidence, lib/incidents.ts) : élimine structurellement tout
// risque de stockage public/URL exposée. Journal en ajout seul.
// ---------------------------------------------------------------------
export interface FamiliarizationEvidenceRow {
  id: number;
  session_id: number;
  description: string;
  recorded_by: number | null;
  recorded_by_name: string | null;
  created_at: string;
}

export function addFamiliarizationEvidence(sessionId: number, description: string, actor: { id: number; role: ConsoleRole }): number {
  const result = getDb()
    .prepare(`INSERT INTO familiarization_evidence (session_id, description, recorded_by) VALUES (?, ?, ?)`)
    .run(sessionId, description, actor.id);
  audit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "familiarization_evidence_attached",
    targetType: "familiarization_session",
    targetId: sessionId,
  });
  return Number(result.lastInsertRowid);
}

export function listFamiliarizationEvidence(sessionId: number): FamiliarizationEvidenceRow[] {
  return getDb()
    .prepare(
      `SELECT fe.*, u.full_name AS recorded_by_name
       FROM familiarization_evidence fe
       LEFT JOIN users u ON u.id = fe.recorded_by
       WHERE fe.session_id = ?
       ORDER BY fe.id DESC`
    )
    .all(sessionId) as unknown as FamiliarizationEvidenceRow[];
}
