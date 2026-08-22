const { pool } = require("../config/database");

// =====================================
// Total Products
// =====================================
const getTotalProducts = async (userId) => {
  const query = `
    SELECT COUNT(*) AS totalProducts
    FROM products
    WHERE user_id = ?
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0];
};

// =====================================
// Total Stock
// =====================================
const getTotalStock = async (userId) => {
  const query = `
    SELECT IFNULL(SUM(quantity), 0) AS totalStock
    FROM products
    WHERE user_id = ?
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0];
};

// =====================================
// Today's Sales
// =====================================
const getTodaySales = async (userId) => {
  const query = `
    SELECT IFNULL(SUM(grand_total), 0) AS todaySales
    FROM invoices
    WHERE user_id = ?
      AND DATE(created_at) = CURDATE()
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0];
};

// =====================================
// Monthly Sales
// =====================================
const getMonthlySales = async (userId) => {
  const query = `
    SELECT IFNULL(SUM(grand_total), 0) AS monthlySales
    FROM invoices
    WHERE user_id = ?
      AND MONTH(created_at) = MONTH(CURDATE())
      AND YEAR(created_at) = YEAR(CURDATE())
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0];
};

// =====================================
// Yearly Sales
// =====================================
const getYearlySales = async (userId) => {
  const query = `
    SELECT IFNULL(SUM(grand_total), 0) AS yearlySales
    FROM invoices
    WHERE user_id = ?
      AND YEAR(created_at) = YEAR(CURDATE())
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0];
};

// =====================================
// Total Revenue
// =====================================
const getTotalRevenue = async (userId) => {
  const query = `
    SELECT IFNULL(SUM(grand_total), 0) AS totalRevenue
    FROM invoices
    WHERE user_id = ?
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0];
};

// =====================================
// Total Bills
// =====================================
const getTotalBills = async (userId) => {
  const query = `
    SELECT COUNT(*) AS totalBills
    FROM invoices
    WHERE user_id = ?
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0];
};

// =====================================
// Recent Bills
// =====================================
const getRecentBills = async (userId) => {
  const query = `
    SELECT
      id,
      invoice_number,
      customer_name,
      grand_total,
      created_at
    FROM invoices
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows;
};

// =====================================
// Low Stock Products
// =====================================
const getLowStockProducts = async (userId) => {
  const query = `
    SELECT
      id,
      item_name,
      package_weight,
      weight_unit,
      selling_price,
      quantity
    FROM products
    WHERE user_id = ?
      AND quantity <= 10
    ORDER BY quantity ASC
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows;
};

// =====================================
// Best Selling Products
// =====================================
const getBestSellingProducts = async (userId) => {
  const query = `
    SELECT
      product_name,
      SUM(quantity) AS totalSold,
      SUM(total) AS revenue
    FROM invoice_items
    WHERE invoice_id IN (
      SELECT id
      FROM invoices
      WHERE user_id = ?
    )
    GROUP BY product_name
    ORDER BY totalSold DESC
    LIMIT 10
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows;
};

module.exports = {
  getTotalProducts,
  getTotalStock,
  getTodaySales,
  getMonthlySales,
  getYearlySales,
  getTotalRevenue,
  getTotalBills,
  getRecentBills,
  getLowStockProducts,
  getBestSellingProducts,
};