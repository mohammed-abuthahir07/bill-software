const {
  createInvoice,
  createInvoiceItem,
  updateProductStock,
  getInvoiceById,
  getInvoiceItems,
  getBillsPaginated,
} = require("../models/bill.model");

const { getProductByIdForUpdate } = require("../models/product.model");
const { formatVariantLabel } = require("../utils/productVariant");
const { pool } = require("../config/database");

const createBill = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user.id;

    const {
      sellerName,
      sellerEmail,
      sellerGST,
      customerName,
      customerEmail,
      customerGST,
      customerAddress,
      products,
    } = req.body;

    if (
      !sellerName ||
      !sellerEmail ||
      !sellerGST ||
      !customerName ||
      !customerEmail ||
      !customerAddress ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const quantityByProductId = new Map();

    for (const item of products) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (!productId || !quantity) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Each line item must have a product variant and quantity.",
        });
      }

      if (quantity <= 0 || !Number.isInteger(quantity)) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Quantity must be a whole number greater than zero.",
        });
      }

      quantityByProductId.set(
        productId,
        (quantityByProductId.get(productId) || 0) + quantity
      );
    }

    let subtotal = 0;
    let gstAmount = 0;
    const invoiceProducts = [];

    for (const [productId, quantity] of quantityByProductId.entries()) {
      const product = await getProductByIdForUpdate(productId, userId, connection);

      if (!product) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: `Product variant not found.`,
        });
      }

      if (product.quantity < quantity) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: `${formatVariantLabel(
            product.item_name,
            product.package_weight,
            product.weight_unit
          )} has only ${product.quantity} packs in stock.`,
        });
      }

      const unitPrice = Number(product.selling_price);
      const lineTotal = unitPrice * quantity;
      const lineGST = (lineTotal * Number(product.gst)) / 100;

      subtotal += lineTotal;
      gstAmount += lineGST;

      invoiceProducts.push({
        productId: product.id,
        productName: formatVariantLabel(
          product.item_name,
          product.package_weight,
          product.weight_unit
        ),
        category: product.category,
        description: product.description,
        quantity,
        weight: Number(product.package_weight),
        unit: product.weight_unit,
        sellingPrice: unitPrice,
        price: unitPrice,
        gst: Number(product.gst),
        total: lineTotal + lineGST,
      });
    }

    const grandTotal = subtotal + gstAmount;
    const invoiceNumber = `INV-${Date.now()}`;

    const invoiceId = await createInvoice(
      connection,
      userId,
      invoiceNumber,
      sellerName,
      sellerEmail,
      sellerGST,
      customerName,
      customerEmail,
      customerGST,
      customerAddress,
      subtotal,
      gstAmount,
      grandTotal
    );

    for (const item of invoiceProducts) {
      await createInvoiceItem(
        connection,
        invoiceId,
        item.productId,
        item.productName,
        item.category,
        item.description,
        item.quantity,
        item.weight,
        item.unit,
        item.sellingPrice,
        item.price,
        item.gst,
        item.total
      );

      const stockResult = await updateProductStock(
        connection,
        item.productId,
        userId,
        item.quantity
      );

      if (!stockResult.affectedRows) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: `${item.productName} does not have enough stock.`,
        });
      }
    }

    await connection.commit();

    const invoice = await getInvoiceById(invoiceId, userId);
    const items = await getInvoiceItems(invoiceId);

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      invoice,
      items,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Create Bill Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  } finally {
    connection.release();
  }
};

const fetchBills = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const { invoices, currentPage, totalPages, totalRecords } =
      await getBillsPaginated(userId, page, limit);

    return res.status(200).json({
      success: true,
      invoices,
      bills: invoices,
      currentPage,
      totalPages,
      totalRecords,
      totalBills: totalRecords,
    });
  } catch (error) {
    console.error("Fetch Bills Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createBill,
  fetchBills,
};
