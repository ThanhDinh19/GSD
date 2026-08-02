const { getPool, sql } = require('../database/connection');

const sampleEmployees = [
  {
    name: 'Nguyễn Văn A',
    email: 'a.nguyen@example.com',
    phone: '0901234567',
    address: '123 Đường Lê Lợi, Quận 1, TP. HCM'
  },
  {
    name: 'Trần Thị B',
    email: 'b.tran@example.com',
    phone: '0912345678',
    address: '456 Đường Nguyễn Huệ, Quận Hải Châu, Đà Nẵng'
  },
  {
    name: 'Phạm Văn C',
    email: 'c.pham@example.com',
    phone: '0923456789',
    address: '789 Đường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội'
  }
];

async function getEmployeesWithSeed() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT name, email, phone, address 
    FROM employees 
    ORDER BY id
  `);

  if (result.recordset.length > 0) {
    return result.recordset;
  }

  await replaceEmployees(sampleEmployees);
  return sampleEmployees;
}

async function replaceEmployees(records) {
  const pool = getPool();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    await new sql.Request(transaction).query('DELETE FROM employees');

    for (const record of records) {
      await new sql.Request(transaction)
        .input('name', sql.NVarChar, record.name !== undefined && record.name !== null ? String(record.name) : null)
        .input('email', sql.NVarChar, record.email !== undefined && record.email !== null ? String(record.email) : null)
        .input('phone', sql.NVarChar, record.phone !== undefined && record.phone !== null ? String(record.phone) : null)
        .input('address', sql.NVarChar, record.address !== undefined && record.address !== null ? String(record.address) : null)
        .query(`
          INSERT INTO employees (name, email, phone, address)
          VALUES (@name, @email, @phone, @address)
        `);
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

module.exports = {
  getEmployeesWithSeed,
  replaceEmployees
};