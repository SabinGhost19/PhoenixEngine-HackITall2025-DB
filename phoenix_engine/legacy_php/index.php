<?php
header("Content-Type: application/json");

// Database connection
$db_url = getenv("DATABASE_URL");
// Parse DATABASE_URL (postgresql://user:pass@host:port/db)
$parts = parse_url($db_url);
$dsn = "pgsql:host=" . $parts['host'] . ";port=" . $parts['port'] . ";dbname=" . ltrim($parts['path'], '/');
$user = $parts['user'];
$pass = $parts['pass'];

try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Get Request Body
$input = json_decode(file_get_contents('php://input'), true);
$account_number = $input['account_number'] ?? null;
$amount = $input['amount'] ?? null;

if (!$account_number || !$amount) {
    http_response_code(400);
    echo json_encode(["error" => "Missing parameters"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // Select Account (Legacy)
    $stmt = $pdo->prepare("SELECT * FROM accounts WHERE account_number = :acc AND is_shadow = FALSE FOR UPDATE");
    $stmt->execute(['acc' => $account_number]);
    $account = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$account) {
        throw new Exception("Account not found");
    }

    // Flawed Logic: Rounding to 2 decimals prematurely
    $commission_rate = ($account['client_type'] === 'VIP') ? 0.005 : 0.01;
    $commission = round($amount * $commission_rate, 2); // Flaw: Rounding here
    $total_deduction = $amount + $commission;

    if ($account['balance'] < $total_deduction) {
        throw new Exception("Insufficient funds");
    }

    $new_balance = $account['balance'] - $total_deduction;

    // Update DB
    $updateStmt = $pdo->prepare("UPDATE accounts SET balance = :bal WHERE id = :id");
    $updateStmt->execute(['bal' => $new_balance, 'id' => $account['id']]);

    $pdo->commit();

    echo json_encode([
        "status" => "success",
        "new_balance" => $new_balance,
        "commission_charged" => $commission,
        "system" => "legacy_php"
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
