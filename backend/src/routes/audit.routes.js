const express = require('express');

const controller =
    require('../controllers/audit.controller');

const {
    authenticate,
} = require(
    '../middlewares/authenticate.middleware'
);

const {
    requirePermission,
} = require(
    '../middlewares/permission.middleware'
);

const router = express.Router();

router.use(authenticate);

router.get(
    '/application-logs',
    requirePermission(
        'SYSTEM.AUDIT.VIEW'
    ),
    controller.getApplicationLogs
);

router.get(
    '/data-change-logs',
    requirePermission(
        'SYSTEM.AUDIT.VIEW'
    ),
    controller.getDataChangeLogs
);

router.get(
    '/login-logs',
    requirePermission(
        'SYSTEM.AUDIT.VIEW'
    ),
    controller.getLoginLogs
);

module.exports = router;

