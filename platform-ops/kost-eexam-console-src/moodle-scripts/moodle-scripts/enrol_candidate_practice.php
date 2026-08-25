<?php
// Inscrit test_candidate comme Student dans le cours Practice Test — étape
// nécessaire pour générer une vraie tentative Moodle réelle (via l'UI, pas
// une insertion DB directe) et alimenter le module Results avec de vraies
// données de notation officielles Moodle.
define('CLI_SCRIPT', true);
require('/bitnami/moodle/config.php');
require_once($CFG->dirroot . '/enrol/manual/lib.php');
require_once($CFG->libdir . '/enrollib.php');
\core\session\manager::set_user(get_admin());
global $DB;

$course = $DB->get_record('course', ['shortname' => 'KOST-PRACTICE-TEST'], '*', MUST_EXIST);
$studentroleid = $DB->get_field('role', 'id', ['shortname' => 'student']);

$manual = enrol_get_plugin('manual');
$instance = $DB->get_record('enrol', ['courseid' => $course->id, 'enrol' => 'manual']);
if (!$instance) {
    $instanceid = $manual->add_instance($course);
    $instance = $DB->get_record('enrol', ['id' => $instanceid]);
    echo "Instance d'inscription manuelle créée.\n";
}

$candidate = $DB->get_record('user', ['username' => 'test_candidate'], '*', MUST_EXIST);
$existing = $DB->get_record('user_enrolments', ['enrolid' => $instance->id, 'userid' => $candidate->id]);
if ($existing) {
    echo "test_candidate déjà inscrit.\n";
} else {
    $manual->enrol_user($instance, $candidate->id, $studentroleid);
    echo "test_candidate inscrit comme Student dans KOST-PRACTICE-TEST.\n";
}
