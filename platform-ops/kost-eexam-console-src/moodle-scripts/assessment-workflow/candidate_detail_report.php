<?php
// Generates the detailed per-candidate report requested: exam identity,
// timing, score/100, percentage, pass/fail vs threshold, and a
// question-by-question breakdown (submitted answer vs correct answer,
// right/wrong) — entirely read from Moodle's own grading (question_attempt
// fraction/response), no parallel scoring logic.
// Usage: php candidate_detail_report.php <attemptid>
define('CLI_SCRIPT', true);
require('/bitnami/moodle/config.php');
require_once($CFG->dirroot . '/mod/quiz/locallib.php');
require_once($CFG->dirroot . '/mod/quiz/attemptlib.php');
require_once($CFG->libdir . '/gradelib.php');
use mod_quiz\quiz_attempt;
global $DB;

$attemptid = (int)($argv[1] ?? 0);
$attemptobj = quiz_attempt::create($attemptid);
$quiz = $attemptobj->get_quiz();
$candidate = $DB->get_record('user', ['id' => $attemptobj->get_userid()]);
$attempt = $attemptobj->get_attempt();

$gradeitem = grade_item::fetch(['itemtype' => 'mod', 'itemmodule' => 'quiz', 'iteminstance' => $quiz->id, 'courseid' => $quiz->course]);
$grade = $DB->get_record('grade_grades', ['itemid' => $gradeitem->id, 'userid' => $candidate->id]);

$report = [
    'exam' => $quiz->name,
    'candidat' => trim($candidate->firstname . ' ' . $candidate->lastname) . " ({$candidate->username})",
    'debut' => date('Y-m-d H:i:s', $attempt->timestart),
    'fin' => date('Y-m-d H:i:s', $attempt->timefinish),
    'duree_secondes' => $attempt->timefinish - $attempt->timestart,
    'statut' => $attempt->state,
    'score_sur_100' => round((float)$grade->finalgrade, 2),
    'pourcentage' => round((float)$grade->finalgrade, 2) . '%', // grademax is already 100
    'seuil_reussite' => $gradeitem->gradepass !== null ? (float)$gradeitem->gradepass : null,
    'resultat' => ($gradeitem->gradepass !== null)
        ? (((float)$grade->finalgrade >= (float)$gradeitem->gradepass) ? 'REUSSI' : 'ECHEC')
        : 'N/A (seuil non défini)',
    'questions' => [],
];

foreach ($attemptobj->get_slots() as $slot) {
    $qa = $attemptobj->get_question_attempt($slot);
    $question = $qa->get_question(false);
    $report['questions'][] = [
        'doc_id' => $question->idnumber ?? null,
        'enonce' => strip_tags($qa->get_question_summary()),
        'reponse_candidat' => $qa->get_response_summary(),
        'reponse_correcte' => $qa->get_right_answer_summary(),
        'note' => $qa->get_fraction() === null ? null : round($qa->get_fraction() * $qa->get_max_mark(), 2),
        'resultat' => $qa->get_fraction() === null ? 'NON REPONDU' : ($qa->get_fraction() >= 0.999 ? 'CORRECT' : 'INCORRECT'),
    ];
}

echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
