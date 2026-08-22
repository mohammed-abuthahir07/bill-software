const { pool } = require("../config/database");

// ==============================
// Total Users
// ==============================
const getTotalUsers = async () => {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) AS totalUsers
        FROM users
    `);

    return rows[0];
};

// ==============================
// Total Products
// ==============================
const getTotalProducts = async () => {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) AS totalProducts
        FROM products
    `);

    return rows[0];
};

// ==============================
// Total Invoices
// ==============================
const getTotalInvoices = async () => {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) AS totalInvoices
        FROM invoices
    `);

    return rows[0];
};

// ==============================
// Total Revenue
// ==============================
const getTotalRevenue = async () => {
    const [rows] = await pool.execute(`
        SELECT IFNULL(SUM(grand_total),0) AS totalRevenue
        FROM invoices
    `);

    return rows[0];
};

// ==============================
// Monthly Revenue
// ==============================
const getMonthlyRevenue = async () => {
    const [rows] = await pool.execute(`
        SELECT IFNULL(SUM(grand_total),0) AS monthlyRevenue
        FROM invoices
        WHERE MONTH(created_at)=MONTH(CURDATE())
        AND YEAR(created_at)=YEAR(CURDATE())
    `);

    return rows[0];
};

module.exports = {
    getTotalUsers,
    getTotalProducts,
    getTotalInvoices,
    getTotalRevenue,
    getMonthlyRevenue
};