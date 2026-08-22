const columnExists = async (pool, table, column) => {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS cnt
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [table, column]
  );

  return Number(rows[0].cnt) > 0;
};

const indexExists = async (pool, table, indexName) => {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS cnt
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
    `,
    [table, indexName]
  );

  return Number(rows[0].cnt) > 0;
};

const addColumnIfMissing = async (pool, table, column, definition) => {
  if (await columnExists(pool, table, column)) return;
  await pool.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  console.log(`Added ${table}.${column}`);
};

const dropIndexIfExists = async (pool, table, indexName) => {
  if (!(await indexExists(pool, table, indexName))) return;

  if (
    !(await indexExists(pool, table, "user_id")) &&
    !(await indexExists(pool, table, "products_user_id"))
  ) {
    await pool.execute("ALTER TABLE products ADD KEY products_user_id (user_id)");
    console.log("Added products_user_id index");
  }

  await pool.execute(`ALTER TABLE ${table} DROP INDEX ${indexName}`);
  console.log(`Dropped ${table}.${indexName}`);
};

const ensurePackedVariants = async (pool) => {
  await addColumnIfMissing(
    pool,
    "products",
    "package_weight",
    "DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER gst"
  );

  await addColumnIfMissing(
    pool,
    "products",
    "weight_unit",
    "VARCHAR(20) NOT NULL DEFAULT 'g' AFTER package_weight"
  );

  const [unitColumn] = await pool.execute(
    `
      SELECT DATA_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'products'
        AND COLUMN_NAME = 'weight_unit'
      LIMIT 1
    `
  );

  if (unitColumn[0] && String(unitColumn[0].DATA_TYPE).toLowerCase() === "enum") {
    await pool.execute(
      "ALTER TABLE products MODIFY COLUMN weight_unit VARCHAR(20) NOT NULL DEFAULT 'g'"
    );
    console.log("Updated products.weight_unit to VARCHAR(20)");
  }

  await addColumnIfMissing(
    pool,
    "products",
    "selling_price",
    "DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER weight_unit"
  );

  await dropIndexIfExists(pool, "products", "unique_product_per_user");
  await dropIndexIfExists(pool, "products", "unique_variant_per_user");
};

module.exports = {
  ensurePackedVariants,
};
