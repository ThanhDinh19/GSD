const { getPool, sql } = require('../database/connection');

async function getClusters() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT 
      c.id,
      c.cluster_code AS clusterCode,
      c.cluster_name AS clusterName,
      c.status_id AS statusId,
      s.status_name AS statusName,
      c.created_at AS createdAt
    FROM clusters c
    LEFT JOIN master_status s ON c.status_id = s.id
    ORDER BY c.id DESC
  `);

  return result.recordset;
}

async function createCluster(payload) {
  const pool = getPool();

  try {
    await pool.request()
      .input('cluster_code', sql.NVarChar, String(payload.clusterCode).trim())
      .input('cluster_name', sql.NVarChar, String(payload.clusterName).trim())
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        INSERT INTO clusters (cluster_code, cluster_name, status_id)
        VALUES (@cluster_code, @cluster_name, @status_id)
      `);
  } catch (err) {
    if (
      err.message.includes('UNIQUE') ||
      err.message.includes('duplicate') ||
      err.number === 2627 ||
      err.number === 2601
    ) {
      const duplicateError = new Error('Mã cụm đã tồn tại.');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw err;
  }
}

async function updateCluster(id, payload) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('cluster_code', sql.NVarChar, String(payload.clusterCode).trim())
    .input('cluster_name', sql.NVarChar, String(payload.clusterName).trim())
    .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
    .query(`
      UPDATE clusters
      SET 
        cluster_code = @cluster_code,
        cluster_name = @cluster_name,
        status_id = @status_id
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

async function deactivateCluster(id) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      UPDATE clusters
      SET status_id = 1
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

module.exports = {
  getClusters,
  createCluster,
  updateCluster,
  deactivateCluster
};