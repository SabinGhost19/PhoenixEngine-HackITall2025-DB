# Quick Start Guide 🚀

## 5-Minute Setup

1. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

2. **Add API keys to .env.local**
\`\`\`env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
\`\`\`

3. **Run**
\`\`\`bash
npm run dev
\`\`\`

4. **Open** http://localhost:3000

## Test with Example Monolith

Create a test PHP project:

\`\`\`
test-monolith/
├── index.php
├── api/
│   ├── users.php
│   ├── products.php
│   └── orders.php
└── config/
    └── database.php
\`\`\`

**index.php**:
\`\`\`php
<?php
require_once 'config/database.php';

// GET /api/users
if ($_SERVER['REQUEST_URI'] === '/api/users' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM users WHERE active = 1");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    header('Content-Type: application/json');
    echo json_encode($users);
    exit;
}

// POST /api/users
if ($_SERVER['REQUEST_URI'] === '/api/users' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['name']) || !isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    $db = getDB();
    $stmt = $db->prepare("INSERT INTO users (name, email, created_at) VALUES (?, ?, NOW())");
    $stmt->execute([$data['name'], $data['email']]);
    
    header('Content-Type: application/json');
    echo json_encode(['id' => $db->lastInsertId(), 'message' => 'User created']);
    exit;
}
?>
\`\`\`

Upload this folder to test the system!

## Expected Output

After migration, you'll get:
- Complete microservice code (Go/Python/Node.js)
- Dockerfile
- README with build instructions
- API documentation
- Test examples

## Next Steps

1. ✅ Review generated code
2. ✅ Check verification results
3. ✅ Download ZIP
4. ✅ Extract and test locally
5. ✅ Deploy to production

## Tips

- Start with simple endpoints (GET requests)
- Review security recommendations
- Test generated code before deploying
- Use Docker for consistent environments

**Need help?** Check the main README.md
