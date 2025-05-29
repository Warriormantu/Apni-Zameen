<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';
require_once '../utils/auth.php';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verify authentication
$user = verifyToken();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Get user's favorites
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("
        SELECT p.*, GROUP_CONCAT(pi.image_path) as images
        FROM favorites f
        JOIN properties p ON f.property_id = p.id
        LEFT JOIN property_images pi ON p.id = pi.property_id
        WHERE f.user_id = ?
        GROUP BY p.id
    ");
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $favorites = [];
    while ($row = $result->fetch_assoc()) {
        $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
        $favorites[] = $row;
    }
    
    echo json_encode($favorites);
    exit();
}

// Add property to favorites
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['property_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Property ID is required']);
        exit();
    }
    
    // Check if property exists
    $stmt = $conn->prepare("SELECT id FROM properties WHERE id = ?");
    $stmt->bind_param("i", $data['property_id']);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Property not found']);
        exit();
    }
    
    // Check if already favorited
    $stmt = $conn->prepare("SELECT id FROM favorites WHERE user_id = ? AND property_id = ?");
    $stmt->bind_param("ii", $user['id'], $data['property_id']);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Property already in favorites']);
        exit();
    }
    
    // Add to favorites
    $stmt = $conn->prepare("INSERT INTO favorites (user_id, property_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $user['id'], $data['property_id']);
    
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Property added to favorites']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add property to favorites']);
    }
    exit();
}

// Remove property from favorites
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $property_id = $_GET['id'] ?? null;
    
    if (!$property_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Property ID is required']);
        exit();
    }
    
    $stmt = $conn->prepare("DELETE FROM favorites WHERE user_id = ? AND property_id = ?");
    $stmt->bind_param("ii", $user['id'], $property_id);
    
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Property removed from favorites']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to remove property from favorites']);
    }
    exit();
}

// Check if property is favorited
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['check'])) {
    $property_id = $_GET['check'];
    
    $stmt = $conn->prepare("SELECT id FROM favorites WHERE user_id = ? AND property_id = ?");
    $stmt->bind_param("ii", $user['id'], $property_id);
    $stmt->execute();
    
    echo json_encode(['isFavorite' => $stmt->get_result()->num_rows > 0]);
    exit();
} 