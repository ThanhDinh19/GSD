const {
    getPool,
    sql,
} = require('../database/connection');

const {
    createHttpError,
} = require('../utils/httpError');

async function getPermissionContext(
    userId,
    permissionCode
) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'user_id',
            sql.BigInt,
            userId
        )
        .input(
            'permission_code',
            sql.VarChar(200),
            permissionCode
        )
        .query(`
            SELECT
                permission_id AS [permissionId],
                permission_code AS [permissionCode],
                screen_code AS [screenCode],
                action_code AS [actionCode],
                scope_code AS [scopeCode],
                scope_config_json AS [scopeConfigJson],
                role_code AS [roleCode],
                source_type AS [sourceType]
            FROM auth.v_user_effective_permissions
            WHERE user_id = @user_id
              AND permission_code =
                  @permission_code;
        `);

    if (result.recordset.length === 0) {
        throw createHttpError(
            403,
            'Bạn không có quyền thực hiện thao tác này.',
            'PERMISSION_DENIED'
        );
    }

    const scopes = [
        ...new Set(
            result.recordset.map(
                (item) => item.scopeCode
            )
        ),
    ];

    return {
        permissionCode,
        scopes,
        grants: result.recordset,
    };
}

async function hasPermission(
    userId,
    permissionCode
) {
    try {
        await getPermissionContext(
            userId,
            permissionCode
        );

        return true;
    } catch (error) {
        if (error.statusCode === 403) {
            return false;
        }

        throw error;
    }
}

async function hasAnyPermission(
    userId,
    permissionCodes
) {
    if (
        !Array.isArray(permissionCodes) ||
        permissionCodes.length === 0
    ) {
        return null;
    }

    const pool = await getPool();
    const request = pool.request();

    request.input(
        'user_id',
        sql.BigInt,
        userId
    );

    const parameters =
        permissionCodes.map(
            (permissionCode, index) => {
                const parameterName =
                    `permission_${index}`;

                request.input(
                    parameterName,
                    sql.VarChar(200),
                    permissionCode
                );

                return `@${parameterName}`;
            }
        );

    const result =
        await request.query(`
            SELECT TOP 1
                permission_code
                    AS [permissionCode],

                screen_code
                    AS [screenCode],

                action_code
                    AS [actionCode],

                scope_code
                    AS [scopeCode],

                source_type
                    AS [sourceType]

            FROM auth.v_user_effective_permissions

            WHERE user_id = @user_id
              AND permission_code IN (
                    ${parameters.join(',')}
              );
        `);

    return result.recordset[0] || null;
}

module.exports = {
    getPermissionContext,
    hasPermission,
    hasAnyPermission,
};