<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/JwtHelper.php';

header('Content-Type: application/json');

$db = new Database();
$conn = $db->getConnection();

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Extract property ID if present
$property_id = null;
if (count($path_parts) > 1 && is_numeric($path_parts[1])) {
    $property_id = $path_parts[1];
}

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        if ($property_id) {
            getProperty($conn, $property_id);
        } else {
            getProperties($conn);
        }
        break;
    case 'POST':
        createProperty($conn);
        break;
    case 'PUT':
        if ($property_id) {
            updateProperty($conn, $property_id);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Property ID required']);
        }
        break;
    case 'DELETE':
        if ($property_id) {
            deleteProperty($conn, $property_id);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Property ID required']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getProperties($conn) {
    // Build query with filters
    $query = "SELECT p.*, u.name as owner_name, 
              (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image 
              FROM properties p 
              JOIN users u ON p.user_id = u.id 
              WHERE 1=1";
    $params = [];
    $types = "";

    // Apply filters
    if (isset($_GET['city']) && !empty($_GET['city'])) {
        $query .= " AND p.city LIKE ?";
        $city = "%" . $_GET['city'] . "%";
        $params[] = $city;
        $types .= "s";
    }

    if (isset($_GET['property_type']) && !empty($_GET['property_type'])) {
        $query .= " AND p.property_type = ?";
        $params[] = $_GET['property_type'];
        $types .= "s";
    }

    if (isset($_GET['min_price']) && is_numeric($_GET['min_price'])) {
        $query .= " AND p.price >= ?";
        $params[] = $_GET['min_price'];
        $types .= "d";
    }

    if (isset($_GET['max_price']) && is_numeric($_GET['max_price'])) {
        $query .= " AND p.price <= ?";
        $params[] = $_GET['max_price'];
        $types .= "d";
    }

    if (isset($_GET['bedrooms']) && is_numeric($_GET['bedrooms'])) {
        $query .= " AND p.bedrooms >= ?";
        $params[] = $_GET['bedrooms'];
        $types .= "i";
    }

    if (isset($_GET['status']) && !empty($_GET['status'])) {
        $query .= " AND p.status = ?";
        $params[] = $_GET['status'];
        $types .= "s";
    }

    // Add sorting
    $query .= " ORDER BY p.created_at DESC";

    // Prepare and execute query
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $properties = [];
    while ($row = $result->fetch_assoc()) {
        $properties[] = $row;
    }

    echo json_encode($properties);
}

function getProperty($conn, $property_id) {
    // Get property details with owner information
    $stmt = $conn->prepare("
        SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
        FROM properties p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    ");
    $stmt->bind_param('i', $property_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Property not found']);
        return;
    }

    $property = $result->fetch_assoc();

    // Get property images
    $stmt = $conn->prepare("SELECT * FROM property_images WHERE property_id = ?");
    $stmt->bind_param('i', $property_id);
    $stmt->execute();
    $images = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    $property['images'] = $images;

    echo json_encode($property);
}

function createProperty($conn) {
    // Verify authentication
    $token = JwtHelper::getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    $decoded = JwtHelper::validateToken($token);
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $required_fields = ['title', 'description', 'price', 'property_type', 'address', 'city', 'state', 'zip_code'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            return;
        }
    }

    // Insert property
    $stmt = $conn->prepare("
        INSERT INTO properties (
            user_id, title, description, price, property_type, status,
            bedrooms, bathrooms, area, address, city, state, zip_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $status = isset($data['status']) ? $data['status'] : 'available';
    $bedrooms = isset($data['bedrooms']) ? $data['bedrooms'] : null;
    $bathrooms = isset($data['bathrooms']) ? $data['bathrooms'] : null;
    $area = isset($data['area']) ? $data['area'] : null;

    $stmt->bind_param(
        'issdssiiidsss',
        $decoded->user_id,
        $data['title'],
        $data['description'],
        $data['price'],
        $data['property_type'],
        $status,
        $bedrooms,
        $bathrooms,
        $area,
        $data['address'],
        $data['city'],
        $data['state'],
        $data['zip_code']
    );

    if ($stmt->execute()) {
        $property_id = $conn->insert_id;

        // Handle images if provided
        if (isset($data['images']) && is_array($data['images'])) {
            $image_stmt = $conn->prepare("
                INSERT INTO property_images (property_id, image_url, is_primary)
                VALUES (?, ?, ?)
            ");

            foreach ($data['images'] as $index => $image) {
                $is_primary = $index === 0 ? 1 : 0;
                $image_stmt->bind_param('isi', $property_id, $image, $is_primary);
                $image_stmt->execute();
            }
        }

        echo json_encode([
            'message' => 'Property created successfully',
            'property_id' => $property_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create property']);
    }
}

function updateProperty($conn, $property_id) {
    // Verify authentication
    $token = JwtHelper::getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    $decoded = JwtHelper::validateToken($token);
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        return;
    }

    // Verify property ownership
    $stmt = $conn->prepare("SELECT user_id FROM properties WHERE id = ?");
    $stmt->bind_param('i', $property_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Property not found']);
        return;
    }

    $property = $result->fetch_assoc();
    if ($property['user_id'] != $decoded->user_id && $decoded->role !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Not authorized to update this property']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    // Build update query dynamically based on provided fields
    $update_fields = [];
    $params = [];
    $types = "";

    $allowed_fields = [
        'title', 'description', 'price', 'property_type', 'status',
        'bedrooms', 'bathrooms', 'area', 'address', 'city', 'state', 'zip_code'
    ];

    foreach ($allowed_fields as $field) {
        if (isset($data[$field])) {
            $update_fields[] = "$field = ?";
            $params[] = $data[$field];
            $types .= is_numeric($data[$field]) ? 'd' : 's';
        }
    }

    if (empty($update_fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }

    $query = "UPDATE properties SET " . implode(', ', $update_fields) . " WHERE id = ?";
    $params[] = $property_id;
    $types .= 'i';

    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        // Handle images if provided
        if (isset($data['images']) && is_array($data['images'])) {
            // Delete existing images
            $conn->query("DELETE FROM property_images WHERE property_id = $property_id");

            // Insert new images
            $image_stmt = $conn->prepare("
                INSERT INTO property_images (property_id, image_url, is_primary)
                VALUES (?, ?, ?)
            ");

            foreach ($data['images'] as $index => $image) {
                $is_primary = $index === 0 ? 1 : 0;
                $image_stmt->bind_param('isi', $property_id, $image, $is_primary);
                $image_stmt->execute();
            }
        }

        echo json_encode(['message' => 'Property updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update property']);
    }
}

function deleteProperty($conn, $property_id) {
    // Verify authentication
    $token = JwtHelper::getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }

    $decoded = JwtHelper::validateToken($token);
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        return;
    }

    // Verify property ownership
    $stmt = $conn->prepare("SELECT user_id FROM properties WHERE id = ?");
    $stmt->bind_param('i', $property_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Property not found']);
        return;
    }

    $property = $result->fetch_assoc();
    if ($property['user_id'] != $decoded->user_id && $decoded->role !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Not authorized to delete this property']);
        return;
    }

    // Delete property (cascade will handle related records)
    $stmt = $conn->prepare("DELETE FROM properties WHERE id = ?");
    $stmt->bind_param('i', $property_id);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Property deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete property']);
    }
}
?> 