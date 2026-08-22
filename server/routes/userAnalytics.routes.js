const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { getAnalytics } = require("../controllers/userAnalytics.controller");

const router = express.Router();

router.get("/", authMiddleware, getAnalytics);

module.exports = router;
