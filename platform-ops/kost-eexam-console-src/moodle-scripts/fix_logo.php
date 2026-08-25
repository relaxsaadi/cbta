<?php
// Ré-upload réel du logo via l'API fichiers officielle de Moodle
// (get_file_storage()->create_file_from_pathname) — le blob physique avait
// disparu suite à la contamination root: du filedir (voir diagnostic).
// Doit être exécuté en tant qu'utilisateur 'daemon' (même utilisateur
// qu'Apache) pour que le fichier créé ait les bonnes permissions.
define('CLI_SCRIPT', true);
require('/bitnami/moodle/config.php');
\core\session\manager::set_user(get_admin());
global $DB;

$fs = get_file_storage();
$syscontext = context_system::instance();

// Supprime l'ancien enregistrement (metadata sans blob physique).
$existing = $fs->get_area_files($syscontext->id, 'core_admin', 'logo', false, 'itemid', false);
foreach ($existing as $f) {
    echo "Suppression de l'ancien enregistrement fichier (id={$f->get_id()}, filename={$f->get_filename()})\n";
    $f->delete();
}

$filerecord = [
    'contextid' => $syscontext->id,
    'component' => 'core_admin',
    'filearea'  => 'logo',
    'itemid'    => 0,
    'filepath'  => '/',
    'filename'  => 'kost-logo.png',
];

$sourcepath = '/tmp/kost-logo-source.png';
if (!file_exists($sourcepath)) {
    die("ERREUR: fichier source introuvable : {$sourcepath}\n");
}

$newfile = $fs->create_file_from_pathname($filerecord, $sourcepath);
echo "Fichier recréé : id={$newfile->get_id()}, contenthash={$newfile->get_contenthash()}, filesize={$newfile->get_filesize()}\n";

// Vérifie que le blob physique existe bien cette fois.
$contenthash = $newfile->get_contenthash();
$expectedpath = $CFG->dataroot . '/filedir/' . substr($contenthash, 0, 2) . '/' . substr($contenthash, 2, 2) . '/' . $contenthash;
echo "Blob physique attendu : {$expectedpath}\n";
echo "Blob physique existe : " . (file_exists($expectedpath) ? 'OUI' : 'NON') . "\n";
echo "Propriétaire du blob : " . (file_exists($expectedpath) ? posix_getpwuid(fileowner($expectedpath))['name'] : 'n/a') . "\n";

echo "Terminé.\n";
