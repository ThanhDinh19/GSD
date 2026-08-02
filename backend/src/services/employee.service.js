const {
    getPool,
    sql,
} = require('../database/connection');

const {
    createHttpError,
} = require('../utils/httpError');

const {
    requiredString,
    optionalString,
} = require('../utils/validation');

function normalizeEmployee(payload) {
    return {
        employeeCode: requiredString(
            payload.employeeCode ??
            payload.employee_code,
            'Mã nhân viên',
            32
        ),

        fullName: requiredString(
            payload.fullName ??
            payload.full_name,
            'Tên nhân viên',
            200
        ),

        preferredName: optionalString(
            payload.preferredName ??
            payload.preferred_name,
            100
        ),

        departmentCode: optionalString(
            payload.departmentCode ??
            payload.department_code,
            32
        ),

        positionCode: optionalString(
            payload.positionCode ??
            payload.position_code,
            50
        ),

        jobTitle: optionalString(
            payload.jobTitle ??
            payload.job_title,
            150
        ),

        managerEmployeeId:
            payload.managerEmployeeId ??
            payload.manager_employee_id ??
            null,

        workEmail: optionalString(
            payload.workEmail ??
            payload.work_email,
            255
        ),

        phoneNumber: optionalString(
            payload.phoneNumber ??
            payload.phone_number,
            30
        ),

        employmentTypeCode:
            optionalString(
                payload.employmentTypeCode ??
                payload.employment_type_code,
                30
            ),

        hireDate:
            payload.hireDate ??
            payload.hire_date ??
            null,

        terminationDate:
            payload.terminationDate ??
            payload.termination_date ??
            null,

        statusId: Number(
            payload.statusId ??
            payload.status_id ??
            0
        ),
    };
}

async function ensureEmployeeCodeUnique(
    pool,
    employeeCode,
    exceptId = null
) {
    const request = pool
        .request()
        .input(
            'employee_code',
            sql.VarChar(32),
            employeeCode
        );

    let query = `
        SELECT TOP 1 id
        FROM hr.employees
        WHERE employee_code =
              @employee_code
    `;

    if (exceptId) {
        request.input(
            'except_id',
            sql.BigInt,
            exceptId
        );

        query += `
            AND id <> @except_id
        `;
    }

    const result = await request.query(query);

    if (result.recordset.length > 0) {
        throw createHttpError(
            400,
            `Mã nhân viên "${employeeCode}" đã tồn tại.`,
            'EMPLOYEE_CODE_EXISTS'
        );
    }
}
async function getEmployees(filters = {}) {
    const pool = await getPool();

    const keyword = String(
        filters.search ??
        filters.keyword ??
        ''
    ).trim();

    const departmentCode = String(
        filters.departmentCode ??
        filters.department_code ??
        ''
    )
        .trim()
        .toUpperCase();

    const statusId =
        filters.statusId === undefined ||
        filters.statusId === null ||
        filters.statusId === ''
            ? null
            : Number(filters.statusId);

    if (
        statusId !== null &&
        ![0, 1].includes(statusId)
    ) {
        throw createHttpError(
            400,
            'Trạng thái nhân viên không hợp lệ.',
            'INVALID_EMPLOYEE_STATUS'
        );
    }

    const result = await pool
        .request()
        .input(
            'keyword',
            sql.NVarChar(200),
            keyword || null
        )
        .input(
            'status_id',
            sql.TinyInt,
            statusId
        )
        .input(
            'department_code',
            sql.VarChar(32),
            departmentCode || null
        )
        .query(`
            SELECT
                e.id AS [id],
                e.employee_code
                    AS [employeeCode],
                e.full_name
                    AS [fullName],
                e.preferred_name
                    AS [preferredName],

                e.department_code
                    AS [departmentCode],
                d.department_name
                    AS [departmentName],

                e.position_code
                    AS [positionCode],
                e.job_title
                    AS [jobTitle],

                e.manager_employee_id
                    AS [managerEmployeeId],
                manager.employee_code
                    AS [managerEmployeeCode],
                manager.full_name
                    AS [managerName],

                e.work_email
                    AS [workEmail],
                e.personal_email
                    AS [personalEmail],
                e.phone_number
                    AS [phoneNumber],

                e.employment_type_code
                    AS [employmentTypeCode],

                e.hire_date
                    AS [hireDate],
                e.probation_end_date
                    AS [probationEndDate],
                e.termination_date
                    AS [terminationDate],

                e.status_id
                    AS [statusId],
                e.created_at
                    AS [createdAt],
                e.updated_at
                    AS [updatedAt]

            FROM hr.employees e

            LEFT JOIN dbo.departments_test d
                ON d.department_code =
                   e.department_code

            LEFT JOIN hr.employees manager
                ON manager.id =
                   e.manager_employee_id

            WHERE
                (
                    @keyword IS NULL
                    OR e.employee_code
                        LIKE '%' + @keyword + '%'
                    OR e.full_name
                        LIKE N'%' + @keyword + N'%'
                    OR e.preferred_name
                        LIKE N'%' + @keyword + N'%'
                    OR e.work_email
                        LIKE '%' + @keyword + '%'
                    OR e.phone_number
                        LIKE '%' + @keyword + '%'
                    OR e.department_code
                        LIKE '%' + @keyword + '%'
                    OR d.department_name
                        LIKE N'%' + @keyword + N'%'
                    OR e.job_title
                        LIKE N'%' + @keyword + N'%'
                )
                AND (
                    @status_id IS NULL
                    OR e.status_id =
                       @status_id
                )
                AND (
                    @department_code IS NULL
                    OR e.department_code =
                       @department_code
                )

            ORDER BY
                e.status_id ASC,
                e.full_name ASC;
        `);

    return result.recordset;
}

async function getEmployeeById(id) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input('id', sql.BigInt, id)
        .query(`
            SELECT TOP 1
                e.id AS [id],
                e.employee_code
                    AS [employeeCode],
                e.full_name
                    AS [fullName],
                e.preferred_name
                    AS [preferredName],
                e.department_code
                    AS [departmentCode],
                e.position_code
                    AS [positionCode],
                e.job_title
                    AS [jobTitle],
                e.manager_employee_id
                    AS [managerEmployeeId],
                e.work_email
                    AS [workEmail],
                e.personal_email
                    AS [personalEmail],
                e.phone_number
                    AS [phoneNumber],
                e.employment_type_code
                    AS [employmentTypeCode],
                e.hire_date
                    AS [hireDate],
                e.probation_end_date
                    AS [probationEndDate],
                e.termination_date
                    AS [terminationDate],
                e.status_id
                    AS [statusId],
                e.created_at
                    AS [createdAt],
                e.updated_at
                    AS [updatedAt]
            FROM hr.employees e
            WHERE e.id = @id;
        `);

    const employee =
        result.recordset[0];

    if (!employee) {
        throw createHttpError(
            404,
            'Không tìm thấy nhân viên.',
            'EMPLOYEE_NOT_FOUND'
        );
    }

    return employee;
}

async function createEmployee(
    payload,
    currentUserId
) {
    const pool = await getPool();
    const employee = normalizeEmployee(payload);

    await ensureEmployeeCodeUnique(
        pool,
        employee.employeeCode
    );

    if (
        employee.managerEmployeeId
    ) {
        await getEmployeeById(
            Number(employee.managerEmployeeId)
        );
    }

    const result = await pool
        .request()
        .input(
            'employee_code',
            sql.VarChar(32),
            employee.employeeCode
        )
        .input(
            'full_name',
            sql.NVarChar(200),
            employee.fullName
        )
        .input(
            'preferred_name',
            sql.NVarChar(100),
            employee.preferredName
        )
        .input(
            'department_code',
            sql.VarChar(32),
            employee.departmentCode
        )
        .input(
            'position_code',
            sql.VarChar(50),
            employee.positionCode
        )
        .input(
            'job_title',
            sql.NVarChar(150),
            employee.jobTitle
        )
        .input(
            'manager_employee_id',
            sql.BigInt,
            employee.managerEmployeeId
        )
        .input(
            'work_email',
            sql.VarChar(255),
            employee.workEmail
        )
        .input(
            'phone_number',
            sql.VarChar(30),
            employee.phoneNumber
        )
        .input(
            'employment_type_code',
            sql.VarChar(30),
            employee.employmentTypeCode
        )
        .input(
            'hire_date',
            sql.Date,
            employee.hireDate
        )
        .input(
            'termination_date',
            sql.Date,
            employee.terminationDate
        )
        .input(
            'status_id',
            sql.TinyInt,
            employee.statusId
        )
        .input(
            'created_by_user_id',
            sql.BigInt,
            currentUserId
        )
        .query(`
            INSERT INTO hr.employees (
                employee_code,
                full_name,
                preferred_name,
                department_code,
                position_code,
                job_title,
                manager_employee_id,
                work_email,
                phone_number,
                employment_type_code,
                hire_date,
                termination_date,
                status_id,
                created_by_user_id
            )
            OUTPUT INSERTED.id
            VALUES (
                @employee_code,
                @full_name,
                @preferred_name,
                @department_code,
                @position_code,
                @job_title,
                @manager_employee_id,
                @work_email,
                @phone_number,
                @employment_type_code,
                @hire_date,
                @termination_date,
                @status_id,
                @created_by_user_id
            );
        `);

    return getEmployeeById(
        result.recordset[0].id
    );
}

async function updateEmployee(
    id,
    payload,
    currentUserId
) {
    const pool = await getPool();

    await getEmployeeById(id);

    const employee = normalizeEmployee(payload);

    await ensureEmployeeCodeUnique(
        pool,
        employee.employeeCode,
        id
    );

    if (
        employee.managerEmployeeId &&
        Number(employee.managerEmployeeId) ===
        Number(id)
    ) {
        throw createHttpError(
            400,
            'Nhân viên không thể là quản lý của chính mình.',
            'INVALID_MANAGER'
        );
    }

    await pool
        .request()
        .input('id', sql.BigInt, id)
        .input(
            'employee_code',
            sql.VarChar(32),
            employee.employeeCode
        )
        .input(
            'full_name',
            sql.NVarChar(200),
            employee.fullName
        )
        .input(
            'preferred_name',
            sql.NVarChar(100),
            employee.preferredName
        )
        .input(
            'department_code',
            sql.VarChar(32),
            employee.departmentCode
        )
        .input(
            'position_code',
            sql.VarChar(50),
            employee.positionCode
        )
        .input(
            'job_title',
            sql.NVarChar(150),
            employee.jobTitle
        )
        .input(
            'manager_employee_id',
            sql.BigInt,
            employee.managerEmployeeId
        )
        .input(
            'work_email',
            sql.VarChar(255),
            employee.workEmail
        )
        .input(
            'phone_number',
            sql.VarChar(30),
            employee.phoneNumber
        )
        .input(
            'employment_type_code',
            sql.VarChar(30),
            employee.employmentTypeCode
        )
        .input(
            'hire_date',
            sql.Date,
            employee.hireDate
        )
        .input(
            'termination_date',
            sql.Date,
            employee.terminationDate
        )
        .input(
            'status_id',
            sql.TinyInt,
            employee.statusId
        )
        .input(
            'updated_by_user_id',
            sql.BigInt,
            currentUserId
        )
        .query(`
            UPDATE hr.employees
            SET
                employee_code =
                    @employee_code,
                full_name =
                    @full_name,
                preferred_name =
                    @preferred_name,
                department_code =
                    @department_code,
                position_code =
                    @position_code,
                job_title =
                    @job_title,
                manager_employee_id =
                    @manager_employee_id,
                work_email =
                    @work_email,
                phone_number =
                    @phone_number,
                employment_type_code =
                    @employment_type_code,
                hire_date =
                    @hire_date,
                termination_date =
                    @termination_date,
                status_id =
                    @status_id,
                updated_by_user_id =
                    @updated_by_user_id,
                updated_at =
                    SYSDATETIME()
            WHERE id = @id;
        `);

    return getEmployeeById(id);
}

async function deactivateEmployee(
    id,
    currentUserId
) {
    const pool = await getPool();

    await getEmployeeById(id);

    await pool
        .request()
        .input('id', sql.BigInt, id)
        .input(
            'updated_by_user_id',
            sql.BigInt,
            currentUserId
        )
        .query(`
            UPDATE hr.employees
            SET
                status_id = 1,
                termination_date =
                    COALESCE(
                        termination_date,
                        CAST(SYSDATETIME() AS DATE)
                    ),
                updated_by_user_id =
                    @updated_by_user_id,
                updated_at =
                    SYSDATETIME()
            WHERE id = @id;

            UPDATE auth.users
            SET
                status_id = 1,
                token_version =
                    token_version + 1,
                updated_by_user_id =
                    @updated_by_user_id,
                updated_at =
                    SYSDATETIME()
            WHERE employee_id = @id;
        `);

    return {
        id,
        statusId: 1,
    };
}

async function getEmployeeOptions(search = '') {
    const keyword = String(search || '').trim();

    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'search',
            sql.NVarChar(200),
            keyword
        )
        .query(`
            SELECT
                e.id AS [id],
                e.employee_code AS [employeeCode],
                e.full_name AS [fullName],
                e.department_code AS [departmentCode],
                e.position_code AS [positionCode],
                e.job_title AS [jobTitle]

            FROM hr.employees e

            LEFT JOIN auth.users u
                ON u.employee_id = e.id

            WHERE e.status_id = 0
              AND u.id IS NULL
              AND (
                    @search = ''
                    OR e.employee_code LIKE '%' + @search + '%'
                    OR e.full_name LIKE '%' + @search + '%'
                    OR e.department_code LIKE '%' + @search + '%'
              )

            ORDER BY
                e.full_name ASC,
                e.employee_code ASC;
        `);

    return result.recordset;
}



module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    getEmployeeOptions,
};