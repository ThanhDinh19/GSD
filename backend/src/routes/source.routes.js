const express = require('express');
const sourceController = require('../controllers/source.controller');
const multer = require('multer');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.get('/', sourceController.getSources);
router.post('/', sourceController.createSource);
router.put('/:id', sourceController.updateSource);
router.delete('/:id', sourceController.deactivateSource);

router.post(
  '/import-excel',
  upload.single('file'),
  sourceController.importSourcesExcel
);




module.exports = router;