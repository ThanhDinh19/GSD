const express = require('express');

const controller = require(
    '../controllers/sewingProcess.controller'
);

const uploadSewingProcessImage = require(
    '../middlewares/uploadSewingProcessImage'
);

const {
    authenticate,
} = require('../middlewares/authenticate.middleware');

const {
    requirePermission,
} = require('../middlewares/permission.middleware');

const router = express.Router();

const SEWING_PROCESS_PERMISSIONS = {
    VIEW:
        'SEWING.PROCESS.VIEW',

    CALCULATE:
        'SEWING.PROCESS.CALCULATE',

    CREATE:
        'SEWING.PROCESS.CREATE',

    UPDATE:
        'SEWING.PROCESS.UPDATE',

    UPLOAD_IMAGE:
        'SEWING.PROCESS.UPLOAD_IMAGE',
};

/*
 * Tất cả API phía dưới đều yêu cầu đăng nhập.
 *
 * Nếu authentication đã được đặt ở app.js:
 *
 * app.use('/api/sewing-process', authenticate, router);
 *
 * thì không cần router.use(authenticate) ở đây.
 */
// router.use(authenticate);

/*
 * Các route cụ thể nên đặt trước route /:id.
 */

// router.post(
//     '/calculate',
//     requirePermission(
//         SEWING_PROCESS_PERMISSIONS.CALCULATE
//     ),
//     controller.calculateSewingProcess
// );

// router.post(
//     '/calculate-machine-needs',
//     requirePermission(
//         SEWING_PROCESS_PERMISSIONS.CALCULATE
//     ),
//     controller.calculateMachineNeeds
// );

// router.get(
//     '/operation-lines/:id/action-details',
//     requirePermission(
//         SEWING_PROCESS_PERMISSIONS.VIEW
//     ),
//     controller.getActionDetailsByOperationClusterLineId
// );

// router.post(
//     '/images/upload',
//     requirePermission(
//         SEWING_PROCESS_PERMISSIONS.UPLOAD_IMAGE
//     ),
//     uploadSewingProcessImage.single('image'),
//     controller.uploadSewingProcessImage
// );

// router.get(
//     '/',
//     requirePermission(
//         SEWING_PROCESS_PERMISSIONS.VIEW
//     ),
//     controller.getSewingProcesses
// );

// router.get(
//     '/:id',
//     requirePermission(
//         SEWING_PROCESS_PERMISSIONS.VIEW
//     ),
//     controller.getSewingProcessById
// );

// router.post(
//     '/',
//     requirePermission(
//         SEWING_PROCESS_PERMISSIONS.CREATE
//     ),
//     controller.createSewingProcess
// );

// router.put(
//     '/:id',
//     requirePermission(
//         SEWING_PROCESS_PERMISSIONS.UPDATE
//     ),
//     controller.updateSewingProcess
// );



router.post(
    '/calculate',
    controller.calculateSewingProcess
);

router.post(
    '/calculate-machine-needs',
    controller.calculateMachineNeeds
);

router.get(
    '/operation-lines/:id/action-details',
    controller.getActionDetailsByOperationClusterLineId
);

router.post(
    '/images/upload',
    uploadSewingProcessImage.single('image'),
    controller.uploadSewingProcessImage
);

router.get(
    '/',
    controller.getSewingProcesses
);

router.get(
    '/:id',
    controller.getSewingProcessById
);

router.post(
    '/',
    controller.createSewingProcess
);

router.put(
    '/:id',
    controller.updateSewingProcess
);

module.exports = router;