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

const router = express.Router();

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


module.exports = router;