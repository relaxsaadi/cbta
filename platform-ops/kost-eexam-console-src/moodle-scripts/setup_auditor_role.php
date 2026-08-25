<?php
// Crée un vrai rôle Moodle "Auditor / Read Only" pour la console KOST
// E-EXAM — lecture seule stricte : aucune capacité d'édition/suppression
// n'est accordée. Même jeu de capacités "vue" que kost_console_admin_role,
// sans aucune des capacités de gestion (mod/quiz:manage, question:add, etc.
// ne sont jamais accordées).
define('CLI_SCRIPT', true);
require('/bitnami/moodle/config.php');
require_once($CFG->libdir . '/accesslib.php');
\core\session\manager::set_user(get_admin());
global $DB;

$shortname = 'kost_console_auditor_role';
$existing = $DB->get_record('role', ['shortname' => $shortname]);

if (!$existing) {
    $roleid = create_role(
        'KOST Console — Auditor (Read Only)',
        $shortname,
        'Read-only access to the KOST E-EXAM console: Audit & Compliance, Evidence Center, Reports, System Status, Documentation, Audit Logs. Cannot modify exams, questions, results, or settings.',
        'authenticateduser'
    );
    echo "Rôle créé (id={$roleid}).\n";
} else {
    $roleid = $existing->id;
    echo "Rôle déjà existant (id={$roleid}).\n";
}

// Contexte système — mêmes capacités "vue" que l'administrateur console,
// aucune capacité de gestion/écriture.
$context = context_system::instance();
$readonlycapabilities = [
    'mod/quiz:view',
    'mod/quiz:viewreports',
    'moodle/course:view',
    'moodle/course:viewparticipants',
    'moodle/user:viewdetails',
    'moodle/webservice:createtoken', // requis pour /login/token.php (voir Phase 1)
    'webservice/rest:use',
];
foreach ($readonlycapabilities as $cap) {
    assign_capability($cap, CAP_ALLOW, $roleid, $context->id, true);
}
echo "Capacités en lecture seule assignées (" . count($readonlycapabilities) . ").\n";

// Compte de test réel — permet de vérifier le rôle de bout en bout, pas
// seulement en théorie.
$username = 'console_auditor';
$user = $DB->get_record('user', ['username' => $username]);
if (!$user) {
    $user = create_user_record($username, 'AuditorReadOnly2026!Bb', 'manual');
    $user->firstname = 'Console';
    $user->lastname = 'Auditor';
    $user->email = 'cbta+auditor@kostacademy.com';
    $user->confirmed = 1;
    $user->policyagreed = 1;
    $DB->update_record('user', $user);
    echo "Compte console_auditor créé (id={$user->id}).\n";
} else {
    echo "Compte console_auditor déjà existant (id={$user->id}).\n";
}

role_assign($roleid, $user->id, $context->id);
echo "Rôle assigné à console_auditor au niveau système.\n";

echo "Terminé.\n";
