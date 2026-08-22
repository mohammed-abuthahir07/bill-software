const { pool } = require("../config/database");

const MONTH_FILTER = `
  MONTH(i.created_at) = ?
  AND YEAR(i.created_at) = ?
`;

const toNumber = (value) => {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

const getMonthlySummary = async (userId, month, year) => {
  const invoiceQuery = `
    SELECT
      IFNULL(SUM(i.grand_total), 0) AS totalRevenue,
      IFNULL(SUM(i.subtotal), 0) AS totalSubtotal,
      IFNULL(SUM(i.gst_amount), 0) AS totalGst,
      COUNT(*) AS totalInvoices,
      IFNULL(AVG(i.grand_total), 0) AS averageInvoiceValue
    FROM invoices i
    WHERE i.user_id = ?
      AND ${MONTH_FILTER}
  `;

  const salesQuery = `
    SELECT IFNULL(SUM(ii.quantity), 0) AS totalSales
    FROM invoice_items ii
    INNER JOIN invoices i ON i.id = ii.invoice_id
    WHERE i.user_id = ?
      AND ${MONTH_FILTER}
  `;

  const bestSellerQuery = `
    SELECT
      ii.product_name AS productName,
      SUM(ii.quantity) AS quantitySold,
      SUM(ii.total) AS revenueGenerated
    FROM invoice_items ii
    INNER JOIN invoices i ON i.id = ii.invoice_id
    WHERE i.user_id = ?
      AND ${MONTH_FILTER}
    GROUP BY ii.product_name
    ORDER BY quantitySold DESC, revenueGenerated DESC
    LIMIT 1
  `;

  const [[invoiceRows], [salesRows], [bestSellerRows]] = await Promise.all([
    pool.execute(invoiceQuery, [userId, month, year]),
    pool.execute(salesQuery, [userId, month, year]),
    pool.execute(bestSellerQuery, [userId, month, year]),
  ]);

  const invoiceStats = invoiceRows[0] || {};
  const salesStats = salesRows[0] || {};
  const bestSeller = bestSellerRows[0] || null;

  return {
    totalRevenue: toNumber(invoiceStats.totalRevenue),
    totalSales: toNumber(salesStats.totalSales),
    totalInvoices: Number(invoiceStats.totalInvoices) || 0,
    averageInvoiceValue: toNumber(invoiceStats.averageInvoiceValue),
    totalGst: toNumber(invoiceStats.totalGst),
    totalSubtotal: toNumber(invoiceStats.totalSubtotal),
    bestSellingProduct: bestSeller
      ? {
          productName: bestSeller.productName,
          quantitySold: toNumber(bestSeller.quantitySold),
          revenueGenerated: toNumber(bestSeller.revenueGenerated),
        }
      : null,
  };
};

const getMonthlyInvoices = async (
  userId,
  month,
  year,
  { search = "", page = 1, limit = 10 } = {}
) => {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (safePage - 1) * safeLimit;
  const searchTerm = String(search || "").trim();
  const searchClause = searchTerm
    ? `AND (i.invoice_number LIKE ? OR i.customer_name LIKE ?)`
    : "";
  const searchParams = searchTerm
    ? [`%${searchTerm}%`, `%${searchTerm}%`]
    : [];

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM invoices i
    WHERE i.user_id = ?
      AND ${MONTH_FILTER}
      ${searchClause}
  `;

  const listQuery = `
    SELECT
      i.id,
      i.invoice_number AS invoiceNumber,
      i.customer_name AS customerName,
      i.created_at AS invoiceDate,
      i.grand_total AS totalAmount,
      COUNT(ii.id) AS itemsCount
    FROM invoices i
    LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE i.user_id = ?
      AND ${MONTH_FILTER}
      ${searchClause}
    GROUP BY
      i.id,
      i.invoice_number,
      i.customer_name,
      i.created_at,
      i.grand_total
    ORDER BY i.created_at DESC
    LIMIT ${safeLimit} OFFSET ${offset}
  `;

  const params = [userId, month, year, ...searchParams];

  const [[countRows], [invoices]] = await Promise.all([
    pool.execute(countQuery, params),
    pool.execute(listQuery, params),
  ]);

  const total = Number(countRows[0]?.total) || 0;

  return {
    invoices: invoices.map((row) => ({
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      customerName: row.customerName,
      invoiceDate: row.invoiceDate,
      itemsCount: Number(row.itemsCount) || 0,
      totalAmount: toNumber(row.totalAmount),
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

const getAllMonthlyInvoices = async (userId, month, year) => {
  const query = `
    SELECT
      i.id,
      i.invoice_number AS invoiceNumber,
      i.customer_name AS customerName,
      i.created_at AS invoiceDate,
      i.grand_total AS totalAmount,
      COUNT(ii.id) AS itemsCount
    FROM invoices i
    LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE i.user_id = ?
      AND ${MONTH_FILTER}
    GROUP BY
      i.id,
      i.invoice_number,
      i.customer_name,
      i.created_at,
      i.grand_total
    ORDER BY i.created_at ASC
  `;

  const [rows] = await pool.execute(query, [userId, month, year]);

  return rows.map((row) => ({
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    customerName: row.customerName,
    invoiceDate: row.invoiceDate,
    itemsCount: Number(row.itemsCount) || 0,
    totalAmount: toNumber(row.totalAmount),
  }));
};

const getMonthlyProducts = async (userId, month, year) => {
  const query = `
    SELECT
      ii.product_name AS productName,
      SUM(ii.quantity) AS quantitySold,
      SUM(ii.total) AS revenueGenerated
    FROM invoice_items ii
    INNER JOIN invoices i ON i.id = ii.invoice_id
    WHERE i.user_id = ?
      AND ${MONTH_FILTER}
    GROUP BY ii.product_name
    ORDER BY quantitySold DESC, revenueGenerated DESC
  `;

  const [rows] = await pool.execute(query, [userId, month, year]);

  return rows.map((row) => ({
    productName: row.productName,
    quantitySold: toNumber(row.quantitySold),
    revenueGenerated: toNumber(row.revenueGenerated),
  }));
};

const getReportUser = async (userId) => {
  const query = `
    SELECT
      u.id,
      u.name,
      u.email,
      p.profile_image AS profileImage,
      p.company_name AS companyName
    FROM users u
    LEFT JOIN user_profiles p ON p.user_id = u.id
    WHERE u.id = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0] || null;
};

module.exports = {
  getMonthlySummary,
  getMonthlyInvoices,
  getAllMonthlyInvoices,
  getMonthlyProducts,
  getReportUser,
};
