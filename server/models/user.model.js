const { pool } = require("../config/database");

// ===============================
// Create User
// ===============================
const createUser = async (name, email, password) => {
  const query = `
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `;

  const [result] = await pool.execute(query, [
    name,
    email,
    password,
  ]);

  return result;
};

// ===============================
// Find User By Email
// ===============================
const findUserByEmail = async (email) => {
  const query = `
    SELECT *
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [email]);

  return rows[0];
};

// ===============================
// Find User By ID
// ===============================
const findUserById = async (id) => {
  const query = `
    SELECT id, name, email, created_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [id]);

  return rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};