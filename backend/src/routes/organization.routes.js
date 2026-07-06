const express = require('express');
const router = express.Router();

const organizationController = require('../controllers/organization.controller');

router.get('/department-types', organizationController.getDepartmentTypes);
router.post('/department-types', organizationController.createDepartmentType);
router.put('/department-types/:id', organizationController.updateDepartmentType);

router.get('/departments/tree', organizationController.getDepartmentTree);
router.get('/departments/:id', organizationController.getDepartmentById);
router.post('/departments', organizationController.createDepartment);
router.put('/departments/:id', organizationController.updateDepartment);
router.patch('/departments/:id/dissolve', organizationController.dissolveDepartment);

router.get('/employees', organizationController.getEmployees);

module.exports = router;