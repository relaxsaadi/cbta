import "server-only";
import { queryReadOnly } from "@/lib/db-readonly";

export type AttemptState = "inprogress" | "finished" | "overdue" | "abandoned";

export interface ResultRecord {
  attemptId: number;
  attemptNumber: number;
  candidateName: string;
  candidateUsername: string;
  examName: string;
  examCmid: number;
  quizId: number;
  state: AttemptState;
  timeStart: string;
  timeFinish: string | null;
  durationSeconds: number | null;
  score: number | null; // sumgrades — raw Moodle score, never recalculated
  maxScore: number; // quiz.sumgrades (max attainable from configured questions)
  officialGrade: number | null; // mdl_grade_grades.finalgrade — the OFFICIAL Moodle grade out of grademax
  gradeMax: number; // mdl_grade_grades.rawgrademax
  passingGrade: number | null;
  percentage: number | null; // derived only for display, from the official grade — not a substitute for it
  passFail: "pass" | "fail" | "not_applicable";
}

function stateLabel(s: string): AttemptState {
  return (["inprogress", "finished", "overdue", "abandoned"] as const).includes(s as AttemptState)
    ? (s as AttemptState)
    : "abandoned";
}

/**
 * Résultats réels, exclusivement lus depuis Moodle (mdl_quiz_attempts +
 * mdl_grade_grades). La note officielle (finalgrade) vient de
 * mdl_grade_grades — jamais recalculée à partir de sumgrades. sumgrades
 * (score brut Moodle) est affiché séparément à titre informatif.
 */
export async function getResults(): Promise<ResultRecord[]> {
  const rows = await queryReadOnly<{
    attemptid: number;
    attempt: number;
    userid: number;
    firstname: string;
    lastname: string;
    username: string;
    quizid: number;
    examname: string;
    cmid: number;
    state: string;
    timestart: number;
    timefinish: number;
    sumgrades: number | null;
    quizsumgrades: number;
    quizgrade: number;
    gradepass: string | null;
    finalgrade: number | null;
    rawgrademax: number | null;
  }>(
    `SELECT
       qa.id as attemptid, qa.attempt, qa.userid, u.firstname, u.lastname, u.username,
       q.id as quizid, q.name as examname, cm.id as cmid,
       qa.state, qa.timestart, qa.timefinish, qa.sumgrades,
       q.sumgrades as quizsumgrades, q.grade as quizgrade,
       gi.gradepass,
       gg.finalgrade, gg.rawgrademax
     FROM mdl_quiz_attempts qa
     JOIN mdl_user u ON u.id = qa.userid
     JOIN mdl_quiz q ON q.id = qa.quiz
     JOIN mdl_modules m ON m.name = 'quiz'
     JOIN mdl_course_modules cm ON cm.instance = q.id AND cm.module = m.id
     LEFT JOIN mdl_grade_items gi ON gi.itemmodule = 'quiz' AND gi.iteminstance = q.id AND gi.itemtype = 'mod'
     LEFT JOIN mdl_grade_grades gg ON gg.itemid = gi.id AND gg.userid = qa.userid
     ORDER BY qa.timestart DESC`
  );

  return rows.map((r) => {
    // mysql2 renvoie les colonnes DECIMAL sous forme de chaînes par défaut
    // (pas de `decimalNumbers: true` configuré) — conversion explicite
    // indispensable, sinon .toFixed()/comparaisons numériques échouent.
    const durationSeconds = r.timefinish > 0 && r.timestart > 0 ? r.timefinish - r.timestart : null;
    const passingGrade = r.gradepass !== null && r.gradepass !== undefined ? parseFloat(String(r.gradepass)) : null;
    const officialGrade = r.finalgrade !== null && r.finalgrade !== undefined ? parseFloat(String(r.finalgrade)) : null;
    const gradeMax = parseFloat(String(r.rawgrademax ?? r.quizgrade));
    const percentage = officialGrade !== null && gradeMax > 0 ? (officialGrade / gradeMax) * 100 : null;

    let passFail: ResultRecord["passFail"] = "not_applicable";
    if (r.state === "finished" && officialGrade !== null && passingGrade !== null) {
      passFail = officialGrade >= passingGrade ? "pass" : "fail";
    }

    return {
      attemptId: r.attemptid,
      attemptNumber: r.attempt,
      candidateName: `${r.firstname} ${r.lastname}`,
      candidateUsername: r.username,
      examName: r.examname,
      examCmid: r.cmid,
      quizId: r.quizid,
      state: stateLabel(r.state),
      timeStart: new Date(r.timestart * 1000).toISOString(),
      timeFinish: r.timefinish > 0 ? new Date(r.timefinish * 1000).toISOString() : null,
      durationSeconds,
      score: r.sumgrades !== null && r.sumgrades !== undefined ? parseFloat(String(r.sumgrades)) : null,
      maxScore: parseFloat(String(r.quizsumgrades)),
      officialGrade,
      gradeMax,
      passingGrade,
      percentage,
      passFail,
    };
  });
}

export async function getResultById(attemptId: number): Promise<
  (ResultRecord & { answeredCount: number; unansweredCount: number }) | null
> {
  const all = await getResults();
  const result = all.find((r) => r.attemptId === attemptId);
  if (!result) return null;

  const questionRows = await queryReadOnly<{ id: number; state: string }>(
    `SELECT qatt.id, qas.state
     FROM mdl_question_attempts qatt
     JOIN mdl_quiz_attempts qa ON qa.uniqueid = qatt.questionusageid
     LEFT JOIN (
       SELECT qas1.questionattemptid, qas1.state
       FROM mdl_question_attempt_steps qas1
       INNER JOIN (
         SELECT questionattemptid, MAX(sequencenumber) as maxseq
         FROM mdl_question_attempt_steps GROUP BY questionattemptid
       ) latest ON latest.questionattemptid = qas1.questionattemptid AND latest.maxseq = qas1.sequencenumber
     ) qas ON qas.questionattemptid = qatt.id
     WHERE qa.id = ?`,
    [attemptId]
  ).catch(() => []);

  const answered = questionRows.filter((q) =>
    ["complete", "gaveup", "gradedright", "gradedwrong", "gradedpartial"].includes(q.state ?? "")
  ).length;
  const unanswered = questionRows.length - answered;

  return { ...result, answeredCount: answered, unansweredCount: Math.max(unanswered, 0) };
}

export function computeResultsSummary(results: ResultRecord[]) {
  const finished = results.filter((r) => r.state === "finished");
  const graded = finished.filter((r) => r.officialGrade !== null);
  const passed = finished.filter((r) => r.passFail === "pass").length;
  const avgScore =
    graded.length > 0 ? graded.reduce((s, r) => s + (r.percentage ?? 0), 0) / graded.length : null;
  const avgDuration =
    finished.filter((r) => r.durationSeconds !== null).length > 0
      ? finished.reduce((s, r) => s + (r.durationSeconds ?? 0), 0) /
        finished.filter((r) => r.durationSeconds !== null).length
      : null;

  return {
    totalAttempts: results.length,
    completedAttempts: finished.length,
    passRate: finished.length > 0 ? (passed / finished.length) * 100 : null,
    averageScorePercent: avgScore,
    averageDurationSeconds: avgDuration,
  };
}
