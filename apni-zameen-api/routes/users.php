<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';
require_once '../helpers/JwtHelper.php';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verify authentication
$token = JwtHelper::getBearerToken();
if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required']);
    exit();
}

$decoded = JwtHelper::validateToken($token);
if (!$decoded) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit();
}

// Verify admin role
if ($decoded->role !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit();
}

$db = new Database();
$conn = $db->getConnection();

// Get user ID from URL if present
$user_id = null;
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));
if (count($path_parts) > 1 && is_numeric($path_parts[1])) {
    $user_id = $path_parts[1];
}

// Handle different HTTP methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($user_id) {
            // Get single user
            $stmt = $conn->prepare("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?");
            $stmt->bind_param('i', $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }
            
            echo json_encode($result->fetch_assoc());
        } else {
            // Get all users
            $stmt = $conn->prepare("SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC");
            $stmt->execute();
            $result = $stmt->get_result();
            
            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            
            echo json_encode($users);
        }
        break;

    case 'PUT':
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required']);
            exit();
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['role']) || !in_array($data['role'], ['buyer', 'seller', 'admin'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid role']);
            exit();
        }

        $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
        $stmt->bind_param('si', $data['role'], $user_id);
        
        if ($stmt->execute()) {
            echo json_encode(['message' => 'User role updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update user role']);
        }
        break;

    case 'DELETE':
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required']);
            exit();
        }

        // Prevent self-deletion
        if ($user_id == $decoded->user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot delete your own account']);
            exit();
        }

        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param('i', $user_id);
        
        if ($stmt->execute()) {
            echo json_encode(['message' => 'User deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete user']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?> 