const { pool } = require("../config/database");

const createProduct = async (
  userId,
  itemName,
  category,
  sku,
  description,
  gst,
  packageWeight,
  weightUnit,
  sellingPrice,
  quantity
) => {
  const query = `
    INSERT INTO products
    (
      user_id,
      item_name,
      category,
      sku,
      description,
      gst,
      package_weight,
      weight_unit,
      selling_price,
      quantity
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute(query, [
    userId,
    itemName,
    category,
    sku,
    description,
    gst,
    packageWeight,
    weightUnit,
    sellingPrice,
    quantity,
  ]);

  return result;
};

const getProductsByUser = async (userId) => {
  const query = `
    SELECT *
    FROM products
    WHERE user_id = ?
    ORDER BY item_name ASC, package_weight ASC, id DESC
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows;
};

const getProductById = async (productId, userId, connection = pool) => {
  const query = `
    SELECT *
    FROM products
    WHERE id = ?
    AND user_id = ?
    LIMIT 1
  `;

  const [rows] = await connection.execute(query, [productId, userId]);
  return rows[0];
};

const getProductByIdForUpdate = async (productId, userId, connection) => {
  const query = `
    SELECT *
    FROM products
    WHERE id = ?
    AND user_id = ?
    LIMIT 1
    FOR UPDATE
  `;

  const [rows] = await connection.execute(query, [productId, userId]);
  return rows[0];
};

const updateProduct = async (
  productId,
  userId,
  itemName,
  category,
  sku,
  description,
  gst,
  packageWeight,
  weightUnit,
  sellingPrice,
  quantity
) => {
  const query = `
    UPDATE products
    SET
      item_name = ?,
      category = ?,
      sku = ?,
      description = ?,
      gst = ?,
      package_weight = ?,
      weight_unit = ?,
      selling_price = ?,
      quantity = ?
    WHERE id = ?
    AND user_id = ?
  `;

  const [result] = await pool.execute(query, [
    itemName,
    category,
    sku,
    description,
    gst,
    packageWeight,
    weightUnit,
    sellingPrice,
    quantity,
    productId,
    userId,
  ]);

  return result;
};

const deleteProduct = async (productId, userId) => {
  const query = `
    DELETE FROM products
    WHERE id = ?
    AND user_id = ?
  `;

  const [result] = await pool.execute(query, [productId, userId]);
  return result;
};

const getProductByName = async (productName, userId) => {
  const query = `
    SELECT *
    FROM products
    WHERE item_name = ?
    AND user_id = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [productName, userId]);
  return rows[0];
};

module.exports = {
  createProduct,
  getProductsByUser,
  getProductByName,
  getProductById,
  getProductByIdForUpdate,
  updateProduct,
  deleteProduct,
};
