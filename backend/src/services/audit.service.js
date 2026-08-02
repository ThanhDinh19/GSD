const {
    getPool,
    sql,
} = require('../database/connection');

const {
    createHttpError,
} = require('../utils/httpError');

function normalizePaging(
    pageValue,
    pageSizeValue
) {
    const page = Math.max(
        1,
        Number(pageValue || 1)
    );

    const pageSize = Math.min(
        100,
        Math.max(
            1,
            Number(pageSizeValue || 20)
        )
    );

    return {
        page,
        pageSize,
        offset: (page - 1) * pageSize,
    };
}

function normalizeDate(value, fieldName) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw createHttpError(
            400,
            `${fieldName} không hợp lệ.`,
            'INVALID_DATE'
        );
    }

    return date;
}

function serializeJson(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    return JSON.stringify(
        value,
        (key, currentValue) => {
            if (
                typeof currentValue ===
                'bigint'
            ) {
                return currentValue.toString();
            }

            return currentValue;
        }
    );
}

function getChangedFields(
    before,
    after
) {
    if (
        !before ||
        !after ||
        typeof before !== 'object' ||
        typeof after !== 'object'
    ) {
        return null;
    }

    const keys = new Set([
        ...Object.keys(before),
        ...Object.keys(after),
    ]);

    const changedFields = [];

    for (const key of keys) {
        const beforeValue =
            before[key];

        const afterValue =
            after[key];

        const beforeJson =
            serializeJson(beforeValue);

        const afterJson =
            serializeJson(afterValue);

        if (beforeJson !== afterJson) {
            changedFields.push({
                field: key,
                before: beforeValue,
                after: afterValue,
            });
        }
    }

    return changedFields.length > 0
        ? changedFields
        : null;
}

async function writeApplicationLog({
    requestId = null,

    userId = null,
    employeeId = null,
    username = null,

    screenCode = null,
    permissionCode = null,
    actionCode,

    entityTypeCode = null,
    entityId = null,

    documentTypeCode = null,
    documentNo = null,

    httpMethod = null,
    endpoint = null,

    success = true,
    httpStatus = 200,
    durationMs = null,

    ipAddress = null,
    userAgent = null,

    message = null,
    metadata = null,
}) {
    if (!actionCode) {
        throw createHttpError(
            400,
            'Action code của audit log là bắt buộc.',
            'AUDIT_ACTION_REQUIRED'
        );
    }

    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'request_id',
            sql.UniqueIdentifier,
            requestId
        )
        .input(
            'user_id',
            sql.BigInt,
            userId
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
            'screen_code',
            sql.VarChar(100),
            screenCode
        )
        .input(
            'permission_code',
            sql.VarChar(200),
            permissionCode
        )
        .input(
            'action_code',
            sql.VarChar(50),
            actionCode
        )
        .input(
            'entity_type_code',
            sql.VarChar(100),
            entityTypeCode
        )
        .input(
            'entity_id',
            sql.NVarChar(100),
            entityId === null ||
            entityId === undefined
                ? null
                : String(entityId)
        )
        .input(
            'document_type_code',
            sql.VarChar(100),
            documentTypeCode
        )
        .input(
            'document_no',
            sql.VarChar(100),
            documentNo
        )
        .input(
            'http_method',
            sql.VarChar(10),
            httpMethod
        )
        .input(
            'endpoint',
            sql.NVarChar(500),
            endpoint
        )
        .input(
            'success',
            sql.Bit,
            success
        )
        .input(
            'http_status',
            sql.Int,
            httpStatus
        )
        .input(
            'duration_ms',
            sql.Int,
            durationMs
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
            'message',
            sql.NVarChar(2000),
            message
        )
        .input(
            'metadata_json',
            sql.NVarChar(sql.MAX),
            serializeJson(metadata)
        )
        .query(`
            INSERT INTO audit.application_logs (
                request_id,
                occurred_at,

                user_id,
                employee_id,
                username,

                screen_code,
                permission_code,
                action_code,

                entity_type_code,
                entity_id,

                document_type_code,
                document_no,

                http_method,
                endpoint,

                success,
                http_status,
                duration_ms,

                ip_address,
                user_agent,

                message,
                metadata_json
            )
            OUTPUT
                INSERTED.id AS [id],
                INSERTED.occurred_at
                    AS [occurredAt]
            VALUES (
                @request_id,
                SYSDATETIME(),

                @user_id,
                @employee_id,
                @username,

                @screen_code,
                @permission_code,
                @action_code,

                @entity_type_code,
                @entity_id,

                @document_type_code,
                @document_no,

                @http_method,
                @endpoint,

                @success,
                @http_status,
                @duration_ms,

                @ip_address,
                @user_agent,

                @message,
                @metadata_json
            );
        `);

    return result.recordset[0];
}

async function writeDataChangeLog({
    requestId = null,
    userId = null,

    entityTypeCode,
    entityId,
    actionCode,

    before = null,
    after = null,
    changedFields = undefined,

    reason = null,
}) {
    if (!entityTypeCode) {
        throw createHttpError(
            400,
            'Loại dữ liệu thay đổi là bắt buộc.',
            'AUDIT_ENTITY_TYPE_REQUIRED'
        );
    }

    if (
        entityId === null ||
        entityId === undefined ||
        entityId === ''
    ) {
        throw createHttpError(
            400,
            'ID dữ liệu thay đổi là bắt buộc.',
            'AUDIT_ENTITY_ID_REQUIRED'
        );
    }

    const normalizedActionCode =
        String(actionCode || '')
            .trim()
            .toUpperCase();

    const allowedActions = [
        'INSERT',
        'UPDATE',
        'DELETE',
        'RESTORE',
    ];

    if (
        !allowedActions.includes(
            normalizedActionCode
        )
    ) {
        throw createHttpError(
            400,
            `Action "${normalizedActionCode}" không hợp lệ.`,
            'INVALID_AUDIT_ACTION'
        );
    }

    let normalizedChangedFields =
        changedFields;

    if (
        normalizedChangedFields ===
        undefined
    ) {
        normalizedChangedFields =
            normalizedActionCode ===
            'UPDATE'
                ? getChangedFields(
                    before,
                    after
                )
                : null;
    }

    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'request_id',
            sql.UniqueIdentifier,
            requestId
        )
        .input(
            'user_id',
            sql.BigInt,
            userId
        )
        .input(
            'entity_type_code',
            sql.VarChar(100),
            entityTypeCode
        )
        .input(
            'entity_id',
            sql.NVarChar(100),
            String(entityId)
        )
        .input(
            'action_code',
            sql.VarChar(20),
            normalizedActionCode
        )
        .input(
            'before_json',
            sql.NVarChar(sql.MAX),
            serializeJson(before)
        )
        .input(
            'after_json',
            sql.NVarChar(sql.MAX),
            serializeJson(after)
        )
        .input(
            'changed_fields_json',
            sql.NVarChar(sql.MAX),
            serializeJson(
                normalizedChangedFields
            )
        )
        .input(
            'reason',
            sql.NVarChar(1000),
            reason
        )
        .query(`
            INSERT INTO audit.data_change_logs (
                request_id,
                occurred_at,
                user_id,

                entity_type_code,
                entity_id,
                action_code,

                before_json,
                after_json,
                changed_fields_json,

                reason
            )
            OUTPUT
                INSERTED.id AS [id],
                INSERTED.occurred_at
                    AS [occurredAt]
            VALUES (
                @request_id,
                SYSDATETIME(),
                @user_id,

                @entity_type_code,
                @entity_id,
                @action_code,

                @before_json,
                @after_json,
                @changed_fields_json,

                @reason
            );
        `);

    return result.recordset[0];
}

async function writeDataChangeLog({
    requestId = null,
    userId = null,

    entityTypeCode,
    entityId,
    actionCode,

    before = null,
    after = null,
    changedFields = undefined,

    reason = null,
}) {
    if (!entityTypeCode) {
        throw createHttpError(
            400,
            'Loại dữ liệu thay đổi là bắt buộc.',
            'AUDIT_ENTITY_TYPE_REQUIRED'
        );
    }

    if (
        entityId === null ||
        entityId === undefined ||
        entityId === ''
    ) {
        throw createHttpError(
            400,
            'ID dữ liệu thay đổi là bắt buộc.',
            'AUDIT_ENTITY_ID_REQUIRED'
        );
    }

    const normalizedActionCode =
        String(actionCode || '')
            .trim()
            .toUpperCase();

    const allowedActions = [
        'INSERT',
        'UPDATE',
        'DELETE',
        'RESTORE',
    ];

    if (
        !allowedActions.includes(
            normalizedActionCode
        )
    ) {
        throw createHttpError(
            400,
            `Action "${normalizedActionCode}" không hợp lệ.`,
            'INVALID_AUDIT_ACTION'
        );
    }

    let normalizedChangedFields =
        changedFields;

    if (
        normalizedChangedFields ===
        undefined
    ) {
        normalizedChangedFields =
            normalizedActionCode ===
            'UPDATE'
                ? getChangedFields(
                    before,
                    after
                )
                : null;
    }

    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'request_id',
            sql.UniqueIdentifier,
            requestId
        )
        .input(
            'user_id',
            sql.BigInt,
            userId
        )
        .input(
            'entity_type_code',
            sql.VarChar(100),
            entityTypeCode
        )
        .input(
            'entity_id',
            sql.NVarChar(100),
            String(entityId)
        )
        .input(
            'action_code',
            sql.VarChar(20),
            normalizedActionCode
        )
        .input(
            'before_json',
            sql.NVarChar(sql.MAX),
            serializeJson(before)
        )
        .input(
            'after_json',
            sql.NVarChar(sql.MAX),
            serializeJson(after)
        )
        .input(
            'changed_fields_json',
            sql.NVarChar(sql.MAX),
            serializeJson(
                normalizedChangedFields
            )
        )
        .input(
            'reason',
            sql.NVarChar(1000),
            reason
        )
        .query(`
            INSERT INTO audit.data_change_logs (
                request_id,
                occurred_at,
                user_id,

                entity_type_code,
                entity_id,
                action_code,

                before_json,
                after_json,
                changed_fields_json,

                reason
            )
            OUTPUT
                INSERTED.id AS [id],
                INSERTED.occurred_at
                    AS [occurredAt]
            VALUES (
                @request_id,
                SYSDATETIME(),
                @user_id,

                @entity_type_code,
                @entity_id,
                @action_code,

                @before_json,
                @after_json,
                @changed_fields_json,

                @reason
            );
        `);

    return result.recordset[0];
}

async function getApplicationLogs(
    filters = {}
) {
    const pool = await getPool();

    const {
        page,
        pageSize,
        offset,
    } = normalizePaging(
        filters.page,
        filters.pageSize
    );

    const fromDate = normalizeDate(
        filters.fromDate,
        'Ngày bắt đầu'
    );

    const toDate = normalizeDate(
        filters.toDate,
        'Ngày kết thúc'
    );

    const result = await pool.request()
        .input(
            'user_id',
            sql.BigInt,
            filters.userId || null
        )
        .input(
            'action_code',
            sql.VarChar(50),
            filters.actionCode || null
        )
        .input(
            'screen_code',
            sql.VarChar(100),
            filters.screenCode || null
        )
        .input(
            'success',
            sql.Bit,
            filters.success
        )
        .input(
            'keyword',
            sql.NVarChar(200),
            filters.keyword || null
        )
        .input(
            'from_date',
            sql.DateTime2,
            fromDate
        )
        .input(
            'to_date',
            sql.DateTime2,
            toDate
        )
        .input(
            'offset',
            sql.Int,
            offset
        )
        .input(
            'page_size',
            sql.Int,
            pageSize
        )
        .query(`
            SELECT
                COUNT_BIG(1) AS [total]
            FROM audit.application_logs l
            WHERE
                (
                    @user_id IS NULL
                    OR l.user_id = @user_id
                )
                AND (
                    @action_code IS NULL
                    OR l.action_code = @action_code
                )
                AND (
                    @screen_code IS NULL
                    OR l.screen_code = @screen_code
                )
                AND (
                    @success IS NULL
                    OR l.success = @success
                )
                AND (
                    @from_date IS NULL
                    OR l.occurred_at >= @from_date
                )
                AND (
                    @to_date IS NULL
                    OR l.occurred_at <= @to_date
                )
                AND (
                    @keyword IS NULL
                    OR l.username
                       LIKE '%' + @keyword + '%'
                    OR l.message
                       LIKE '%' + @keyword + '%'
                    OR l.entity_id
                       LIKE '%' + @keyword + '%'
                    OR l.endpoint
                       LIKE '%' + @keyword + '%'
                );

            SELECT
                l.id AS [id],
                l.request_id AS [requestId],
                l.occurred_at AS [occurredAt],

                l.user_id AS [userId],
                l.employee_id AS [employeeId],
                l.username AS [username],

                l.screen_code AS [screenCode],
                l.permission_code
                    AS [permissionCode],
                l.action_code AS [actionCode],

                l.entity_type_code
                    AS [entityTypeCode],
                l.entity_id AS [entityId],

                l.http_method AS [httpMethod],
                l.endpoint AS [endpoint],
                l.success AS [success],
                l.http_status AS [httpStatus],
                l.duration_ms AS [durationMs],

                l.ip_address AS [ipAddress],
                l.user_agent AS [userAgent],
                l.message AS [message],
                l.metadata_json AS [metadataJson]

            FROM audit.application_logs l
            WHERE
                (
                    @user_id IS NULL
                    OR l.user_id = @user_id
                )
                AND (
                    @action_code IS NULL
                    OR l.action_code = @action_code
                )
                AND (
                    @screen_code IS NULL
                    OR l.screen_code = @screen_code
                )
                AND (
                    @success IS NULL
                    OR l.success = @success
                )
                AND (
                    @from_date IS NULL
                    OR l.occurred_at >= @from_date
                )
                AND (
                    @to_date IS NULL
                    OR l.occurred_at <= @to_date
                )
                AND (
                    @keyword IS NULL
                    OR l.username
                       LIKE '%' + @keyword + '%'
                    OR l.message
                       LIKE '%' + @keyword + '%'
                    OR l.entity_id
                       LIKE '%' + @keyword + '%'
                    OR l.endpoint
                       LIKE '%' + @keyword + '%'
                )

            ORDER BY l.occurred_at DESC
            OFFSET @offset ROWS
            FETCH NEXT @page_size ROWS ONLY;
        `);

    return {
        items: result.recordsets[1],
        page,
        pageSize,
        total:
            Number(
                result.recordsets[0][0]
                    ?.total || 0
            ),
    };
}

async function getDataChangeLogs(
    filters = {}
) {
    const pool = await getPool();

    const {
        page,
        pageSize,
        offset,
    } = normalizePaging(
        filters.page,
        filters.pageSize
    );

    const result = await pool.request()
        .input(
            'user_id',
            sql.BigInt,
            filters.userId || null
        )
        .input(
            'entity_type_code',
            sql.VarChar(100),
            filters.entityTypeCode || null
        )
        .input(
            'entity_id',
            sql.NVarChar(100),
            filters.entityId || null
        )
        .input(
            'action_code',
            sql.VarChar(20),
            filters.actionCode || null
        )
        .input(
            'offset',
            sql.Int,
            offset
        )
        .input(
            'page_size',
            sql.Int,
            pageSize
        )
        .query(`
            SELECT
                COUNT_BIG(1) AS [total]
            FROM audit.data_change_logs l
            WHERE
                (
                    @user_id IS NULL
                    OR l.user_id = @user_id
                )
                AND (
                    @entity_type_code IS NULL
                    OR l.entity_type_code =
                       @entity_type_code
                )
                AND (
                    @entity_id IS NULL
                    OR l.entity_id = @entity_id
                )
                AND (
                    @action_code IS NULL
                    OR l.action_code = @action_code
                );

            SELECT
                l.id AS [id],
                l.request_id AS [requestId],
                l.occurred_at AS [occurredAt],
                l.user_id AS [userId],

                l.entity_type_code
                    AS [entityTypeCode],
                l.entity_id AS [entityId],
                l.action_code AS [actionCode],

                l.before_json AS [beforeJson],
                l.after_json AS [afterJson],
                l.changed_fields_json
                    AS [changedFieldsJson],
                l.reason AS [reason]

            FROM audit.data_change_logs l
            WHERE
                (
                    @user_id IS NULL
                    OR l.user_id = @user_id
                )
                AND (
                    @entity_type_code IS NULL
                    OR l.entity_type_code =
                       @entity_type_code
                )
                AND (
                    @entity_id IS NULL
                    OR l.entity_id = @entity_id
                )
                AND (
                    @action_code IS NULL
                    OR l.action_code = @action_code
                )

            ORDER BY l.occurred_at DESC
            OFFSET @offset ROWS
            FETCH NEXT @page_size ROWS ONLY;
        `);

    return {
        items: result.recordsets[1],
        page,
        pageSize,
        total:
            Number(
                result.recordsets[0][0]
                    ?.total || 0
            ),
    };
}

async function getLoginLogs(
    filters = {}
) {
    const pool = await getPool();

    const {
        page,
        pageSize,
        offset,
    } = normalizePaging(
        filters.page,
        filters.pageSize
    );

    const result = await pool.request()
        .input(
            'user_id',
            sql.BigInt,
            filters.userId || null
        )
        .input(
            'username',
            sql.VarChar(100),
            filters.username || null
        )
        .input(
            'success',
            sql.Bit,
            filters.success
        )
        .input(
            'offset',
            sql.Int,
            offset
        )
        .input(
            'page_size',
            sql.Int,
            pageSize
        )
        .query(`
            SELECT
                COUNT_BIG(1) AS [total]
            FROM audit.login_logs l
            WHERE
                (
                    @user_id IS NULL
                    OR l.user_id = @user_id
                )
                AND (
                    @username IS NULL
                    OR l.username
                       LIKE '%' + @username + '%'
                )
                AND (
                    @success IS NULL
                    OR l.success = @success
                );

            SELECT
                l.id AS [id],
                l.user_id AS [userId],
                l.username AS [username],
                l.session_key AS [sessionKey],

                l.success AS [success],
                l.failure_reason_code
                    AS [failureReasonCode],
                l.failure_message
                    AS [failureMessage],

                l.ip_address AS [ipAddress],
                l.user_agent AS [userAgent],
                l.occurred_at AS [occurredAt]

            FROM audit.login_logs l
            WHERE
                (
                    @user_id IS NULL
                    OR l.user_id = @user_id
                )
                AND (
                    @username IS NULL
                    OR l.username
                       LIKE '%' + @username + '%'
                )
                AND (
                    @success IS NULL
                    OR l.success = @success
                )

            ORDER BY l.occurred_at DESC
            OFFSET @offset ROWS
            FETCH NEXT @page_size ROWS ONLY;
        `);

    return {
        items: result.recordsets[1],
        page,
        pageSize,
        total:
            Number(
                result.recordsets[0][0]
                    ?.total || 0
            ),
    };
}

module.exports = {
    writeApplicationLog,
    writeDataChangeLog,

    getApplicationLogs,
    getDataChangeLogs,
    getLoginLogs,
}