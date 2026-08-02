const {
    getPool,
    sql,
} = require('../database/connection');

const {
    createHttpError,
} = require('../utils/httpError');

/**
 * Kiểm tra tài khoản tồn tại.
 */
async function ensureUserExists(
    transactionOrPool,
    userId
) {
    const request =
        transactionOrPool instanceof sql.Transaction
            ? new sql.Request(transactionOrPool)
            : transactionOrPool.request();

    const result = await request
        .input(
            'user_id',
            sql.BigInt,
            userId
        )
        .query(`
            SELECT TOP 1
                id,
                username,
                status_id AS [statusId]
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

/**
 * Chuyển giá trị ngày về Date hoặc null.
 */
function normalizeDate(
    value,
    fieldName
) {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw createHttpError(
            400,
            `${fieldName} không hợp lệ.`,
            'INVALID_ROLE_DATE'
        );
    }

    return date;
}

/**
 * Chuẩn hóa danh sách role.
 *
 * Hỗ trợ dạng đơn giản:
 * roles: [1, 2, 3]
 *
 * Hoặc dạng đầy đủ:
 * roles: [
 *   {
 *     roleId: 1,
 *     departmentCode: "IT",
 *     validFrom: null,
 *     validTo: null,
 *     note: "Gán vai trò IT"
 *   }
 * ]
 */
function normalizeRoles(roles) {
    if (!Array.isArray(roles)) {
        throw createHttpError(
            400,
            'roles phải là một mảng.',
            'INVALID_USER_ROLES'
        );
    }

    const normalizedRoles = [];
    const uniqueKeys = new Set();

    for (const item of roles) {
        const roleId = Number(
            typeof item === 'number'
                ? item
                : item?.roleId
        );

        if (
            !Number.isInteger(roleId) ||
            roleId <= 0
        ) {
            throw createHttpError(
                400,
                'ID vai trò không hợp lệ.',
                'INVALID_ROLE_ID'
            );
        }

        const departmentCode =
            typeof item === 'number'
                ? null
                : (
                    item?.departmentCode
                        ? String(
                            item.departmentCode
                        )
                            .trim()
                            .toUpperCase()
                        : null
                );

        if (
            departmentCode &&
            departmentCode.length > 32
        ) {
            throw createHttpError(
                400,
                'Mã phòng ban không được vượt quá 32 ký tự.',
                'INVALID_DEPARTMENT_CODE'
            );
        }

        const validFrom =
            typeof item === 'number'
                ? null
                : normalizeDate(
                    item?.validFrom,
                    'Ngày bắt đầu'
                );

        const validTo =
            typeof item === 'number'
                ? null
                : normalizeDate(
                    item?.validTo,
                    'Ngày kết thúc'
                );

        if (
            validFrom &&
            validTo &&
            validFrom > validTo
        ) {
            throw createHttpError(
                400,
                'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.',
                'INVALID_ROLE_VALIDITY'
            );
        }

        const note =
            typeof item === 'number'
                ? null
                : (
                    item?.note
                        ? String(item.note)
                            .trim()
                        : null
                );

        if (note && note.length > 500) {
            throw createHttpError(
                400,
                'Ghi chú không được vượt quá 500 ký tự.',
                'INVALID_ROLE_NOTE'
            );
        }

        const uniqueKey =
            `${roleId}:${departmentCode || ''}`;

        if (uniqueKeys.has(uniqueKey)) {
            continue;
        }

        uniqueKeys.add(uniqueKey);

        normalizedRoles.push({
            roleId,
            departmentCode,
            validFrom,
            validTo,
            note,
        });
    }

    return normalizedRoles;
}

/**
 * Lấy danh sách role và trạng thái
 * đã gán cho một tài khoản.
 */
async function getUserRoles(userId) {
    const id = Number(userId);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw createHttpError(
            400,
            'ID tài khoản không hợp lệ.',
            'INVALID_USER_ID'
        );
    }

    const pool = await getPool();

    const user = await ensureUserExists(
        pool,
        id
    );

    const roleResult = await pool
        .request()
        .query(`
            SELECT
                id AS [roleId],
                role_code AS [roleCode],
                role_name AS [roleName],
                description AS [description],
                role_type_code AS [roleTypeCode],
                priority_no AS [priorityNo],
                is_system_role AS [isSystemRole],
                status_id AS [statusId]
            FROM auth.roles
            WHERE status_id = 0
            ORDER BY
                priority_no,
                role_name;
        `);

    const assignmentResult = await pool
        .request()
        .input(
            'user_id',
            sql.BigInt,
            id
        )
        .query(`
            SELECT
                ur.id AS [assignmentId],
                ur.role_id AS [roleId],
                ur.department_code
                    AS [departmentCode],
                ur.valid_from AS [validFrom],
                ur.valid_to AS [validTo],
                ur.status_id AS [statusId],
                ur.assigned_by_user_id
                    AS [assignedByUserId],
                ur.assigned_at AS [assignedAt],
                ur.note AS [note]
            FROM auth.user_roles ur
            WHERE ur.user_id = @user_id
              AND ur.status_id = 0
            ORDER BY
                ur.role_id,
                ur.department_code;
        `);

    const assignmentMap = new Map();

    for (
        const assignment
        of assignmentResult.recordset
    ) {
        if (
            !assignmentMap.has(
                assignment.roleId
            )
        ) {
            assignmentMap.set(
                assignment.roleId,
                []
            );
        }

        assignmentMap
            .get(assignment.roleId)
            .push(assignment);
    }

    const roles =
        roleResult.recordset.map(
            (role) => {
                const assignments =
                    assignmentMap.get(
                        role.roleId
                    ) || [];

                return {
                    ...role,
                    isSystemRole:
                        Boolean(
                            role.isSystemRole
                        ),
                    assigned:
                        assignments.length > 0,
                    assignments,
                };
            }
        );

    return {
        user: {
            id: user.id,
            username: user.username,
            statusId: user.statusId,
        },
        roles,
    };
}

/**
 * Thay thế toàn bộ role của tài khoản.
 */
async function replaceUserRoles(
    userId,
    roles,
    currentUserId
) {
    const id = Number(userId);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw createHttpError(
            400,
            'ID tài khoản không hợp lệ.',
            'INVALID_USER_ID'
        );
    }

    const normalizedRoles =
        normalizeRoles(roles);

    const pool = await getPool();

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {
        await ensureUserExists(
            transaction,
            id
        );

        /*
         * Kiểm tra role gửi lên có tồn tại
         * và đang hoạt động hay không.
         */
        const roleResult =
            await new sql.Request(
                transaction
            )
                .query(`
                    SELECT
                        id
                    FROM auth.roles
                    WHERE status_id = 0;
                `);

        const validRoleIds = new Set(
            roleResult.recordset.map(
                (item) => Number(item.id)
            )
        );

        const invalidRoleIds =
            normalizedRoles
                .filter(
                    (item) =>
                        !validRoleIds.has(
                            item.roleId
                        )
                )
                .map(
                    (item) => item.roleId
                );

        if (invalidRoleIds.length > 0) {
            throw createHttpError(
                400,
                `Vai trò không hợp lệ hoặc đã ngừng sử dụng: ${invalidRoleIds.join(', ')}`,
                'INVALID_ROLES'
            );
        }

        /*
         * Vô hiệu hóa toàn bộ role hiện tại.
         */
        await new sql.Request(transaction)
            .input(
                'user_id',
                sql.BigInt,
                id
            )
            .query(`
                UPDATE auth.user_roles
                SET status_id = 1
                WHERE user_id = @user_id
                  AND status_id = 0;
            `);

        /*
         * Kích hoạt lại bản ghi cũ hoặc insert mới.
         */
        for (
            const role
            of normalizedRoles
        ) {
            const existingResult =
                await new sql.Request(
                    transaction
                )
                    .input(
                        'user_id',
                        sql.BigInt,
                        id
                    )
                    .input(
                        'role_id',
                        sql.Int,
                        role.roleId
                    )
                    .input(
                        'department_code',
                        sql.VarChar(32),
                        role.departmentCode
                    )
                    .query(`
                        SELECT TOP 1
                            id
                        FROM auth.user_roles
                        WHERE user_id = @user_id
                          AND role_id = @role_id
                          AND (
                                department_code =
                                    @department_code
                                OR (
                                    department_code IS NULL
                                    AND @department_code IS NULL
                                )
                          )
                        ORDER BY id DESC;
                    `);

            const existingAssignment =
                existingResult.recordset[0];

            if (existingAssignment) {
                await new sql.Request(
                    transaction
                )
                    .input(
                        'assignment_id',
                        sql.BigInt,
                        existingAssignment.id
                    )
                    .input(
                        'valid_from',
                        sql.DateTime2,
                        role.validFrom
                    )
                    .input(
                        'valid_to',
                        sql.DateTime2,
                        role.validTo
                    )
                    .input(
                        'assigned_by_user_id',
                        sql.BigInt,
                        currentUserId
                    )
                    .input(
                        'note',
                        sql.NVarChar(500),
                        role.note
                    )
                    .query(`
                        UPDATE auth.user_roles
                        SET
                            valid_from =
                                @valid_from,
                            valid_to =
                                @valid_to,
                            status_id = 0,
                            assigned_by_user_id =
                                @assigned_by_user_id,
                            assigned_at =
                                SYSDATETIME(),
                            note =
                                @note
                        WHERE id =
                              @assignment_id;
                    `);
            } else {
                await new sql.Request(
                    transaction
                )
                    .input(
                        'user_id',
                        sql.BigInt,
                        id
                    )
                    .input(
                        'role_id',
                        sql.Int,
                        role.roleId
                    )
                    .input(
                        'department_code',
                        sql.VarChar(32),
                        role.departmentCode
                    )
                    .input(
                        'valid_from',
                        sql.DateTime2,
                        role.validFrom
                    )
                    .input(
                        'valid_to',
                        sql.DateTime2,
                        role.validTo
                    )
                    .input(
                        'assigned_by_user_id',
                        sql.BigInt,
                        currentUserId
                    )
                    .input(
                        'note',
                        sql.NVarChar(500),
                        role.note
                    )
                    .query(`
                        INSERT INTO auth.user_roles (
                            user_id,
                            role_id,
                            department_code,
                            valid_from,
                            valid_to,
                            status_id,
                            assigned_by_user_id,
                            assigned_at,
                            note
                        )
                        VALUES (
                            @user_id,
                            @role_id,
                            @department_code,
                            @valid_from,
                            @valid_to,
                            0,
                            @assigned_by_user_id,
                            SYSDATETIME(),
                            @note
                        );
                    `);
            }
        }

        /*
         * Buộc tài khoản đăng nhập lại
         * để nhận role và permission mới.
         */
        await new sql.Request(transaction)
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
                UPDATE auth.users
                SET
                    token_version =
                        token_version + 1,
                    updated_by_user_id =
                        @current_user_id,
                    updated_at =
                        SYSDATETIME()
                WHERE id = @user_id;

                UPDATE auth.sessions
                SET
                    revoked_at =
                        COALESCE(
                            revoked_at,
                            SYSDATETIME()
                        ),
                    revoked_by_user_id =
                        @current_user_id,
                    revoke_reason =
                        N'Vai trò tài khoản thay đổi'
                WHERE user_id =
                      @user_id
                  AND revoked_at IS NULL;
            `);

        await transaction.commit();

        const data =
            await getUserRoles(id);

        return {
            ...data,
            updatedRoleCount:
                normalizedRoles.length,
        };
    } catch (error) {
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error(
                'Rollback user role thất bại:',
                rollbackError
            );
        }

        throw error;
    }
}

module.exports = {
    getUserRoles,
    replaceUserRoles,
};