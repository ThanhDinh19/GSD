const express = require('express');
const balanceTypeController = require('../controllers/balanceType.controller');

const router = express.Router();

router.get('/', balanceTypeController.getBalanceTypes);
router.post('/', balanceTypeController.createBalanceType);
router.put('/:id', balanceTypeController.updateBalanceType);

module.exports = router;
