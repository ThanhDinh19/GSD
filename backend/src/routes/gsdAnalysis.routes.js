const express = require('express');

const {
    authenticate,
} = require(
    '../middlewares/authenticate.middleware'
);

const {
    requirePermission,
} = require(
    '../middlewares/permission.middleware'
);

const gsdAnalysisController =
    require(
        '../controllers/gsdAnalysis.controller'
    );

const uploadGsdAnalysisImage =
    require(
        '../middlewares/uploadGsdAnalysis'
    );

const router = express.Router();

const PERMISSIONS = {
    VIEW: 'GSD.ANALYSIS.VIEW',
    CREATE: 'GSD.ANALYSIS.CREATE',
    UPDATE: 'GSD.ANALYSIS.UPDATE',
    DELETE: 'GSD.ANALYSIS.DELETE',
};

/*
 * Bắt buộc đăng nhập cho toàn bộ route.
 * Middleware này tạo req.user.
 */
router.use(authenticate);

/*
 * Đặt route cụ thể trước route /:id.
 */
router.get(
    '/source-actions/:sourceId',
    gsdAnalysisController.getSourceActionsForAnalysis
);

router.post(
    '/calculate',
    requirePermission(
        PERMISSIONS.CREATE
    ),
    gsdAnalysisController
        .calculateAnalysis
);

router.post(
    '/images/upload',
    requirePermission(
        PERMISSIONS.CREATE
    ),
    uploadGsdAnalysisImage.single(
        'image'
    ),
    gsdAnalysisController
        .uploadGsdAnalysisImage
);

router.get(
    '/:id/copy-draft',
    requirePermission(
        PERMISSIONS.VIEW
    ),
    gsdAnalysisController
        .getAnalysisCopyDraft
);

router.get(
    '/',
    requirePermission(
        PERMISSIONS.VIEW
    ),
    gsdAnalysisController
        .getAnalyses
);

router.post('/', requirePermission(PERMISSIONS.CREATE), gsdAnalysisController.createAnalysis);

// router.post('/', gsdAnalysisController.createAnalysis);

router.put('/:id', requirePermission(PERMISSIONS.UPDATE), gsdAnalysisController.updateAnalysis);

router.get('/:id', requirePermission(PERMISSIONS.VIEW), gsdAnalysisController.getAnalysisById);

router.put('/deactivate/:id', requirePermission(PERMISSIONS.DELETE), gsdAnalysisController.deactivate);

module.exports = router;