const express = require('express');
const router = express.Router();

const organizationController_test = require('../controllers/organization_test.controller');

router.get('/departments-test/tree', organizationController_test.getDepartmentTree_test);
router.get('/departments-test/:code', organizationController_test.getDepartmentById_test);
router.post('/departments-test', organizationController_test.createDepartment_test);
router.put('/departments-test/:code', organizationController_test.updateDepartment_test);
router.patch('/departments-test/:id/dissolve', organizationController_test.dissolveDepartment_test);

router.get('/employees-test', organizationController_test.getEmployees_test);

router.get('/department-types-test1', organizationController_test.getDepartmentTypes_test_1);
router.post('/department-types-test1', organizationController_test.createDepartmentType_test_1);
router.put('/department-types-test1/:id', organizationController_test.updateDepartmentType_test_1);

module.exports = router;