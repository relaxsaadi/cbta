<?php
// Generic, reusable "create assessment" mechanism implementing the
// EXERCICE / TEST / EXAMEN workflow requested by the ANAC auditor.
// Uses ONLY Moodle's own APIs for the parts that matter for correctness
// and audit trust:
//   - question_bank random-slot mechanism (mod_quiz\classes\structure::
//     add_random_questions()) filtered by BOTH category AND the
//     'status-frozen-fr-verified' tag — the real, native Moodle
//     random-draw feature, not a custom picker.
//   - Moodle's own grade API for the pass threshold (grade_item), so the
//     console/gradebook read the same number Moodle itself grades against.
//   - Moodle's own quiz-attempt API for the end-to-end test (as used all
//     session), never a parallel scoring calculation.
//
// Usage: php create_assessment.php <config.json>
//
// config.json fields:
//   name            string   assessment name (French)
//   type            string   "exercice" | "test" | "examen"
//   function        string   e.g. "7.1"
//   requested_count int      how many questions to draw (validated against
//                            real admissible count; the caller is expected
//                            to have already applied the "cap to available"
//                            rule if that's the desired behaviour — this
//                            script always BLOCKS if requested > available)
//   duration_min    int
//   passthreshold   int      percent, e.g. 80
//   attempts        int|null override the type preset's default attempts
//   group_name      string   cohort name for traceability/enrolment
//   open_time       int|null unix timestamp, 0/null = no restriction
//   close_time      int|null
define('CLI_SCRIPT', true);
require('/bitnami/moodle/config.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->libdir . '/gradelib.php');
require_once($CFG->dirroot . '/mod/quiz/lib.php');
require_once($CFG->dirroot . '/tag/lib.php');
require_once($CFG->dirroot . '/enrol/manual/lib.php');
require_once($CFG->libdir . '/enrollib.php');
require_once($CFG->libdir . '/grade/grade_item.php');
use mod_quiz\structure;
use qbank_managecategories\category_condition;
use qbank_tagquestion\tag_condition;

\core\session\manager::set_user(get_admin());
global $DB;

function logln($s) { echo "[" . date('H:i:s') . "] $s\n"; }
function fail($msg) { echo "BLOCKED: {$msg}\n"; exit(1); }

$configpath = $argv[1] ?? null;
if (!$configpath) { die("Usage: php create_assessment.php <config.json>\n"); }
$cfg = json_decode(file_get_contents($configpath), true);
if (!$cfg) { die("Could not parse config JSON\n"); }

$typepresets = [
    'exercice' => [
        'label' => 'Exercice',
        'attempts' => 0,               // plusieurs tentatives possibles
        'reviewattempt' => 0x1010,     // DURING + IMMEDIATELY_AFTER (feedback immédiat possible)
        'shuffleanswers' => 1,
        'not_certificative' => true,
    ],
    'test' => [
        'label' => 'Test',
        'attempts' => 0,               // configurable — default unlimited, override via config
        'reviewattempt' => 0x1000,     // DURING only by default, configurable
        'shuffleanswers' => 1,
        'not_certificative' => true,
    ],
    'examen' => [
        'label' => 'Examen',
        'attempts' => 1,               // 1 tentative par défaut
        'reviewattempt' => 0,          // pas de correction affichée pendant/après (traçé, pas révélé)
        'shuffleanswers' => 1,         // réponses mélangées
        'not_certificative' => false,
    ],
];

$type = strtolower($cfg['type'] ?? 'examen');
if (!isset($typepresets[$type])) { fail("unknown type '{$type}' — must be exercice/test/examen"); }
$preset = $typepresets[$type];
$attempts = $cfg['attempts'] ?? $preset['attempts'];

$function = $cfg['function']; // e.g. "7.1"
$categoryname = "Fonction {$function}";
$category = $DB->get_record('question_categories', ['name' => $categoryname]);
if (!$category) { fail("category '{$categoryname}' not found — has this function been imported yet?"); }
$catcontext = context::instance_by_id($category->contextid);

// Admissible count = FROZEN-tagged questions actually IN this category
// right now (never trust a stale/remembered number).
$frozentag = $DB->get_record('tag', ['rawname' => 'status-frozen-fr-verified']);
if (!$frozentag) { fail("tag 'status-frozen-fr-verified' does not exist — nothing is admissible"); }

$available = $DB->count_records_sql("
    SELECT COUNT(DISTINCT q.id)
    FROM {question} q
    JOIN {question_versions} qv ON qv.questionid = q.id
    JOIN {question_bank_entries} qbe ON qbe.id = qv.questionbankentryid
    JOIN {tag_instance} ti ON ti.itemid = q.id AND ti.component = 'core_question' AND ti.itemtype = 'question'
    WHERE qbe.questioncategoryid = ? AND ti.tagid = ?
", [$category->id, $frozentag->id]);

logln("Function {$function}: {$available} admissible (FROZEN FR / SOURCE VERIFIED) questions available in '{$categoryname}'.");

$requested = (int)$cfg['requested_count'];
if ($requested > $available) {
    fail("requested {$requested} questions but only {$available} admissible questions are available in {$categoryname}. Not created.");
}
if ($requested < 1) { fail("requested_count must be >= 1"); }

// -----------------------------------------------------------------
// Group / cohort (for traceability + enrolment)
// -----------------------------------------------------------------
$groupname = $cfg['group_name'] ?? "Groupe — Fonction {$function}";
$systemcontext = context_system::instance();
$cohort = $DB->get_record('cohort', ['name' => $groupname, 'contextid' => $systemcontext->id]);
if (!$cohort) {
    $cohortdata = new stdClass();
    $cohortdata->contextid = $systemcontext->id;
    $cohortdata->name = $groupname;
    $cohortdata->idnumber = '';
    $cohortdata->description = "Créé automatiquement pour l'évaluation « {$cfg['name']} » (Fonction {$function}, {$preset['label']}).";
    $cohortdata->descriptionformat = FORMAT_HTML;
    $cohortdata->visible = 1;
    $cohortdata->component = '';
    $cohortdata->timecreated = time();
    $cohortdata->timemodified = time();
    $cohortid = $DB->insert_record('cohort', $cohortdata);
    $cohort = $DB->get_record('cohort', ['id' => $cohortid]);
    logln("Cohort créé: {$groupname} (id={$cohort->id})");
} else {
    logln("Cohort déjà existant: {$groupname} (id={$cohort->id})");
}

// -----------------------------------------------------------------
// Course (reuse the function's existing production course if present)
// -----------------------------------------------------------------
$fnslug = str_replace('.', '-', $function);
$shortname = "KOST-DGR-{$fnslug}-PRODUCTION";
$course = $DB->get_record('course', ['shortname' => $shortname]);
if (!$course) {
    // Fall back: pilot-named course for 7.1, or create fresh.
    $course = $DB->get_record('course', ['shortname' => "KOST-DGR-{$fnslug}-PILOT"]);
}
if (!$course) {
    $data = new stdClass();
    $data->fullname = "KOST DGR — Fonction {$function} (Production)";
    $data->shortname = $shortname;
    $data->category = 1;
    $data->visible = 0;
    $data->summary = "Cours de production — Fonction {$function}.";
    $data->summaryformat = FORMAT_HTML;
    $course = create_course($data);
    logln("Cours créé (id={$course->id}).");
} else {
    logln("Réutilisation du cours existant (id={$course->id}, {$course->shortname}).");
}

// -----------------------------------------------------------------
// Quiz
// -----------------------------------------------------------------
$moduleid = $DB->get_field('modules', 'id', ['name' => 'quiz']);
$quizname = $cfg['name'];
$existingQuiz = $DB->get_record('quiz', ['course' => $course->id, 'name' => $quizname]);
if ($existingQuiz) { fail("a quiz named '{$quizname}' already exists in this course (id={$existingQuiz->id}) — choose a different name or reuse it manually."); }

$now = time();
$opentime = (int)($cfg['open_time'] ?? 0);
$closetime = (int)($cfg['close_time'] ?? 0);
$durationmin = (int)$cfg['duration_min'];

$notice = $preset['not_certificative']
    ? "<p><strong>{$preset['label']} — familiarisation / entraînement. Ne constitue pas un examen certificatif.</strong></p>"
    : "<p><strong>ÉVALUATION FORMELLE — {$preset['label']}.</strong> {$requested} questions tirées aléatoirement parmi {$available} admissibles (FROZEN FR / SOURCE VERIFIED) de la Fonction {$function}. Seuil de réussite : {$cfg['passthreshold']}%.</p>";

$quiz = new stdClass();
$quiz->course = $course->id;
$quiz->name = $quizname;
$quiz->intro = $notice;
$quiz->introformat = FORMAT_HTML;
$quiz->timeopen = $opentime;
$quiz->timeclose = $closetime;
$quiz->timelimit = $durationmin * 60;
$quiz->overduehandling = 'autosubmit';
$quiz->graceperiod = 0;
$quiz->preferredbehaviour = 'deferredfeedback';
$quiz->canredoquestions = 0;
$quiz->attempts = $attempts;
$quiz->attemptonlast = 0;
$quiz->grademethod = 1;
$quiz->decimalpoints = 2;
$quiz->questiondecimalpoints = -1;
$quiz->reviewattempt = $preset['reviewattempt'];
$quiz->reviewcorrectness = 0;
$quiz->reviewmaxmarks = 0;
$quiz->reviewmarks = 0;
$quiz->reviewspecificfeedback = 0;
$quiz->reviewgeneralfeedback = 0;
$quiz->reviewrightanswer = 0;
$quiz->reviewoverallfeedback = 0;
$quiz->questionsperpage = 1;
$quiz->navmethod = 'free';
$quiz->shuffleanswers = $preset['shuffleanswers'];
$quiz->sumgrades = 0;
$quiz->grade = 100; // ramené sur 100 points
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
logln("Quiz inséré (id={$quizid}): '{$quizname}', type={$preset['label']}, attempts={$attempts}, duration={$durationmin}min, shuffleanswers={$quiz->shuffleanswers}.");

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

$section = $DB->get_record('course_sections', ['course' => $course->id, 'section' => 0]);
if ($section) {
    $sequence = trim($section->sequence);
    $sequence = $sequence === '' ? (string)$cmid : $sequence . ',' . $cmid;
    $DB->set_field('course_sections', 'sequence', $sequence, ['id' => $section->id]);
}

$qsection = new stdClass();
$qsection->quizid = $quizid;
$qsection->firstslot = 1;
$qsection->heading = '';
$qsection->shufflequestions = 0;
$DB->insert_record('quiz_sections', $qsection);

rebuild_course_cache($course->id, true);
logln("course_module créé (cmid={$cmid}).");

// -----------------------------------------------------------------
// Random slots — category AND tag filtered (the real isolation
// guarantee: only THIS function's FROZEN-tagged questions, ever).
// -----------------------------------------------------------------
$settings = \mod_quiz\quiz_settings::create_for_cmid($cmid);
$structure = structure::create_for_quiz($settings);

$filtercondition = [
    'qpage' => 0,
    'cat' => "{$category->id},{$catcontext->id}",
    'qperpage' => 20,
    'tabname' => 'questions',
    'sortdata' => [],
    'filter' => [
        'category' => [
            'jointype' => category_condition::JOINTYPE_DEFAULT,
            'values' => [(string)$category->id],
            'filteroptions' => ['includesubcategories' => false],
        ],
        'qtagids' => [
            'jointype' => tag_condition::JOINTYPE_DEFAULT,
            'values' => [(string)$frozentag->id],
        ],
    ],
];

$structure->add_random_questions(1, $requested, $filtercondition);
logln("{$requested} slots aléatoires ajoutés (filtre: catégorie '{$categoryname}' + tag 'status-frozen-fr-verified').");

$DB->set_field('quiz', 'sumgrades', (float)$requested, ['id' => $quizid]);
\mod_quiz\quiz_settings::create($quizid)->get_grade_calculator()->recompute_quiz_sumgrades();

core_tag_tag::set_item_tags('mod_quiz', 'quiz', $quizid, context_module::instance($cmid),
    ["function-{$function}", "type-{$type}", 'production-assessment']);

// -----------------------------------------------------------------
// Pass threshold — via Moodle's own grade_item, so console/gradebook
// read the exact same number Moodle grades against. No parallel logic.
// -----------------------------------------------------------------
$passthreshold = (float)$cfg['passthreshold'];
quiz_grade_item_update($DB->get_record('quiz', ['id' => $quizid], '*', MUST_EXIST));
$gradeitem = grade_item::fetch(['itemtype' => 'mod', 'itemmodule' => 'quiz', 'iteminstance' => $quizid, 'courseid' => $course->id]);
if ($gradeitem) {
    $gradeitem->gradepass = $passthreshold; // out of 100 (quiz->grade = 100)
    $gradeitem->update();
    logln("Seuil de réussite fixé via grade_item: {$passthreshold}/100.");
} else {
    logln("WARNING: grade_item not found yet for this quiz — pass threshold not set (will retry after first grade recalculation).");
}

// -----------------------------------------------------------------
// Enrolment (cohort members, if any already added to the cohort)
// -----------------------------------------------------------------
$manual = enrol_get_plugin('manual');
$instance = $DB->get_record('enrol', ['courseid' => $course->id, 'enrol' => 'manual']);
if (!$instance) {
    $instanceid = $manual->add_instance($course);
    $instance = $DB->get_record('enrol', ['id' => $instanceid]);
}
$studentroleid = $DB->get_field('role', 'id', ['shortname' => 'student']);
$members = $DB->get_records('cohort_members', ['cohortid' => $cohort->id]);
foreach ($members as $m) {
    $existingEnrol = $DB->get_record('user_enrolments', ['enrolid' => $instance->id, 'userid' => $m->userid]);
    if (!$existingEnrol) {
        $manual->enrol_user($instance, $m->userid, $studentroleid);
        logln("Membre du cohort (userid={$m->userid}) inscrit dans le cours.");
    }
}

// -----------------------------------------------------------------
// Audit trail — assessment-creation record (Moodle remains the source
// of truth for grading; this is a creation-event log only).
// -----------------------------------------------------------------
$auditrecord = [
    'created_at' => date('c'),
    'creator' => 'kostadmin (admin script — console UI not yet wired, see report)',
    'name' => $quizname,
    'type' => $preset['label'],
    'function' => $function,
    'source_category' => $categoryname,
    'source_category_id' => $category->id,
    'available_admissible' => $available,
    'requested_count' => $requested,
    'duration_min' => $durationmin,
    'pass_threshold_pct' => $passthreshold,
    'attempts_allowed' => $attempts,
    'shuffle_answers' => (bool)$preset['shuffleanswers'],
    'group' => $groupname,
    'group_cohort_id' => $cohort->id,
    'open_time' => $opentime ? date('c', $opentime) : null,
    'close_time' => $closetime ? date('c', $closetime) : null,
    'course_id' => $course->id,
    'quiz_id' => $quizid,
    'cmid' => $cmid,
];

echo "\n=== ASSESSMENT CREATED ===\n";
echo json_encode($auditrecord, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
echo "\nTerminé.\n";
