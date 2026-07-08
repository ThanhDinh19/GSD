const { getPool, sql } = require('../database/connection');

async function getWorks() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT 
      k.id,
      k.work_code AS workCode,
      k.work_name AS workName,
      k.status_id AS statusId,
      s.status_name AS statusName,
      k.created_at AS createdAt
    FROM works k
    LEFT JOIN master_status s ON k.status_id = s.id
    ORDER BY k.id DESC
  `);

  return result.recordset;
}


async function createWork(payload) {
  const pool = getPool();

  try {
    await pool.request()
      .input('work_code', sql.NVarChar, String(payload.workCode).trim())
      .input('work_name', sql.NVarChar, String(payload.workName).trim())
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        INSERT INTO works (work_code, work_name, status_id)
        VALUES (@work_code, @work_name, @status_id)
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



async function updateWork(id, payload) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('work_code', sql.VarChar, String(payload.workCode).trim())
    .input('work_name', sql.NVarChar, String(payload.workName).trim())
    .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
    .query(`
      UPDATE works
      SET 
        work_code = @work_code,
        work_name = @work_name,
        status_id = @status_id
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

module.exports = {
    getWorks,
    createWork,
    updateWork,
}