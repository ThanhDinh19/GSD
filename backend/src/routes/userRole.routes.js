const express = require('express');

const controller =
    require(
        '../controllers/userRole.controller'
    );

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
    '/:userId/roles',
    requirePermission(
        'SYSTEM.USERS.VIEW'
    ),
    controller.getUserRoles
);

router.put(
    '/:userId/roles',
    requirePermission(
        'SYSTEM.USERS.UPDATE'
    ),
    controller.updateUserRoles
);

module.exports = router;