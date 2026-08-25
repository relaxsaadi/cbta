import "server-only";
import { queryReadOnly } from "@/lib/db-readonly";
import { classifyScope, type DataScope } from "@/lib/data-scope";

// Moodle n'a pas d'entité "session" distincte : une session d'examen est
// dérivée de la fenêtre d'ouverture/fermeture réelle du Quiz + de ses
// tentatives réelles. Pas d'invention d'un système de sessions séparé.
export interface SessionRecord {
  examId: number;
  examName: string;
  timeOpen: string | null;
  timeClose: string | null;
  durationMinutes: number;
  candidatesStarted: number;
  candidatesCompleted: number;
  attemptsInProgress: number;
  status: "scheduled" | "open" | "closed" | "no_window";
  scope: DataScope;
}

function computeStatus(timeOpen: number, timeClose: number): SessionRecord["status"] {
  const now = Math.floor(Date.now() / 1000);
  if (timeOpen === 0 && timeClose === 0) return "no_window";
  if (timeOpen > now) return "scheduled";
  if (timeClose !== 0 && timeClose < now) return "closed";
  return "open";
}

export async function getSessions(): Promise<SessionRecord[]> {
  const rows = await queryReadOnly<{
    id: number;
    name: string;
    coursename: string;
    timeopen: number;
    timeclose: number;
    timelimit: number;
    started: number;
    completed: number;
    inprogress: number;
  }>(
    `SELECT
       q.id, q.name, c.fullname as coursename, q.timeopen, q.timeclose, q.timelimit,
       (SELECT COUNT(DISTINCT userid) FROM mdl_quiz_attempts qa WHERE qa.quiz = q.id AND qa.preview = 0) as started,
       (SELECT COUNT(*) FROM mdl_quiz_attempts qa WHERE qa.quiz = q.id AND qa.preview = 0 AND qa.state = 'finished') as completed,
       (SELECT COUNT(*) FROM mdl_quiz_attempts qa WHERE qa.quiz = q.id AND qa.preview = 0 AND qa.state = 'inprogress') as inprogress
     FROM mdl_quiz q
     JOIN mdl_course c ON c.id = q.course
     ORDER BY q.timeopen DESC`
  );

  return rows.map((r) => ({
    examId: r.id,
    examName: r.name,
    timeOpen: r.timeopen > 0 ? new Date(r.timeopen * 1000).toISOString() : null,
    timeClose: r.timeclose > 0 ? new Date(r.timeclose * 1000).toISOString() : null,
    durationMinutes: Math.round(r.timelimit / 60),
    candidatesStarted: r.started,
    candidatesCompleted: r.completed,
    attemptsInProgress: r.inprogress,
    status: computeStatus(r.timeopen, r.timeclose),
    // Même règle que exams-data.ts : nom du quiz + nom du cours — ne
    // JAMAIS classifier seulement sur le nom du quiz, sinon un examen dont
    // le cours est auto-déclaré "(Demo)" mais dont le nom de quiz ne
    // contient aucun marqueur se retrouve classé "production" par erreur
    // (bug réel trouvé par revue visuelle le 2026-08-25 : cette page et
    // /exams affichaient deux périmètres différents pour le même examen).
    scope: classifyScope(r.name, r.coursename),
  }));
}
