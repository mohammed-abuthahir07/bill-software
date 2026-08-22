const express = require("express");

const router = express.Router();

const {
    getCompanies,
    getCompany,
} = require("../controllers/company.controller");

const adminMiddleware = require("../middleware/admin.middleware");

// =====================================
// GET ALL COMPANIES
// =====================================
router.get(
    "/companies",
    adminMiddleware,
    getCompanies
);

// =====================================
// GET SINGLE COMPANY
// =====================================
router.get(
    "/companies/:id",
    adminMiddleware,
    getCompany
);

module.exports = router;