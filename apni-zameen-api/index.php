<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request URI
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/apni-zameen-api';
$endpoint = str_replace($base_path, '', $request_uri);

// Basic routing
switch ($endpoint) {
    case '/properties':
        require_once 'routes/properties.php';
        break;
    case '/users':
        require_once 'routes/users.php';
        break;
    case '/auth':
        require_once 'routes/auth.php';
        break;
    case '/inquiries':
        require_once 'routes/inquiries.php';
        break;
    case '/favorites':
        require_once 'routes/favorites.php';
        break;
    case '/upload':
        require_once 'routes/upload.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Endpoint not found']);
        break;
}
?> 