import "server-only";
import { queryReadOnly } from "@/lib/db-readonly";

export interface PracticeTestRecord {
  id: number;
  cmid: number;
  name: string;
  course: string;
  durationMinutes: number;
  numQuestions: number;
  questionTypes: string[];
  shuffleAnswers: boolean;
  attemptsAllowed: number;
}

/**
 * Le Practice Test est identifié par son tag 'practice-test' — jamais par
 * une déduction sur le nom. S'il n'existe pas (tag absent), la fonction
 * retourne null plutôt que d'inventer une entrée.
 */
export async function getPracticeTest(): Promise<PracticeTestRecord | null> {
  const rows = await queryReadOnly<{
    id: number;
    cmid: number;
    name: string;
    coursename: string;
    timelimit: number;
    attempts: number;
    shuffleanswers: number;
    numslots: number;
  }>(
    `SELECT q.id, cm.id as cmid, q.name, c.fullname as coursename,
            q.timelimit, q.attempts, q.shuffleanswers,
            (SELECT COUNT(*) FROM mdl_quiz_slots qs WHERE qs.quizid = q.id) as numslots
     FROM mdl_quiz q
     JOIN mdl_course c ON c.id = q.course
     JOIN mdl_modules m ON m.name = 'quiz'
     JOIN mdl_course_modules cm ON cm.instance = q.id AND cm.module = m.id
     JOIN mdl_tag_instance ti ON ti.component = 'mod_quiz' AND ti.itemtype = 'quiz' AND ti.itemid = q.id
     JOIN mdl_tag t ON t.id = ti.tagid AND t.rawname = 'practice-test'
     LIMIT 1`
  ).catch(() => []);

  const row = rows[0];
  if (!row) return null;

  const qtypes = await queryReadOnly<{ qtype: string }>(
    `SELECT DISTINCT q2.qtype
     FROM mdl_quiz_slots qs
     JOIN mdl_question_references qr ON qr.itemid = qs.id AND qr.component = 'mod_quiz' AND qr.questionarea = 'slot'
     JOIN mdl_question_versions qv ON qv.questionbankentryid = qr.questionbankentryid
     JOIN mdl_question q2 ON q2.id = qv.questionid
     WHERE qs.quizid = ?`,
    [row.id]
  ).catch(() => []);

  return {
    id: row.id,
    cmid: row.cmid,
    name: row.name,
    course: row.coursename,
    durationMinutes: Math.round(row.timelimit / 60),
    numQuestions: row.numslots,
    questionTypes: qtypes.map((q) =>
      q.qtype === "multichoice" ? "MCQ" : q.qtype === "truefalse" ? "True / False" : q.qtype === "essay" ? "Open answer" : q.qtype
    ),
    shuffleAnswers: row.shuffleanswers === 1,
    attemptsAllowed: row.attempts === 0 ? Infinity : row.attempts,
  };
}

export interface QuestionTypesAttemptEvidence {
  attemptId: number;
  timestamp: string;
  qtypesExercised: string[];
}

/**
 * Preuve réelle qu'une vraie tentative (pas seulement la config du quiz) a
 * exercé chaque type de question — requis pour VERIFIED sur "Multiple
 * question types", pas seulement la présence des questions dans le quiz.
 */
export async function getLatestPracticeAttemptQuestionTypes(): Promise<QuestionTypesAttemptEvidence | null> {
  const attempts = await queryReadOnly<{ id: number; timefinish: number }>(
    `SELECT qa.id, qa.timefinish
     FROM mdl_quiz_attempts qa
     JOIN mdl_quiz q ON q.id = qa.quiz
     JOIN mdl_tag_instance ti ON ti.component = 'mod_quiz' AND ti.itemtype = 'quiz' AND ti.itemid = q.id
     JOIN mdl_tag t ON t.id = ti.tagid AND t.rawname = 'practice-test'
     WHERE qa.state = 'finished'
     ORDER BY qa.timefinish DESC
     LIMIT 1`
  ).catch(() => []);

  const attempt = attempts[0];
  if (!attempt) return null;

  const qtypes = await queryReadOnly<{ qtype: string }>(
    `SELECT DISTINCT q.qtype
     FROM mdl_question_attempts qatt
     JOIN mdl_question q ON q.id = qatt.questionid
     JOIN mdl_quiz_attempts qa ON qa.uniqueid = qatt.questionusageid
     WHERE qa.id = ?`,
    [attempt.id]
  ).catch(() => []);

  return {
    attemptId: attempt.id,
    timestamp: new Date(attempt.timefinish * 1000).toISOString(),
    qtypesExercised: qtypes.map((q) => q.qtype),
  };
}
