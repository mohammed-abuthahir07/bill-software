const express = require("express");

const { createBill,fetchBills } = require("../controllers/billing.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Create Invoice
router.post("/create", authMiddleware, createBill);
router.get("/", authMiddleware, fetchBills);

module.exports = router;