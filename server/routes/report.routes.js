const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const {
  getMonthlySummaryReport,
  getMonthlyInvoicesReport,
  getMonthlyProductsReport,
  downloadMonthlyPdf,
} = require("../controllers/report.controller");

const router = express.Router();

router.get("/monthly-summary", authMiddleware, getMonthlySummaryReport);
router.get("/monthly-invoices", authMiddleware, getMonthlyInvoicesReport);
router.get("/monthly-products", authMiddleware, getMonthlyProductsReport);
router.get("/download-pdf", authMiddleware, downloadMonthlyPdf);

module.exports = router;
