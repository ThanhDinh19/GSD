const {
    getPool,
    sql,
} = require('../database/connection');

const {
    createHttpError,
} = require('../utils/httpError');

async function getRoles() {
    const pool = await getPool();

    const result = await pool
        .request()
        .query(`
            SELECT
                r.id AS [id],
                r.role_code AS [roleCode],
                r.role_name AS [roleName],
                r.description AS [description],
                r.role_type_code
                    AS [roleTypeCode],
                r.priority_no
                    AS [priorityNo],
                r.is_system_role
                    AS [isSystemRole],
                r.status_id
                    AS [statusId],
                COUNT(DISTINCT ur.user_id)
                    AS [userCount],
                COUNT(DISTINCT rp.permission_id)
                    AS [permissionCount]
            FROM auth.roles r

            LEFT JOIN auth.user_roles ur
                ON ur.role_id = r.id
               AND ur.status_id = 0

            LEFT JOIN auth.role_permissions rp
                ON rp.role_id = r.id
               AND rp.status_id = 0

            GROUP BY
                r.id,
                r.role_code,
                r.role_name,
                r.description,
                r.role_type_code,
                r.priority_no,
                r.is_system_role,
                r.status_id

            ORDER BY
                r.priority_no,
                r.role_name;
        `);

    return result.recordset;
}

async function getRoleById(id) {
    const pool = await getPool();

    const roleResult = await pool
        .request()
        .input('id', sql.Int, id)
        .query(`
            SELECT TOP 1
                id AS [id],
                role_code AS [roleCode],
                role_name AS [roleName],
                description AS [description],
                role_type_code
                    AS [roleTypeCode],
                priority_no
                    AS [priorityNo],
                is_system_role
                    AS [isSystemRole],
                status_id
                    AS [statusId]
            FROM auth.roles
            WHERE id = @id;
        `);

    const role = roleResult.recordset[0];

    if (!role) {
        throw createHttpError(
            404,
            'Không tìm thấy vai trò.'
        );
    }

    return role;
}

async function createRole(
    payload,
    currentUserId
) {
    const roleCode =
        String(payload.roleCode || '')
            .trim()
            .toUpperCase();

    const roleName =
        String(payload.roleName || '')
            .trim();

    if (!roleCode || !roleName) {
        throw createHttpError(
            400,
            'Mã và tên vai trò là bắt buộc.'
        );
    }

    const pool = await getPool();

    const duplicate = await pool
        .request()
        .input(
            'role_code',
            sql.VarChar(100),
            roleCode
        )
        .query(`
            SELECT TOP 1 id
            FROM auth.roles
            WHERE role_code =
                  @role_code;
        `);

    if (duplicate.recordset.length > 0) {
        throw createHttpError(
            400,
            'Mã vai trò đã tồn tại.'
        );
    }

    const result = await pool
        .request()
        .input(
            'role_code',
            sql.VarChar(100),
            roleCode
        )
        .input(
            'role_name',
            sql.NVarChar(200),
            roleName
        )
        .input(
            'description',
            sql.NVarChar(1000),
            payload.description || null
        )
        .input(
            'role_type_code',
            sql.VarChar(30),
            payload.roleTypeCode ||
            'BUSINESS'
        )
        .input(
            'priority_no',
            sql.Int,
            Number(payload.priorityNo || 100)
        )
        .input(
            'created_by_user_id',
            sql.BigInt,
            currentUserId
        )
        .query(`
            INSERT INTO auth.roles (
                role_code,
                role_name,
                description,
                role_type_code,
                priority_no,
                is_system_role,
                status_id,
                created_by_user_id
            )
            OUTPUT INSERTED.id
            VALUES (
                @role_code,
                @role_name,
                @description,
                @role_type_code,
                @priority_no,
                0,
                0,
                @created_by_user_id
            );
        `);

    return getRoleById(
        result.recordset[0].id
    );
}

async function deactivateRole(
    id,
    currentUserId
) {
    const pool = await getPool();
    const role = await getRoleById(id);

    if (role.isSystemRole) {
        throw createHttpError(
            400,
            'Không thể xóa vai trò hệ thống.'
        );
    }

    await pool
        .request()
        .input('id', sql.Int, id)
        .input(
            'current_user_id',
            sql.BigInt,
            currentUserId
        )
        .query(`
            UPDATE auth.roles
            SET
                status_id = 1,
                updated_by_user_id =
                    @current_user_id,
                updated_at =
                    SYSDATETIME()
            WHERE id = @id;

            UPDATE auth.user_roles
            SET status_id = 1
            WHERE role_id = @id;

            UPDATE auth.role_permissions
            SET status_id = 1
            WHERE role_id = @id;
        `);

    return {
        id,
        statusId: 1,
    };
}

async function updateRole(
    id,
    payload,
    currentUserId
) {
    const pool = await getPool();

    const currentRole =
        await getRoleById(id);

    let roleCode = String(
        payload.roleCode ??
        payload.role_code ??
        currentRole.roleCode
    )
        .trim()
        .toUpperCase();

    const roleName = String(
        payload.roleName ??
        payload.role_name ??
        currentRole.roleName
    ).trim();

    const description =
        payload.description !== undefined
            ? (
                payload.description
                    ? String(
                        payload.description
                    ).trim()
                    : null
            )
            : currentRole.description;

    let roleTypeCode = String(
        payload.roleTypeCode ??
        payload.role_type_code ??
        currentRole.roleTypeCode
    )
        .trim()
        .toUpperCase();

    const priorityNo = Number(
        payload.priorityNo ??
        payload.priority_no ??
        currentRole.priorityNo
    );

    let statusId = Number(
        payload.statusId ??
        payload.status_id ??
        currentRole.statusId
    );

    if (!roleCode) {
        throw createHttpError(
            400,
            'Mã vai trò là bắt buộc.',
            'ROLE_CODE_REQUIRED'
        );
    }

    if (!roleName) {
        throw createHttpError(
            400,
            'Tên vai trò là bắt buộc.',
            'ROLE_NAME_REQUIRED'
        );
    }

    const allowedRoleTypes = [
        'SYSTEM',
        'BUSINESS',
        'WORKFLOW',
        'TEMPORARY',
    ];

    if (
        !allowedRoleTypes.includes(
            roleTypeCode
        )
    ) {
        throw createHttpError(
            400,
            'Loại vai trò không hợp lệ.',
            'INVALID_ROLE_TYPE'
        );
    }

    if (
        !Number.isInteger(priorityNo) ||
        priorityNo < 0
    ) {
        throw createHttpError(
            400,
            'Độ ưu tiên vai trò không hợp lệ.',
            'INVALID_ROLE_PRIORITY'
        );
    }

    if (![0, 1].includes(statusId)) {
        throw createHttpError(
            400,
            'Trạng thái vai trò không hợp lệ.',
            'INVALID_ROLE_STATUS'
        );
    }

    /*
     * Role hệ thống không được:
     * - đổi mã
     * - đổi loại
     * - ngừng sử dụng
     */
    if (currentRole.isSystemRole) {
        roleCode =
            currentRole.roleCode;

        roleTypeCode =
            currentRole.roleTypeCode;

        statusId =
            currentRole.statusId;
    }

    const duplicateResult =
        await pool
            .request()
            .input(
                'id',
                sql.Int,
                id
            )
            .input(
                'role_code',
                sql.VarChar(100),
                roleCode
            )
            .query(`
                SELECT TOP 1 id
                FROM auth.roles
                WHERE role_code =
                      @role_code
                  AND id <> @id;
            `);

    if (
        duplicateResult.recordset.length > 0
    ) {
        throw createHttpError(
            400,
            `Mã vai trò "${roleCode}" đã tồn tại.`,
            'ROLE_CODE_EXISTS'
        );
    }

    await pool
        .request()
        .input(
            'id',
            sql.Int,
            id
        )
        .input(
            'role_code',
            sql.VarChar(100),
            roleCode
        )
        .input(
            'role_name',
            sql.NVarChar(200),
            roleName
        )
        .input(
            'description',
            sql.NVarChar(1000),
            description
        )
        .input(
            'role_type_code',
            sql.VarChar(30),
            roleTypeCode
        )
        .input(
            'priority_no',
            sql.Int,
            priorityNo
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
            UPDATE auth.roles
            SET
                role_code =
                    @role_code,

                role_name =
                    @role_name,

                description =
                    @description,

                role_type_code =
                    @role_type_code,

                priority_no =
                    @priority_no,

                status_id =
                    @status_id,

                updated_by_user_id =
                    @updated_by_user_id,

                updated_at =
                    SYSDATETIME()

            WHERE id = @id;
        `);

    /*
     * Khi role bị ngừng sử dụng,
     * vô hiệu hóa các quan hệ liên quan.
     */
    if (statusId !== 0) {
        await pool
            .request()
            .input(
                'role_id',
                sql.Int,
                id
            )
            .query(`
                UPDATE auth.user_roles
                SET status_id = 1
                WHERE role_id =
                      @role_id;

                UPDATE auth.role_permissions
                SET status_id = 1
                WHERE role_id =
                      @role_id;
            `);
    }

    return getRoleById(id);
}

module.exports = {
    getRoles,
    getRoleById,
    createRole,
    deactivateRole,
    updateRole,
};