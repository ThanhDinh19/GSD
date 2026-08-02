const argon2 = require('argon2');

const {
    getPool,
    sql,
} = require('../database/connection');

const {
    createHttpError,
} = require('../utils/httpError');

async function ensureEmployeeExists(
    transactionOrPool,
    employeeId
) {
    const request =
        transactionOrPool instanceof sql.Transaction
            ? new sql.Request(transactionOrPool)
            : transactionOrPool.request();

    const result = await request
        .input(
            'employee_id',
            sql.BigInt,
            employeeId
        )
        .query(`
            SELECT TOP 1
                id,
                status_id
            FROM hr.employees
            WHERE id = @employee_id;
        `);

    const employee =
        result.recordset[0];

    if (!employee) {
        throw createHttpError(
            400,
            'Nhân viên không tồn tại.',
            'EMPLOYEE_NOT_FOUND'
        );
    }

    if (employee.status_id !== 0) {
        throw createHttpError(
            400,
            'Nhân viên đã ngừng hoạt động.',
            'EMPLOYEE_INACTIVE'
        );
    }
}

async function getUsers() {
    const pool = await getPool();

    const result = await pool
    .request()
    .query(`
        SELECT
            u.id AS [id],
            u.employee_id AS [employeeId],
            e.employee_code AS [employeeCode],
            e.full_name AS [employeeName],
            e.department_code AS [departmentCode],

            u.username AS [username],
            u.login_email AS [loginEmail],
            u.must_change_password AS [mustChangePassword],
            u.failed_login_count AS [failedLoginCount],
            u.locked_until AS [lockedUntil],
            u.last_login_at AS [lastLoginAt],
            u.status_id AS [statusId],
            u.created_at AS [createdAt],

            role_summary.role_names AS [roleNames]

        FROM auth.users u

        LEFT JOIN hr.employees e
            ON e.id = u.employee_id

        OUTER APPLY (
            SELECT
                STRING_AGG(
                    role_data.role_name,
                    N', '
                ) WITHIN GROUP (
                    ORDER BY role_data.role_name
                ) AS role_names
            FROM (
                SELECT DISTINCT
                    r.role_name
                FROM auth.user_roles ur

                INNER JOIN auth.roles r
                    ON r.id = ur.role_id

                WHERE ur.user_id = u.id
                  AND ur.status_id = 0
                  AND r.status_id = 0
                  AND (
                        ur.valid_from IS NULL
                        OR ur.valid_from <= SYSDATETIME()
                  )
                  AND (
                        ur.valid_to IS NULL
                        OR ur.valid_to >= SYSDATETIME()
                  )
            ) role_data
        ) role_summary

        ORDER BY
            u.status_id ASC,
            u.username ASC;
    `);
    return result.recordset;
}

async function getUserById(id) {
    const pool = await getPool();

    const userResult = await pool
        .request()
        .input('id', sql.BigInt, id)
        .query(`
            SELECT TOP 1
                u.id AS [id],
                u.employee_id
                    AS [employeeId],
                e.employee_code
                    AS [employeeCode],
                e.full_name
                    AS [employeeName],
                e.department_code
                    AS [departmentCode],

                u.username
                    AS [username],
                u.login_email
                    AS [loginEmail],
                u.must_change_password
                    AS [mustChangePassword],
                u.locked_until
                    AS [lockedUntil],
                u.status_id
                    AS [statusId],
                u.is_system_account
                    AS [isSystemAccount],
                u.created_at
                    AS [createdAt],
                u.updated_at
                    AS [updatedAt]

            FROM auth.users u

            LEFT JOIN hr.employees e
                ON e.id = u.employee_id

            WHERE u.id = @id;
        `);

    const user = userResult.recordset[0];

    if (!user) {
        throw createHttpError(
            404,
            'Không tìm thấy tài khoản.',
            'USER_NOT_FOUND'
        );
    }

    const roleResult = await pool
        .request()
        .input(
            'user_id',
            sql.BigInt,
            id
        )
        .query(`
            SELECT
                ur.id AS [userRoleId],
                r.id AS [roleId],
                r.role_code AS [roleCode],
                r.role_name AS [roleName],
                ur.department_code
                    AS [departmentCode],
                ur.valid_from AS [validFrom],
                ur.valid_to AS [validTo],
                ur.status_id AS [statusId]
            FROM auth.user_roles ur

            INNER JOIN auth.roles r
                ON r.id = ur.role_id

            WHERE ur.user_id = @user_id
            ORDER BY r.role_name;
        `);

    return {
        ...user,
        roles: roleResult.recordset,
    };
}

async function createUser(
    payload,
    currentUserId
) {
    const employeeId =
        Number(payload.employeeId);

    const username =
        String(payload.username || '')
            .trim()
            .toLowerCase();

    const loginEmail =
        payload.loginEmail
            ? String(payload.loginEmail)
                .trim()
                .toLowerCase()
            : null;

    const password =
        String(payload.password || '');

    if (!employeeId) {
        throw createHttpError(
            400,
            'Vui lòng chọn nhân viên.'
        );
    }

    if (!username) {
        throw createHttpError(
            400,
            'Tên đăng nhập là bắt buộc.'
        );
    }

    if (password.length < 9) {
        throw createHttpError(
            400,
            'Mật khẩu phải có ít nhất 9 ký tự.'
        );
    }

    const pool = await getPool();

    await ensureEmployeeExists(
        pool,
        employeeId
    );

    const duplicateResult = await pool
        .request()
        .input(
            'employee_id',
            sql.BigInt,
            employeeId
        )
        .input(
            'username',
            sql.VarChar(100),
            username
        )
        .query(`
            SELECT TOP 1 id
            FROM auth.users
            WHERE employee_id = @employee_id
               OR username = @username;
        `);

    if (
        duplicateResult.recordset.length > 0
    ) {
        throw createHttpError(
            400,
            'Nhân viên đã có tài khoản hoặc tên đăng nhập đã tồn tại.',
            'USER_EXISTS'
        );
    }

    const passwordHash =
        await argon2.hash(password, {
            type: argon2.argon2id,
        });

    const result = await pool
        .request()
        .input(
            'employee_id',
            sql.BigInt,
            employeeId
        )
        .input(
            'username',
            sql.VarChar(100),
            username
        )
        .input(
            'login_email',
            sql.VarChar(255),
            loginEmail
        )
        .input(
            'password_hash',
            sql.NVarChar(500),
            passwordHash
        )
        .input(
            'created_by_user_id',
            sql.BigInt,
            currentUserId
        )
        .query(`
            INSERT INTO auth.users (
                employee_id,
                username,
                login_email,
                password_hash,
                password_algo,
                must_change_password,
                status_id,
                created_by_user_id,
                password_changed_at
            )
            OUTPUT INSERTED.id
            VALUES (
                @employee_id,
                @username,
                @login_email,
                @password_hash,
                'ARGON2ID',
                1,
                0,
                @created_by_user_id,
                SYSDATETIME()
            );
        `);

    return getUserById(
        result.recordset[0].id
    );
}

async function setUserLock(
    id,
    isLocked,
    currentUserId
) {
    const pool = await getPool();

    await getUserById(id);

    await pool
        .request()
        .input('id', sql.BigInt, id)
        .input(
            'current_user_id',
            sql.BigInt,
            currentUserId
        )
        .query(`
            UPDATE auth.users
            SET
                status_id =
                    ${isLocked ? 1 : 0},
                locked_until =
                    ${isLocked
                        ? 'DATEADD(YEAR, 100, SYSDATETIME())'
                        : 'NULL'},
                token_version =
                    token_version + 1,
                updated_by_user_id =
                    @current_user_id,
                updated_at =
                    SYSDATETIME()
            WHERE id = @id;

            ${
                isLocked
                    ? `
                    UPDATE auth.sessions
                    SET
                        revoked_at =
                            SYSDATETIME(),
                        revoked_by_user_id =
                            @current_user_id,
                        revoke_reason =
                            N'Tài khoản bị khóa'
                    WHERE user_id = @id
                      AND revoked_at IS NULL;
                    `
                    : ''
            }
        `);

    return getUserById(id);
}

async function resetPassword(
    id,
    newPassword,
    currentUserId
) {
    if (
        !newPassword ||
        newPassword.length < 10
    ) {
        throw createHttpError(
            400,
            'Mật khẩu mới phải có ít nhất 10 ký tự.'
        );
    }

    const pool = await getPool();

    await getUserById(id);

    const passwordHash =
        await argon2.hash(newPassword, {
            type: argon2.argon2id,
        });

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {
        await new sql.Request(transaction)
            .input('id', sql.BigInt, id)
            .input(
                'password_hash',
                sql.NVarChar(500),
                passwordHash
            )
            .input(
                'current_user_id',
                sql.BigInt,
                currentUserId
            )
            .query(`
                UPDATE auth.users
                SET
                    password_hash =
                        @password_hash,
                    password_algo =
                        'ARGON2ID',
                    must_change_password = 1,
                    password_changed_at =
                        SYSDATETIME(),
                    token_version =
                        token_version + 1,
                    failed_login_count = 0,
                    locked_until = NULL,
                    updated_by_user_id =
                        @current_user_id,
                    updated_at =
                        SYSDATETIME()
                WHERE id = @id;

                INSERT INTO auth.password_history (
                    user_id,
                    password_hash,
                    password_algo,
                    changed_by_user_id
                )
                VALUES (
                    @id,
                    @password_hash,
                    'ARGON2ID',
                    @current_user_id
                );

                UPDATE auth.sessions
                SET
                    revoked_at =
                        SYSDATETIME(),
                    revoked_by_user_id =
                        @current_user_id,
                    revoke_reason =
                        N'Đặt lại mật khẩu'
                WHERE user_id = @id
                  AND revoked_at IS NULL;
            `);

        await transaction.commit();

        return {
            id,
            mustChangePassword: true,
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function revokeSessions(
    id,
    currentUserId
) {
    const pool = await getPool();

    await pool
        .request()
        .input(
            'user_id',
            sql.BigInt,
            id
        )
        .input(
            'current_user_id',
            sql.BigInt,
            currentUserId
        )
        .query(`
            UPDATE auth.sessions
            SET
                revoked_at =
                    SYSDATETIME(),
                revoked_by_user_id =
                    @current_user_id,
                revoke_reason =
                    N'Quản trị viên thu hồi phiên'
            WHERE user_id = @user_id
              AND revoked_at IS NULL;

            UPDATE auth.users
            SET
                token_version =
                    token_version + 1,
                updated_by_user_id =
                    @current_user_id,
                updated_at =
                    SYSDATETIME()
            WHERE id = @user_id;
        `);

    return {
        id,
        revoked: true,
    };
}

async function updateUser(
    id,
    payload,
    currentUserId
) {
    const pool = await getPool();

    const current = await getUserById(id);

    const employeeId = Number(
        payload.employeeId ??
        payload.employee_id ??
        current.employeeId
    );

    const username = String(
        payload.username ??
        current.username
    )
        .trim()
        .toLowerCase();

    const loginEmailValue =
        payload.loginEmail ??
        payload.login_email ??
        current.loginEmail;

    const loginEmail = loginEmailValue
        ? String(loginEmailValue)
            .trim()
            .toLowerCase()
        : null;

    const statusId = Number(
        payload.statusId ??
        payload.status_id ??
        current.statusId
    );

    if (
        !Number.isInteger(employeeId) ||
        employeeId <= 0
    ) {
        throw createHttpError(
            400,
            'Nhân viên không hợp lệ.',
            'INVALID_EMPLOYEE'
        );
    }

    if (!username) {
        throw createHttpError(
            400,
            'Tên đăng nhập là bắt buộc.',
            'USERNAME_REQUIRED'
        );
    }

    if (![0, 1].includes(statusId)) {
        throw createHttpError(
            400,
            'Trạng thái tài khoản không hợp lệ.',
            'INVALID_USER_STATUS'
        );
    }

    await ensureEmployeeExists(
        pool,
        employeeId
    );

    const duplicateResult =
        await pool.request()
            .input(
                'id',
                sql.BigInt,
                id
            )
            .input(
                'employee_id',
                sql.BigInt,
                employeeId
            )
            .input(
                'username',
                sql.VarChar(100),
                username
            )
            .input(
                'login_email',
                sql.VarChar(255),
                loginEmail
            )
            .query(`
                SELECT TOP 1
                    id,
                    username
                FROM auth.users
                WHERE id <> @id
                  AND (
                        employee_id = @employee_id
                        OR username = @username
                        OR (
                            @login_email IS NOT NULL
                            AND login_email = @login_email
                        )
                  );
            `);

    if (duplicateResult.recordset.length > 0) {
        throw createHttpError(
            400,
            'Nhân viên, tên đăng nhập hoặc email đăng nhập đã được sử dụng.',
            'USER_EXISTS'
        );
    }

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {
        await new sql.Request(transaction)
            .input(
                'id',
                sql.BigInt,
                id
            )
            .input(
                'employee_id',
                sql.BigInt,
                employeeId
            )
            .input(
                'username',
                sql.VarChar(100),
                username
            )
            .input(
                'login_email',
                sql.VarChar(255),
                loginEmail
            )
            .input(
                'status_id',
                sql.TinyInt,
                statusId
            )
            .input(
                'updated_by_user_id',
                sql.BigInt,
                currentUserId
            )
            .query(`
                UPDATE auth.users
                SET
                    employee_id = @employee_id,
                    username = @username,
                    login_email = @login_email,
                    status_id = @status_id,

                    token_version =
                        CASE
                            WHEN employee_id <> @employee_id
                              OR username <> @username
                              OR status_id <> @status_id
                            THEN token_version + 1
                            ELSE token_version
                        END,

                    updated_by_user_id =
                        @updated_by_user_id,
                    updated_at = SYSDATETIME()

                WHERE id = @id;
            `);

        if (statusId !== 0) {
            await new sql.Request(transaction)
                .input(
                    'user_id',
                    sql.BigInt,
                    id
                )
                .input(
                    'updated_by_user_id',
                    sql.BigInt,
                    currentUserId
                )
                .query(`
                    UPDATE auth.sessions
                    SET
                        revoked_at =
                            COALESCE(
                                revoked_at,
                                SYSDATETIME()
                            ),
                        revoked_by_user_id =
                            @updated_by_user_id,
                        revoke_reason =
                            N'Tài khoản ngừng sử dụng'
                    WHERE user_id = @user_id
                      AND revoked_at IS NULL;
                `);
        }

        await transaction.commit();

        return getUserById(id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}



module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    setUserLock,
    resetPassword,
    revokeSessions,
};