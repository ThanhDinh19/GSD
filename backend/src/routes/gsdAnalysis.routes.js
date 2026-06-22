const express = require('express');
const gsdAnalysisController = require('../controllers/gsdAnalysis.controller');

const router = express.Router();

router.get('/', gsdAnalysisController.getAnalyses);
router.get('/source-actions/:sourceId', gsdAnalysisController.getSourceActionsForAnalysis);
router.post('/calculate', gsdAnalysisController.calculateAnalysis);
router.post('/', gsdAnalysisController.createAnalysis);
router.get('/:id', gsdAnalysisController.getAnalysisById);

module.exports = router;