const bcrypt = require("bcrypt");
const { pool } = require("../config/database");

const seedAdmin = async () => {
  try {
    const email = "admin@gmail.com";
    const password = "admin123";

    // Check if admin already exists
    const [existing] = await pool.execute(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      console.log("⚠️ Admin already exists.");
      process.exit();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin
    await pool.execute(
      `
      INSERT INTO admins (email, password)
      VALUES (?, ?)
      `,
      [email, hashedPassword]
    );

    console.log("✅ Admin created successfully!");
    console.log("--------------------------------");
    console.log("Email    : admin@gmail.com");
    console.log("Password : admin123");
    console.log("--------------------------------");

    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();