const express = require('express');
const router = express.Router();

const operationClusterController = require('../controllers/operationCluster.controller');

router.get('/', operationClusterController.getOperationClusterHeaders);
router.get('/gsd-options', operationClusterController.getGsdOptions);
router.get('/gsd-options/:id/actions', operationClusterController.getGsdActions);
router.get('/:id', operationClusterController.getOperationClusterById);
router.post('/', operationClusterController.createOperationCluster);
module.exports = router;