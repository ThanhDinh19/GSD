const express = require('express');
const multer = require('multer');
const path = require('path');
const gsdCodeController = require('../controllers/gsdCode.controller');

const router = express.Router();

// const upload = multer({
//   dest: path.join(__dirname, '../../uploads'),
//   fileFilter: (req, file, cb) => {
//     const allowedExts = ['.xlsx', '.xlsm', '.xls'];
//     const ext = path.extname(file.originalname).toLowerCase();

//     if (!allowedExts.includes(ext)) {
//       return cb(new Error('Chỉ hỗ trợ file Excel .xlsx, .xlsm, .xls'));
//     }

//     return cb(null, true);
//   },
// });


const upload = multer({
  storage: multer.memoryStorage(),
});

// router.post(
//   '/import-gsd',
//   upload.single('file'),
//   gsdCodeController.importGsdCodesFromExcel
// );


router.get('/', gsdCodeController.getGsdCodes);
router.get('/active', gsdCodeController.getActiveGsdCodes);
router.post('/', gsdCodeController.createGsdCode);
router.put('/:id', gsdCodeController.updateGsdCode);
router.delete('/:id', gsdCodeController.deactivateGsdCode);


router.post(
  '/import-excel',
  upload.single('file'),
  gsdCodeController.importGsdCodesExcel_ver2
);

module.exports = router;