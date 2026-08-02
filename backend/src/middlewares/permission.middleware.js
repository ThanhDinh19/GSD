const authorizationService =
    require('../services/authorization.service');

function requirePermission(
    permissionCode
) {
    return async function (
        req,
        res,
        next
    ) {
        try {
            if (!req.user?.id) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message:
                            'Bạn chưa đăng nhập.',
                        code:
                            'UNAUTHENTICATED',
                    });
            }

            const permissionContext =
                await authorizationService
                    .getPermissionContext(
                        Number(req.user.id),
                        permissionCode
                    );

            req.authorization = {
                permissionCode,
                scopes:
                    permissionContext.scopes,
                grants:
                    permissionContext.grants,
            };

            return next();
        } catch (error) {
            if (
                error.statusCode === 403 ||
                error.status === 403
            ) {
                return res
                    .status(403)
                    .json({
                        success: false,
                        message:
                            error.message,
                        code:
                            error.code ||
                            'PERMISSION_DENIED',
                    });
            }

            return next(error);
        }
    };
}

module.exports = {
    requirePermission,
};