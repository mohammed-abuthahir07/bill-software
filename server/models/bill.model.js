const { pool } = require("../config/database");

const createInvoice = async (
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
) => {
  const query = `
    INSERT INTO invoices (
      user_id,
      invoice_number,
      seller_name,
      seller_email,
      seller_gst,
      customer_name,
      customer_email,
      customer_gst,
      customer_address,
      subtotal,
      gst_amount,
      grand_total
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
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
    grandTotal,
  ]);

  return result.insertId;
};

const createInvoiceItem = async (
  connection,
  invoiceId,
  productId,
  productName,
  category,
  description,
  quantity,
  weight,
  unit,
  sellingPrice,
  price,
  gst,
  total
) => {
  const query = `
    INSERT INTO invoice_items (
      invoice_id,
      product_id,
      product_name,
      category,
      description,
      quantity,
      weight,
      unit,
      selling_price,
      price,
      gst,
      total
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(query, [
    invoiceId,
    productId,
    productName,
    category,
    description,
    quantity,
    weight,
    unit,
    sellingPrice,
    price,
    gst,
    total,
  ]);

  return result;
};

const updateProductStock = async (connection, productId, userId, quantity) => {
  const query = `
    UPDATE products
    SET quantity = quantity - ?
    WHERE id = ?
      AND user_id = ?
      AND quantity >= ?
  `;

  const [result] = await connection.execute(query, [
    quantity,
    productId,
    userId,
    quantity,
  ]);

  return result;
};

const getInvoiceById = async (invoiceId, userId, connection = pool) => {
  const query = `
    SELECT *
    FROM invoices
    WHERE id = ?
    AND user_id = ?
    LIMIT 1
  `;

  const [rows] = await connection.execute(query, [invoiceId, userId]);
  return rows[0];
};

const getInvoiceItems = async (invoiceId, connection = pool) => {
  const query = `
    SELECT
      product_id,
      product_name,
      category,
      description,
      quantity,
      weight,
      unit,
      selling_price,
      price,
      gst,
      total
    FROM invoice_items
    WHERE invoice_id = ?
  `;

  const [rows] = await connection.execute(query, [invoiceId]);
  return rows;
};

const getAllBills = async (userId) => {
  const query = `
    SELECT
      id,
      invoice_number,
      customer_name,
      customer_email,
      customer_gst,
      customer_address,
      subtotal,
      gst_amount,
      grand_total,
      created_at
    FROM invoices
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  const [bills] = await pool.execute(query, [userId]);

  for (const bill of bills) {
    const [items] = await pool.execute(
      `
      SELECT
        product_id,
        product_name,
        category,
        description,
        quantity,
        weight,
        unit,
        selling_price,
        price,
        gst,
        total
      FROM invoice_items
      WHERE invoice_id = ?
      `,
      [bill.id]
    );

    bill.items = items;
  }

  return bills;
};

const getBillsPaginated = async (userId, page = 1, limit = 10) => {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const requestedPage = Math.max(parseInt(page, 10) || 1, 1);

  const [countRows] = await pool.execute(
    `
    SELECT COUNT(*) AS total
    FROM invoices
    WHERE user_id = ?
    `,
    [userId]
  );

  const totalRecords = Number(countRows[0]?.total) || 0;
  const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / safeLimit);
  const currentPage =
    totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * safeLimit;

  const [bills] = await pool.execute(
    `
    SELECT
      id,
      invoice_number,
      customer_name,
      customer_email,
      customer_gst,
      customer_address,
      subtotal,
      gst_amount,
      grand_total,
      created_at
    FROM invoices
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ${safeLimit} OFFSET ${offset}
    `,
    [userId]
  );

  for (const bill of bills) {
    const [items] = await pool.execute(
      `
      SELECT
        product_id,
        product_name,
        category,
        description,
        quantity,
        weight,
        unit,
        selling_price,
        price,
        gst,
        total
      FROM invoice_items
      WHERE invoice_id = ?
      `,
      [bill.id]
    );

    bill.items = items;
  }

  return {
    invoices: bills,
    currentPage,
    totalPages,
    totalRecords,
  };
};

module.exports = {
  createInvoice,
  createInvoiceItem,
  updateProductStock,
  getInvoiceById,
  getInvoiceItems,
  getAllBills,
  getBillsPaginated,
};
