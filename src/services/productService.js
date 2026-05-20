const { getDb } = require("../db/database");
const { createHttpError } = require("../utils/errors");
const { validateProduct } = require("../utils/validators");
const { enrichProductWithWarranty } = require("../utils/warranty");

function mapProductInput(input) {
  return {
    name: input.name.trim(),
    brand: input.brand.trim(),
    category: input.category.trim(),
    purchaseDate: input.purchaseDate,
    warrantyEndDate: input.warrantyEndDate,
    serialNumber: input.serialNumber ? input.serialNumber.trim() : "",
    notes: input.notes ? input.notes.trim() : ""
  };
}

async function listProducts(userId, filters = {}) {
  const db = getDb();
  const params = [userId];
  const where = ["user_id = ?"];

  if (filters.category) {
    where.push("LOWER(category) = LOWER(?)");
    params.push(filters.category);
  }

  if (filters.search) {
    where.push("(LOWER(name) LIKE LOWER(?) OR LOWER(brand) LIKE LOWER(?) OR LOWER(serial_number) LIKE LOWER(?))");
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  if (filters.expiringSoon === "true") {
    where.push("date(warranty_end_date) BETWEEN date('now') AND date('now', '+30 day')");
  }

  const products = await db.all(
    `SELECT * FROM products WHERE ${where.join(" AND ")} ORDER BY warranty_end_date ASC, created_at DESC`,
    params
  );

  return products.map((product) => enrichProductWithWarranty(product));
}

async function getProduct(userId, productId) {
  const db = getDb();
  const product = await db.get("SELECT * FROM products WHERE id = ? AND user_id = ?", productId, userId);
  if (!product) {
    throw createHttpError(404, "Product not found.");
  }
  return enrichProductWithWarranty(product);
}

async function createProduct(userId, input) {
  const errors = validateProduct(input);
  if (errors.length > 0) {
    throw createHttpError(400, errors.join(" "));
  }

  const product = mapProductInput(input);
  const db = getDb();
  const result = await db.run(
    `INSERT INTO products
      (user_id, name, brand, category, purchase_date, warranty_end_date, serial_number, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    userId,
    product.name,
    product.brand,
    product.category,
    product.purchaseDate,
    product.warrantyEndDate,
    product.serialNumber,
    product.notes
  );

  return getProduct(userId, result.lastID);
}

async function updateProduct(userId, productId, input) {
  await getProduct(userId, productId);

  const errors = validateProduct(input);
  if (errors.length > 0) {
    throw createHttpError(400, errors.join(" "));
  }

  const product = mapProductInput(input);
  const db = getDb();
  await db.run(
    `UPDATE products
     SET name = ?, brand = ?, category = ?, purchase_date = ?, warranty_end_date = ?,
         serial_number = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    product.name,
    product.brand,
    product.category,
    product.purchaseDate,
    product.warrantyEndDate,
    product.serialNumber,
    product.notes,
    productId,
    userId
  );

  return getProduct(userId, productId);
}

async function deleteProduct(userId, productId) {
  await getProduct(userId, productId);
  const db = getDb();
  await db.run("DELETE FROM products WHERE id = ? AND user_id = ?", productId, userId);
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
