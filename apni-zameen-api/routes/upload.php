<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Validate property_id
if (!isset($_POST['property_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Property ID is required']);
    exit();
}

$property_id = $_POST['property_id'];

// Verify property ownership
$stmt = $conn->prepare("SELECT user_id FROM properties WHERE id = ?");
$stmt->bind_param("i", $property_id);
$stmt->execute();
$result = $stmt->get_result();
$property = $result->fetch_assoc();

if (!$property || ($property['user_id'] !== $user['id'] && $user['role'] !== 'admin')) {
    http_response_code(403);
    echo json_encode(['error' => 'Not authorized to upload images for this property']);
    exit();
}

// Create uploads directory if it doesn't exist
$upload_dir = '../uploads/properties/' . $property_id;
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$uploaded_files = [];
$errors = [];

// Process each uploaded file
foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
    $file_name = $_FILES['images']['name'][$key];
    $file_size = $_FILES['images']['size'][$key];
    $file_tmp = $_FILES['images']['tmp_name'][$key];
    $file_type = $_FILES['images']['type'][$key];

    // Validate file type
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file_type, $allowed_types)) {
        $errors[] = "File $file_name is not an allowed image type";
        continue;
    }

    // Validate file size (5MB max)
    if ($file_size > 5 * 1024 * 1024) {
        $errors[] = "File $file_name is too large (max 5MB)";
        continue;
    }

    // Generate unique filename
    $file_extension = pathinfo($file_name, PATHINFO_EXTENSION);
    $new_file_name = uniqid() . '.' . $file_extension;
    $file_path = $upload_dir . '/' . $new_file_name;

    // Move uploaded file
    if (move_uploaded_file($file_tmp, $file_path)) {
        // Store image path in database
        $relative_path = 'uploads/properties/' . $property_id . '/' . $new_file_name;
        $stmt = $conn->prepare("INSERT INTO property_images (property_id, image_path) VALUES (?, ?)");
        $stmt->bind_param("is", $property_id, $relative_path);
        
        if ($stmt->execute()) {
            $uploaded_files[] = [
                'path' => $relative_path,
                'id' => $stmt->insert_id
            ];
        } else {
            $errors[] = "Failed to save image $file_name to database";
            unlink($file_path); // Delete the file if database insert fails
        }
    } else {
        $errors[] = "Failed to upload file $file_name";
    }
}

// Return response
if (empty($uploaded_files)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'No files were uploaded successfully',
        'details' => $errors
    ]);
} else {
    echo json_encode([
        'message' => 'Files uploaded successfully',
        'files' => $uploaded_files,
        'errors' => $errors
    ]);
} 