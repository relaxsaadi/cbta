import "server-only";
import { callMoodleServiceWs } from "@/lib/moodle-client";
import { queryReadOnly } from "@/lib/db-readonly";

export interface DashboardKpis {
  activeExams: number | null;
  candidates: number | null;
  completedExams: number | null;
  passRate: number | null; // pourcentage, null si aucune tentative
  questionBankSize: number | null;
}

// Chaque KPI est indépendant : l'échec d'un appel ne doit jamais faire
// tomber le reste du dashboard, et `null` signifie explicitement
// "donnée non disponible" (jamais une valeur inventée).
async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const [activeExams, candidates, completedExams, passRate, questionBankSize] = await Promise.all([
    safe(async () => {
      const courses = await queryReadOnly<{ id: number }>(
        `SELECT id FROM mdl_course WHERE id != 1`
      );
      if (courses.length === 0) return 0;
      const result = await callMoodleServiceWs<
        { quizzes: unknown[] }
      >("mod_quiz_get_quizzes_by_courses", {
        "courseids[0]": courses[0].id,
      });
      return result.quizzes?.length ?? 0;
    }),
    safe(async () => {
      const rows = await queryReadOnly<{ count: number }>(
        `SELECT COUNT(DISTINCT ue.userid) as count
         FROM mdl_user_enrolments ue
         JOIN mdl_enrol e ON e.id = ue.enrolid
         JOIN mdl_course c ON c.id = e.courseid
         WHERE c.id != 1`
      );
      return rows[0]?.count ?? 0;
    }),
    safe(async () => {
      const rows = await queryReadOnly<{ count: number }>(
        `SELECT COUNT(*) as count FROM mdl_quiz_attempts WHERE state = 'finished'`
      );
      return rows[0]?.count ?? 0;
    }),
    safe(async () => {
      const rows = await queryReadOnly<{ total: number; passed: number }>(
        `SELECT COUNT(*) as total,
                SUM(CASE WHEN gg.finalgrade >= gi.gradepass THEN 1 ELSE 0 END) as passed
         FROM mdl_grade_grades gg
         JOIN mdl_grade_items gi ON gi.id = gg.itemid
         WHERE gi.itemtype = 'mod' AND gi.itemmodule = 'quiz' AND gg.finalgrade IS NOT NULL`
      );
      const total = rows[0]?.total ?? 0;
      if (total === 0) return null;
      return Math.round(((rows[0]?.passed ?? 0) / total) * 100);
    }),
    safe(async () => {
      const rows = await queryReadOnly<{ count: number }>(
        `SELECT COUNT(*) as count FROM mdl_question WHERE parent = 0`
      );
      return rows[0]?.count ?? 0;
    }),
  ]);

  return { activeExams, candidates, completedExams, passRate, questionBankSize };
}
