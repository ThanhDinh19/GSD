const express = require('express');

const controller =
    require('../controllers/user.controller');

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
    '/',
    requirePermission(
        'SYSTEM.USERS.VIEW'
    ),
    controller.getUsers
);

router.get(
    '/:id',
    requirePermission(
        'SYSTEM.USERS.VIEW'
    ),
    controller.getUserById
);

router.post(
    '/',
    requirePermission('SYSTEM.USERS.CREATE'),
    controller.createUser
);

router.put(
    '/:id',
    requirePermission(
        'SYSTEM.USERS.UPDATE'
    ),
    controller.updateUser
);

router.post(
    '/:id/lock',
    requirePermission(
        'SYSTEM.USERS.LOCK'
    ),
    controller.lockUser
);

router.post(
    '/:id/unlock',
    requirePermission(
        'SYSTEM.USERS.LOCK'
    ),
    controller.unlockUser
);

router.post(
    '/:id/reset-password',
    requirePermission(
        'SYSTEM.USERS.RESET_PASSWORD'
    ),
    controller.resetPassword
);

router.post(
    '/:id/revoke-sessions',
    requirePermission(
        'SYSTEM.USERS.LOCK'
    ),
    controller.revokeSessions
);

module.exports = router;