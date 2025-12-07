# Backend Integration Guide

This document outlines the API endpoints required for backend integration with the frontend authentication system.

## Configuration

1. Copy `.env.example` to `.env`
2. Set `VITE_API_BASE_URL` to your backend API base URL (default: `http://localhost:3000/api`)

## Required API Endpoints

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "username": "string",
  "role": "admin" | "client",
  "email": "string (optional)",
  "token": "string (optional - JWT or session token)"
}
```

**Error Response (401/400):**
```json
{
  "message": "Error description"
}
```

**Notes:**
- Admin users (role: "admin") can toggle between client and admin views
- Regular users (role: "client") only see the client view
- If a token is returned, it will be stored in localStorage as 'authToken'

---

### 2. Register

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "string (min 3 characters)",
  "email": "string (valid email format)",
  "password": "string (min 6 characters)"
}
```

**Success Response (201):**
```json
{
  "username": "string",
  "role": "client",
  "email": "string",
  "token": "string (optional - JWT or session token)"
}
```

**Error Response (400/409):**
```json
{
  "message": "Error description"
}
```

**Notes:**
- New users are always assigned the "client" role by default
- Common error messages:
  - "Username already exists" (409)
  - "Email already registered" (409)
  - "Invalid email format" (400)
  - "Password too short" (400)

---

### 3. Logout (Optional)

**Endpoint:** `POST /api/auth/logout`

**Request Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Notes:**
- Used to invalidate server-side sessions/tokens
- Frontend will always clear localStorage regardless of response

---

### 4. Verify Authentication (Optional)

**Endpoint:** `GET /api/auth/verify`

**Request Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "username": "string",
  "role": "admin" | "client",
  "email": "string (optional)"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid or expired token"
}
```

**Notes:**
- Used to verify if a stored token is still valid
- Currently not implemented in frontend, but structure is ready for future use

---

## Frontend Implementation

The authentication logic is centralized in `/src/services/authService.js`. To enable backend integration:

1. Uncomment the actual API calls in `authService.js`
2. Comment out or remove the mock implementations
3. Ensure the backend endpoints match the specifications above

## Current Mock Behavior

- **Login:** Admin credentials are `username: "admin"`, `password: "admin123"`
- **Register:** Any valid credentials create a client user
- **Token Storage:** Not currently used in mock, but implemented for real backend
- **Delays:** Mock responses have artificial delays (1.5s login, 2s register) for UX testing

## Testing Checklist

- [ ] Login with valid credentials returns user data with correct role
- [ ] Login with invalid credentials returns appropriate error
- [ ] Admin login (admin/admin123) sets role to "admin"
- [ ] Admin users can see and toggle between Client/Admin views
- [ ] Regular users only see Client view with logout button
- [ ] Register with valid data creates new user with "client" role
- [ ] Register with duplicate username/email returns error
- [ ] Register with invalid data (short password, invalid email) returns error
- [ ] Logout clears authentication state and returns to login screen
- [ ] Token is stored in localStorage after successful login/register
- [ ] Token is cleared from localStorage after logout
