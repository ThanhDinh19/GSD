require('dotenv').config();

const argon2 = require('argon2');

const {
    connectDB,
    getPool,
    sql,
} = require('../database/connection');

async function createInitialAdmin() {
    const username =
        process.env.INITIAL_USERNAME ||
        'admin';

    const password =
        process.env.INITIAL_PASSWORD;

    if (!password) {
        throw new Error(
            'Thiếu INITIAL_ADMIN_PASSWORD'
        );
    }

    const pool = await getPool();

    const existed =
        await pool
            .request()
            .input(
                'username',
                sql.VarChar(100),
                username
            )
            .query(`
                SELECT TOP 1 id
                FROM auth.users
                WHERE username =
                      @username;
            `);

    if (
        existed.recordset.length > 0
    ) {
        throw new Error(
            `Tài khoản "${username}" đã tồn tại.`
        );
    }

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {
        const employeeResult =
            await new sql.Request(
                transaction
            )
                .input(
                    'employee_code',
                    sql.VarChar(32),
                    'NV'
                )
                .input(
                    'full_name',
                    sql.NVarChar(200),
                    'Nguyễn Văn A'
                )
                .input(
                    'department_code',
                    sql.VarChar(32),
                    'IT'
                )
                .query(`
                    INSERT INTO hr.employees (
                        employee_code,
                        full_name,
                        department_code,
                        status_id
                    )
                    OUTPUT INSERTED.id
                    VALUES (
                        @employee_code,
                        @full_name,
                        @department_code,
                        0
                    );
                `);

        const employeeId =
            employeeResult
                .recordset[0]
                .id;

        const passwordHash =
            await argon2.hash(
                password,
                {
                    type:
                        argon2.argon2id,
                }
            );

        const userResult =
            await new sql.Request(
                transaction
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
                    'password_hash',
                    sql.NVarChar(500),
                    passwordHash
                )
                .query(`
                    INSERT INTO auth.users (
                        employee_id,
                        username,
                        password_hash,
                        password_algo,
                        must_change_password,
                        is_system_account,
                        status_id,
                        password_changed_at
                    )
                    OUTPUT INSERTED.id
                    VALUES (
                        @employee_id,
                        @username,
                        @password_hash,
                        'ARGON2ID',
                        1,
                        1,
                        0,
                        SYSDATETIME()
                    );
                `);

        const userId =
            userResult
                .recordset[0]
                .id;

        const roleResult =
            await new sql.Request(
                transaction
            )
                .query(`
                    SELECT TOP 1 id
                    FROM auth.roles
                    WHERE role_code =
                          'SEWING_PROCESS_VIEWER';
                `);

        const roleId =
            roleResult.recordset[0]?.id;

        if (!roleId) {
            throw new Error(
                'Chưa có role SYSTEM_ADMIN. Hãy chạy file seed trước.'
            );
        }

        await new sql.Request(
            transaction
        )
            .input(
                'user_id',
                sql.BigInt,
                userId
            )
            .input(
                'role_id',
                sql.Int,
                roleId
            )
            .query(`
                INSERT INTO auth.user_roles (
                    user_id,
                    role_id,
                    status_id,
                    assigned_at
                )
                VALUES (
                    @user_id,
                    @role_id,
                    0,
                    SYSDATETIME()
                );
            `);

        await transaction.commit();

        console.log(
            'Đã tạo user thành công:',
            username
        );
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function main() {
    await connectDB();
    await createInitialAdmin();
}

main()
    .then(() => {
        console.log('Script hoàn tất.');
        process.exit(0);
    })
    .catch((error) => {
        console.error(
            'Lỗi khi tạo user ban đầu:',
            error
        );
        process.exit(1);
    });