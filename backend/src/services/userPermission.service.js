const {
    getPool,
    sql,
} = require('../database/connection');

const {
    createHttpError,
} = require('../utils/httpError');

async function ensureUserExists(transactionOrPool, userId) {
    const request =
        transactionOrPool instanceof sql.Transaction
            ? new sql.Request(transactionOrPool)
            : transactionOrPool.request();

    const result = await request
        .input('user_id', sql.BigInt, userId)
        .query(`
            SELECT TOP 1
                id,
                username,
                status_id
            FROM auth.users
            WHERE id = @user_id;
        `);

    const user = result.recordset[0];

    if (!user) {
        throw createHttpError(
            404,
            'Không tìm thấy tài khoản.',
            'USER_NOT_FOUND'
        );
    }

    return user;
}

async function getUserPermissionMatrix(userId) {
    const id = Number(userId);

    if (!Number.isInteger(id) || id <= 0) {
        throw createHttpError(
            400,
            'Mã tài khoản không hợp lệ.',
            'INVALID_USER_ID'
        );
    }

    const pool = await getPool();

    const user = await ensureUserExists(pool, id);

    const roleResult = await pool
        .request()
        .input('user_id', sql.BigInt, id)
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
                    OR ur.valid_from <= SYSDATETIME()
              )
              AND (
                    ur.valid_to IS NULL
                    OR ur.valid_to >= SYSDATETIME()
              )

            ORDER BY r.role_name;
        `);

    const permissionResult = await pool
        .request()
        .input('user_id', sql.BigInt, id)
        .query(`
            WITH role_grants AS (
                SELECT DISTINCT
                    rp.permission_id
                FROM auth.user_roles ur

                INNER JOIN auth.roles r
                    ON r.id = ur.role_id
                   AND r.status_id = 0

                INNER JOIN auth.role_permissions rp
                    ON rp.role_id = ur.role_id
                   AND rp.status_id = 0

                WHERE ur.user_id = @user_id
                  AND ur.status_id = 0
                  AND (
                        ur.valid_from IS NULL
                        OR ur.valid_from <= SYSDATETIME()
                  )
                  AND (
                        ur.valid_to IS NULL
                        OR ur.valid_to >= SYSDATETIME()
                  )
            ),

            active_overrides AS (
                SELECT
                    uo.permission_id,
                    uo.effect_code,
                    uo.scope_code,

                    ROW_NUMBER() OVER (
                        PARTITION BY uo.permission_id
                        ORDER BY
                            uo.granted_at DESC,
                            uo.id DESC
                    ) AS row_no

                FROM auth.user_permission_overrides uo

                WHERE uo.user_id = @user_id
                  AND uo.status_id = 0
                  AND (
                        uo.valid_from IS NULL
                        OR uo.valid_from <= SYSDATETIME()
                  )
                  AND (
                        uo.valid_to IS NULL
                        OR uo.valid_to >= SYSDATETIME()
                  )
            )

            SELECT
                m.id AS [moduleId],
                m.module_code AS [moduleCode],
                m.module_name AS [moduleName],
                m.sort_order AS [moduleSortOrder],

                s.id AS [screenId],
                s.screen_code AS [screenCode],
                s.screen_name AS [screenName],
                s.route_path AS [routePath],
                s.sort_order AS [screenSortOrder],

                a.id AS [actionId],
                a.action_code AS [actionCode],
                a.action_name AS [actionName],
                a.action_group_code AS [actionGroupCode],
                a.sort_order AS [actionSortOrder],

                p.id AS [permissionId],
                p.permission_code AS [permissionCode],
                p.permission_name AS [permissionName],
                p.is_sensitive AS [isSensitive],

                CAST(
                    CASE
                        WHEN permission_override.effect_code = 'DENY'
                            THEN 0

                        WHEN role_grant.permission_id IS NOT NULL
                          OR permission_override.effect_code = 'ALLOW'
                            THEN 1

                        ELSE 0
                    END
                    AS BIT
                ) AS [effectiveAllowed],

                CAST(
                    CASE
                        WHEN role_grant.permission_id IS NOT NULL
                            THEN 1
                        ELSE 0
                    END
                    AS BIT
                ) AS [inheritedFromRole],

                permission_override.effect_code
                    AS [overrideEffect],

                permission_override.scope_code
                    AS [overrideScopeCode]

            FROM auth.permissions p

            INNER JOIN app.screens s
                ON s.id = p.screen_id

            INNER JOIN app.modules m
                ON m.id = s.module_id

            INNER JOIN app.actions a
                ON a.id = p.action_id

            LEFT JOIN role_grants role_grant
                ON role_grant.permission_id = p.id

            LEFT JOIN active_overrides permission_override
                ON permission_override.permission_id = p.id
               AND permission_override.row_no = 1

            WHERE p.status_id = 0
              AND s.status_id = 0
              AND m.status_id = 0
              AND a.status_id = 0

            ORDER BY
                m.sort_order,
                s.sort_order,
                a.sort_order;
        `);

    const moduleMap = new Map();

    for (const row of permissionResult.recordset) {
        if (!moduleMap.has(row.moduleId)) {
            moduleMap.set(row.moduleId, {
                moduleId: row.moduleId,
                moduleCode: row.moduleCode,
                moduleName: row.moduleName,
                moduleSortOrder: row.moduleSortOrder,
                screens: [],
            });
        }

        const moduleItem = moduleMap.get(row.moduleId);

        let screenItem = moduleItem.screens.find(
            (screen) => screen.screenId === row.screenId
        );

        if (!screenItem) {
            screenItem = {
                screenId: row.screenId,
                screenCode: row.screenCode,
                screenName: row.screenName,
                routePath: row.routePath,
                screenSortOrder: row.screenSortOrder,
                actions: [],
            };

            moduleItem.screens.push(screenItem);
        }

        screenItem.actions.push({
            actionId: row.actionId,
            actionCode: row.actionCode,
            actionName: row.actionName,
            actionGroupCode: row.actionGroupCode,
            actionSortOrder: row.actionSortOrder,

            permissionId: row.permissionId,
            permissionCode: row.permissionCode,
            permissionName: row.permissionName,
            isSensitive: row.isSensitive,

            effectiveAllowed: row.effectiveAllowed,
            inheritedFromRole: row.inheritedFromRole,
            overrideEffect: row.overrideEffect,
            overrideScopeCode: row.overrideScopeCode,
        });
    }

    return {
        user: {
            id: user.id,
            username: user.username,
            statusId: user.status_id,
        },
        roles: roleResult.recordset,
        modules: Array.from(moduleMap.values()),
    };
}

async function saveUserPermissionOverrides(
    userId,
    payload,
    currentUserId
) {
    const id = Number(userId);

    if (!Number.isInteger(id) || id <= 0) {
        throw createHttpError(
            400,
            'Mã tài khoản không hợp lệ.',
            'INVALID_USER_ID'
        );
    }

    const changes = Array.isArray(payload?.changes)
        ? payload.changes
        : [];

    if (changes.length === 0) {
        throw createHttpError(
            400,
            'Không có quyền nào được thay đổi.',
            'EMPTY_PERMISSION_CHANGES'
        );
    }

    const validOperations = new Set([
        'ALLOW',
        'DENY',
        'REMOVE_OVERRIDE',
    ]);

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
        await ensureUserExists(transaction, id);

        const scopeResult = await new sql.Request(transaction)
            .query(`
                SELECT scope_code
                FROM auth.scope_types
                WHERE status_id = 0;
            `);

        const validScopes = new Set(
            scopeResult.recordset.map(
                (item) => item.scope_code
            )
        );

        for (const item of changes) {
            const permissionId = Number(item.permissionId);

            const operation = String(
                item.operation || ''
            ).toUpperCase();

            const scopeCode = String(
                item.scopeCode || 'ALL'
            ).toUpperCase();

            if (
                !Number.isInteger(permissionId) ||
                permissionId <= 0
            ) {
                throw createHttpError(
                    400,
                    'Permission không hợp lệ.',
                    'INVALID_PERMISSION_ID'
                );
            }

            if (!validOperations.has(operation)) {
                throw createHttpError(
                    400,
                    `Operation không hợp lệ: ${operation}`,
                    'INVALID_PERMISSION_OPERATION'
                );
            }

            if (
                operation !== 'REMOVE_OVERRIDE' &&
                !validScopes.has(scopeCode)
            ) {
                throw createHttpError(
                    400,
                    `Scope không hợp lệ: ${scopeCode}`,
                    'INVALID_PERMISSION_SCOPE'
                );
            }

            const permissionResult =
                await new sql.Request(transaction)
                    .input(
                        'permission_id',
                        sql.BigInt,
                        permissionId
                    )
                    .query(`
                        SELECT TOP 1 id
                        FROM auth.permissions
                        WHERE id = @permission_id
                          AND status_id = 0;
                    `);

            if (permissionResult.recordset.length === 0) {
                throw createHttpError(
                    404,
                    `Không tìm thấy permission ${permissionId}.`,
                    'PERMISSION_NOT_FOUND'
                );
            }

            await new sql.Request(transaction)
                .input('user_id', sql.BigInt, id)
                .input(
                    'permission_id',
                    sql.BigInt,
                    permissionId
                )
                .query(`
                    UPDATE auth.user_permission_overrides
                    SET status_id = 1
                    WHERE user_id = @user_id
                      AND permission_id = @permission_id
                      AND status_id = 0;
                `);

            if (operation !== 'REMOVE_OVERRIDE') {
                await new sql.Request(transaction)
                    .input('user_id', sql.BigInt, id)
                    .input(
                        'permission_id',
                        sql.BigInt,
                        permissionId
                    )
                    .input(
                        'effect_code',
                        sql.VarChar(10),
                        operation
                    )
                    .input(
                        'scope_code',
                        sql.VarChar(30),
                        scopeCode
                    )
                    .input(
                        'current_user_id',
                        sql.BigInt,
                        currentUserId
                    )
                    .query(`
                        INSERT INTO auth.user_permission_overrides (
                            user_id,
                            permission_id,
                            effect_code,
                            scope_code,
                            status_id,
                            granted_by_user_id,
                            granted_at
                        )
                        VALUES (
                            @user_id,
                            @permission_id,
                            @effect_code,
                            @scope_code,
                            0,
                            @current_user_id,
                            SYSDATETIME()
                        );
                    `);
            }
        }

        /*
         * Buộc user đăng nhập lại để nhận permission
         * và navigation mới.
         */
        await new sql.Request(transaction)
            .input('user_id', sql.BigInt, id)
            .input(
                'current_user_id',
                sql.BigInt,
                currentUserId
            )
            .query(`
                UPDATE auth.users
                SET
                    token_version = token_version + 1,
                    updated_by_user_id = @current_user_id,
                    updated_at = SYSDATETIME()
                WHERE id = @user_id;

                UPDATE auth.sessions
                SET
                    revoked_at = COALESCE(
                        revoked_at,
                        SYSDATETIME()
                    ),
                    revoked_by_user_id = @current_user_id,
                    revoke_reason =
                        N'Phân quyền tài khoản thay đổi'
                WHERE user_id = @user_id
                  AND revoked_at IS NULL;
            `);

        await transaction.commit();

        return {
            userId: id,
            updatedCount: changes.length,
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    ensureUserExists,
    getUserPermissionMatrix,
    saveUserPermissionOverrides,
    
}