<?php
define('CLI_SCRIPT', true);
require('/bitnami/moodle/config.php');
global $CFG;

echo "slasharguments: " . var_export($CFG->slasharguments ?? 'unset (default 1)', true) . "\n";

// Simulate exactly what get_logo_url() builds.
$maxwidth = null; $maxheight = 200;
$filepath = ((int)$maxwidth . 'x' . (int)$maxheight) . '/';
echo "filepath (passed as itemid param): " . var_export($filepath, true) . "\n";
$themerev = theme_get_revision();
echo "themerev (passed as pathname param): " . var_export($themerev, true) . "\n";
$logo = get_config('core_admin', 'logo');
echo "logo filename: " . var_export($logo, true) . "\n";

$url = \moodle_url::make_pluginfile_url(
    context_system::instance()->id, 'core_admin', 'logo', $filepath, $themerev, $logo
);
echo "Generated URL: " . $url->out(false) . "\n";

// Now simulate file_pluginfile()'s arg parsing on that exact relative path.
$relpath = parse_url($url->out(false), PHP_URL_PATH);
$relpath = preg_replace('#^.*/pluginfile\.php#', '', $relpath);
echo "Relative path passed to file_pluginfile(): " . var_export($relpath, true) . "\n";

$args = explode('/', ltrim($relpath, '/'));
echo "Raw exploded args: " . var_export($args, true) . "\n";
