const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  addProduct,
  getAllProducts,
  getSingleProduct,
  editProduct,
  removeProduct,
} = require("../controllers/product.controller");

// ===============================
// Protected Routes
// ===============================

// Add Product
router.post("/", authMiddleware, addProduct);

// Get All Products (Current User)
router.get("/", authMiddleware, getAllProducts);

// Get Single Product
router.get("/:id", authMiddleware, getSingleProduct);

// Update Product
router.put("/:id", authMiddleware, editProduct);

// Delete Product
router.delete("/:id", authMiddleware, removeProduct);

module.exports = router;