const express = require('express');
const productCateController = require('../controllers/productCategory.controller');

const router = express.Router();

router.get('/', productCateController.getProductCategories);
router.post('/', productCateController.createProductCategory);
router.put('/:id', productCateController.updateProductCategory);
// router.delete('/:id', clusterController.deactivateCluster);

module.exports = router;