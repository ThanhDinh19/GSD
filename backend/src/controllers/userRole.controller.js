const userRoleService =
    require('../services/userRole.service');

const auditService =
    require('../services/audit.service');

const {
    parsePositiveId,
} = require('../utils/validation');

const {
    getRequestId,
    getIpAddress,
    getUserAgent,
} = require('../utils/requestContext');

async function getUserRoles(
    req,
    res,
    next
) {
    try {
        const userId = parsePositiveId(
            req.params.userId,
            'ID tài khoản'
        );

        const data =
            await userRoleService
                .getUserRoles(userId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function updateUserRoles(
    req,
    res,
    next
) {
    try {
        const userId = parsePositiveId(
            req.params.userId,
            'ID tài khoản'
        );

        const before =
            await userRoleService
                .getUserRoles(userId);

        const data =
            await userRoleService
                .replaceUserRoles(
                    userId,
                    req.body.roles,
                    req.user.id
                );

        await auditService.writeDataChangeLog({
            requestId: getRequestId(req),
            userId: req.user.id,
            entityTypeCode: 'USER_ROLE',
            entityId: userId,
            actionCode: 'UPDATE',
            before,
            after: data,
            reason:
                req.body.reason ||
                'Cập nhật vai trò tài khoản.',
        });

        await auditService.writeApplicationLog({
            requestId: getRequestId(req),
            userId: req.user.id,
            employeeId:
                req.user.employeeId || null,
            username:
                req.user.username || null,

            screenCode: 'SYSTEM.USERS',
            permissionCode:
                'SYSTEM.USERS.UPDATE',
            actionCode: 'UPDATE_ROLE',

            entityTypeCode: 'AUTH_USER',
            entityId: userId,

            httpMethod: req.method,
            endpoint: req.originalUrl,

            success: true,
            httpStatus: 200,

            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),

            message:
                'Cập nhật vai trò cho tài khoản.',
        });

        return res.status(200).json({
            success: true,
            message:
                'Cập nhật vai trò tài khoản thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUserRoles,
    updateUserRoles,
};