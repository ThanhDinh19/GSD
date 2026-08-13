const express = require('express');
const operationClusterController = require('../controllers/operationCluster.controller');
const {
    authenticate,
} = require(
    '../middlewares/authenticate.middleware'
);
const {
    requirePermission,
    requireAnyPermission,
} = require(
    '../middlewares/permission.middleware'
);
const router = express.Router();

const PERMISSIONS = {
    MAIN_VIEW: 'OPERATION_CLUSTER.MAIN.VIEW',
    NEW_VIEW: 'OPERATION_CLUSTER.NEW.VIEW',

    MAIN_CREATE: 'OPERATION_CLUSTER.MAIN.CREATE',
    NEW_CREATE: 'OPERATION_CLUSTER.NEW.CREATE',

    UPDATE: 'OPERATION_CLUSTER.MAIN.UPDATE',
};

router.use(authenticate);

router.get('/', requireAnyPermission(PERMISSIONS.MAIN_VIEW, PERMISSIONS.NEW_VIEW), operationClusterController.getOperationClusterHeaders);
router.get('/gsd-options', requireAnyPermission(PERMISSIONS.MAIN_VIEW, PERMISSIONS.NEW_VIEW), operationClusterController.getGsdOptions);
router.get('/gsd-options/:id/actions', requireAnyPermission(PERMISSIONS.MAIN_VIEW, PERMISSIONS.NEW_VIEW), operationClusterController.getGsdActions);
router.get('/:id', requireAnyPermission(PERMISSIONS.MAIN_VIEW, PERMISSIONS.NEW_VIEW), operationClusterController.getOperationClusterById);

router.post('/', requireAnyPermission(PERMISSIONS.MAIN_CREATE, PERMISSIONS.NEW_CREATE), operationClusterController.createOperationCluster);

router.put('/:id', requirePermission(PERMISSIONS.UPDATE), operationClusterController.updateOperationCluster);
router.post('/copy', operationClusterController.copyOperationCluster);
module.exports = router;