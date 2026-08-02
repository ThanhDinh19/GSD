const express = require('express');

const controller =
    require(
        '../controllers/rolePermission.controller'
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
    '/:roleId/permissions',
    requirePermission(
        'SYSTEM.ROLES.VIEW'
    ),
    controller.getRolePermissions
);

router.put(
    '/:roleId/permissions',
    requirePermission(
        'SYSTEM.ROLES.MANAGE'
    ),
    controller.updateRolePermissions
);

module.exports = router;