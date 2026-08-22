require("dotenv").config();

const { pool } = require("../config/database");
const { ensurePackedVariants } = require("./ensurePackedVariants");

const run = async () => {
  try {
    await ensurePackedVariants(pool);
    console.log("Packed variant migration complete.");
  } catch (error) {
    console.error("Packed variant migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
