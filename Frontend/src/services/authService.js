// Authentication Service
// This file contains all authentication-related API calls

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Login user with username and password
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data with role and token
 */
export const loginUser = async (username, password) => {
  // TODO: Uncomment when backend is ready
  // const response = await fetch(`${API_BASE_URL}/auth/login`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ username, password }),
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   throw new Error(error.message || 'Login failed');
  // }
  //
  // const data = await response.json();
  //
  // // Store token if provided
  // if (data.token) {
  //   localStorage.setItem('authToken', data.token);
  // }
  //
  // return data; // Expected format: { username, role, email?, token? }

  // Mock implementation for development
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check for admin credentials
      const isAdmin = username.toLowerCase() === 'admin' && password === 'admin123';

      if (!username || !password) {
        reject(new Error('Username and password are required'));
        return;
      }

      resolve({
        username,
        role: isAdmin ? 'admin' : 'client',
        email: `${username}@example.com`,
      });
    }, 1500);
  });
};

/**
 * Register new user
 * @param {string} username - Desired username
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data with role and token
 */
export const registerUser = async (username, email, password) => {
  // TODO: Uncomment when backend is ready
  // const response = await fetch(`${API_BASE_URL}/auth/register`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ username, email, password }),
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   throw new Error(error.message || 'Registration failed');
  // }
  //
  // const data = await response.json();
  //
  // // Store token if provided
  // if (data.token) {
  //   localStorage.setItem('authToken', data.token);
  // }
  //
  // return data; // Expected format: { username, role, email, token? }

  // Mock implementation for development
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!username || !email || !password) {
        reject(new Error('All fields are required'));
        return;
      }

      if (password.length < 6) {
        reject(new Error('Password must be at least 6 characters'));
        return;
      }

      resolve({
        username,
        email,
        role: 'client', // New users are always clients
      });
    }, 2000);
  });
};

/**
 * Logout user
 * Clears authentication token from storage
 */
export const logoutUser = () => {
  // TODO: Uncomment when backend is ready
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   // Optional: Call backend to invalidate token
  //   fetch(`${API_BASE_URL}/auth/logout`, {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${token}`,
  //     },
  //   }).catch(console.error);
  // }

  localStorage.removeItem('authToken');
};

/**
 * Get current authentication token
 * @returns {string|null} Authentication token
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Verify if user is authenticated
 * @returns {Promise<Object|null>} User data if authenticated, null otherwise
 */
export const verifyAuth = async () => {
  // TODO: Uncomment when backend is ready
  // const token = getAuthToken();
  // if (!token) return null;
  //
  // try {
  //   const response = await fetch(`${API_BASE_URL}/auth/verify`, {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Bearer ${token}`,
  //     },
  //   });
  //
  //   if (!response.ok) {
  //     localStorage.removeItem('authToken');
  //     return null;
  //   }
  //
  //   const data = await response.json();
  //   return data; // Expected format: { username, role, email? }
  // } catch (error) {
  //   console.error('Auth verification failed:', error);
  //   localStorage.removeItem('authToken');
  //   return null;
  // }

  // Mock implementation for development
  return null;
};
