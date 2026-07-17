const express = require('express');
const controller = require('../controllers/sewingProcess.controller');
const uploadSewingProcessImage = require('../middlewares/uploadSewingProcessImage');
const router = express.Router();

router.post('/calculate', controller.calculateSewingProcess);
router.post('/calculate-machine-needs', controller.calculateMachineNeeds);

router.get(
    '/operation-lines/:id/action-details',
    controller.getActionDetailsByOperationClusterLineId
);


router.get('/', controller.getSewingProcesses);
router.get('/:id', controller.getSewingProcessById);

router.post('/', controller.createSewingProcess);
router.put('/:id', controller.updateSewingProcess);
router.post(
    '/images/upload',
    uploadSewingProcessImage.single('image'),
    controller.uploadSewingProcessImage
);



module.exports = router;