const express = require('express');
const routingController = require('../controllers/routing.controller');

const router = express.Router();

router.get('/', routingController.getRouting);
router.post('/save', routingController.saveRouting);

module.exports = router;