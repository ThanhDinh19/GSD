const sql = require('mssql');
const { getPool } = require('../database/connection');

const buildTree = (rows) => {
    const map = new Map();
    const roots = [];

    rows.forEach((row) => {
        map.set(row.department_code, {
            ...row,
            children: [],
        });
    });

    rows.forEach((row) => {
        const node = map.get(row.department_code);

        if (row.parent_department_code && map.has(row.parent_department_code)) {
            map.get(row.parent_department_code).children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
};


// tạo mã phòng ban
const generateNextDepartmentCode = async (pool) => {
    const result = await pool.request().query(`
    SELECT ISNULL(MAX(CAST(SUBSTRING(department_code, 2, 10) AS INT)), 0) + 1 AS next_no
    FROM departments_test
    WHERE department_code LIKE 'D%'
      AND ISNUMERIC(SUBSTRING(department_code, 2, 10)) = 1
  `);

    const nextNo = result.recordset[0].next_no;
    return `D${String(nextNo).padStart(4, '0')}`;
};


// lấy loại phòng ban
const getDepartmentTypes = async () => {
    const pool = await getPool();

    const result = await pool.request().query(`
    SELECT
      d.department_type_code,
      d.department_type_name,
      d.status_id,
      s.status_name,
      d.created_at,
      d.updated_at
    FROM department_types_test d
    LEFT JOIN master_status s on d.status_id = s.id
  `);

    return result.recordset;
};



const getDepartmentTree = async (includeInactive = false) => {
    const pool = await getPool();

    const result = await pool.request()
        .input('includeInactive', sql.Bit, includeInactive ? 1 : 0)
        .query(`
      SELECT
        d.department_code,
        d.department_name,
        d.manager_employee_id,
        e.name AS manager_name,
        d.parent_department_code,
         parent.department_name AS parent_department_name,
        d.department_type_code,
        dt.department_type_name,
        dt.sort_order AS department_type_sort_order,
        d.status_id,
        d.dissolved_at,
        d.created_at,
        d.updated_at
      FROM departments_test d
      LEFT JOIN departments_test parent
        ON parent.department_code = d.parent_department_code
      LEFT JOIN department_types_test dt
        ON dt.department_type_code = d.department_type_code
      LEFT JOIN employees e
        ON e.employee_id = d.manager_employee_id
      WHERE (@includeInactive = 1 OR d.status_id = 0)
      ORDER BY
        ISNULL(dt.sort_order, 9999),
        d.department_name
    `);

    return buildTree(result.recordset);
};

const getDepartmentById = async (code) => {
    const pool = await getPool();

    const result = await pool.request()
        .input('department_code', sql.VarChar(16), code)
        .query(`
     SELECT
        d.department_code,
        d.department_name,
        d.manager_employee_id,
        e.name AS manager_name,
        d.parent_department_code,
        parent.department_name AS parent_department_name,
        d.department_type_code,
        dt.department_type_name,
        d.status_id,
        d.dissolved_at,
        d.created_at,
        d.updated_at
    FROM departments_test d
        LEFT JOIN employees e
            ON e.employee_id = d.manager_employee_id
        LEFT JOIN departments_test parent
            ON parent.department_code = d.parent_department_code
        LEFT JOIN department_types_test dt
            ON dt.department_type_code = d.department_type_code
    WHERE d.department_code = @department_code
    `);

    return result.recordset[0] || null;
};

const createDepartment = async (payload) => {
    const pool = await getPool();

    const departmentCode = await generateNextDepartmentCode(pool);

    const result = await pool.request()
        .input('department_code', sql.VarChar(16), departmentCode)
        .input('department_name', sql.NVarChar(255), payload.department_name)
        .input('manager_employee_id', sql.VarChar(16), payload.manager_employee_id || null)
        .input('parent_department_code', sql.VarChar(16), payload.parent_department_code || null)
        .input('department_type_code', sql.VarChar(16), payload.department_type_code)
        .input('status_id', sql.TinyInt, payload.status_id ?? 0)
        .query(`
      INSERT INTO departments_test (
        department_code,
        department_name,
        manager_employee_id,
        parent_department_code,
        department_type_code,
        status_id,
        dissolved_at
      )
      OUTPUT INSERTED.*
      VALUES (
        @department_code,
        @department_name,
        @manager_employee_id,
        @parent_department_code,
        @department_type_code,
        @status_id,
        CASE WHEN @status_id = 1 THEN SYSDATETIME() ELSE NULL END
      )
    `);

    return result.recordset[0];
};

const updateDepartment = async (code, payload) => {
    const pool = await getPool();


    const result = await pool.request()
        .input('department_code', sql.VarChar(16), code)
        .input('department_name', sql.NVarChar(255), payload.department_name)
        .input('manager_employee_id', sql.VarChar(16), payload.manager_employee_id || null)
        .input('parent_department_code', sql.VarChar(16), payload.parent_department_code || null)
        .input('department_type_code', sql.VarChar(16), payload.department_type_code)
        .input('status_id', sql.TinyInt, payload.status_id ?? 0)
        .query(`
      UPDATE departments_test
      SET
        department_name = @department_name,
        manager_employee_id = @manager_employee_id,
        parent_department_code = @parent_department_code,
        department_type_code = @department_type_code,
        status_id = @status_id,
        dissolved_at = CASE
          WHEN @status_id = 1 AND dissolved_at IS NULL THEN SYSDATETIME()
          WHEN @status_id = 0 THEN NULL
          ELSE dissolved_at
        END,
        updated_at = SYSDATETIME()
      OUTPUT INSERTED.*
      WHERE department_code = @department_code
    `);

    return result.recordset[0];
};

const dissolveDepartment = async (code) => {
    const pool = await getPool();

    const result = await pool.request()
        .input('department_code', sql.VarChar(16), code)
        .query(`
      UPDATE departments_test
      SET
        status_id = 1,
        dissolved_at = ISNULL(dissolved_at, SYSDATETIME()),
        updated_at = SYSDATETIME()
      OUTPUT INSERTED.*
      WHERE department_code = @department_code
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