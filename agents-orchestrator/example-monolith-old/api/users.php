<?php
/**
 * Example Legacy Monolith - User API
 * This is a sample PHP application to test the migration tool
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/lib/auth.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// GET /api/users - List all users
if ($method === 'GET' && $path === '/api/users') {
    $db = getDatabase();
    
    // Optional filters
    $filters = [];
    $params = [];
    
    if (isset($_GET['active'])) {
        $filters[] = 'active = ?';
        $params[] = (int)$_GET['active'];
    }
    
    if (isset($_GET['role'])) {
        $filters[] = 'role = ?';
        $params[] = $_GET['role'];
    }
    
    $sql = 'SELECT id, name, email, role, active, created_at FROM users';
    if (!empty($filters)) {
        $sql .= ' WHERE ' . implode(' AND ', $filters);
    }
    $sql .= ' ORDER BY created_at DESC';
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendJson(['success' => true, 'data' => $users]);
}

// GET /api/users/{id} - Get single user
if ($method === 'GET' && preg_match('#^/api/users/(\d+)$#', $path, $matches)) {
    $userId = (int)$matches[1];
    
    $db = getDatabase();
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        sendJson(['success' => false, 'error' => 'User not found'], 404);
    }
    
    // Get user's orders
    $stmt = $db->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10');
    $stmt->execute([$userId]);
    $user['recent_orders'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendJson(['success' => true, 'data' => $user]);
}

// POST /api/users - Create new user
if ($method === 'POST' && $path === '/api/users') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validation
    $errors = [];
    if (empty($data['name'])) {
        $errors[] = 'Name is required';
    }
    if (empty($data['email'])) {
        $errors[] = 'Email is required';
    } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Invalid email format';
    }
    if (empty($data['password'])) {
        $errors[] = 'Password is required';
    } elseif (strlen($data['password']) < 8) {
        $errors[] = 'Password must be at least 8 characters';
    }
    
    if (!empty($errors)) {
        sendJson(['success' => false, 'errors' => $errors], 400);
    }
    
    // Check if email already exists
    $db = getDatabase();
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        sendJson(['success' => false, 'error' => 'Email already registered'], 409);
    }
    
    // Create user
    $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
    $role = $data['role'] ?? 'user';
    
    $stmt = $db->prepare('
        INSERT INTO users (name, email, password, role, active, created_at)
        VALUES (?, ?, ?, ?, 1, NOW())
    ');
    $stmt->execute([
        $data['name'],
        $data['email'],
        $hashedPassword,
        $role
    ]);
    
    $userId = $db->lastInsertId();
    
    // Send welcome email (simulated)
    sendWelcomeEmail($data['email'], $data['name']);
    
    sendJson([
        'success' => true,
        'data' => [
            'id' => $userId,
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $role
        ]
    ], 201);
}

// PUT /api/users/{id} - Update user
if ($method === 'PUT' && preg_match('#^/api/users/(\d+)$#', $path, $matches)) {
    $userId = (int)$matches[1];
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check authentication
    $authUser = requireAuth();
    if ($authUser['id'] != $userId && $authUser['role'] !== 'admin') {
        sendJson(['success' => false, 'error' => 'Unauthorized'], 403);
    }
    
    $db = getDatabase();
    
    // Check if user exists
    $stmt = $db->prepare('SELECT id FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    if (!$stmt->fetch()) {
        sendJson(['success' => false, 'error' => 'User not found'], 404);
    }
    
    // Build update query
    $updates = [];
    $params = [];
    
    if (isset($data['name'])) {
        $updates[] = 'name = ?';
        $params[] = $data['name'];
    }
    if (isset($data['email'])) {
        $updates[] = 'email = ?';
        $params[] = $data['email'];
    }
    if (isset($data['role']) && $authUser['role'] === 'admin') {
        $updates[] = 'role = ?';
        $params[] = $data['role'];
    }
    if (isset($data['active']) && $authUser['role'] === 'admin') {
        $updates[] = 'active = ?';
        $params[] = (int)$data['active'];
    }
    
    if (empty($updates)) {
        sendJson(['success' => false, 'error' => 'No fields to update'], 400);
    }
    
    $params[] = $userId;
    $sql = 'UPDATE users SET ' . implode(', ', $updates) . ', updated_at = NOW() WHERE id = ?';
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    sendJson(['success' => true, 'message' => 'User updated']);
}

// DELETE /api/users/{id} - Delete user (soft delete)
if ($method === 'DELETE' && preg_match('#^/api/users/(\d+)$#', $path, $matches)) {
    $userId = (int)$matches[1];
    
    // Require admin
    $authUser = requireAuth();
    if ($authUser['role'] !== 'admin') {
        sendJson(['success' => false, 'error' => 'Admin access required'], 403);
    }
    
    $db = getDatabase();
    
    // Soft delete
    $stmt = $db->prepare('UPDATE users SET active = 0, deleted_at = NOW() WHERE id = ?');
    $stmt->execute([$userId]);
    
    if ($stmt->rowCount() === 0) {
        sendJson(['success' => false, 'error' => 'User not found'], 404);
    }
    
    sendJson(['success' => true, 'message' => 'User deleted']);
}

// 404 Not Found
sendJson(['success' => false, 'error' => 'Endpoint not found'], 404);

// Helper functions
function sendJson($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sendWelcomeEmail($email, $name) {
    // Simulated email sending
    error_log("Sending welcome email to $email");
}
?>
