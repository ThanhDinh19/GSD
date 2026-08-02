const express = require('express');

const controller =
    require('../controllers/role.controller');

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

/**
 * Lấy danh sách vai trò.
 */
router.get(
    '/',
    requirePermission(
        'SYSTEM.ROLES.VIEW'
    ),
    controller.getRoles
);

/**
 * Tạo vai trò.
 */
router.post(
    '/',
    requirePermission(
        'SYSTEM.ROLES.MANAGE'
    ),
    controller.createRole
);

/**
 * Lấy chi tiết vai trò.
 */
router.get(
    '/:id',
    requirePermission(
        'SYSTEM.ROLES.VIEW'
    ),
    controller.getRoleById
);

/**
 * Cập nhật vai trò.
 */
router.put(
    '/:id',
    requirePermission(
        'SYSTEM.ROLES.MANAGE'
    ),
    controller.updateRole
);

/**
 * Ngừng sử dụng vai trò.
 */
router.delete(
    '/:id',
    requirePermission(
        'SYSTEM.ROLES.MANAGE'
    ),
    controller.deactivateRole
);

module.exports = router;