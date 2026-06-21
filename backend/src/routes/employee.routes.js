const express = require('express');
const employeeController = require('../controllers/employee.controller');

const router = express.Router();

router.get('/', employeeController.getEmployees);
router.post('/save', employeeController.saveEmployees);

module.exports = router;