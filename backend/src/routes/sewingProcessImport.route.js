const express = require('express');
const multer = require('multer');

const {
    previewImport,
} = require('../controllers/sewingProcessImport.controller');


const router = express.Router();


const storage = multer.memoryStorage();


const upload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024,
    },

    fileFilter: (
        req,
        file,
        callback
    ) => {
        const fileName =
            String(
                file.originalname || ''
            ).toLowerCase();

        const isExcel =
            fileName.endsWith('.xlsx') ||
            fileName.endsWith('.xls');

        if (!isExcel) {
            const error = new Error(
                'Chỉ hỗ trợ file Excel .xlsx hoặc .xls.'
            );

            error.statusCode = 400;

            return callback(
                error
            );
        }

        callback(
            null,
            true
        );
    },
});


router.post(
    '/preview',
    upload.single('file'),
    previewImport
);


module.exports = router;