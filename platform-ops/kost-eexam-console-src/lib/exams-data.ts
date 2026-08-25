import "server-only";
import { queryReadOnly } from "@/lib/db-readonly";
import { classifyScope, type DataScope } from "@/lib/data-scope";

export interface ExamRecord {
  id: number;
  cmid: number;
  name: string;
  course: string;
  dgrFunctions: string[];
  durationMinutes: number;
  passingScore: number | null;
  maxGrade: number;
  timeOpen: string | null;
  timeClose: string | null;
  numQuestions: number;
  attemptsAllowed: number;
  shuffleAnswers: boolean;
  overdueHandling: string;
  status: "open" | "scheduled" | "closed" | "no_window";
  scope: DataScope;
}

function computeStatus(timeOpen: number, timeClose: number): ExamRecord["status"] {
  const now = Math.floor(Date.now() / 1000);
  if (timeOpen === 0 && timeClose === 0) return "no_window";
  if (timeOpen > now) return "scheduled";
  if (timeClose !== 0 && timeClose < now) return "closed";
  return "open";
}

export async function getExams(): Promise<ExamRecord[]> {
  const rows = await queryReadOnly<{
    id: number;
    cmid: number;
    name: string;
    coursename: string;
    timeopen: number;
    timeclose: number;
    timelimit: number;
    attempts: number;
    shuffleanswers: number;
    overduehandling: string;
    sumgrades: number;
    grade: number;
    numslots: number;
    gradepass: string | null;
  }>(
    `SELECT
       q.id, cm.id as cmid, q.name,
       c.fullname as coursename,
       q.timeopen, q.timeclose, q.timelimit, q.attempts, q.shuffleanswers,
       q.overduehandling, q.sumgrades, q.grade,
       (SELECT COUNT(*) FROM mdl_quiz_slots qs WHERE qs.quizid = q.id) as numslots,
       (SELECT gi.gradepass FROM mdl_grade_items gi
        WHERE gi.itemmodule = 'quiz' AND gi.iteminstance = q.id AND gi.itemtype = 'mod') as gradepass
     FROM mdl_quiz q
     JOIN mdl_course c ON c.id = q.course
     JOIN mdl_modules m ON m.name = 'quiz'
     JOIN mdl_course_modules cm ON cm.instance = q.id AND cm.module = m.id
     ORDER BY q.id DESC`
  );

  const tagRows = await queryReadOnly<{ quizid: number; tagname: string }>(
    `SELECT ti.itemid as quizid, t.rawname as tagname
     FROM mdl_tag_instance ti
     JOIN mdl_tag t ON t.id = ti.tagid
     WHERE ti.component = 'mod_quiz' AND ti.itemtype = 'quiz' AND t.rawname LIKE 'function-%'`
  ).catch(() => []);

  return rows.map((r) => ({
    id: r.id,
    cmid: r.cmid,
    name: r.name,
    course: r.coursename,
    dgrFunctions: tagRows
      .filter((t) => t.quizid === r.id)
      .map((t) => t.tagname.replace("function-", "Function ")),
    durationMinutes: Math.round(r.timelimit / 60),
    passingScore: r.gradepass !== null ? Math.round(parseFloat(r.gradepass)) : null,
    maxGrade: parseFloat(String(r.grade)), // mysql2 renvoie les DECIMAL sous forme de chaîne
    timeOpen: r.timeopen > 0 ? new Date(r.timeopen * 1000).toISOString() : null,
    timeClose: r.timeclose > 0 ? new Date(r.timeclose * 1000).toISOString() : null,
    numQuestions: r.numslots,
    attemptsAllowed: r.attempts === 0 ? Infinity : r.attempts,
    shuffleAnswers: r.shuffleanswers === 1,
    overdueHandling: r.overduehandling,
    status: computeStatus(r.timeopen, r.timeclose),
    scope: classifyScope(r.name, r.coursename),
  }));
}
