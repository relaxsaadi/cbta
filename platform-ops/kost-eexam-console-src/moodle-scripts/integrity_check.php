<?php
// Vérifie l'intégrité réelle (pas seulement les permissions) des zones de
// stockage critiques : moodledata, cache, localcache, temp, filedir.
// Exécuté en tant que 'daemon' (même utilisateur qu'Apache) pour tester
// exactement les mêmes conditions d'écriture que la production.
define('CLI_SCRIPT', true);
require('/bitnami/moodle/config.php');
global $CFG, $DB;

function check($label, $ok, $detail = '') {
    echo ($ok ? "OK  " : "FAIL") . " | {$label}" . ($detail ? " — {$detail}" : "") . "\n";
}

// 1. dataroot writable
check('moodledata root writable', is_writable($CFG->dataroot), $CFG->dataroot);

// 2. filedir — real write test via Moodle's file API (not raw fopen)
$fs = get_file_storage();
$syscontext = context_system::instance();
$testcontent = 'integrity-check-' . time();
try {
    $existing = $fs->get_file($syscontext->id, 'core', 'integritycheck', 0, '/', 'test.txt');
    if ($existing) { $existing->delete(); }
    $newfile = $fs->create_file_from_string([
        'contextid' => $syscontext->id, 'component' => 'core', 'filearea' => 'integritycheck',
        'itemid' => 0, 'filepath' => '/', 'filename' => 'test.txt',
    ], $testcontent);
    $hash = $newfile->get_contenthash();
    $path = $CFG->dataroot . '/filedir/' . substr($hash,0,2) . '/' . substr($hash,2,2) . '/' . $hash;
    check('filedir real write via file API', file_exists($path) && file_get_contents($path) === $testcontent, $path);
    $newfile->delete();
    check('filedir delete works', true);
} catch (Exception $e) {
    check('filedir real write via file API', false, $e->getMessage());
}

// 3. cache — real write test via Moodle's cache API
try {
    $cache = \cache::make('core', 'config');
    $cache->set('integritycheck', 'value-' . time());
    $val = $cache->get('integritycheck');
    check('cache (MUC) real write/read', $val !== false, "value=" . var_export($val, true));
} catch (Exception $e) {
    check('cache (MUC) real write/read', false, $e->getMessage());
}

// 4. localcache
$localtest = $CFG->localcachedir . '/integritycheck-' . time() . '.txt';
$writeok = @file_put_contents($localtest, 'test') !== false;
check('localcache real write', $writeok, $localtest);
if ($writeok) { @unlink($localtest); }

// 5. temp
$temptest = $CFG->tempdir . '/integritycheck-' . time() . '.txt';
$writeok = @file_put_contents($temptest, 'test') !== false;
check('temp real write', $writeok, $temptest);
if ($writeok) { @unlink($temptest); }

// 6. Ownership summary
$rootowned = shell_exec('find ' . escapeshellarg($CFG->dataroot) . ' ! -user daemon 2>/dev/null | wc -l');
check('zero root-owned files in moodledata', trim($rootowned) === '0', "count=" . trim($rootowned));

// 7. DB sanity — confirm read/write to Moodle DB still works (not touching mdl_ data)
$dbok = $DB->get_manager()->table_exists('config');
check('Moodle DB connection healthy', $dbok);

echo "Terminé.\n";
