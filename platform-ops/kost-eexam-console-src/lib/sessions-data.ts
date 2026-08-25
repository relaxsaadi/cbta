import "server-only";
import { queryReadOnly } from "@/lib/db-readonly";

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
    timeopen: number;
    timeclose: number;
    timelimit: number;
    started: number;
    completed: number;
    inprogress: number;
  }>(
    `SELECT
       q.id, q.name, q.timeopen, q.timeclose, q.timelimit,
       (SELECT COUNT(DISTINCT userid) FROM mdl_quiz_attempts qa WHERE qa.quiz = q.id AND qa.preview = 0) as started,
       (SELECT COUNT(*) FROM mdl_quiz_attempts qa WHERE qa.quiz = q.id AND qa.preview = 0 AND qa.state = 'finished') as completed,
       (SELECT COUNT(*) FROM mdl_quiz_attempts qa WHERE qa.quiz = q.id AND qa.preview = 0 AND qa.state = 'inprogress') as inprogress
     FROM mdl_quiz q
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
  }));
}
