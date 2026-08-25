import "server-only";
import { queryReadOnly } from "@/lib/db-readonly";
import { classifyScope, type DataScope } from "@/lib/data-scope";

export interface CandidateRecord {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  courses: { id: number; name: string; scope: DataScope }[];
  attemptsStarted: number;
  attemptsCompleted: number;
  lastAttempt: string | null;
}

/**
 * Candidats réels = utilisateurs Moodle inscrits dans un cours autre que le
 * cours système (id 1), à l'exclusion des comptes techniques/de service
 * (identifiés uniquement via le rôle Moodle réel `kost_console_service` —
 * jamais par une liste de noms devinée). Aucune donnée n'est inventée : si
 * un candidat n'a jamais tenté d'examen, ses compteurs de tentatives sont 0.
 */
export async function getCandidates(): Promise<CandidateRecord[]> {
  const serviceAccountRows = await queryReadOnly<{ userid: number }>(
    `SELECT ra.userid
     FROM mdl_role_assignments ra
     JOIN mdl_role r ON r.id = ra.roleid
     WHERE r.shortname = 'kost_console_service'`
  ).catch(() => []);
  const serviceAccountIds = new Set(serviceAccountRows.map((r) => r.userid));

  const users = await queryReadOnly<{
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
  }>(
    `SELECT DISTINCT u.id, u.username, u.firstname, u.lastname, u.email
     FROM mdl_user_enrolments ue
     JOIN mdl_enrol e ON e.id = ue.enrolid
     JOIN mdl_course c ON c.id = e.courseid
     JOIN mdl_user u ON u.id = ue.userid
     WHERE c.id != 1 AND u.deleted = 0`
  );

  const courseRows = await queryReadOnly<{ userid: number; courseid: number; coursename: string }>(
    `SELECT DISTINCT ue.userid, c.id as courseid, c.fullname as coursename
     FROM mdl_user_enrolments ue
     JOIN mdl_enrol e ON e.id = ue.enrolid
     JOIN mdl_course c ON c.id = e.courseid
     WHERE c.id != 1`
  );

  const attemptRows = await queryReadOnly<{
    userid: number;
    started: number;
    completed: number;
    lastattempt: number | null;
  }>(
    `SELECT userid,
            COUNT(*) as started,
            SUM(CASE WHEN state = 'finished' THEN 1 ELSE 0 END) as completed,
            MAX(timestart) as lastattempt
     FROM mdl_quiz_attempts
     WHERE preview = 0
     GROUP BY userid`
  ).catch(() => []);

  return users
    .filter((u) => !serviceAccountIds.has(u.id))
    .map((u) => {
      const courses = courseRows
        .filter((c) => c.userid === u.id)
        .map((c) => ({ id: c.courseid, name: c.coursename, scope: classifyScope(c.coursename) }));
      const attempts = attemptRows.find((a) => a.userid === u.id);
      return {
        userId: u.id,
        username: u.username,
        fullName: `${u.firstname} ${u.lastname}`,
        email: u.email,
        courses,
        attemptsStarted: attempts?.started ?? 0,
        attemptsCompleted: attempts?.completed ?? 0,
        lastAttempt: attempts?.lastattempt ? new Date(attempts.lastattempt * 1000).toISOString() : null,
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}
