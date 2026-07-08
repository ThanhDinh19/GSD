const sql = require('mssql');
const { getPool } = require('../database/connection');

const buildTree = (rows) => {
  const map = new Map();
  const roots = [];

  rows.forEach((row) => {
    map.set(row.department_id, {
      ...row,
      children: [],
    });
  });

  rows.forEach((row) => {
    const node = map.get(row.department_id);

    if (row.parent_department_id && map.has(row.parent_department_id)) {
      map.get(row.parent_department_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

// tạo mã loại phòng ban 
const generateNextDepartmentTypeId = async (pool) => {
  const result = await pool.request().query(`
    SELECT ISNULL(MAX(CAST(SUBSTRING(department_type_id, 3, 10) AS INT)), 0) + 1 AS next_no
    FROM department_types
    WHERE department_type_id LIKE 'DT%'
      AND ISNUMERIC(SUBSTRING(department_type_id, 3, 10)) = 1
  `);

  const nextNo = result.recordset[0].next_no;
  return `DT${String(nextNo).padStart(4, '0')}`;
};
// tạo mã phòng ban
const generateNextDepartmentId = async (pool) => {
  const result = await pool.request().query(`
    SELECT ISNULL(MAX(CAST(SUBSTRING(department_id, 2, 10) AS INT)), 0) + 1 AS next_no
    FROM departments
    WHERE department_id LIKE 'D%'
      AND ISNUMERIC(SUBSTRING(department_id, 2, 10)) = 1
  `);

  const nextNo = result.recordset[0].next_no;
  return `D${String(nextNo).padStart(4, '0')}`;
};
// lấy loại phòng ban
const getDepartmentTypes = async () => {
  const pool = await getPool();

  const result = await pool.request().query(`
    SELECT
      department_type_id,
      department_type_name,
      sort_order,
      status,
      created_at,
      updated_at
    FROM department_types
    ORDER BY sort_order ASC
  `);

  return result.recordset;
};
// tạo loại phòng ban
const createDepartmentType = async (payload) => {
  const pool = await getPool();

  const departmentTypeId = await generateNextDepartmentTypeId(pool);

  const result = await pool.request()
    .input('department_type_id', sql.VarChar(16), departmentTypeId)
    .input('department_type_name', sql.NVarChar(255), payload.department_type_name)
    .input('sort_order', sql.Int, payload.sort_order)
    .input('status', sql.Int, payload.status ?? 1)
    .query(`
      INSERT INTO department_types (
        department_type_id,
        department_type_name,
        sort_order,
        status
      )
      OUTPUT INSERTED.*
      VALUES (
        @department_type_id,
        @department_type_name,
        @sort_order,
        @status
      )
    `);

  return result.recordset[0];
};
// cập nhật loại phòng ban
const updateDepartmentType = async (id, payload) => {
  const pool = await getPool();

  const result = await pool.request()
    .input('department_type_id', sql.VarChar(16), id)
    .input('department_type_name', sql.NVarChar(255), payload.department_type_name)
    .input('sort_order', sql.Int, payload.sort_order)
    .input('status', sql.Int, payload.status ?? 1)
    .query(`
      UPDATE department_types
      SET
        department_type_name = @department_type_name,
        sort_order = @sort_order,
        status = @status,
        updated_at = SYSDATETIME()
      OUTPUT INSERTED.*
      WHERE department_type_id = @department_type_id
    `);

  return result.recordset[0];
};

// lấy sơ đồ tổ chức dùng hàm buildTree để trả về dạng json (cây)
const getDepartmentTree = async (includeInactive = false) => {
  const pool = await getPool();

  const result = await pool.request()
    .input('includeInactive', sql.Bit, includeInactive ? 1 : 0)
    .query(`
      SELECT
        d.department_id,
        d.department_name,
        d.manager_employee_id,
        e.name AS manager_name,
        d.parent_department_id,
        d.department_type_id,
        dt.department_type_name,
        dt.sort_order AS department_type_sort_order,
        d.status,
        d.dissolved_at,
        d.created_at,
        d.updated_at
      FROM departments d
      LEFT JOIN department_types dt
        ON dt.department_type_id = d.department_type_id
      LEFT JOIN employees e
        ON e.employee_id = d.manager_employee_id
      WHERE (@includeInactive = 1 OR d.status = 1)
      ORDER BY
        ISNULL(dt.sort_order, 9999),
        d.department_name
    `);

  return buildTree(result.recordset);
};

const getDepartmentById = async (id) => {
  const pool = await getPool();

  const result = await pool.request()
    .input('department_id', sql.VarChar(16), id)
    .query(`
      SELECT
        d.department_id,
        d.department_name,
        d.manager_employee_id,
        e.name AS manager_name,
        d.parent_department_id,
        parent.department_name AS parent_department_name,
        d.department_type_id,
        dt.department_type_name,
        d.status,
        d.dissolved_at,
        d.created_at,
        d.updated_at
      FROM departments d
      LEFT JOIN employees e
        ON e.employee_id = d.manager_employee_id
      LEFT JOIN departments parent
        ON parent.department_id = d.parent_department_id
      LEFT JOIN department_types dt
        ON dt.department_type_id = d.department_type_id
      WHERE d.department_id = @department_id
    `);

  return result.recordset[0] || null;
};

const createDepartment = async (payload) => {
  const pool = await getPool();

  const departmentId = await generateNextDepartmentId(pool);

  const result = await pool.request()
    .input('department_id', sql.VarChar(16), departmentId)
    .input('department_name', sql.NVarChar(255), payload.department_name)
    .input('manager_employee_id', sql.VarChar(16), payload.manager_employee_id || null)
    .input('parent_department_id', sql.VarChar(16), payload.parent_department_id || null)
    .input('department_type_id', sql.VarChar(16), payload.department_type_id)
    .input('status', sql.Int, payload.status ?? 1)
    .query(`
      INSERT INTO departments (
        department_id,
        department_name,
        manager_employee_id,
        parent_department_id,
        department_type_id,
        status,
        dissolved_at
      )
      OUTPUT INSERTED.*
      VALUES (
        @department_id,
        @department_name,
        @manager_employee_id,
        @parent_department_id,
        @department_type_id,
        @status,
        CASE WHEN @status = 0 THEN SYSDATETIME() ELSE NULL END
      )
    `);

  return result.recordset[0];
};

const updateDepartment = async (id, payload) => {
  const pool = await getPool();

  const result = await pool.request()
    .input('department_id', sql.VarChar(16), id)
    .input('department_name', sql.NVarChar(255), payload.department_name)
    .input('manager_employee_id', sql.VarChar(16), payload.manager_employee_id || null)
    .input('parent_department_id', sql.VarChar(16), payload.parent_department_id || null)
    .input('department_type_id', sql.VarChar(16), payload.department_type_id)
    .input('status', sql.Int, payload.status ?? 1)
    .query(`
      UPDATE departments
      SET
        department_name = @department_name,
        manager_employee_id = @manager_employee_id,
        parent_department_id = @parent_department_id,
        department_type_id = @department_type_id,
        status = @status,
        dissolved_at = CASE
          WHEN @status = 0 AND dissolved_at IS NULL THEN SYSDATETIME()
          WHEN @status = 1 THEN NULL
          ELSE dissolved_at
        END,
        updated_at = SYSDATETIME()
      OUTPUT INSERTED.*
      WHERE department_id = @department_id
    `);

  return result.recordset[0];
};

const dissolveDepartment = async (id) => {
  const pool = await getPool();

  const result = await pool.request()
    .input('department_id', sql.VarChar(16), id)
    .query(`
      UPDATE departments
      SET
        status = 0,
        dissolved_at = ISNULL(dissolved_at, SYSDATETIME()),
        updated_at = SYSDATETIME()
      OUTPUT INSERTED.*
      WHERE department_id = @department_id
    `);

  return result.recordset[0];
};

const getEmployees = async () => {
  const pool = await getPool();

  const result = await pool.request().query(`
    SELECT
      id,
      employee_id,
      name,
      email,
      phone
    FROM employees
    WHERE employee_id IS NOT NULL
    ORDER BY name
  `);

  return result.recordset;
};

// lấy loại phòng ban test
const getDepartmentTypes_test = async () => {
  const pool = await getPool();

  const result = await pool.request().query(`
   select 
    d.id,
    d.department_type_code as departmentTypeCode,
    d.department_type_name as departmentTypeName,
    d.status_id as statusId,
    s.status_name as statusName,
    d.created_at as createdAt
   from department_types_test d
   left join master_status s on d.status_id = s.id
   order by d.id desc
  `);

  return result.recordset;
};

const createDepartmentType_test = async (payload) => {
  const pool = await getPool();

  try {
    await pool.request()
      .input('department_type_code', sql.VarChar, String(payload.departmentTypeCode))
      .input('department_type_name', sql.NVarChar, String(payload.departmentTypeName))
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        INSERT INTO department_types_test (department_type_code, department_type_name, status_id)
        VALUES (@department_type_code, @department_type_name, @status_id)
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
};


async function updateDepartmentType_test(id, payload) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('department_type_code', sql.VarChar, String(payload.departmentTypeCode).trim())
    .input('department_type_name', sql.NVarChar, String(payload.departmentTypeName).trim())
    .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
    .query(`
      UPDATE department_types_test
      SET 
        department_type_code = @department_type_code,
        department_type_name = @department_type_name,
        status_id = @status_id
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

module.exports = {
  getDepartmentTypes,
  createDepartmentType,
  updateDepartmentType,
  getDepartmentTree,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  dissolveDepartment,
  getEmployees,
  getDepartmentTypes_test,
  createDepartmentType_test,
  updateDepartmentType_test,
};