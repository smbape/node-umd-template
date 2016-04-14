<?php

function getContents($path='') {
    ob_start();
    include $path;
    $var = ob_get_contents();
    ob_end_clean();
    return $var;
}

$contents = null;
$build = null;

if (isset($_GET['build']) && preg_match('/^(?:app|web)$/', $_GET['build'])) {
    $build = $_GET['build'];
}

$baseUrl = empty($_SERVER['HTTP_BASE']) ? '/' : '/' . $_SERVER['HTTP_BASE'] . '/';
$uri = substr($_SERVER['REQUEST_URI'], strlen($baseUrl));

if ( preg_match('/^app\b/', $uri) ) {
    $contents = getContents('index.single.html');
} else if (preg_match('/^web\b/', $uri)) {
    $contents = getContents('index.classic.html');
} else if (empty($uri) && $build === null) {
    $contents = getContents('index.single.html');
} else if ($build !== null) {
    $build = $build === 'web' ? 'index.classic.html' : 'index.single.html';
    $contents = getContents($build);
} else if (preg_match('/^rest\b/', $uri)) {
    // Redirect to rest server
    // Prefer using httpd redirect or nginx redirect
} else {
    // do nothing
}

if ($contents !== null) {
    // Set baseUrl to allow correct path resolution when requiring static files and reloading page
    $contents = preg_replace('/\b(href|src|data-main)="(?!https?:\/\/|\/)([^"]+)/', '$1="' . $baseUrl . '$2', $contents);
    $contents = str_replace('baseUrl: \'\'', 'baseUrl: "' . $baseUrl . '"', $contents);

    // Serve contents
    echo $contents;
}
