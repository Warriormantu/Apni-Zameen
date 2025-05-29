<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
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

$db = new Database();
$conn = $db->getConnection();

// Get inquiry ID from URL if present
$inquiry_id = null;
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));
if (count($path_parts) > 1 && is_numeric($path_parts[1])) {
    $inquiry_id = $path_parts[1];
}

// Handle different HTTP methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($inquiry_id) {
            // Get single inquiry
            $stmt = $conn->prepare("
                SELECT i.*, p.title as property_title, u.name as user_name, u.email as user_email
                FROM inquiries i
                JOIN properties p ON i.property_id = p.id
                JOIN users u ON i.user_id = u.id
                WHERE i.id = ?
            ");
            $stmt->bind_param('i', $inquiry_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Inquiry not found']);
                exit();
            }
            
            echo json_encode($result->fetch_assoc());
        } else {
            // Get inquiries based on user role
            if ($decoded->role === 'admin') {
                // Admin can see all inquiries
                $stmt = $conn->prepare("
                    SELECT i.*, p.title as property_title, u.name as user_name, u.email as user_email
                    FROM inquiries i
                    JOIN properties p ON i.property_id = p.id
                    JOIN users u ON i.user_id = u.id
                    ORDER BY i.created_at DESC
                ");
                $stmt->execute();
            } else {
                // Regular users can only see their own inquiries
                $stmt = $conn->prepare("
                    SELECT i.*, p.title as property_title, u.name as user_name, u.email as user_email
                    FROM inquiries i
                    JOIN properties p ON i.property_id = p.id
                    JOIN users u ON i.user_id = u.id
                    WHERE i.user_id = ?
                    ORDER BY i.created_at DESC
                ");
                $stmt->bind_param('i', $decoded->user_id);
                $stmt->execute();
            }
            
            $result = $stmt->get_result();
            $inquiries = [];
            while ($row = $result->fetch_assoc()) {
                $inquiries[] = $row;
            }
            
            echo json_encode($inquiries);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['property_id']) || !isset($data['message'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Property ID and message are required']);
            exit();
        }

        $stmt = $conn->prepare("
            INSERT INTO inquiries (user_id, property_id, message, status)
            VALUES (?, ?, ?, 'pending')
        ");
        $stmt->bind_param('iis', $decoded->user_id, $data['property_id'], $data['message']);
        
        if ($stmt->execute()) {
            echo json_encode([
                'message' => 'Inquiry submitted successfully',
                'inquiry_id' => $conn->insert_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to submit inquiry']);
        }
        break;

    case 'PUT':
        if (!$inquiry_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Inquiry ID required']);
            exit();
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['status']) || !in_array($data['status'], ['pending', 'responded', 'closed'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid status']);
            exit();
        }

        // Verify user has permission to update
        $stmt = $conn->prepare("
            SELECT i.id
            FROM inquiries i
            JOIN properties p ON i.property_id = p.id
            WHERE i.id = ? AND (i.user_id = ? OR p.user_id = ? OR ? = 'admin')
        ");
        $stmt->bind_param('iiis', $inquiry_id, $decoded->user_id, $decoded->user_id, $decoded->role);
        $stmt->execute();
        
        if ($stmt->get_result()->num_rows === 0) {
            http_response_code(403);
            echo json_encode(['error' => 'Not authorized to update this inquiry']);
            exit();
        }

        $stmt = $conn->prepare("UPDATE inquiries SET status = ? WHERE id = ?");
        $stmt->bind_param('si', $data['status'], $inquiry_id);
        
        if ($stmt->execute()) {
            echo json_encode(['message' => 'Inquiry status updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update inquiry status']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?> 