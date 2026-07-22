const express = require('express');
const gsdAnalysisController = require('../controllers/gsdAnalysis.controller');
const uploadGsdAnalysisImage = require('../middlewares/uploadGsdAnalysis');
const router = express.Router();

router.get('/', gsdAnalysisController.getAnalyses);
router.get('/source-actions/:sourceId', gsdAnalysisController.getSourceActionsForAnalysis);
router.post('/calculate', gsdAnalysisController.calculateAnalysis);
router.post('/', gsdAnalysisController.createAnalysis);
router.get('/:id', gsdAnalysisController.getAnalysisById);
router.put('/:id',gsdAnalysisController.updateAnalysis);
router.get('/:id/copy-draft',gsdAnalysisController.getAnalysisCopyDraft);
router.post(
    '/images/upload', 
    uploadGsdAnalysisImage.single('image'), 
    gsdAnalysisController.uploadGsdAnalysisImage
);

module.exports = router;