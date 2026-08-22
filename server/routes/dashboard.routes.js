const express = require("express");

const { getDashboard } = require("../controllers/dashboard.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Dashboard
router.get("/", authMiddleware, getDashboard);

module.exports = router;