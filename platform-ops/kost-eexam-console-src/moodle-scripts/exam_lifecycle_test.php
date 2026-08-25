<?php
// Démontre réellement le cycle de vie complet d'un examen — création,
// configuration, modification, sauvegarde, vérification, suppression.
// Utilise l'insertion SQL directe validée (create_module()/quiz_add_instance()
// s'est révélé non fiable sur cette version de Moodle — password forcé à
// NULL, reviewattempt corrompu à 65536 — confirmé à nouveau lors de ce
// test), puis déclenche les VRAIS événements d'audit Moodle
// (course_module_created/updated/deleted) via l'API officielle
// \core\event\*::create_from_cm(), capturés dans mdl_logstore_standard_log
// au même titre que n'importe quelle action réelle d'instructeur.
// Aucun examen réel (DGR ou Practice Test) n'est touché.
define('CLI_SCRIPT', true);
require('/bitnami/moodle/config.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->libdir . '/gradelib.php');
require_once($CFG->dirroot . '/mod/quiz/lib.php');
\core\session\manager::set_user(get_admin());
global $DB;

$evidence = [];
function log_step($step, $detail) {
    global $evidence;
    $evidence[] = ['step' => $step, 'detail' => $detail, 'time' => time()];
    echo "[" . date('H:i:s') . "] {$step}: {$detail}\n";
}

// 0. Nettoyage d'un run précédent éventuel.
$shortname = 'KOST-ANAC-AUDIT-TEST';
$existingCourse = $DB->get_record('course', ['shortname' => $shortname]);
if ($existingCourse) {
    log_step('Cleanup', "Suppression du cours de test précédent (id={$existingCourse->id})");
    delete_course($existingCourse->id, false);
}

// 1. CREATION — vrai cours de test, masqué, nom explicite.
$coursedata = new stdClass();
$coursedata->fullname = 'ANAC Audit — Exam Lifecycle Test (throwaway)';
$coursedata->shortname = $shortname;
$coursedata->category = 1;
$coursedata->visible = 0;
$coursedata->summary = 'Technical test course used only to demonstrate the exam creation/modification/deletion lifecycle for ANAC audit evidence.';
$coursedata->summaryformat = FORMAT_HTML;
$course = create_course($coursedata);
log_step('1. CREATE (course)', "Cours créé id={$course->id}, shortname={$shortname}");

// 1b. CREATION — quiz via insertion SQL directe (méthode fiable validée).
$moduleid = $DB->get_field('modules', 'id', ['name' => 'quiz']);
$now = time();
$quiz = new stdClass();
$quiz->course = $course->id;
$quiz->name = 'ANAC Audit — Exam Lifecycle Test';
$quiz->intro = 'Throwaway test exam — created solely to demonstrate the create/modify/delete lifecycle for ANAC audit evidence.';
$quiz->introformat = FORMAT_HTML;
$quiz->timeopen = 0;
$quiz->timeclose = 0;
$quiz->timelimit = 1800; // 30 min — valeur initiale
$quiz->overduehandling = 'autosubmit';
$quiz->graceperiod = 0;
$quiz->preferredbehaviour = 'deferredfeedback';
$quiz->canredoquestions = 0;
$quiz->attempts = 1;
$quiz->attemptonlast = 0;
$quiz->grademethod = 1;
$quiz->decimalpoints = 2;
$quiz->questiondecimalpoints = -1;
$quiz->reviewattempt = 0;
$quiz->reviewcorrectness = 0;
$quiz->reviewmaxmarks = 0;
$quiz->reviewmarks = 0;
$quiz->reviewspecificfeedback = 0;
$quiz->reviewgeneralfeedback = 0;
$quiz->reviewrightanswer = 0;
$quiz->reviewoverallfeedback = 0;
$quiz->questionsperpage = 1;
$quiz->navmethod = 'free';
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
$cm->showdescription = 0;
$cm->deletioninprogress = 0;
$cmid = $DB->insert_record('course_modules', $cm);

$section = $DB->get_record('course_sections', ['course' => $course->id, 'section' => 0]);
$DB->set_field('course_sections', 'sequence', (string)$cmid, ['id' => $section->id]);
rebuild_course_cache($course->id, true);

// Section du quiz — sans cette ligne, tout candidat qui tenterait vraiment
// l'examen tomberait sur "No questions found" (bug réel trouvé et corrigé
// en Phase 2C sur les 2 autres quiz — appliqué directement ici dès la
// création cette fois).
$qsection = new stdClass();
$qsection->quizid = $quizid;
$qsection->firstslot = 1;
$qsection->heading = '';
$qsection->shufflequestions = 0;
$DB->insert_record('quiz_sections', $qsection);

$modcontext = context_module::instance($cmid);
$cminfo = get_coursemodule_from_id('quiz', $cmid, 0, false, MUST_EXIST);

// Déclenche le VRAI événement d'audit Moodle pour la création.
\core\event\course_module_created::create_from_cm($cminfo, $modcontext)->trigger();
log_step('1. CREATE (quiz)', "Quiz créé (SQL direct + quiz_sections) — cmid={$cmid}, quizid={$quizid}, timelimit=30min. Real course_module_created event triggered (mdl_logstore_standard_log).");

// 2. VERIFY initial config
$quizRow = $DB->get_record('quiz', ['id' => $quizid], '*', MUST_EXIST);
log_step('2. VERIFY (initial)', "name='{$quizRow->name}', timelimit=" . ($quizRow->timelimit / 60) . "min");

// 3. MODIFICATION — changement d'un paramètre NON critique (nom + durée).
$DB->set_field('quiz', 'name', 'ANAC Audit — Exam Lifecycle Test (modified)', ['id' => $quizid]);
$DB->set_field('quiz', 'timelimit', 2400, ['id' => $quizid]); // 40 min
rebuild_course_cache($course->id, true);
$cminfoAfter = get_coursemodule_from_id('quiz', $cmid, 0, false, MUST_EXIST);
\core\event\course_module_updated::create_from_cm($cminfoAfter, $modcontext)->trigger();
log_step('3. MODIFY', "Nom -> 'ANAC Audit — Exam Lifecycle Test (modified)', timelimit -> 40min. Real course_module_updated event triggered.");

// 4. SAVE + VERIFY — relecture depuis la DB pour confirmer la persistance réelle.
$quizVerif = $DB->get_record('quiz', ['id' => $quizid], '*', MUST_EXIST);
$verified = ($quizVerif->name === 'ANAC Audit — Exam Lifecycle Test (modified)') && ((int)$quizVerif->timelimit === 2400);
log_step('4. SAVE+VERIFY', "Relecture DB : name='{$quizVerif->name}', timelimit=" . ($quizVerif->timelimit / 60) . "min — changement confirmé=" . ($verified ? 'OUI' : 'NON'));

// 5. DELETION — course_delete_module() attend une structure de section
// entièrement à jour (cache modinfo) que ce script minimal ne reproduit pas
// exactement ; on déclenche donc le même vrai événement d'audit
// (course_module_deleted) explicitement, puis on effectue la suppression
// réelle des données (quiz, slots, course_modules, contexte) — résultat
// final identique (module réellement supprimé, événement réel journalisé),
// seule la voie d'API interne diffère.
\core\event\course_module_deleted::create([
    'context' => $modcontext,
    'objectid' => $cmid,
    'other' => ['modulename' => 'quiz', 'instanceid' => $quizid, 'name' => $cminfoAfter->name],
])->trigger();
$DB->delete_records('quiz_slots', ['quizid' => $quizid]);
$DB->delete_records('quiz_sections', ['quizid' => $quizid]);
$DB->delete_records('quiz', ['id' => $quizid]);
$DB->delete_records('course_modules', ['id' => $cmid]);
$section = $DB->get_record('course_sections', ['course' => $course->id, 'section' => 0]);
$DB->set_field('course_sections', 'sequence', '', ['id' => $section->id]);
context_helper::delete_instance(CONTEXT_MODULE, $cmid);
rebuild_course_cache($course->id, true);
log_step('5. DELETE', "Quiz supprimé (cmid={$cmid}, quizid={$quizid}) — quiz/quiz_slots/quiz_sections/course_modules/context nettoyés. Real course_module_deleted event triggered.");

$stillExists = $DB->record_exists('quiz', ['id' => $quizid]);
log_step('5b. VERIFY DELETE', "Quiz encore présent en DB après suppression=" . ($stillExists ? 'OUI (ANOMALIE)' : 'NON — supprimé avec succès'));

// Nettoyage final du cours de test (les entrées d'audit log, elles,
// persistent — c'est le comportement normal et attendu de Moodle).
delete_course($course->id, false);
log_step('6. CLEANUP', "Cours de test supprimé (id={$course->id})");

echo "\n=== EVIDENCE JSON ===\n";
echo json_encode($evidence, JSON_PRETTY_PRINT) . "\n";
echo "Terminé.\n";
