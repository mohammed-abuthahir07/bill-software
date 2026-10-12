const mysql = require("mysql2/promise");
require("dotenv").config();
const { ensurePackedVariants } = require("../migrations/ensurePackedVariants");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const connectDB = async () => {
    try {
        const connection = await pool.getConnection();

        console.log("✅ MySQL Connected Successfully");

        connection.release();

        await ensurePackedVariants(pool);
        console.log("✅ Product schema is ready");

    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = {
    pool,
    connectDB,
};
