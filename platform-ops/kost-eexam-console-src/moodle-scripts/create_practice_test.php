<?php
// Crée un VRAI Quiz Moodle "Practice Test" — séparé de tout examen
// réglementaire, contenu générique non sensible, uniquement destiné à
// familiariser le candidat avec l'interface (QCM, Vrai/Faux, navigation,
// timer, Previous/Next, soumission, auto-submit). Marqué explicitement
// "Practice / Training Only — Not a Certification Examination".
define('CLI_SCRIPT', true);
require('/bitnami/moodle/config.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->libdir . '/gradelib.php');
require_once($CFG->dirroot . '/mod/quiz/lib.php');

$CFG->debug = E_ALL;
$CFG->debugdisplay = 1;
ini_set('display_errors', '1');
\core\session\manager::set_user(get_admin());
global $DB;

// 1. Cours dédié, visible (le practice test doit être accessible aux
// candidats pour se familiariser avant le vrai examen).
$shortname = 'KOST-PRACTICE-TEST';
$course = $DB->get_record('course', ['shortname' => $shortname]);
if (!$course) {
    $data = new stdClass();
    $data->fullname = 'KOST E-EXAM — Practice Test';
    $data->shortname = $shortname;
    $data->category = 1;
    $data->visible = 1;
    $data->summary = 'Practice / Training Only — Not a Certification Examination. Environnement de familiarisation avec la plateforme (navigation, timer, soumission). Aucun contenu réglementaire ou sensible.';
    $data->summaryformat = FORMAT_HTML;
    $course = create_course($data);
    echo "Cours créé (id={$course->id}).\n";
} else {
    echo "Cours déjà existant (id={$course->id}).\n";
}

// 2. Catégorie de questions dédiée "Practice / Training" — jamais mélangée
// avec les catégories réglementaires (Sécurité et Sauvetage / Secourisme).
$coursecontext = context_course::instance($course->id);
$category = $DB->get_record('question_categories', ['name' => 'Practice / Training', 'contextid' => $coursecontext->id]);
if (!$category) {
    $cat = new stdClass();
    $cat->name = 'Practice / Training';
    $cat->contextid = $coursecontext->id;
    $cat->info = 'Questions génériques de familiarisation — pas de contenu réglementaire.';
    $cat->infoformat = FORMAT_HTML;
    $cat->stamp = make_unique_id_code();
    $cat->parent = 0;
    $cat->sortorder = 999;
    $catid = $DB->insert_record('question_categories', $cat);
    $category = $DB->get_record('question_categories', ['id' => $catid]);
    echo "Catégorie de questions créée (id={$category->id}).\n";
} else {
    echo "Catégorie déjà existante (id={$category->id}).\n";
}

function create_sample_mcq($category, $name, $questiontext, $answers, $correctindex) {
    global $DB;
    $existing = $DB->get_record_sql(
        "SELECT q.id FROM {question} q
         JOIN {question_versions} qv ON qv.questionid = q.id
         JOIN {question_bank_entries} qbe ON qbe.id = qv.questionbankentryid
         WHERE q.name = ? AND qbe.questioncategoryid = ?",
        [$name, $category->id]
    );
    if ($existing) {
        echo "Question déjà existante : {$name}\n";
        return $existing->id;
    }

    $question = new stdClass();
    $question->category = $category->id;
    $question->parent = 0;
    $question->name = $name;
    $question->questiontext = $questiontext;
    $question->questiontextformat = FORMAT_HTML;
    $question->generalfeedback = '';
    $question->generalfeedbackformat = FORMAT_HTML;
    $question->defaultmark = 1;
    $question->penalty = 0.3333333;
    $question->qtype = 'multichoice';
    $question->length = 1;
    $question->stamp = make_unique_id_code();
    $question->timecreated = time();
    $question->timemodified = time();
    $question->createdby = 2;
    $question->modifiedby = 2;
    $questionid = $DB->insert_record('question', $question);

    $qbe = new stdClass();
    $qbe->questioncategoryid = $category->id;
    $qbe->ownerid = 2;
    $qbeid = $DB->insert_record('question_bank_entries', $qbe);

    $qv = new stdClass();
    $qv->questionbankentryid = $qbeid;
    $qv->version = 1;
    $qv->questionid = $questionid;
    $qv->status = 'ready';
    $DB->insert_record('question_versions', $qv);

    $qa = new stdClass();
    $qa->questionid = $questionid;
    $qa->layout = 0;
    $qa->single = 1;
    $qa->shuffleanswers = 1;
    $qa->correctfeedback = 'Correct.';
    $qa->correctfeedbackformat = FORMAT_HTML;
    $qa->partiallycorrectfeedback = '';
    $qa->partiallycorrectfeedbackformat = FORMAT_HTML;
    $qa->incorrectfeedback = 'Incorrect.';
    $qa->incorrectfeedbackformat = FORMAT_HTML;
    $qa->answernumbering = 'abc';
    $DB->insert_record('qtype_multichoice_options', $qa);

    foreach ($answers as $i => $answertext) {
        $answer = new stdClass();
        $answer->question = $questionid;
        $answer->answer = $answertext;
        $answer->answerformat = FORMAT_HTML;
        $answer->fraction = ($i === $correctindex) ? 1.0 : 0.0;
        $answer->feedback = '';
        $answer->feedbackformat = FORMAT_HTML;
        $DB->insert_record('question_answers', $answer);
    }

    echo "Question MCQ créée : {$name} (id={$questionid})\n";
    return $questionid;
}

function create_sample_truefalse($category, $name, $questiontext, $correctistrue) {
    global $DB;
    $existing = $DB->get_record_sql(
        "SELECT q.id FROM {question} q
         JOIN {question_versions} qv ON qv.questionid = q.id
         JOIN {question_bank_entries} qbe ON qbe.id = qv.questionbankentryid
         WHERE q.name = ? AND qbe.questioncategoryid = ?",
        [$name, $category->id]
    );
    if ($existing) {
        echo "Question déjà existante : {$name}\n";
        return $existing->id;
    }

    $question = new stdClass();
    $question->category = $category->id;
    $question->parent = 0;
    $question->name = $name;
    $question->questiontext = $questiontext;
    $question->questiontextformat = FORMAT_HTML;
    $question->generalfeedback = '';
    $question->generalfeedbackformat = FORMAT_HTML;
    $question->defaultmark = 1;
    $question->penalty = 1.0000000;
    $question->qtype = 'truefalse';
    $question->length = 1;
    $question->stamp = make_unique_id_code();
    $question->timecreated = time();
    $question->timemodified = time();
    $question->createdby = 2;
    $question->modifiedby = 2;
    $questionid = $DB->insert_record('question', $question);

    $qbe = new stdClass();
    $qbe->questioncategoryid = $category->id;
    $qbe->ownerid = 2;
    $qbeid = $DB->insert_record('question_bank_entries', $qbe);

    $qv = new stdClass();
    $qv->questionbankentryid = $qbeid;
    $qv->version = 1;
    $qv->questionid = $questionid;
    $qv->status = 'ready';
    $DB->insert_record('question_versions', $qv);

    $trueanswer = new stdClass();
    $trueanswer->question = $questionid;
    $trueanswer->answer = 'True';
    $trueanswer->answerformat = FORMAT_PLAIN;
    $trueanswer->fraction = $correctistrue ? 1.0 : 0.0;
    $trueanswer->feedback = '';
    $trueanswer->feedbackformat = FORMAT_HTML;
    $trueanswerid = $DB->insert_record('question_answers', $trueanswer);

    $falseanswer = new stdClass();
    $falseanswer->question = $questionid;
    $falseanswer->answer = 'False';
    $falseanswer->answerformat = FORMAT_PLAIN;
    $falseanswer->fraction = $correctistrue ? 0.0 : 1.0;
    $falseanswer->feedback = '';
    $falseanswer->feedbackformat = FORMAT_HTML;
    $falseanswerid = $DB->insert_record('question_answers', $falseanswer);

    $tf = new stdClass();
    $tf->question = $questionid;
    $tf->trueanswer = $trueanswerid;
    $tf->falseanswer = $falseanswerid;
    $DB->insert_record('question_truefalse', $tf);

    echo "Question True/False créée : {$name} (id={$questionid})\n";
    return $questionid;
}

$q1 = create_sample_mcq($category, 'Practice Q1 — Interface navigation',
    'This is a practice question. Which button lets you move to the next question in this platform?',
    ['Previous', 'Next', 'Cancel', 'Logout'], 1);
$q2 = create_sample_mcq($category, 'Practice Q2 — Answer selection',
    'This is a practice question. In a multiple-choice question, how do you select your answer?',
    ['Click the radio button next to your chosen answer', 'Type the answer in a text box', 'Drag and drop the answer', 'Answers cannot be selected'], 0);
$q3 = create_sample_truefalse($category, 'Practice Q3 — Timer behaviour',
    'This is a practice question. True or False: if the timer reaches zero, your practice attempt is submitted automatically.',
    true);

// 3. Quiz — insertion directe (méthode validée, évite les effets de bord de
// create_module() observés précédemment sur password/reviewattempt).
$moduleid = $DB->get_field('modules', 'id', ['name' => 'quiz']);
$quizname = 'KOST E-EXAM — Practice Test';
$existing = $DB->get_record('quiz', ['course' => $course->id, 'name' => $quizname]);

if ($existing) {
    echo "Quiz déjà existant (id={$existing->id}).\n";
    $quizid = $existing->id;
} else {
    $now = time();
    $quiz = new stdClass();
    $quiz->course = $course->id;
    $quiz->name = $quizname;
    $quiz->intro = '<p><strong>Practice / Training Only — Not a Certification Examination.</strong></p><p>This practice test lets you get familiar with the exam interface: navigation, timer, answer selection, and submission. It is not scored for certification and contains no regulatory content.</p>';
    $quiz->introformat = FORMAT_HTML;
    $quiz->timeopen = 0;
    $quiz->timeclose = 0;
    $quiz->timelimit = 600; // 10 minutes — assez pour démontrer le timer sans frustrer
    $quiz->overduehandling = 'autosubmit';
    $quiz->graceperiod = 0;
    $quiz->preferredbehaviour = 'deferredfeedback';
    $quiz->canredoquestions = 0;
    $quiz->attempts = 0; // illimité — c'est un entraînement
    $quiz->attemptonlast = 0;
    $quiz->grademethod = 1;
    $quiz->decimalpoints = 2;
    $quiz->questiondecimalpoints = -1;
    // Mêmes valeurs que l'examen réel validé en Phase 2b (0 = pas de
    // panneau de révision affiché) — on ne devine pas un bitmask non
    // vérifié pour l'affichage "pendant l'épreuve".
    $quiz->reviewattempt = 0;
    $quiz->reviewcorrectness = 0;
    $quiz->reviewmaxmarks = 0;
    $quiz->reviewmarks = 0;
    $quiz->reviewspecificfeedback = 0;
    $quiz->reviewgeneralfeedback = 0;
    $quiz->reviewrightanswer = 0;
    $quiz->reviewoverallfeedback = 0;
    $quiz->questionsperpage = 1;
    $quiz->navmethod = 'free'; // Previous / Next libre
    $quiz->shuffleanswers = 1;
    $quiz->sumgrades = 0;
    $quiz->grade = 100;
    $quiz->timecreated = $now;
    $quiz->timemodified = $now;
    $quiz->password = '';
    $quiz->subnet = '';
    $quiz->browsersecurity = '-';
    $quiz->delay1 = 0;
    $quiz->delay2 = 0;
    $quiz->showuserpicture = 0;
    $quiz->showblocks = 0;
    $quiz->completionattemptsexhausted = 0;
    $quiz->completionminattempts = 0;
    $quiz->allowofflineattempts = 0;

    $quizid = $DB->insert_record('quiz', $quiz);
    echo "Quiz inséré (id={$quizid}).\n";

    $cm = new stdClass();
    $cm->course = $course->id;
    $cm->module = $moduleid;
    $cm->instance = $quizid;
    $cm->section = 0;
    $cm->added = $now;
    $cm->visible = 1;
    $cm->visibleoncoursepage = 1;
    $cm->visibleold = 1;
    $cm->groupmode = 0;
    $cm->groupingid = 0;
    $cm->completion = 0;
    $cm->completionview = 0;
    $cm->completionexpected = 0;
    $cm->completionpassgrade = 0;
    $cm->showdescription = 1;
    $cm->deletioninprogress = 0;
    $cmid = $DB->insert_record('course_modules', $cm);
    echo "course_module inséré (cmid={$cmid}).\n";

    $section = $DB->get_record('course_sections', ['course' => $course->id, 'section' => 0]);
    if ($section) {
        $sequence = trim($section->sequence);
        $sequence = $sequence === '' ? (string)$cmid : $sequence . ',' . $cmid;
        $DB->set_field('course_sections', 'sequence', $sequence, ['id' => $section->id]);
    }
    rebuild_course_cache($course->id, true);

    $modcontext = context_module::instance($cmid);

    function add_slot($quizid, $slotnum) {
        global $DB;
        $slot = new stdClass();
        $slot->slot = $slotnum;
        $slot->quizid = $quizid;
        $slot->page = $slotnum;
        $slot->requireprevious = 0;
        $slot->maxmark = 1.0000000;
        return $DB->insert_record('quiz_slots', $slot);
    }
    function add_question_reference($usingcontextid, $slotid, $qbankentryid) {
        global $DB;
        $ref = new stdClass();
        $ref->usingcontextid = $usingcontextid;
        $ref->component = 'mod_quiz';
        $ref->questionarea = 'slot';
        $ref->itemid = $slotid;
        $ref->questionbankentryid = $qbankentryid;
        $ref->version = null;
        $DB->insert_record('question_references', $ref);
    }
    function get_qbe($questionid) {
        global $DB;
        return $DB->get_field_sql(
            "SELECT qbe.id FROM {question_bank_entries} qbe
             JOIN {question_versions} qv ON qv.questionbankentryid = qbe.id
             WHERE qv.questionid = ?", [$questionid]);
    }

    $modulecontextid = $modcontext->id;
    $slot1 = add_slot($quizid, 1);
    add_question_reference($modulecontextid, $slot1, get_qbe($q1));
    $slot2 = add_slot($quizid, 2);
    add_question_reference($modulecontextid, $slot2, get_qbe($q2));
    $slot3 = add_slot($quizid, 3);
    add_question_reference($modulecontextid, $slot3, get_qbe($q3));

    $DB->set_field('quiz', 'sumgrades', 3.0, ['id' => $quizid]);
    quiz_grade_item_update($DB->get_record('quiz', ['id' => $quizid]));
    // Pas de note de passage — un practice test n'a pas de sanction pass/fail.

    echo "3 slots ajoutés. Quiz complet id={$quizid}, cmid={$cmid}.\n";
}

// 4. Tag explicite 'practice-test' pour identification claire côté console.
$quizcm = $DB->get_record_sql(
    "SELECT cm.id FROM {course_modules} cm
     JOIN {modules} m ON m.id = cm.module
     WHERE m.name = 'quiz' AND cm.instance = ?", [$quizid]);
if ($quizcm) {
    require_once($CFG->dirroot . '/tag/lib.php');
    $tagcontext = context_module::instance($quizcm->id);
    core_tag_tag::set_item_tags('mod_quiz', 'quiz', $quizid, $tagcontext, ['practice-test']);
    echo "Tag 'practice-test' appliqué (cmid={$quizcm->id}).\n";
}

echo "Terminé.\n";
