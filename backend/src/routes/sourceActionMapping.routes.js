const express = require('express');
const sourceActionMappingController = require('../controllers/sourceActionMapping.controller');

const router = express.Router();

router.get('/:sourceId', sourceActionMappingController.getMappingBySourceId);
router.put('/:sourceId', sourceActionMappingController.saveMapping);

module.exports = router;