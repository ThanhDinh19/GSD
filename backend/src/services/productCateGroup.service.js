const { getPool, sql } = require('../database/connection');

async function getProductCateGroups() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT 
      c.id,
      c.category_group_code AS cateGroupCode,
      c.category_group_name AS cateGroupName,
      c.status_id AS statusId,
      s.status_name AS statusName,
      c.created_at AS createdAt
    FROM product_category_groups c
    LEFT JOIN master_status s ON c.status_id = s.id
    ORDER BY c.id DESC
  `);

  return result.recordset;
}

async function createProductCateGroup(payload) {
  const pool = getPool();

  try {
    await pool.request()
      .input('category_group_code', sql.VarChar, String(payload.cateGroupCode).trim())
      .input('category_group_name', sql.NVarChar, String(payload.cateGroupName).trim())
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        INSERT INTO product_category_groups (category_group_code, category_group_name, status_id)
        VALUES (@category_group_code, @category_group_name, @status_id)
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

async function updateProductCateGroup(id, payload) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('category_group_code', sql.VarChar, String(payload.cateGroupCode).trim())
    .input('category_group_name', sql.NVarChar, String(payload.cateGroupName).trim())
    .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
    .query(`
      UPDATE product_category_groups
      SET 
        category_group_code = @category_group_code,
        category_group_name = @category_group_name,
        status_id = @status_id
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

async function deactivateProductCateGroup(id) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id) 
    .query(`
      UPDATE product_category_groups
      SET status_id = 1
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

module.exports = {
  getProductCateGroups,
  createProductCateGroup,
  updateProductCateGroup,
  deactivateProductCateGroup
};