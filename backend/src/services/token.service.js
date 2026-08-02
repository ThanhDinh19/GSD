const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authConfig = require('../config/auth.config');

function createAccessToken(user) {
    return jwt.sign(
        {
            username: user.username,
            employeeId: user.employeeId || null,
            departmentCode:
                user.departmentCode || null,
            tokenVersion: user.tokenVersion,
        },
        authConfig.accessTokenSecret,
        {
            subject: String(user.id),
            expiresIn:
                authConfig.accessTokenExpiresIn,
            issuer: authConfig.issuer,
            audience: authConfig.audience,
        }
    );
}

function verifyAccessToken(token) {
    return jwt.verify(
        token,
        authConfig.accessTokenSecret,
        {
            issuer: authConfig.issuer,
            audience: authConfig.audience,
        }
    );
}

function generateRefreshSecret() {
    return crypto
        .randomBytes(48)
        .toString('base64url');
}

function hashRefreshSecret(secret) {
    return crypto
        .createHash('sha256')
        .update(secret)
        .digest('hex');
}

function compareRefreshHash(
    secret,
    storedHash
) {
    const currentHash =
        hashRefreshSecret(secret);

    const currentBuffer =
        Buffer.from(currentHash, 'hex');

    const storedBuffer =
        Buffer.from(storedHash, 'hex');

    if (
        currentBuffer.length !==
        storedBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        currentBuffer,
        storedBuffer
    );
}

function parseRefreshCookie(cookieValue) {
    if (!cookieValue) return null;

    const separatorIndex =
        cookieValue.indexOf('.');

    if (separatorIndex <= 0) {
        return null;
    }

    const sessionKey =
        cookieValue.slice(0, separatorIndex);

    const refreshSecret =
        cookieValue.slice(separatorIndex + 1);

    if (!sessionKey || !refreshSecret) {
        return null;
    }

    return {
        sessionKey,
        refreshSecret,
    };
}

module.exports = {
    createAccessToken,
    verifyAccessToken,
    generateRefreshSecret,
    hashRefreshSecret,
    compareRefreshHash,
    parseRefreshCookie,
};