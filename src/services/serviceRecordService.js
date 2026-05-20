const { getDb } = require("../db/database");
const { createHttpError } = require("../utils/errors");
const { validateServiceRecord } = require("../utils/validators");

async function ensureProductBelongsToUser(userId, productId) {
  const db = getDb();
  const product = await db.get("SELECT id FROM products WHERE id = ? AND user_id = ?", productId, userId);
  if (!product) {
    throw createHttpError(404, "Product not found for this user.");
  }
}

async function listServiceRecords(userId, productId) {
  const db = getDb();
  const params = [userId];
  let query = `
    SELECT service_records.*, products.name AS product_name
    FROM service_records
    INNER JOIN products ON products.id = service_records.product_id
    WHERE service_records.user_id = ?
  `;

  if (productId) {
    await ensureProductBelongsToUser(userId, productId);
    query += " AND service_records.product_id = ?";
    params.push(productId);
  }

  query += " ORDER BY service_date DESC, created_at DESC";
  return db.all(query, params);
}

async function createServiceRecord(userId, input) {
  const errors = validateServiceRecord(input);
  if (errors.length > 0) {
    throw createHttpError(400, errors.join(" "));
  }

  await ensureProductBelongsToUser(userId, Number(input.productId));

  const db = getDb();
  const result = await db.run(
    `INSERT INTO service_records
      (product_id, user_id, service_date, provider, description, cost)
     VALUES (?, ?, ?, ?, ?, ?)`,
    Number(input.productId),
    userId,
    input.serviceDate,
    input.provider.trim(),
    input.description.trim(),
    Number(input.cost || 0)
  );

  return db.get(
    `SELECT service_records.*, products.name AS product_name
     FROM service_records
     INNER JOIN products ON products.id = service_records.product_id
     WHERE service_records.id = ? AND service_records.user_id = ?`,
    result.lastID,
    userId
  );
}

async function deleteServiceRecord(userId, recordId) {
  const db = getDb();
  const record = await db.get("SELECT id FROM service_records WHERE id = ? AND user_id = ?", recordId, userId);
  if (!record) {
    throw createHttpError(404, "Service record not found.");
  }

  await db.run("DELETE FROM service_records WHERE id = ? AND user_id = ?", recordId, userId);
}

module.exports = {
  listServiceRecords,
  createServiceRecord,
  deleteServiceRecord
};
