const { getPool, sql } = require('../database/connection');

async function getSkillGrades() {
    const pool = getPool();

    const result = await pool.request().query(`
    SELECT 
      sg.id,
      sg.level,
      sg.note,
      sg.status_id,
      s.status_name,
      sg.created_at
    FROM skill_grade sg
    LEFT JOIN master_status s ON sg.status_id = s.id
    ORDER BY sg.id DESC
  `);

    return result.recordset;
}


async function createSkillGrade(payload) {
    const pool = getPool();

    try {
        await pool.request()
            .input('level', sql.Int, String(payload.level).trim())
            .input('note', sql.NVarChar, String(payload.note).trim())
            .input('status_id', sql.TinyInt, payload.status_id !== undefined ? Number(payload.status_id) : 0)
            .query(`
        INSERT INTO skill_grade (level, note, status_id)
        VALUES (@level, @note, @status_id)
      `);
    } catch (err) {
        const duplicateError = new Error('Mã đã tồn tại.');
        duplicateError.statusCode = 400;
        throw duplicateError;
        throw err;
    }
}


async function updateSkillGrade(id, payload) {
    const pool = getPool();

    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('level', sql.Int, String(payload.level).trim())
        .input('note', sql.NVarChar, String(payload.note).trim())
        .input('status_id', sql.TinyInt, payload.status_id !== undefined ? Number(payload.status_id) : 0)
        .query(`
      UPDATE skill_grade
      SET 
        level = @level,
        note = @note,
        status_id = @status_id
      WHERE id = @id
    `);

    return result.rowsAffected[0] > 0;
}

module.exports = {
    getSkillGrades,
    createSkillGrade,
    updateSkillGrade,
}