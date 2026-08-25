<?php
// Ajoute une vraie question "Open answer" (essay) — générique, non
// réglementaire — au Practice Test, pour démontrer réellement les 3 types
// de questions supportés (MCQ déjà présent, True/False déjà présent, Open
// answer ajouté ici). Utilise le vrai type Moodle 'essay'.
define('CLI_SCRIPT', true);
require('/bitnami/moodle/config.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->libdir . '/gradelib.php');
require_once($CFG->dirroot . '/mod/quiz/lib.php');
\core\session\manager::set_user(get_admin());
global $DB;

$category = $DB->get_record('question_categories', ['name' => 'Practice / Training'], '*', MUST_EXIST);
$quiz = $DB->get_record('quiz', ['id' => 2], '*', MUST_EXIST); // KOST E-EXAM — Practice Test

$name = 'Practice Q4 — Open answer';
$existing = $DB->get_record_sql(
    "SELECT q.id FROM {question} q
     JOIN {question_versions} qv ON qv.questionid = q.id
     JOIN {question_bank_entries} qbe ON qbe.id = qv.questionbankentryid
     WHERE q.name = ? AND qbe.questioncategoryid = ?",
    [$name, $category->id]
);

if ($existing) {
    $questionid = $existing->id;
    echo "Question déjà existante (id={$questionid}).\n";
} else {
    $question = new stdClass();
    $question->category = $category->id;
    $question->parent = 0;
    $question->name = $name;
    $question->questiontext = 'This is a practice question. In one sentence, describe what you would do if you needed to leave your seat during a real exam.';
    $question->questiontextformat = FORMAT_HTML;
    $question->generalfeedback = '';
    $question->generalfeedbackformat = FORMAT_HTML;
    $question->defaultmark = 1;
    $question->penalty = 0;
    $question->qtype = 'essay';
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

    $eo = new stdClass();
    $eo->questionid = $questionid;
    $eo->responseformat = 'plain';
    $eo->responserequired = 1;
    $eo->responsefieldlines = 5;
    $eo->attachments = 0;
    $eo->attachmentsrequired = 0;
    $eo->graderinfo = '';
    $eo->graderinfoformat = FORMAT_HTML;
    $eo->responsetemplate = '';
    $eo->responsetemplateformat = FORMAT_HTML;
    $DB->insert_record('qtype_essay_options', $eo);

    echo "Question 'essay' créée (id={$questionid}).\n";
}

// Ajoute le slot 4 au Practice Test s'il n'existe pas déjà.
$existingSlot = $DB->get_record_sql(
    "SELECT qs.id FROM {quiz_slots} qs
     JOIN {question_references} qr ON qr.itemid = qs.id AND qr.component='mod_quiz' AND qr.questionarea='slot'
     JOIN {question_versions} qv ON qv.questionbankentryid = qr.questionbankentryid
     WHERE qs.quizid = ? AND qv.questionid = ?", [$quiz->id, $questionid]
);

if ($existingSlot) {
    echo "Slot déjà existant.\n";
} else {
    $moduleid = $DB->get_field('modules', 'id', ['name' => 'quiz']);
    $cm = $DB->get_record_sql(
        "SELECT cm.* FROM {course_modules} cm JOIN {modules} m ON m.id=cm.module
         WHERE m.name='quiz' AND cm.instance=?", [$quiz->id]);
    $modcontext = context_module::instance($cm->id);

    $slot = new stdClass();
    $slot->slot = 4;
    $slot->quizid = $quiz->id;
    $slot->page = 4;
    $slot->requireprevious = 0;
    $slot->maxmark = 1.0000000;
    $slotid = $DB->insert_record('quiz_slots', $slot);

    $qbeid = $DB->get_field_sql(
        "SELECT qbe.id FROM {question_bank_entries} qbe
         JOIN {question_versions} qv ON qv.questionbankentryid = qbe.id
         WHERE qv.questionid = ?", [$questionid]);

    $ref = new stdClass();
    $ref->usingcontextid = $modcontext->id;
    $ref->component = 'mod_quiz';
    $ref->questionarea = 'slot';
    $ref->itemid = $slotid;
    $ref->questionbankentryid = $qbeid;
    $ref->version = null;
    $DB->insert_record('question_references', $ref);

    $DB->set_field('quiz', 'sumgrades', 4.0, ['id' => $quiz->id]);
    quiz_grade_item_update($DB->get_record('quiz', ['id' => $quiz->id]));

    echo "Slot 4 (essay) ajouté au Practice Test.\n";
}

echo "Terminé.\n";
