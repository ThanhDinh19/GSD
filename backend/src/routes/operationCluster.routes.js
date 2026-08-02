const express = require('express');
const operationClusterController = require('../controllers/operationCluster.controller');
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

const PERMISSIONS = {
    VIEW: 'OPERATION_CLUSTER.MAIN.VIEW',
    CREATE: 'OPERATION_CLUSTER.MAIN.CREATE',
    UPDATE: 'OPERATION_CLUSTER.MAIN.UPDATE',
};

router.use(authenticate);

router.get('/', operationClusterController.getOperationClusterHeaders);
router.get('/gsd-options', requirePermission(PERMISSIONS.VIEW), operationClusterController.getGsdOptions);
router.get('/gsd-options/:id/actions', requirePermission(PERMISSIONS.VIEW), operationClusterController.getGsdActions);
router.get('/:id', requirePermission(PERMISSIONS.VIEW), operationClusterController.getOperationClusterById);
router.post('/', requirePermission(PERMISSIONS.CREATE), operationClusterController.createOperationCluster);
router.put('/:id', requirePermission(PERMISSIONS.UPDATE), operationClusterController.updateOperationCluster);
router.post('/copy', operationClusterController.copyOperationCluster);
module.exports = router;