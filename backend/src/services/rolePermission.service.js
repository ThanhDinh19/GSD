const {
    getPool,
    sql,
} = require('../database/connection');

const {
    createHttpError,
} = require('../utils/httpError');

/**
 * Kiểm tra role tồn tại.
 */
async function ensureRoleExists(
    transactionOrPool,
    roleId
) {
    const request =
        transactionOrPool instanceof sql.Transaction
            ? new sql.Request(transactionOrPool)
            : transactionOrPool.request();

    const result = await request
        .input(
            'role_id',
            sql.Int,
            roleId
        )
        .query(`
            SELECT TOP 1
                id,
                role_code AS [roleCode],
                role_name AS [roleName],
                description AS [description],
                role_type_code AS [roleTypeCode],
                priority_no AS [priorityNo],
                is_system_role AS [isSystemRole],
                status_id AS [statusId]
            FROM auth.roles
            WHERE id = @role_id;
        `);

    const role = result.recordset[0];

    if (!role) {
        throw createHttpError(
            404,
            'Không tìm thấy vai trò.',
            'ROLE_NOT_FOUND'
        );
    }

    return role;
}

/**
 * Chuẩn hóa danh sách permission gửi từ frontend.
 *
 * Hỗ trợ:
 * [
 *   {
 *     permissionId: 1,
 *     scopeCode: 'ALL'
 *   }
 * ]
 */
function normalizePermissions(permissions) {
    if (!Array.isArray(permissions)) {
        throw createHttpError(
            400,
            'permissions phải là một mảng.',
            'INVALID_ROLE_PERMISSIONS'
        );
    }

    const normalized = [];
    const uniqueKeys = new Set();

    for (const item of permissions) {
        const permissionId = Number(
            typeof item === 'number'
                ? item
                : item?.permissionId
        );

        const scopeCode = String(
            typeof item === 'number'
                ? 'ALL'
                : item?.scopeCode || 'ALL'
        )
            .trim()
            .toUpperCase();

        if (
            !Number.isInteger(permissionId) ||
            permissionId <= 0
        ) {
            throw createHttpError(
                400,
                'Permission ID không hợp lệ.',
                'INVALID_PERMISSION_ID'
            );
        }

        const uniqueKey =
            `${permissionId}:${scopeCode}`;

        if (uniqueKeys.has(uniqueKey)) {
            continue;
        }

        uniqueKeys.add(uniqueKey);

        normalized.push({
            permissionId,
            scopeCode,
        });
    }

    return normalized;
}

/**
 * Lấy ma trận quyền của role.
 */
async function getRolePermissions(roleId) {
    const id = Number(roleId);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw createHttpError(
            400,
            'ID vai trò không hợp lệ.',
            'INVALID_ROLE_ID'
        );
    }

    const pool = await getPool();

    const role = await ensureRoleExists(
        pool,
        id
    );

    const result = await pool
        .request()
        .input(
            'role_id',
            sql.Int,
            id
        )
        .query(`
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
                        WHEN assigned.id IS NULL
                            THEN 0
                        ELSE 1
                    END
                    AS BIT
                ) AS [assigned],

                assigned.scope_code AS [scopeCode]

            FROM auth.permissions p

            INNER JOIN app.screens s
                ON s.id = p.screen_id

            INNER JOIN app.modules m
                ON m.id = s.module_id

            INNER JOIN app.actions a
                ON a.id = p.action_id

            OUTER APPLY (
                SELECT TOP 1
                    rp.id,
                    rp.scope_code
                FROM auth.role_permissions rp
                WHERE rp.role_id = @role_id
                  AND rp.permission_id = p.id
                  AND rp.status_id = 0
                ORDER BY
                    CASE
                        WHEN rp.scope_code = 'ALL'
                            THEN 0
                        ELSE 1
                    END,
                    rp.id DESC
            ) assigned

            WHERE p.status_id = 0
              AND s.status_id = 0
              AND m.status_id = 0
              AND a.status_id = 0

            ORDER BY
                m.sort_order,
                m.module_name,
                s.sort_order,
                s.screen_name,
                a.sort_order,
                a.action_name;
        `);

    const moduleMap = new Map();

    for (const row of result.recordset) {
        if (!moduleMap.has(row.moduleId)) {
            moduleMap.set(row.moduleId, {
                moduleId: row.moduleId,
                moduleCode: row.moduleCode,
                moduleName: row.moduleName,
                moduleSortOrder:
                    row.moduleSortOrder,
                screens: [],
            });
        }

        const moduleItem =
            moduleMap.get(row.moduleId);

        let screenItem =
            moduleItem.screens.find(
                (screen) =>
                    screen.screenId ===
                    row.screenId
            );

        if (!screenItem) {
            screenItem = {
                screenId: row.screenId,
                screenCode: row.screenCode,
                screenName: row.screenName,
                routePath: row.routePath,
                screenSortOrder:
                    row.screenSortOrder,
                actions: [],
            };

            moduleItem.screens.push(
                screenItem
            );
        }

        screenItem.actions.push({
            actionId: row.actionId,
            actionCode: row.actionCode,
            actionName: row.actionName,
            actionGroupCode:
                row.actionGroupCode,
            actionSortOrder:
                row.actionSortOrder,

            permissionId:
                row.permissionId,
            permissionCode:
                row.permissionCode,
            permissionName:
                row.permissionName,
            isSensitive:
                Boolean(row.isSensitive),

            assigned:
                Boolean(row.assigned),

            scopeCode:
                row.scopeCode || 'ALL',
        });
    }

    return {
        role: {
            id: role.id,
            roleCode: role.roleCode,
            roleName: role.roleName,
            description: role.description,
            roleTypeCode:
                role.roleTypeCode,
            priorityNo:
                role.priorityNo,
            isSystemRole:
                Boolean(role.isSystemRole),
            statusId:
                role.statusId,
        },
        modules:
            Array.from(
                moduleMap.values()
            ),
    };
}

/**
 * Thay thế toàn bộ permission của role.
 */
async function replaceRolePermissions(
    roleId,
    permissions,
    currentUserId
) {
    const id = Number(roleId);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw createHttpError(
            400,
            'ID vai trò không hợp lệ.',
            'INVALID_ROLE_ID'
        );
    }

    const normalizedPermissions =
        normalizePermissions(permissions);

    const pool = await getPool();

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {
        const role =
            await ensureRoleExists(
                transaction,
                id
            );

        if (role.statusId !== 0) {
            throw createHttpError(
                400,
                'Vai trò đang ngừng sử dụng.',
                'ROLE_INACTIVE'
            );
        }

        /*
         * Kiểm tra scope hợp lệ.
         */
        const scopeResult =
            await new sql.Request(
                transaction
            ).query(`
                SELECT
                    scope_code AS [scopeCode]
                FROM auth.scope_types
                WHERE status_id = 0;
            `);

        const validScopes = new Set(
            scopeResult.recordset.map(
                (item) =>
                    String(
                        item.scopeCode
                    ).toUpperCase()
            )
        );

        for (
            const item
            of normalizedPermissions
        ) {
            if (
                !validScopes.has(
                    item.scopeCode
                )
            ) {
                throw createHttpError(
                    400,
                    `Scope không hợp lệ: ${item.scopeCode}`,
                    'INVALID_PERMISSION_SCOPE'
                );
            }
        }

        /*
         * Lấy toàn bộ permission đang hoạt động
         * để kiểm tra ID gửi lên.
         */
        const permissionResult =
            await new sql.Request(
                transaction
            ).query(`
                SELECT
                    p.id
                FROM auth.permissions p

                INNER JOIN app.screens s
                    ON s.id = p.screen_id

                INNER JOIN app.modules m
                    ON m.id = s.module_id

                INNER JOIN app.actions a
                    ON a.id = p.action_id

                WHERE p.status_id = 0
                  AND s.status_id = 0
                  AND m.status_id = 0
                  AND a.status_id = 0;
            `);

        const validPermissionIds =
            new Set(
                permissionResult
                    .recordset
                    .map(
                        (item) =>
                            Number(item.id)
                    )
            );

        const invalidPermissionIds =
            normalizedPermissions
                .filter(
                    (item) =>
                        !validPermissionIds.has(
                            item.permissionId
                        )
                )
                .map(
                    (item) =>
                        item.permissionId
                );

        if (
            invalidPermissionIds.length > 0
        ) {
            throw createHttpError(
                400,
                `Permission không hợp lệ: ${invalidPermissionIds.join(', ')}`,
                'INVALID_PERMISSIONS'
            );
        }

        /*
         * Lưu user đang bị ảnh hưởng trước khi
         * cập nhật quyền role.
         */


        /*
         * Vô hiệu hóa toàn bộ quyền hiện tại.
         */
        await new sql.Request(transaction)
            .input(
                'role_id',
                sql.Int,
                id
            )
            .query(`
                UPDATE auth.role_permissions
                SET status_id = 1
                WHERE role_id = @role_id
                  AND status_id = 0;
            `);

        /*
         * Kích hoạt lại dòng cũ hoặc insert mới.
         */
        for (
            const item
            of normalizedPermissions
        ) {
            await new sql.Request(
                transaction
            )
                .input(
                    'role_id',
                    sql.Int,
                    id
                )
                .input(
                    'permission_id',
                    sql.BigInt,
                    item.permissionId
                )
                .input(
                    'scope_code',
                    sql.VarChar(30),
                    item.scopeCode
                )
                .input(
                    'current_user_id',
                    sql.BigInt,
                    currentUserId
                )
                .query(`
                    UPDATE auth.role_permissions
                    SET
                        status_id = 0,
                        granted_by_user_id =
                            @current_user_id,
                        granted_at =
                            SYSDATETIME()
                    WHERE role_id =
                          @role_id
                      AND permission_id =
                          @permission_id
                      AND scope_code =
                          @scope_code;

                    IF @@ROWCOUNT = 0
                    BEGIN
                        INSERT INTO auth.role_permissions (
                            role_id,
                            permission_id,
                            scope_code,
                            status_id,
                            granted_by_user_id,
                            granted_at
                        )
                        VALUES (
                            @role_id,
                            @permission_id,
                            @scope_code,
                            0,
                            @current_user_id,
                            SYSDATETIME()
                        );
                    END;
                `);
        }

        /*
         * Buộc tất cả user thuộc role đăng nhập lại.
         */
        const affectedResult =
            await new sql.Request(transaction)
                .input(
                    'role_id',
                    sql.Int,
                    id
                )
                .input(
                    'current_user_id',
                    sql.BigInt,
                    currentUserId
                )
                .query(`
      DECLARE @affected_users TABLE (
        user_id BIGINT PRIMARY KEY
      );

      INSERT INTO @affected_users (
        user_id
      )
      SELECT DISTINCT
        ur.user_id
      FROM auth.user_roles ur

      INNER JOIN auth.users u
        ON u.id = ur.user_id

      WHERE ur.role_id = @role_id
        AND ur.status_id = 0
        AND u.status_id = 0
        AND (
          ur.valid_from IS NULL
          OR ur.valid_from <= SYSDATETIME()
        )
        AND (
          ur.valid_to IS NULL
          OR ur.valid_to >= SYSDATETIME()
        );

      UPDATE u
      SET
        u.token_version =
          u.token_version + 1,
        u.updated_by_user_id =
          @current_user_id,
        u.updated_at =
          SYSDATETIME()
      FROM auth.users u

      INNER JOIN @affected_users affected
        ON affected.user_id = u.id;

      UPDATE s
      SET
        s.revoked_at =
          COALESCE(
            s.revoked_at,
            SYSDATETIME()
          ),
        s.revoked_by_user_id =
          @current_user_id,
        s.revoke_reason =
          N'Quyền vai trò thay đổi'
      FROM auth.sessions s

      INNER JOIN @affected_users affected
        ON affected.user_id = s.user_id

      WHERE s.revoked_at IS NULL;

      SELECT
        COUNT(*) AS [affectedUserCount]
      FROM @affected_users;
    `);


        const affectedUserCount =
            Number(
                affectedResult.recordset[0]
                    ?.affectedUserCount || 0
            );

        await transaction.commit();

        const data =
            await getRolePermissions(id);

        return {
            ...data,
            updatedPermissionCount:
                normalizedPermissions.length,
            affectedUserCount,
        };
    } catch (error) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error(
                'Rollback role permission thất bại:',
                rollbackError
            );
        }

        throw error;
    }
}

module.exports = {
    getRolePermissions,
    replaceRolePermissions,
};