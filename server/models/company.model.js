const { pool } = require("../config/database");

// =========================================
// Get All Companies (Users)
// =========================================
// const getAllCompanies = async () => {
//     const [rows] = await pool.execute(`
//         SELECT
//             u.id,
//             u.name,
//             u.email,
//             u.created_at,

//             COUNT(i.id) AS totalInvoices,

//             IFNULL(SUM(i.grand_total), 0) AS totalRevenue

//         FROM users u

//         LEFT JOIN invoices i
//             ON u.id = i.user_id

//         GROUP BY
//             u.id,
//             u.name,
//             u.email,
//             u.created_at

//         ORDER BY u.created_at DESC
//     `);

//     return rows;
// };
const getAllCompanies = async () => {

    const [rows] = await pool.execute(`
        SELECT

            u.id,
            u.name,
            u.email,
            u.created_at,

            (
                SELECT COUNT(*)
                FROM products p
                WHERE p.user_id = u.id
            ) AS totalProducts,

            (
                SELECT COUNT(*)
                FROM invoices i
                WHERE i.user_id = u.id
            ) AS totalInvoices,

            (
                SELECT IFNULL(SUM(i.grand_total), 0)
                FROM invoices i
                WHERE i.user_id = u.id
                  AND MONTH(i.created_at) = MONTH(CURDATE())
                  AND YEAR(i.created_at) = YEAR(CURDATE())
            ) AS monthlyRevenue,

            (
                SELECT IFNULL(SUM(i.grand_total), 0)
                FROM invoices i
                WHERE i.user_id = u.id
                  AND YEAR(i.created_at) = YEAR(CURDATE())
            ) AS yearlyRevenue,

            (
                SELECT IFNULL(SUM(i.grand_total), 0)
                FROM invoices i
                WHERE i.user_id = u.id
            ) AS totalRevenue

        FROM users u

        ORDER BY u.created_at DESC
    `);

    return rows;
};

// =========================================
// Get Company By ID
// =========================================
const getCompanyById = async (id) => {
    const [rows] = await pool.execute(
        `
        SELECT
            u.id,
            u.name,
            u.email,
            u.created_at,

            COUNT(i.id) AS totalInvoices,

            IFNULL(SUM(i.grand_total), 0) AS totalRevenue

        FROM users u

        LEFT JOIN invoices i
            ON u.id = i.user_id

        WHERE u.id = ?

        GROUP BY
            u.id,
            u.name,
            u.email,
            u.created_at
        `,
        [id]
    );

    return rows[0];
};
const getCompanyProducts = async (userId) => {
    const [rows] = await pool.execute(
        `
        SELECT COUNT(*) AS totalProducts
        FROM products
        WHERE user_id = ?
        `,
        [userId]
    );

    return rows[0];
};
const getCompanyMonthlyRevenue = async (userId) => {
    const [rows] = await pool.execute(
        `
        SELECT
        IFNULL(SUM(grand_total),0) AS monthlyRevenue
        FROM invoices
        WHERE user_id = ?
        AND MONTH(created_at)=MONTH(CURDATE())
        AND YEAR(created_at)=YEAR(CURDATE())
        `,
        [userId]
    );

    return rows[0];
};
const getRecentInvoices = async (userId) => {
    const [rows] = await pool.execute(
        `
        SELECT
            invoice_number,
            customer_name,
            grand_total,
            created_at
        FROM invoices
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
        `,
        [userId]
    );

    return rows;
};
module.exports = {
    getAllCompanies,
    getCompanyById,
    getCompanyProducts,
    getCompanyMonthlyRevenue,
    getRecentInvoices
};