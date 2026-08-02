const express = require('express');

const userController =
    require('../controllers/user.controller');

const userPermissionController =
    require('../controllers/userPermission.controller');

const {
    authenticate,
} = require('../middlewares/authenticate.middleware');

const {
    requirePermission,
} = require('../middlewares/permission.middleware');

const router = express.Router();

router.use(authenticate);

router.get(
    '/users',
    requirePermission('SYSTEM.USERS.VIEW'),
    userController.getUsers
);

router.get(
    '/users/:id/permission-matrix',
    requirePermission('SYSTEM.ROLES.VIEW'),
    userPermissionController.getPermissionMatrix
);

router.put(
    '/users/:id/permission-overrides',
    requirePermission('SYSTEM.ROLES.MANAGE'),
    userPermissionController.savePermissionOverrides
);

module.exports = router;