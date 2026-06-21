const { getPool, sql } = require('../database/connection');

async function getSources() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT
      s.id,
      s.source_code AS sourceCode,
      s.source_name AS sourceName,
      s.note,
      s.status_id AS statusId,
      ms.status_name AS statusName,
      s.created_at AS createdAt
    FROM sources s
    LEFT JOIN master_status ms ON s.status_id = ms.id
    ORDER BY s.id DESC
  `);

  return result.recordset;
}

async function createSource(payload) {
  const pool = getPool();

  try {
    await pool.request()
      .input('source_code', sql.NVarChar, String(payload.sourceCode).trim())
      .input('source_name', sql.NVarChar, payload.sourceName ? String(payload.sourceName).trim() : null)
      .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        INSERT INTO sources (
          source_code,
          source_name,
          note,
          status_id
        )
        VALUES (
          @source_code,
          @source_name,
          @note,
          @status_id
        )
      `);
  } catch (err) {
    if (
      err.message.includes('UNIQUE') ||
      err.message.includes('duplicate') ||
      err.number === 2627 ||
      err.number === 2601
    ) {
      const duplicateError = new Error('Mã source đã tồn tại.');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw err;
  }
}

async function updateSource(id, payload) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('source_code', sql.NVarChar, String(payload.sourceCode).trim())
    .input('source_name', sql.NVarChar, payload.sourceName ? String(payload.sourceName).trim() : null)
    .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
    .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
    .query(`
      UPDATE sources
      SET
        source_code = @source_code,
        source_name = @source_name,
        note = @note,
        status_id = @status_id
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

async function deactivateSource(id) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      UPDATE sources
      SET status_id = 1
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

module.exports = {
  getSources,
  createSource,
  updateSource,
  deactivateSource
};