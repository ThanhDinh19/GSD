const express = require('express');
const productCateGroupController = require('../controllers/productCateGroup.controller');

const router = express.Router();

router.get('/', productCateGroupController.getProductCateGroups);
router.post('/', productCateGroupController.createProductCateGroup);
router.put('/:id', productCateGroupController.updateProductCateGroup);
// router.delete('/:id', clusterController.deactivateCluster);

module.exports = router;