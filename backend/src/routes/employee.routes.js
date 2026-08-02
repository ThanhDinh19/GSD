const express = require('express');

const controller =
    require('../controllers/employee.controller');

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
        'SYSTEM.EMPLOYEES.VIEW'
    ),
    controller.getEmployees
);

router.get(
    '/:id',
    requirePermission(
        'SYSTEM.EMPLOYEES.VIEW'
    ),
    controller.getEmployeeById
);

router.post(
    '/',
    requirePermission(
        'SYSTEM.EMPLOYEES.CREATE'
    ),
    controller.createEmployee
);

router.put(
    '/:id',
    requirePermission(
        'SYSTEM.EMPLOYEES.UPDATE'
    ),
    controller.updateEmployee
);

router.delete(
    '/:id',
    requirePermission(
        'SYSTEM.EMPLOYEES.DELETE'
    ),
    controller.deleteEmployee
);

module.exports = router;