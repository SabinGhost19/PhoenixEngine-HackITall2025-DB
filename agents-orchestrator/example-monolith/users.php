<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET,POST");

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Database connection
// Database connection
$db_url = getenv("DATABASE_URL");
if (!$db_url) {
    $db_url = "postgresql://phoenix:password@host.docker.internal:5432/phoenix_db";
}

$parts = parse_url($db_url);
$host = $parts['host'];
$port = $parts['port'] ?? 5432;
$db_name = ltrim($parts['path'], '/');
$username = $parts['user'];
$password = $parts['pass'];

try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit();
}

// Create users table if not exists (for demo purposes)
$conn->exec("CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

if ($method === 'POST') {
    // Create User
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->name) && !empty($data->email)) {
        try {
            $query = "INSERT INTO users (name, email) VALUES (:name, :email)";
            $stmt = $conn->prepare($query);
            
            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":email", $data->email);
            
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["message" => "User created successfully.", "id" => $conn->lastInsertId()]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to create user."]);
            }
        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data. Name and email required."]);
    }
} elseif ($method === 'GET') {
    // List Users
    try {
        $query = "SELECT id, name, email, created_at FROM users ORDER BY id DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($users);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
}
?>
