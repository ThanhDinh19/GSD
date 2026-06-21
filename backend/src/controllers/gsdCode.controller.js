const asyncHandler = require('../utils/asyncHandler');
const gsdCodeService = require('../services/gsdCode.service');
const fs = require('fs');

const getGsdCodes = asyncHandler(async (req, res) => {
    const data = await gsdCodeService.getGsdCodes();
    return res.json(data);
});

const getActiveGsdCodes = asyncHandler(async (req, res) => {
    const data = await gsdCodeService.getActiveGsdCodes();
    return res.json(data);
});

const createGsdCode = asyncHandler(async (req, res) => {
    const {
        actionCode,
        actionName,
        gsdCode,
        codeNew,
        frequency,
        tmu,
        note,
        statusId,
    } = req.body;

    if (!actionCode || !actionName) {
        return res.status(400).json({
            error: 'Mã thao tác và Tên thao tác là bắt buộc.',
        });
    }

    await gsdCodeService.createGsdCode({
        actionCode,
        actionName,
        gsdCode,
        codeNew,
        frequency,
        tmu,
        note,
        statusId,
    });

    return res.json({
        message: 'Đã thêm thao tác chuẩn thành công.',
    });
});

const updateGsdCode = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
        actionCode,
        actionName,
        gsdCode,
        codeNew,
        frequency,
        tmu,
        note,
        statusId,
    } = req.body;

    if (!actionCode || !actionName) {
        return res.status(400).json({
            error: 'Mã thao tác và Tên thao tác là bắt buộc.',
        });
    }

    const updated = await gsdCodeService.updateGsdCode(Number(id), {
        actionCode,
        actionName,
        gsdCode,
        codeNew,
        frequency,
        tmu,
        note,
        statusId,
    });

    if (!updated) {
        return res.status(404).json({
            error: 'Không tìm thấy thao tác chuẩn.',
        });
    }

    return res.json({
        message: 'Đã cập nhật thao tác chuẩn thành công.',
    });
});

const deactivateGsdCode = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updated = await gsdCodeService.deactivateGsdCode(Number(id));

    if (!updated) {
        return res.status(404).json({
            error: 'Không tìm thấy thao tác chuẩn.',
        });
    }

    return res.json({
        message: 'Đã chuyển thao tác chuẩn sang Không sử dụng.',
    });
});

const importGsdCodesFromExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'Vui lòng chọn file Excel.',
        });
    }

    try {
        const sheetName = req.body.sheetName || 'GSD';

        const result = await gsdCodeService.importGsdCodesFromExcel(
            req.file.path,
            sheetName
        );

        return res.json(result);
    } finally {
        fs.unlink(req.file.path, () => { });
    }
});

module.exports = {
    getGsdCodes,
    getActiveGsdCodes,
    createGsdCode,
    updateGsdCode,
    deactivateGsdCode,
    importGsdCodesFromExcel,
};