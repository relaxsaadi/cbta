import "server-only";
import { queryReadWrite, execReadWrite } from "@/lib/db-readwrite";
import type { IncidentCategory, IncidentPriority, IncidentStatus } from "@/lib/incident-constants";

export type { IncidentCategory, IncidentPriority, IncidentStatus };

export interface IncidentEvent {
  id: number;
  eventType: string;
  detail: string;
  actorUsername: string;
  createdAt: string;
}

export interface Incident {
  id: number;
  category: IncidentCategory;
  subject: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  reporterUsername: string;
  reporterFullName: string;
  relatedExam: string | null;
  relatedSession: string | null;
  attachmentNote: string | null;
  createdAt: string;
  updatedAt: string;
  events: IncidentEvent[];
}

interface IncidentRow {
  id: number;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  reporter_username: string;
  reporter_fullname: string;
  related_exam: string | null;
  related_session: string | null;
  attachment_note: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(r: IncidentRow): Omit<Incident, "events"> {
  return {
    id: r.id,
    category: r.category as IncidentCategory,
    subject: r.subject,
    description: r.description,
    priority: r.priority as IncidentPriority,
    status: r.status as IncidentStatus,
    reporterUsername: r.reporter_username,
    reporterFullName: r.reporter_fullname,
    relatedExam: r.related_exam,
    relatedSession: r.related_session,
    attachmentNote: r.attachment_note,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function createIncident(input: {
  category: IncidentCategory;
  subject: string;
  description: string;
  priority: IncidentPriority;
  reporterUsername: string;
  reporterFullName: string;
  relatedExam?: string | null;
  relatedSession?: string | null;
  attachmentNote?: string | null;
}): Promise<number> {
  const { insertId } = await execReadWrite(
    `INSERT INTO kost_console_incidents
       (category, subject, description, priority, status, reporter_username, reporter_fullname, related_exam, related_session, attachment_note)
     VALUES (?, ?, ?, ?, 'open', ?, ?, ?, ?, ?)`,
    [
      input.category,
      input.subject,
      input.description,
      input.priority,
      input.reporterUsername,
      input.reporterFullName,
      input.relatedExam ?? null,
      input.relatedSession ?? null,
      input.attachmentNote ?? null,
    ]
  );
  await execReadWrite(
    `INSERT INTO kost_console_incident_events (incident_id, event_type, detail, actor_username)
     VALUES (?, 'created', 'Incident reported', ?)`,
    [insertId, input.reporterUsername]
  );
  return insertId;
}

export async function getIncidents(): Promise<Incident[]> {
  const rows = await queryReadWrite<IncidentRow>(
    `SELECT * FROM kost_console_incidents ORDER BY created_at DESC`
  );
  const events = await queryReadWrite<{
    id: number;
    incident_id: number;
    event_type: string;
    detail: string;
    actor_username: string;
    created_at: string;
  }>(`SELECT * FROM kost_console_incident_events ORDER BY created_at ASC`);

  return rows.map((r) => ({
    ...mapRow(r),
    events: events
      .filter((e) => e.incident_id === r.id)
      .map((e) => ({
        id: e.id,
        eventType: e.event_type,
        detail: e.detail,
        actorUsername: e.actor_username,
        createdAt: new Date(e.created_at).toISOString(),
      })),
  }));
}

export async function updateIncidentStatus(
  incidentId: number,
  newStatus: IncidentStatus,
  actorUsername: string
): Promise<void> {
  await execReadWrite(`UPDATE kost_console_incidents SET status = ? WHERE id = ?`, [
    newStatus,
    incidentId,
  ]);
  await execReadWrite(
    `INSERT INTO kost_console_incident_events (incident_id, event_type, detail, actor_username)
     VALUES (?, 'status_change', ?, ?)`,
    [incidentId, `Status changed to "${newStatus}"`, actorUsername]
  );
}

export async function getIncidentCount(): Promise<number> {
  const rows = await queryReadWrite<{ n: number }>(
    `SELECT COUNT(*) as n FROM kost_console_incidents`
  );
  return rows[0]?.n ?? 0;
}
