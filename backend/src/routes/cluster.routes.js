const express = require('express');
const clusterController = require('../controllers/cluster.controller');

const router = express.Router();

router.get('/', clusterController.getClusters);
router.get('/:id', clusterController.getClusterById);
router.post('/', clusterController.createCluster);
router.put('/:id', clusterController.updateCluster);
router.delete('/:id', clusterController.deactivateCluster);

module.exports = router;