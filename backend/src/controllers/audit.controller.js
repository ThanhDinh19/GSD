const auditService =
    require('../services/audit.service');

const {
    createHttpError,
} = require('../utils/httpError');

function parseOptionalBoolean(value) {
    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {
        return null;
    }

    if (
        value === true ||
        value === 'true' ||
        value === '1' ||
        value === 1
    ) {
        return true;
    }

    if (
        value === false ||
        value === 'false' ||
        value === '0' ||
        value === 0
    ) {
        return false;
    }

    throw createHttpError(
        400,
        'Giá trị success không hợp lệ.',
        'INVALID_BOOLEAN'
    );
}

function parseOptionalId(value) {
    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {
        return null;
    }

    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        throw createHttpError(
            400,
            'ID lọc không hợp lệ.',
            'INVALID_ID'
        );
    }

    return id;
}

async function getApplicationLogs(
    req,
    res,
    next
) {
    try {
        const data =
            await auditService
                .getApplicationLogs({
                    page: req.query.page,
                    pageSize:
                        req.query.pageSize,

                    userId:
                        parseOptionalId(
                            req.query.userId
                        ),

                    actionCode:
                        req.query.actionCode ||
                        null,

                    screenCode:
                        req.query.screenCode ||
                        null,

                    success:
                        parseOptionalBoolean(
                            req.query.success
                        ),

                    keyword:
                        req.query.keyword ||
                        null,

                    fromDate:
                        req.query.fromDate ||
                        null,

                    toDate:
                        req.query.toDate ||
                        null,
                });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function getDataChangeLogs(
    req,
    res,
    next
) {
    try {
        const data =
            await auditService
                .getDataChangeLogs({
                    page: req.query.page,
                    pageSize:
                        req.query.pageSize,

                    userId:
                        parseOptionalId(
                            req.query.userId
                        ),

                    entityTypeCode:
                        req.query
                            .entityTypeCode ||
                        null,

                    entityId:
                        req.query.entityId ||
                        null,

                    actionCode:
                        req.query.actionCode ||
                        null,
                });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function getLoginLogs(
    req,
    res,
    next
) {
    try {
        const data =
            await auditService
                .getLoginLogs({
                    page: req.query.page,
                    pageSize:
                        req.query.pageSize,

                    userId:
                        parseOptionalId(
                            req.query.userId
                        ),

                    username:
                        req.query.username ||
                        null,

                    success:
                        parseOptionalBoolean(
                            req.query.success
                        ),
                });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getApplicationLogs,
    getDataChangeLogs,
    getLoginLogs,
};