function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Thiếu biến môi trường ${name}`);
    }

    return value;
}

module.exports = {
    accessTokenSecret: requireEnv(
        'JWT_ACCESS_SECRET'
    ),

    accessTokenExpiresIn:
        process.env.JWT_ACCESS_EXPIRES_IN ||
        '15m',

    refreshTokenDays: Number(
        process.env.REFRESH_TOKEN_DAYS || 7
    ),

    maxFailedLogin: Number(
        process.env.AUTH_MAX_FAILED_LOGIN || 5
    ),

    lockMinutes: Number(
        process.env.AUTH_LOCK_MINUTES || 15
    ),

    issuer: 'excel-demo-app',
    audience: 'excel-demo-web',

    refreshCookieName: 'refresh_token',

    isProduction:
        process.env.NODE_ENV === 'production',
};