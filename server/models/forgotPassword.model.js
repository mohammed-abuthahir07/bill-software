const { pool } = require("../config/database");

// =====================================
// Find User By Email
// =====================================
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

// =====================================
// Save Password Reset OTP
// =====================================
const savePasswordResetOTP = async (userId, email, otp, expiresAt) => {
  const query = `
    INSERT INTO password_reset_otp
    (
      user_id,
      email,
      otp,
      expires_at
    )
    VALUES (?, ?, ?, ?)
  `;

  await pool.execute(query, [
    userId,
    email,
    otp,
    expiresAt
  ]);
};

// =====================================
// Verify Password Reset OTP
// =====================================
const verifyPasswordResetOTP = async (userId, otp) => {
  const query = `
    SELECT *
    FROM password_reset_otp
    WHERE user_id = ?
      AND otp = ?
      AND expires_at > NOW()
    ORDER BY id DESC
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [userId, otp]);

  return rows[0];
};

// =====================================
// Update User Password
// =====================================
const updateUserPassword = async (userId, hashedPassword) => {
  const query = `
    UPDATE users
    SET password = ?
    WHERE id = ?
  `;

  await pool.execute(query, [hashedPassword, userId]);
};

// =====================================
// Delete Used OTP
// =====================================
const deletePasswordResetOTP = async (userId) => {
  const query = `
    DELETE FROM password_reset_otp
    WHERE user_id = ?
  `;

  await pool.execute(query, [userId]);
};

module.exports = {
  findUserByEmail,
  savePasswordResetOTP,
  verifyPasswordResetOTP,
  updateUserPassword,
  deletePasswordResetOTP,
};