const { getPool, sql } = require('../database/connection');

async function getCustomers() {
  const pool = getPool();

  const result = await pool.request().query(`
    select 
        c.id,
        c.cus_code as cusCode,
        c.cus_name as cusName,
        ms.id as statusId,
        ms.status_code as statusCode,
        ms.status_name as statusName
    from customer c
    left join master_status ms on c.status_id = ms.id
    order by c.id desc
  `);

  return result.recordset;
}

// async function getCustomerById(id) {
//   const pool = getPool();

//   const result = await pool.request()
//   .input('id', sql.Int, id)
//   .query(`
//     select
//       s.id,
//       s.cluster_name,
//       s.cluster_code,
//       ms.status_name
//     from clusters s
//     left join master_status ms on s.status_id = ms.id  
//     where s.id = @id
//   `);

//   return result.recordset[0];
// }

async function createCustomer(payload) {
  const pool = getPool();

  try {
    await pool.request()
      .input('cus_code', sql.NVarChar, String(payload.cusCode).trim())
      .input('cus_name', sql.NVarChar, String(payload.cusName).trim())
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        INSERT INTO customer (cus_code, cus_name, status_id)
        VALUES (@cus_code, @cus_name, @status_id)
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

async function updateCustomer(id, payload) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('cus_code', sql.NVarChar, String(payload.cusCode).trim())
    .input('cus_name', sql.NVarChar, String(payload.cusName).trim())
    .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
    .query(`
      UPDATE customer
      SET 
        cus_code = @cus_code,
        cus_name = @cus_name,
        status_id = @status_id
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

async function deactivateCustomer(id) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      UPDATE customer
      SET status_id = 1
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}



module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deactivateCustomer
};