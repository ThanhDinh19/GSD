const userService =
    require('../services/user.service');

const auditService =
    require('../services/audit.service');

const {
    parsePositiveId,
} = require('../utils/validation');

const {
    createHttpError,
} = require('../utils/httpError');

const {
    getRequestId,
    getIpAddress,
    getUserAgent,
} = require('../utils/requestContext');

function getAuditContext(req) {
    return {
        requestId: getRequestId(req),
        userId: req.user?.id || null,
        employeeId:
            req.user?.employeeId || null,
        username:
            req.user?.username || null,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        endpoint: req.originalUrl,
        httpMethod: req.method,
    };
}

async function writeUserAudit(
    req,
    {
        actionCode,
        entityId,
        permissionCode,
        before = null,
        after = null,
        message = null,
    }
) {
    const context = getAuditContext(req);

    await auditService.writeApplicationLog({
        ...context,
        screenCode: 'SYSTEM.USERS',
        permissionCode,
        actionCode,
        entityTypeCode: 'AUTH_USER',
        entityId,
        success: true,
        httpStatus: 200,
        message,
    });

    if (
        ['INSERT', 'UPDATE'].includes(
            actionCode
        )
    ) {
        await auditService.writeDataChangeLog({
            requestId: context.requestId,
            userId: context.userId,
            entityTypeCode: 'AUTH_USER',
            entityId,
            actionCode,
            before,
            after,
            reason: message,
        });
    }
}

async function getUsers(req, res, next) {
    try {
        const data =
            await userService.getUsers();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function getUserById(
    req,
    res,
    next
) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID tài khoản'
        );

        const data =
            await userService.getUserById(id);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function createUser(req, res, next) {
    try {
        const data = await userService.createUser(
            req.body,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}



async function updateUser(
    req,
    res,
    next
) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID tài khoản'
        );

        const before =
            await userService.getUserById(id);

        const data =
            await userService.updateUser(
                id,
                req.body,
                req.user.id
            );

        await writeUserAudit(req, {
            actionCode: 'UPDATE',
            entityId: id,
            permissionCode:
                'SYSTEM.USERS.UPDATE',
            before,
            after: data,
            message:
                'Cập nhật tài khoản.',
        });

        return res.status(200).json({
            success: true,
            message:
                'Cập nhật tài khoản thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function lockUser(
    req,
    res,
    next
) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID tài khoản'
        );

        if (id === Number(req.user.id)) {
            throw createHttpError(
                400,
                'Bạn không thể tự khóa tài khoản đang đăng nhập.',
                'CANNOT_LOCK_CURRENT_USER'
            );
        }

        const before =
            await userService.getUserById(id);

        const data =
            await userService.setUserLock(
                id,
                true,
                req.user.id
            );

        await writeUserAudit(req, {
            actionCode: 'UPDATE',
            entityId: id,
            permissionCode:
                'SYSTEM.USERS.LOCK',
            before,
            after: data,
            message:
                'Khóa tài khoản.',
        });

        return res.status(200).json({
            success: true,
            message:
                'Khóa tài khoản thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function unlockUser(
    req,
    res,
    next
) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID tài khoản'
        );

        const before =
            await userService.getUserById(id);

        const data =
            await userService.setUserLock(
                id,
                false,
                req.user.id
            );

        await writeUserAudit(req, {
            actionCode: 'UPDATE',
            entityId: id,
            permissionCode:
                'SYSTEM.USERS.LOCK',
            before,
            after: data,
            message:
                'Mở khóa tài khoản.',
        });

        return res.status(200).json({
            success: true,
            message:
                'Mở khóa tài khoản thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function resetPassword(
    req,
    res,
    next
) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID tài khoản'
        );

        const newPassword =
            String(
                req.body.newPassword ||
                req.body.new_password ||
                ''
            );

        const data =
            await userService.resetPassword(
                id,
                newPassword,
                req.user.id
            );

        /*
         * Tuyệt đối không ghi mật khẩu
         * hoặc password hash vào audit.
         */
        await writeUserAudit(req, {
            actionCode: 'UPDATE',
            entityId: id,
            permissionCode:
                'SYSTEM.USERS.RESET_PASSWORD',
            after: {
                mustChangePassword: true,
                sessionsRevoked: true,
            },
            message:
                'Đặt lại mật khẩu tài khoản.',
        });

        return res.status(200).json({
            success: true,
            message:
                'Đặt lại mật khẩu thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function revokeSessions(
    req,
    res,
    next
) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID tài khoản'
        );

        const data =
            await userService.revokeSessions(
                id,
                req.user.id
            );

        await auditService.writeApplicationLog({
            ...getAuditContext(req),
            screenCode: 'SYSTEM.USERS',
            permissionCode:
                'SYSTEM.USERS.LOCK',
            actionCode: 'REVOKE_SESSION',
            entityTypeCode: 'AUTH_USER',
            entityId: id,
            success: true,
            httpStatus: 200,
            message:
                'Thu hồi toàn bộ phiên đăng nhập.',
        });

        return res.status(200).json({
            success: true,
            message:
                'Thu hồi phiên đăng nhập thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    lockUser,
    unlockUser,
    resetPassword,
    revokeSessions,
};
