const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  multipleStatements: true, // Required to run multiple queries in the .sql file
  waitForConnections: true,
  connectionLimit: 10
});

const connectDB = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      console.log('Connected to Aiven MySQL database successfully!');

      // Automatically run bill.sql on startup
      const sqlFilePath = path.join(__dirname, '../bill.sql');
      if (fs.existsSync(sqlFilePath)) {
        const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
        connection.query(sqlQuery, (sqlErr) => {
          connection.release();
          if (sqlErr) {
            console.error('Error executing SQL file:', sqlErr.message);
            return reject(sqlErr);
          }
          console.log('Database tables imported successfully from SQL file!');
          resolve(pool);
        });
      } else {
        console.log('bill.sql file not found, skipping import.');
        connection.release();
        resolve(pool);
      }
    });
  });
};

module.exports = { connectDB, pool };