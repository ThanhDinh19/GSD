const argon2 = require('argon2');

const {
    getPool,
    sql,
} = require('../database/connection');

const authConfig =
    require('../config/auth.config');

const tokenService =
    require('./token.service');
    
const {
    createHttpError,
} = require('../utils/httpError');

async function writeLoginLog({
    userId = null,
    username = null,
    success,
    failureReasonCode = null,
    failureMessage = null,
    sessionKey = null,
    ipAddress = null,
    userAgent = null,
}) {
    try {
        const pool = await getPool();

        await pool
            .request()
            .input(
                'user_id',
                sql.BigInt,
                userId
            )
            .input(
                'username',
                sql.VarChar(100),
                username
            )
            .input(
                'success',
                sql.Bit,
                success
            )
            .input(
                'failure_reason_code',
                sql.VarChar(50),
                failureReasonCode
            )
            .input(
                'failure_message',
                sql.NVarChar(500),
                failureMessage
            )
            .input(
                'session_key',
                sql.UniqueIdentifier,
                sessionKey
            )
            .input(
                'ip_address',
                sql.VarChar(64),
                ipAddress
            )
            .input(
                'user_agent',
                sql.NVarChar(1000),
                userAgent
            )
            .query(`
                INSERT INTO audit.login_logs (
                    user_id,
                    username,
                    session_key,
                    success,
                    failure_reason_code,
                    failure_message,
                    ip_address,
                    user_agent
                )
                VALUES (
                    @user_id,
                    @username,
                    @session_key,
                    @success,
                    @failure_reason_code,
                    @failure_message,
                    @ip_address,
                    @user_agent
                );
            `);
    } catch (error) {
        console.error(
            'Không ghi được login log:',
            error
        );
    }
}

async function getUserByLogin(login) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'login',
            sql.VarChar(255),
            login
        )
        .query(`
            SELECT TOP 1
                u.id AS [id],
                u.employee_id AS [employeeId],
                u.username AS [username],
                u.login_email AS [loginEmail],
                u.password_hash AS [passwordHash],
                u.password_algo AS [passwordAlgo],
                u.failed_login_count
                    AS [failedLoginCount],
                u.locked_until AS [lockedUntil],
                u.token_version AS [tokenVersion],
                u.status_id AS [userStatusId],
                u.is_system_account
                    AS [isSystemAccount],

                e.employee_code AS [employeeCode],
                e.full_name AS [fullName],
                e.department_code
                    AS [departmentCode],
                e.status_id AS [employeeStatusId]

            FROM auth.users u

            LEFT JOIN hr.employees e
                ON e.id = u.employee_id

            WHERE
                u.username = @login
                OR u.login_email = @login;
        `);

    return result.recordset[0] || null;
}

async function increaseFailedLogin(userId) {
    const pool = await getPool();

    await pool
        .request()
        .input(
            'id',
            sql.BigInt,
            userId
        )
        .input(
            'max_failed',
            sql.Int,
            authConfig.maxFailedLogin
        )
        .input(
            'lock_minutes',
            sql.Int,
            authConfig.lockMinutes
        )
        .query(`
            UPDATE auth.users
            SET
                failed_login_count =
                    failed_login_count + 1,

                locked_until =
                    CASE
                        WHEN failed_login_count + 1
                             >= @max_failed
                        THEN DATEADD(
                            MINUTE,
                            @lock_minutes,
                            SYSDATETIME()
                        )
                        ELSE locked_until
                    END,

                updated_at = SYSDATETIME()

            WHERE id = @id;
        `);
}

async function resetSuccessfulLogin(userId) {
    const pool = await getPool();

    await pool
        .request()
        .input(
            'id',
            sql.BigInt,
            userId
        )
        .query(`
            UPDATE auth.users
            SET
                failed_login_count = 0,
                locked_until = NULL,
                last_login_at = SYSDATETIME(),
                updated_at = SYSDATETIME()
            WHERE id = @id;
        `);
}

async function createRefreshSession({
    userId,
    ipAddress,
    userAgent,
}) {
    const pool = await getPool();

    const refreshSecret =
        tokenService.generateRefreshSecret();

    const refreshHash =
        tokenService.hashRefreshSecret(
            refreshSecret
        );

    const expiresAt = new Date(
        Date.now() +
        authConfig.refreshTokenDays *
        24 *
        60 *
        60 *
        1000
    );

    const result = await pool
        .request()
        .input(
            'user_id',
            sql.BigInt,
            userId
        )
        .input(
            'refresh_token_hash',
            sql.NVarChar(500),
            refreshHash
        )
        .input(
            'ip_address',
            sql.VarChar(64),
            ipAddress
        )
        .input(
            'user_agent',
            sql.NVarChar(1000),
            userAgent
        )
        .input(
            'expires_at',
            sql.DateTime2,
            expiresAt
        )
        .query(`
            INSERT INTO auth.sessions (
                user_id,
                refresh_token_hash,
                ip_address,
                user_agent,
                expires_at
            )
            OUTPUT
                INSERTED.id AS [id],
                INSERTED.session_key
                    AS [sessionKey]
            VALUES (
                @user_id,
                @refresh_token_hash,
                @ip_address,
                @user_agent,
                @expires_at
            );
        `);

    const session =
        result.recordset[0];

    return {
        sessionKey: session.sessionKey,
        cookieValue:
            `${session.sessionKey}.${refreshSecret}`,
        expiresAt,
    };
}

async function getActiveUserById(userId) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'user_id',
            sql.BigInt,
            userId
        )
        .query(`
            SELECT TOP 1
                u.id AS [id],
                u.employee_id AS [employeeId],
                u.username AS [username],
                u.login_email AS [loginEmail],
                u.token_version AS [tokenVersion],
                u.status_id AS [userStatusId],
                u.is_system_account
                    AS [isSystemAccount],

                e.employee_code AS [employeeCode],
                e.full_name AS [fullName],
                e.department_code
                    AS [departmentCode],
                e.status_id AS [employeeStatusId]

            FROM auth.users u

            LEFT JOIN hr.employees e
                ON e.id = u.employee_id

            WHERE u.id = @user_id;
        `);

    const user = result.recordset[0];

    if (!user || user.userStatusId !== 0) {
        throw createHttpError(
            401,
            'Tài khoản không tồn tại hoặc đã bị khóa.',
            'USER_INACTIVE'
        );
    }

    if (
        !user.isSystemAccount &&
        user.employeeId &&
        user.employeeStatusId !== 0
    ) {
        throw createHttpError(
            401,
            'Nhân viên đã ngừng hoạt động.',
            'EMPLOYEE_INACTIVE'
        );
    }

    return user;
}

async function getMe(userId) {
    const user =
        await getActiveUserById(userId);

    const pool = await getPool();

    const rolesResult = await pool
        .request()
        .input(
            'user_id',
            sql.BigInt,
            userId
        )
        .query(`
            SELECT DISTINCT
                r.id AS [id],
                r.role_code AS [roleCode],
                r.role_name AS [roleName]
            FROM auth.user_roles ur

            INNER JOIN auth.roles r
                ON r.id = ur.role_id

            WHERE ur.user_id = @user_id
              AND ur.status_id = 0
              AND r.status_id = 0
              AND (
                    ur.valid_from IS NULL
                    OR ur.valid_from
                       <= SYSDATETIME()
              )
              AND (
                    ur.valid_to IS NULL
                    OR ur.valid_to
                       >= SYSDATETIME()
              )
            ORDER BY r.role_name;
        `);

    const permissionResult = await pool
        .request()
        .input(
            'user_id',
            sql.BigInt,
            userId
        )
        .query(`
            SELECT
                permission_code
                    AS [permissionCode],
                permission_name
                    AS [permissionName],
                screen_code AS [screenCode],
                action_code AS [actionCode],
                scope_code AS [scopeCode]
            FROM auth.v_user_effective_permissions
            WHERE user_id = @user_id
            ORDER BY permission_code;
        `);

    const navigationResult = await pool
        .request()
        .input(
            'user_id',
            sql.BigInt,
            userId
        )
        .query(`
            SELECT
                module_id AS [moduleId],
                module_code AS [moduleCode],
                module_name AS [moduleName],
                module_icon_key
                    AS [moduleIconKey],
                module_sort_order
                    AS [moduleSortOrder],

                screen_id AS [screenId],
                parent_screen_id
                    AS [parentScreenId],
                screen_code AS [screenCode],
                screen_name AS [screenName],
                route_path AS [routePath],
                component_key AS [componentKey],
                screen_icon_key
                    AS [screenIconKey],
                screen_sort_order
                    AS [screenSortOrder]

            FROM app.v_user_navigation
            WHERE user_id = @user_id

            ORDER BY
                module_sort_order,
                screen_sort_order;
        `);

    const permissionMap = new Map();

    for (
        const row of
        permissionResult.recordset
    ) {
        if (
            !permissionMap.has(
                row.permissionCode
            )
        ) {
            permissionMap.set(
                row.permissionCode,
                {
                    code: row.permissionCode,
                    name: row.permissionName,
                    screenCode: row.screenCode,
                    actionCode: row.actionCode,
                    scopes: [],
                }
            );
        }

        const permission =
            permissionMap.get(
                row.permissionCode
            );

        if (
            !permission.scopes.includes(
                row.scopeCode
            )
        ) {
            permission.scopes.push(
                row.scopeCode
            );
        }
    }

    return {
        user: {
            id: user.id,
            employeeId: user.employeeId,
            employeeCode:
                user.employeeCode,
            username: user.username,
            loginEmail: user.loginEmail,
            fullName:
                user.fullName ||
                user.username,
            departmentCode:
                user.departmentCode,
        },

        roles: rolesResult.recordset,

        permissions:
            Array.from(
                permissionMap.values()
            ),

        navigation:
            navigationResult.recordset,
    };
}

async function login({
    login,
    password,
    ipAddress,
    userAgent,
}) {
    const normalizedLogin =
        String(login || '').trim();

    if (!normalizedLogin || !password) {
        throw createHttpError(
            400,
            'Vui lòng nhập tài khoản và mật khẩu.',
            'LOGIN_REQUIRED'
        );
    }

    const user =
        await getUserByLogin(
            normalizedLogin
        );

    if (!user) {
        await writeLoginLog({
            username: normalizedLogin,
            success: false,
            failureReasonCode:
                'INVALID_CREDENTIALS',
            failureMessage:
                'Tài khoản hoặc mật khẩu không đúng.',
            ipAddress,
            userAgent,
        });

        throw createHttpError(
            401,
            'Tài khoản hoặc mật khẩu không đúng.',
            'INVALID_CREDENTIALS'
        );
    }

    if (user.userStatusId !== 0) {
        throw createHttpError(
            403,
            'Tài khoản đã bị ngừng sử dụng.',
            'USER_INACTIVE'
        );
    }

    if (
        user.lockedUntil &&
        new Date(user.lockedUntil) >
        new Date()
    ) {
        throw createHttpError(
            423,
            'Tài khoản đang tạm khóa do đăng nhập sai nhiều lần.',
            'USER_LOCKED'
        );
    }

    let passwordMatched = false;

    try {
        passwordMatched =
            await argon2.verify(
                user.passwordHash,
                password
            );
    } catch {
        passwordMatched = false;
    }

    if (!passwordMatched) {
        await increaseFailedLogin(user.id);

        await writeLoginLog({
            userId: user.id,
            username: user.username,
            success: false,
            failureReasonCode:
                'INVALID_CREDENTIALS',
            failureMessage:
                'Mật khẩu không đúng.',
            ipAddress,
            userAgent,
        });

        throw createHttpError(
            401,
            'Tài khoản hoặc mật khẩu không đúng.',
            'INVALID_CREDENTIALS'
        );
    }

    await resetSuccessfulLogin(user.id);

    const activeUser =
        await getActiveUserById(user.id);

    const accessToken =
        tokenService.createAccessToken(
            activeUser
        );

    const refreshSession =
        await createRefreshSession({
            userId: user.id,
            ipAddress,
            userAgent,
        });

    await writeLoginLog({
        userId: user.id,
        username: user.username,
        success: true,
        sessionKey:
            refreshSession.sessionKey,
        ipAddress,
        userAgent,
    });

    const profile =
        await getMe(user.id);

    return {
        accessToken,
        refreshCookieValue:
            refreshSession.cookieValue,
        refreshExpiresAt:
            refreshSession.expiresAt,
        ...profile,
    };
}

async function refresh({
    cookieValue,
    ipAddress,
    userAgent,
}) {
    const parsed =
        tokenService.parseRefreshCookie(
            cookieValue
        );

    if (!parsed) {
        throw createHttpError(
            401,
            'Refresh token không hợp lệ.',
            'INVALID_REFRESH_TOKEN'
        );
    }

    const pool = await getPool();

    const sessionResult = await pool
        .request()
        .input(
            'session_key',
            sql.UniqueIdentifier,
            parsed.sessionKey
        )
        .query(`
            SELECT TOP 1
                s.id AS [sessionId],
                s.user_id AS [userId],
                s.refresh_token_hash
                    AS [refreshTokenHash],
                s.expires_at AS [expiresAt],
                s.revoked_at AS [revokedAt]
            FROM auth.sessions s
            WHERE s.session_key =
                  @session_key;
        `);

    const session =
        sessionResult.recordset[0];

    if (
        !session ||
        session.revokedAt ||
        new Date(session.expiresAt) <=
        new Date()
    ) {
        throw createHttpError(
            401,
            'Phiên đăng nhập đã hết hạn.',
            'SESSION_EXPIRED'
        );
    }

    const tokenMatched =
        tokenService.compareRefreshHash(
            parsed.refreshSecret,
            session.refreshTokenHash
        );

    if (!tokenMatched) {
        throw createHttpError(
            401,
            'Refresh token không hợp lệ.',
            'INVALID_REFRESH_TOKEN'
        );
    }

    const user =
        await getActiveUserById(
            session.userId
        );

    const newSecret =
        tokenService.generateRefreshSecret();

    const newHash =
        tokenService.hashRefreshSecret(
            newSecret
        );

    const newExpiresAt = new Date(
        Date.now() +
        authConfig.refreshTokenDays *
        24 *
        60 *
        60 *
        1000
    );

    await pool
        .request()
        .input(
            'session_id',
            sql.BigInt,
            session.sessionId
        )
        .input(
            'refresh_token_hash',
            sql.NVarChar(500),
            newHash
        )
        .input(
            'expires_at',
            sql.DateTime2,
            newExpiresAt
        )
        .input(
            'ip_address',
            sql.VarChar(64),
            ipAddress
        )
        .input(
            'user_agent',
            sql.NVarChar(1000),
            userAgent
        )
        .query(`
            UPDATE auth.sessions
            SET
                refresh_token_hash =
                    @refresh_token_hash,
                expires_at = @expires_at,
                last_used_at = SYSDATETIME(),
                ip_address = @ip_address,
                user_agent = @user_agent
            WHERE id = @session_id
              AND revoked_at IS NULL;
        `);

    return {
        accessToken:
            tokenService.createAccessToken(
                user
            ),

        refreshCookieValue:
            `${parsed.sessionKey}.${newSecret}`,

        refreshExpiresAt:
            newExpiresAt,
    };
}

async function logout(cookieValue) {
    const parsed =
        tokenService.parseRefreshCookie(
            cookieValue
        );

    if (!parsed) return;

    const pool = await getPool();

    await pool
        .request()
        .input(
            'session_key',
            sql.UniqueIdentifier,
            parsed.sessionKey
        )
        .query(`
            UPDATE auth.sessions
            SET
                revoked_at = SYSDATETIME(),
                revoke_reason =
                    N'Người dùng đăng xuất'
            WHERE session_key =
                  @session_key
              AND revoked_at IS NULL;
        `);
}

module.exports = {
    login,
    refresh,
    logout,
    getMe,
    getActiveUserById,
};