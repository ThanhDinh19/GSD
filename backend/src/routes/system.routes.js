const express = require('express')

const {
    requirePermission,
} = require(
    '../middlewares/permission.middleware'
);

const employeeController = require('../controllers/employee.controller');
const router = express.Router();
const {
    authenticate,
} = require(
    '../middlewares/authenticate.middleware'
);

router.get(
    '/',
    authenticate,
    requirePermission('SYSTEM.USERS.CREATE'),
    employeeController.getEmployeeOptions
);

module.exports = router;