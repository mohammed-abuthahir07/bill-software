const {
  createProduct,
  getProductsByUser,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../models/product.model");
const { isValidWeightUnit } = require("../utils/productVariant");

const parseRequiredNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const addProduct = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      itemName,
      category,
      sku,
      description,
      gst,
      packageWeight,
      weightUnit,
      sellingPrice,
      quantity,
    } = req.body;

    const parsedGst = parseRequiredNumber(gst) ?? 0;
    const parsedPackageWeight = parseRequiredNumber(packageWeight);
    const parsedSellingPrice = parseRequiredNumber(sellingPrice);
    const parsedQuantity = parseRequiredNumber(quantity);
    const normalizedUnit = String(weightUnit || "").trim();

    if (
      !itemName ||
      !category ||
      parsedPackageWeight === null ||
      parsedPackageWeight <= 0 ||
      !isValidWeightUnit(normalizedUnit) ||
      parsedSellingPrice === null ||
      parsedSellingPrice < 0 ||
      parsedQuantity === null ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Required product variant fields are missing or invalid.",
      });
    }

    const result = await createProduct(
      userId,
      itemName.trim(),
      category,
      sku || null,
      description || null,
      parsedGst,
      parsedPackageWeight,
      normalizedUnit,
      parsedSellingPrice,
      Math.floor(parsedQuantity)
    );

    const product = await getProductById(result.insertId, userId);

    res.status(201).json({
      success: true,
      message: "Product variant added successfully.",
      product,
    });
  } catch (error) {
    console.error("Add Product Error:", error);

    res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Internal Server Error",
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const products = await getProductsByUser(userId);

    res.status(200).json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    const product = await getProductById(productId, userId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found.",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const editProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const product = await getProductById(productId, userId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found.",
      });
    }

    const itemName = req.body.itemName ?? product.item_name;
    const category = req.body.category ?? product.category;
    const sku = req.body.sku ?? product.sku;
    const description = req.body.description ?? product.description;
    const gst = parseRequiredNumber(req.body.gst) ?? Number(product.gst);
    const packageWeight =
      parseRequiredNumber(req.body.packageWeight) ?? Number(product.package_weight);
    const weightUnit = String(req.body.weightUnit || product.weight_unit).trim();
    const sellingPrice =
      parseRequiredNumber(req.body.sellingPrice) ?? Number(product.selling_price);
    const quantity =
      parseRequiredNumber(req.body.quantity) ?? Number(product.quantity);

    if (
      !itemName ||
      !category ||
      packageWeight <= 0 ||
      !isValidWeightUnit(weightUnit) ||
      sellingPrice < 0 ||
      quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Required product variant fields are missing or invalid.",
      });
    }

    await updateProduct(
      productId,
      userId,
      itemName.trim(),
      category,
      sku || null,
      description || null,
      gst,
      packageWeight,
      weightUnit,
      sellingPrice,
      Math.floor(quantity)
    );

    const updatedProduct = await getProductById(productId, userId);

    res.status(200).json({
      success: true,
      message: "Product variant updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Internal Server Error",
    });
  }
};

const removeProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    const product = await getProductById(productId, userId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found.",
      });
    }

    await deleteProduct(productId, userId);

    res.status(200).json({
      success: true,
      message: "Product variant deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_ROW_IS_REFERENCED") {
      return res.status(400).json({
        success: false,
        message: "This variant is used in existing invoices and cannot be deleted.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getSingleProduct,
  editProduct,
  removeProduct,
};
