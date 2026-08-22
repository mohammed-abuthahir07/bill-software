const express = require("express");

const router = express.Router();

const {
  sendOTP,
  verifyOTP,
  resetPassword,
} = require("../controllers/forgotPassword.controller");

// =====================================
// Send OTP
// =====================================
router.post("/send-otp", sendOTP);

// =====================================
// Verify OTP
// =====================================
router.post("/verify-otp", verifyOTP);

// =====================================
// Reset Password
// =====================================
router.post("/reset-password", resetPassword);

module.exports = router;