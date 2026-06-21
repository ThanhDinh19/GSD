const express = require('express');
const mappingController = require('../controllers/mapping.controller');

const router = express.Router();

router.get('/:key', mappingController.getMappingConfig);
router.post('/', mappingController.saveMappingConfig);

module.exports = router;