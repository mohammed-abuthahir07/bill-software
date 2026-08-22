const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const adminMiddleware = require("../middleware/admin.middleware");


// Protect Analytics Routes
router.use(adminMiddleware);

// User Registration
router.get("/users",analyticsController.usersAnalytics);
// Revenue
router.get( "/revenue", analyticsController.revenueAnalytics);
// Invoice
router.get( "/invoices", analyticsController.invoiceAnalytics);
// Products
router.get("/products",  analyticsController.productAnalytics);



module.exports = router;