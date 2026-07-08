const express = require('express');
const workController = require('../controllers/work.controller');

const router = express.Router();

router.get('/', workController.getWorks);
router.post('/', workController.createWork);
router.put('/:id', workController.updateWork);
// router.delete('/:id', clusterController.deactivateCluster);

module.exports = router;