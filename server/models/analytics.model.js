const { pool } = require("../config/database");


// ===============================
// Users Registered Per Month
// ===============================
const getUsersAnalytics = async () => {

    const query = `
        SELECT
            DATE_FORMAT(created_at, '%b') AS month,
            COUNT(*) AS users
        FROM users
        GROUP BY DATE_FORMAT(created_at, '%b'),
                 MONTH(created_at)
        ORDER BY MONTH(created_at)
    `;


    const [rows] = await pool.execute(query);

    return rows;

};




// ===============================
// Revenue Per Month
// ===============================
const getRevenueAnalytics = async () => {


    const query = `
        SELECT
            DATE_FORMAT(created_at, '%b') AS month,
            SUM(grand_total) AS revenue
        FROM invoices
        GROUP BY DATE_FORMAT(created_at, '%b'),
                 MONTH(created_at)
        ORDER BY MONTH(created_at)
    `;


    const [rows] = await pool.execute(query);

    return rows;

};




// ===============================
// Invoice Created Per Month
// ===============================
const getInvoiceAnalytics = async () => {


    const query = `
        SELECT
            DATE_FORMAT(created_at, '%b') AS month,
            COUNT(*) AS invoices
        FROM invoices
        GROUP BY DATE_FORMAT(created_at, '%b'),
                 MONTH(created_at)
        ORDER BY MONTH(created_at)
    `;


    const [rows] = await pool.execute(query);

    return rows;

};




// ===============================
// Products Added Per Month
// ===============================
const getProductAnalytics = async () => {


    const query = `
        SELECT
            DATE_FORMAT(created_at, '%b') AS month,
            COUNT(*) AS products
        FROM products
        GROUP BY DATE_FORMAT(created_at, '%b'),
                 MONTH(created_at)
        ORDER BY MONTH(created_at)
    `;


    const [rows] = await pool.execute(query);

    return rows;

};



module.exports = {
    getUsersAnalytics,
    getRevenueAnalytics,
    getInvoiceAnalytics,
    getProductAnalytics
};