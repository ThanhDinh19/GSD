const express = require('express');

const controller =
    require(
        '../controllers/permission.controller'
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
    '/catalog',
    requirePermission(
        'SYSTEM.ROLES.VIEW'
    ),
    controller.getPermissionCatalog
);

router.get(
    '/scopes',
    requirePermission(
        'SYSTEM.ROLES.VIEW'
    ),
    controller.getScopeTypes
);

module.exports = router;