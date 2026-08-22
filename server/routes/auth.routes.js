const express = require("express");

const {
  register,
  login,
  getProfile,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// ===============================
// Public Routes
// ===============================

// Register User
router.post("/register", register);

// Login User
router.post("/login", login);

// ===============================
// Protected Routes
// ===============================

// Get Logged In User Profile
router.get("/profile", authMiddleware, getProfile);

module.exports = router;