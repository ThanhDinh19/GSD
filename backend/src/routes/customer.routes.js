const express = require('express');
const customerController = require('../controllers/customer.controller');

const router = express.Router();

router.get('/', customerController.getCustomers);
// router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deactivateCustomer);

module.exports = router;