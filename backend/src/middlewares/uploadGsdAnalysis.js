const path = require('path');
const multer = require('multer');
const gsdAnalysisImageDir = require('../config/gsdAnalysisImageDir');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, gsdAnalysisImageDir);
    },

    filename(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const fileName = `gsd_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;

        cb(null, fileName);
    },
});

const uploadSGsdAnalysisImage = multer({
    storage,
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Chỉ được upload file hình ảnh.'));
        }

        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = uploadSGsdAnalysisImage;