const express = require('express');

const statusRoutes = require('./status.routes');
const clusterRoutes = require('./cluster.routes');
const employeeRoutes = require('./employee.routes');
const routingRoutes = require('./routing.routes');
const mappingRoutes = require('./mapping.routes');
const sourceRoutes = require('./source.routes');
const gsdCodeRoutes = require('./gsdCode.routes');
const machineEquipmentRoutes = require('./machineEquipment.routes');
const sourceActionMappingRoutes = require('./sourceActionMapping.routes');
const gsdAnalysisRoutes = require('./gsdAnalysis.routes');
const employeeController = require('../controllers/employee.controller');
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
const router = express.Router();

// dinh 17/05/2026
const customerRoutes = require('./customer.routes');
const sewingProcessRoutes = require('./sewingProcess.routes');

router.use('/statuses', statusRoutes);
router.use('/clusters', clusterRoutes);
router.use('/data', employeeRoutes);
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

module.exports = router;