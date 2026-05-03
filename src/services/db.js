// src/services/db.js

// Global memory cache to hold users during current runtime
const _userMemoryDatabase = [
  {
    name: "Admin Moderator",
    email: "admin@mediaflow.com",
    password: "admin@123",
    role: "admin"
  }
];

export const memoryDB = {
  // Add a new user to the system
  insertUser: (user) => {
    if (_userMemoryDatabase.some(u => u.email === user.email)) {
      return { success: false, message: "Email is already registered." };
    }
    _userMemoryDatabase.push({ ...user, role: 'user' });
    return { success: true };
  },

  // Check user credentials for login
  findUser: (email, password) => {
    return _userMemoryDatabase.find(
      (user) => user.email === email && user.password === password
    );
  },

  // Get all registered users
  getAllUsers: () => [..._userMemoryDatabase]
};