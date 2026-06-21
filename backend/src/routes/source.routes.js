const express = require('express');
const sourceController = require('../controllers/source.controller');

const router = express.Router();

router.get('/', sourceController.getSources);
router.post('/', sourceController.createSource);
router.put('/:id', sourceController.updateSource);
router.delete('/:id', sourceController.deactivateSource);

module.exports = router;