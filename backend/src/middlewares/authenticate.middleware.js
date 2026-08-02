const authService =
    require('../services/auth.service');

const tokenService =
    require('../services/token.service');

function getBearerToken(req) {
    const authorization =
        req.headers.authorization;

    if (!authorization) {
        return null;
    }

    const [scheme, token] =
        authorization.split(' ');

    if (
        scheme !== 'Bearer' ||
        !token
    ) {
        return null;
    }

    return token;
}

async function authenticate(
    req,
    res,
    next
) {
    try {
        const token =
            getBearerToken(req);

        if (!token) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        'Bạn chưa đăng nhập.',
                });
        }

        const payload =
            tokenService.verifyAccessToken(
                token
            );

        const userId =
            Number(payload.sub);

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        'Access token không hợp lệ.',
                });
        }

        const user =
            await authService
                .getActiveUserById(
                    userId
                );

        if (
            Number(payload.tokenVersion) !==
            Number(user.tokenVersion)
        ) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        'Phiên đăng nhập đã bị thu hồi.',
                });
        }

        req.user = {
            id: user.id,
            username: user.username,
            employeeId:
                user.employeeId,
            employeeCode:
                user.employeeCode,
            fullName:
                user.fullName,
            departmentCode:
                user.departmentCode,
        };

        next();
    } catch (error) {
        console.error(
            'authenticate error:',
            error
        );

        return res
            .status(401)
            .json({
                success: false,
                message:
                    'Access token hết hạn hoặc không hợp lệ.',
            });
    }
}

module.exports = {
    authenticate,
};