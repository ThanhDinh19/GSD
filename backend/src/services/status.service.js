const { getPool } = require('../database/connection');

async function getStatuses() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT 
      id,
      status_code AS statusCode,
      status_name AS statusName
    FROM master_status
    ORDER BY id
  `);

  return result.recordset;
}

module.exports = {
  getStatuses
};