# Example Monolith Application

This is a sample PHP monolith application for testing the migration tool.

## Structure

\`\`\`
example-monolith/
├── api/
│   └── users.php       # User management endpoints
├── config/
│   └── database.php    # Database configuration
└── lib/
    └── auth.php        # Authentication helpers
\`\`\`

## Endpoints

### User API (`api/users.php`)

1. **GET /api/users**
   - List all users
   - Query params: `active`, `role`
   - Response: Array of users

2. **GET /api/users/{id}**
   - Get single user
   - Includes recent orders
   - Response: User object

3. **POST /api/users**
   - Create new user
   - Required: `name`, `email`, `password`
   - Optional: `role`
   - Response: Created user

4. **PUT /api/users/{id}**
   - Update user
   - Requires authentication
   - Updatable: `name`, `email`, `role`, `active`
   - Response: Success message

5. **DELETE /api/users/{id}**
   - Soft delete user
   - Requires admin role
   - Response: Success message

## How to Use for Testing

1. Upload this folder to the migration tool
2. The tool will detect all 5 endpoints
3. Select any endpoint to migrate
4. Choose target language (Go/Python/Node.js)
5. Download generated microservice

## Expected Detection

The architecture agent should detect:
- 5 HTTP endpoints
- MySQL database usage
- Authentication/authorization patterns
- Input validation
- Related file dependencies

## Database Schema

\`\`\`sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    active TINYINT(1) DEFAULT 1,
    api_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
\`\`\`

## Features Demonstrated

✅ CRUD operations
✅ Authentication/authorization
✅ Input validation
✅ Database queries (SELECT, INSERT, UPDATE)
✅ Error handling
✅ JSON responses
✅ File dependencies
✅ Business logic complexity

Perfect for testing the migration tool!
