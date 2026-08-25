import "server-only";
import { queryReadOnly } from "@/lib/db-readonly";

export interface LogEntry {
  id: number;
  timestamp: string;
  userFullName: string;
  action: string;
  component: string;
  eventName: string;
  ip: string | null;
  courseId: number | null;
}

export async function getAuditLogs(limit = 100): Promise<LogEntry[]> {
  const rows = await queryReadOnly<{
    id: number;
    timecreated: number;
    firstname: string | null;
    lastname: string | null;
    action: string;
    component: string;
    eventname: string;
    ip: string | null;
    courseid: number | null;
  }>(
    `SELECT
       l.id, l.timecreated, u.firstname, u.lastname,
       l.action, l.component, l.eventname, l.ip, l.courseid
     FROM mdl_logstore_standard_log l
     LEFT JOIN mdl_user u ON u.id = l.userid
     ORDER BY l.timecreated DESC
     LIMIT ?`,
    [limit]
  );

  return rows.map((r) => ({
    id: r.id,
    timestamp: new Date(r.timecreated * 1000).toISOString(),
    userFullName: r.firstname ? `${r.firstname} ${r.lastname}` : "System / Guest",
    action: r.action,
    component: r.component.replace(/^(mod_|core_|report_)/, ""),
    eventName: r.eventname.split("\\").pop() ?? r.eventname,
    ip: r.ip,
    courseId: r.courseid,
  }));
}

export async function getAuditLogCount(): Promise<number> {
  const rows = await queryReadOnly<{ count: number }>(
    `SELECT COUNT(*) as count FROM mdl_logstore_standard_log`
  );
  return rows[0]?.count ?? 0;
}
