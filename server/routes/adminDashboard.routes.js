const express = require("express");

const router = express.Router();

const { getDashboard } = require("../controllers/adminDashboard.controller");

const adminMiddleware = require("../middleware/admin.middleware");

router.get("/", adminMiddleware, getDashboard);

module.exports = router;