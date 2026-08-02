const express = require('express');

const statusRoutes = require('./status.routes');
const clusterRoutes = require('./cluster.routes');
const employeeRoutes_test = require('./employee_test.routes');
const routingRoutes = require('./routing.routes');
const mappingRoutes = require('./mapping.routes');
const sourceRoutes = require('./source.routes');
const gsdCodeRoutes = require('./gsdCode.routes');
const machineEquipmentRoutes = require('./machineEquipment.routes');
const sourceActionMappingRoutes = require('./sourceActionMapping.routes');
const gsdAnalysisRoutes = require('./gsdAnalysis.routes');
const employeeController = require('../controllers/employee_test.controller');
const organizationRoutes = require('./organization.routes');
const workRoutes = require('./work.routes');
const productCate = require('./productCategory.routes')
// dinh 07/07/2026
const productCateGroup = require('./productCateGroup.routes');
const organizationRoutes_test = require('./organization_test.routes');
const skillGradeRoutes = require('./skillGrade.routes');
const salaryCoefficientRoutes = require('./salary_coefficient.routes');
// dinh 08/07/2026
const operationClusterRoutes = require('./operationCluster.routes');
// dinh 30/06/2026
const systemRoutes = require('./system.routes');

const router = express.Router();

// dinh 17/05/2026
const customerRoutes = require('./customer.routes');
const sewingProcessRoutes = require('./sewingProcess.routes');

// dinh 21/07/2026
const userRoutes_test = require('./user_test.routes');

// dinh 25/07/2026
const authRoutes = require('./auth.routes');

const employeeRoutes = require('./employee.routes');

const userRoutes = require('./user.routes');

const userRoleRoutes = require('./userRole.routes');

const roleRoutes = require('./role.routes');

const rolePermissionRoutes = require('./rolePermission.routes');

const permissionRoutes = require('./permission.routes');

const auditRoutes = require('./audit.routes');

const userPermissionRoute = require('./userPermission.routes');

router.use('/statuses', statusRoutes);
router.use('/clusters', clusterRoutes);
router.use('/data', employeeRoutes_test);
router.post('/save', employeeController.saveEmployees);
router.use('/sources', sourceRoutes);
router.use('/gsd-codes', gsdCodeRoutes);
router.use('/machine-equipments', machineEquipmentRoutes);
router.use('/source-action-mappings', sourceActionMappingRoutes);
router.use('/gsd-analysis', gsdAnalysisRoutes);

router.use('/routing', routingRoutes);
router.use('/mapping-config', mappingRoutes);

// dinh 07/06/2026
router.use('/organization', organizationRoutes);
router.use('/works', workRoutes);
router.use('/productCate', productCate);

// dinh 07/07/2026
router.use('/productCateGroup', productCateGroup);
router.use('/organization-test', organizationRoutes_test);
router.use('/skill-grade', skillGradeRoutes);

// dinh 08/07/2026
router.use('/salary-coefficient', salaryCoefficientRoutes);
router.use('/operation-clusters', operationClusterRoutes);

// dinh 15/07/2026
router.use('/customers', customerRoutes);
router.use('/sewing-processes', sewingProcessRoutes);

// dinh 21/07/2026
router.use('/user', userRoutes_test);

// dinh 25/07/2026
router.use('/auth', authRoutes);


router.use('/employees', employeeRoutes);

/*
 * Route /users/:userId/roles.
 */
router.use('/users', userRoleRoutes);

/*
 * Route CRUD /users.
 */
router.use('/system/users', userRoutes);

/*
 * Route /roles/:roleId/permissions.
 */
router.use('/roles', rolePermissionRoutes);

/*
 * Route CRUD /roles.
 */
router.use('/roles', roleRoutes);

router.use('/permissions', permissionRoutes);

router.use('/audit', auditRoutes);

router.use('/system', userPermissionRoute);

router.use('/system/employees/options', systemRoutes);

module.exports = router;