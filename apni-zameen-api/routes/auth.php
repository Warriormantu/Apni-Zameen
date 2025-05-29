<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/JwtHelper.php';

header('Content-Type: application/json');

$db = new Database();
$conn = $db->getConnection();

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'register':
        handleRegister($conn);
        break;
    case 'login':
        handleLogin($conn);
        break;
    case 'me':
        handleGetCurrentUser($conn);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function handleRegister($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }

    // Validate email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }

    // Check if email already exists
    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->bind_param('s', $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already registered']);
        return;
    }

    // Hash password
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $conn->prepare('INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)');
    $role = isset($data['role']) ? $data['role'] : 'buyer';
    $phone = isset($data['phone']) ? $data['phone'] : null;
    $stmt->bind_param('sssss', $data['name'], $data['email'], $hashed_password, $phone, $role);

    if ($stmt->execute()) {
        $user_id = $conn->insert_id;
        $token = JwtHelper::generateToken($user_id, $role);
        
        echo json_encode([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => [
                'id' => $user_id,
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => $role
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed']);
    }
}

function handleLogin($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing email or password']);
        return;
    }

    $stmt = $conn->prepare('SELECT id, name, email, password, role FROM users WHERE email = ?');
    $stmt->bind_param('s', $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        return;
    }

    $user = $result->fetch_assoc();

    if (!password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        return;
    }

    $token = JwtHelper::generateToken($user['id'], $user['role']);

    echo json_encode([
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
}

function handleGetCurrentUser($conn) {
    $token = JwtHelper::getBearerToken();

    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        return;
    }

    $decoded = JwtHelper::validateToken($token);

    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        return;
    }

    $stmt = $conn->prepare('SELECT id, name, email, role FROM users WHERE id = ?');
    $stmt->bind_param('i', $decoded->user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }

    $user = $result->fetch_assoc();
    echo json_encode($user);
} 