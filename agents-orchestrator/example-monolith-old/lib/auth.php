<?php
/**
 * Authentication helper functions
 */

function requireAuth() {
    $token = getBearerToken();
    
    if (!$token) {
        sendJsonError('Authentication required', 401);
    }
    
    $user = validateToken($token);
    
    if (!$user) {
        sendJsonError('Invalid token', 401);
    }
    
    return $user;
}

function getBearerToken() {
    $headers = getAuthorizationHeader();
    
    if (!empty($headers)) {
        if (preg_match('/Bearer\s+(.*)$/i', $headers, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

function getAuthorizationHeader() {
    if (isset($_SERVER['Authorization'])) {
        return trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            return trim($headers['Authorization']);
        }
    }
    
    return null;
}

function validateToken($token) {
    // Simplified token validation (in real app, use JWT)
    $db = getDatabase();
    $stmt = $db->prepare('SELECT * FROM users WHERE api_token = ? AND active = 1');
    $stmt->execute([$token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function sendJsonError($message, $status = 400) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}
?>
