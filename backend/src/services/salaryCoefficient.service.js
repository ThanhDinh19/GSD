const { getPool, sql } = require('../database/connection');

async function getSalaryCoefficients() {
  const pool = await getPool();

  const result = await pool.request().query(`
    SELECT 
      sc.id,
      sc.level_id AS levelId,
      sg.level AS level,
      sg.note AS levelNote,
      sc.coefficient,
      sc.status_id AS statusId,
      s.status_name AS statusName,
      sc.created_at AS createdAt,
      sc.updated_at AS updatedAt
    FROM salary_coefficients sc
      LEFT JOIN skill_grade sg ON sc.level_id = sg.id
      LEFT JOIN master_status s ON sc.status_id = s.id
    ORDER BY sg.level ASC, sc.id DESC
  `);

  return result.recordset;
}

async function createSalaryCoefficient(payload) {
  const pool = await getPool();

  try {
    const result = await pool.request()
      .input('level_id', sql.Int, Number(payload.levelId))
      .input('coefficient', sql.Decimal(6, 2), Number(payload.coefficient))
      .input(
        'status_id',
        sql.TinyInt,
        payload.statusId !== undefined ? Number(payload.statusId) : 0
      )
      .query(`
        INSERT INTO salary_coefficients (
          level_id,
          coefficient,
          status_id
        )
        OUTPUT INSERTED.*
        VALUES (
          @level_id,
          @coefficient,
          @status_id
        )
      `);

    return result.recordset[0];
  } catch (err) {
    if (
      err.message.includes('UNIQUE') ||
      err.message.includes('duplicate') ||
      err.number === 2627 ||
      err.number === 2601
    ) {
      const duplicateError = new Error('Dữ liệu đã tồn tại.');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw err;
  }
}

async function updateSalaryCoefficient(id, payload) {
  const pool = await getPool();

  const result = await pool.request()
    .input('id', sql.Int, Number(id))
    .input('level_id', sql.Int, Number(payload.levelId))
    .input('coefficient', sql.Decimal(6, 2), Number(payload.coefficient))
    .input(
      'status_id',
      sql.TinyInt,
      payload.statusId !== undefined ? Number(payload.statusId) : 0
    )
    .query(`
      UPDATE salary_coefficients
      SET 
        level_id = @level_id,
        coefficient = @coefficient,
        status_id = @status_id
      OUTPUT INSERTED.*
      WHERE id = @id  
    `);

  return result.recordset[0] || null;
}

module.exports = {
  getSalaryCoefficients,
  createSalaryCoefficient,
  updateSalaryCoefficient,
};