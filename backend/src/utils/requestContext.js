const {
    randomUUID,
} = require('crypto');

function getRequestId(req) {
    if (req.requestId) {
        return req.requestId;
    }

    if (req.id) {
        req.requestId = String(req.id);

        return req.requestId;
    }

    const headerRequestId =
        req.headers?.['x-request-id'] ||
        req.headers?.['x-correlation-id'];

    req.requestId = headerRequestId
        ? String(headerRequestId)
        : randomUUID();

    return req.requestId;
}

function getIpAddress(req) {
    const forwardedFor =
        req.headers?.['x-forwarded-for'];

    let ipAddress = forwardedFor
        ? String(forwardedFor)
            .split(',')[0]
            .trim()
        : req.ip ||
          req.socket?.remoteAddress ||
          req.connection?.remoteAddress ||
          null;

    if (
        typeof ipAddress === 'string' &&
        ipAddress.startsWith('::ffff:')
    ) {
        ipAddress =
            ipAddress.slice(7);
    }

    return ipAddress;
}

function getUserAgent(req) {
    return (
        req.headers?.['user-agent'] ||
        null
    );
}

module.exports = {
    getRequestId,
    getIpAddress,
    getUserAgent,
};