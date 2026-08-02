const express = require('express');
const employeeController = require('../controllers/employee_test.controller');

const router = express.Router();

router.get('/', employeeController.getEmployees);
router.post('/save', employeeController.saveEmployees);

module.exports = router;