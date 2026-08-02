const rolePermissionService =
    require(
        '../services/rolePermission.service'
    );

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

async function getRolePermissions(
    req,
    res,
    next
) {
    try {
        const roleId = parsePositiveId(
            req.params.roleId,
            'ID vai trò'
        );

        const data =
            await rolePermissionService
                .getRolePermissions(roleId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function updateRolePermissions(
    req,
    res,
    next
) {
    try {
        const roleId = parsePositiveId(
            req.params.roleId,
            'ID vai trò'
        );

        const before =
            await rolePermissionService
                .getRolePermissions(roleId);

        const data =
            await rolePermissionService
                .replaceRolePermissions(
                    roleId,
                    req.body.permissions,
                    req.user.id
                );

        await auditService.writeDataChangeLog({
            requestId: getRequestId(req),
            userId: req.user.id,
            entityTypeCode:
                'ROLE_PERMISSION',
            entityId: roleId,
            actionCode: 'UPDATE',
            before,
            after: data,
            reason:
                req.body.reason ||
                'Cập nhật quyền cho vai trò.',
        });

        await auditService.writeApplicationLog({
            requestId: getRequestId(req),
            userId: req.user.id,
            employeeId:
                req.user.employeeId || null,
            username:
                req.user.username || null,

            screenCode: 'SYSTEM.ROLES',
            permissionCode:
                'SYSTEM.ROLES.MANAGE',
            actionCode:
                'UPDATE_PERMISSION',

            entityTypeCode: 'ROLE',
            entityId: roleId,

            httpMethod: req.method,
            endpoint: req.originalUrl,

            success: true,
            httpStatus: 200,

            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),

            message:
                'Cập nhật quyền và phạm vi dữ liệu cho vai trò.',
        });

        return res.status(200).json({
            success: true,
            message:
                'Cập nhật quyền vai trò thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRolePermissions,
    updateRolePermissions,
};