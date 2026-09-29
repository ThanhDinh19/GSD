const { getPool, sql } = require('../database/connection');

async function getBalanceTypes() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT
      b.id,
      b.balance_type_code AS balanceTypeCode,
      b.balance_type_name AS balanceTypeName,
      b.status_id AS statusId,
      s.status_name AS statusName,
      b.created_at AS createdAt
    FROM balance_types b
    LEFT JOIN master_status s ON b.status_id = s.id
    ORDER BY b.id DESC
  `);

  return result.recordset;
}

async function createBalanceType(payload) {
  const pool = getPool();

  try {
    await pool.request()
      .input('balance_type_code', sql.VarChar, String(payload.balanceTypeCode).trim())
      .input('balance_type_name', sql.NVarChar, String(payload.balanceTypeName).trim())
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        INSERT INTO balance_types (balance_type_code, balance_type_name, status_id)
        VALUES (@balance_type_code, @balance_type_name, @status_id)
      `);
  } catch (err) {
    if (
      err.message.includes('UNIQUE') ||
      err.message.includes('duplicate') ||
      err.number === 2627 ||
      err.number === 2601
    ) {
      const duplicateError = new Error('Mã loại cân bằng đã tồn tại.');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw err;
  }
}

async function updateBalanceType(id, payload) {
  const pool = getPool();

  try {
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('balance_type_code', sql.VarChar, String(payload.balanceTypeCode).trim())
      .input('balance_type_name', sql.NVarChar, String(payload.balanceTypeName).trim())
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        UPDATE balance_types
        SET
          balance_type_code = @balance_type_code,
          balance_type_name = @balance_type_name,
          status_id = @status_id
        WHERE id = @id
      `);

    return result.rowsAffected[0] > 0;
  } catch (err) {
    if (
      err.message.includes('UNIQUE') ||
      err.message.includes('duplicate') ||
      err.number === 2627 ||
      err.number === 2601
    ) {
      const duplicateError = new Error('Mã loại cân bằng đã tồn tại.');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw err;
  }
}

module.exports = {
  getBalanceTypes,
  createBalanceType,
  updateBalanceType,
};
