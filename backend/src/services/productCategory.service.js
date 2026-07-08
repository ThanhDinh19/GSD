const { getPool, sql } = require('../database/connection');

async function getProductCategories() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT 
      c.id,
      c.product_code AS productCode,
      c.product_name AS productName,
      c.status_id AS statusId,
      s.status_name AS statusName,
      c.created_at AS createdAt
    FROM product_categories c
    LEFT JOIN master_status s ON c.status_id = s.id
    ORDER BY c.id DESC
  `);

  return result.recordset;
}

async function createProductCate(payload) {
  const pool = getPool();

  try {
    await pool.request()
      .input('product_code', sql.VarChar, String(payload.productCode).trim())
      .input('product_name', sql.NVarChar, String(payload.productName).trim())
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        INSERT INTO product_categories (product_code, product_name, status_id)
        VALUES (@product_code, @product_name, @status_id)
      `);
  } catch (err) {
    if (
      err.message.includes('UNIQUE') ||
      err.message.includes('duplicate') ||
      err.number === 2627 ||
      err.number === 2601
    ) {
      const duplicateError = new Error('Mã đã tồn tại.');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw err;
  }
}

async function updateProductCate(id, payload) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('product_code', sql.NVarChar, String(payload.productCode).trim())
    .input('product_name', sql.NVarChar, String(payload.productName).trim())
    .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
    .query(`
      UPDATE product_categories
      SET 
        product_code = @product_code,
        product_name = @product_name,
        status_id = @status_id
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

async function deactivateProductCate(id) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      UPDATE product_categories
      SET status_id = 1
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

module.exports = {
  getProductCategories,
  createProductCate,
  updateProductCate,
  deactivateProductCate
};