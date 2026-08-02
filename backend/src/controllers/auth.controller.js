const authService =
    require('../services/auth.service');

const authConfig =
    require('../config/auth.config');

function getIpAddress(req) {
    const forwarded =
        req.headers['x-forwarded-for'];

    if (forwarded) {
        return String(forwarded)
            .split(',')[0]
            .trim();
    }

    return (
        req.ip ||
        req.socket?.remoteAddress ||
        null
    );
}

function getRefreshCookieOptions() {
    return {
        httpOnly: true,
        secure:
            authConfig.isProduction,
        sameSite:
            authConfig.isProduction
                ? 'strict'
                : 'lax',
        path: '/api/auth',
        maxAge:
            authConfig.refreshTokenDays *
            24 *
            60 *
            60 *
            1000,
    };
}

async function login(req, res) {
    try {
        const result =
            await authService.login({
                login:
                    req.body.login ||
                    req.body.username ||
                    req.body.email,

                password:
                    req.body.password,

                ipAddress:
                    getIpAddress(req),

                userAgent:
                    req.headers[
                        'user-agent'
                    ] || null,
            });

        res.cookie(
            authConfig.refreshCookieName,
            result.refreshCookieValue,
            getRefreshCookieOptions()
        );

        return res
            .status(200)
            .json({
                success: true,
                message:
                    'Đăng nhập thành công.',
                data: {
                    accessToken:
                        result.accessToken,
                    user: result.user,
                    roles: result.roles,
                    permissions:
                        result.permissions,
                    navigation:
                        result.navigation,
                },
            });
    } catch (error) {
        console.error(
            'login error:',
            error
        );

        return res
            .status(
                error.statusCode || 500
            )
            .json({
                success: false,
                message:
                    error.message ||
                    'Đăng nhập thất bại.',
                code:
                    error.code || null,
            });
    }
}

async function refresh(req, res) {
    try {
        const cookieValue =
            req.cookies?.[
                authConfig
                    .refreshCookieName
            ];

        const result =
            await authService.refresh({
                cookieValue,
                ipAddress:
                    getIpAddress(req),
                userAgent:
                    req.headers[
                        'user-agent'
                    ] || null,
            });

        res.cookie(
            authConfig.refreshCookieName,
            result.refreshCookieValue,
            getRefreshCookieOptions()
        );

        return res
            .status(200)
            .json({
                success: true,
                data: {
                    accessToken:
                        result.accessToken,
                },
            });
    } catch (error) {
        res.clearCookie(
            authConfig.refreshCookieName,
            {
                path: '/api/auth',
            }
        );

        return res
            .status(
                error.statusCode || 401
            )
            .json({
                success: false,
                message:
                    error.message ||
                    'Không thể làm mới phiên đăng nhập.',
            });
    }
}

async function logout(req, res) {
    try {
        const cookieValue =
            req.cookies?.[
                authConfig
                    .refreshCookieName
            ];

        await authService.logout(
            cookieValue
        );

        res.clearCookie(
            authConfig.refreshCookieName,
            {
                path: '/api/auth',
            }
        );

        return res
            .status(200)
            .json({
                success: true,
                message:
                    'Đăng xuất thành công.',
            });
    } catch (error) {
        return res
            .status(500)
            .json({
                success: false,
                message:
                    error.message ||
                    'Đăng xuất thất bại.',
            });
    }
}

async function me(req, res) {
    try {
        const data =
            await authService.getMe(
                req.user.id
            );

        return res
            .status(200)
            .json({
                success: true,
                data,
            });
    } catch (error) {
        return res
            .status(
                error.statusCode || 500
            )
            .json({
                success: false,
                message:
                    error.message ||
                    'Không lấy được thông tin tài khoản.',
            });
    }
}

module.exports = {
    login,
    refresh,
    logout,
    me,
};