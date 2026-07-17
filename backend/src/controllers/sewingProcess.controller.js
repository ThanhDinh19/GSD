const sewingProcessService = require('../services/sewingProcess.service');

async function getSewingProcesses(req, res) {
    try {
        const data = await sewingProcessService.getSewingProcesses();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        console.error('getSewingProcesses error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Lấy danh sách quy trình may thất bại.',
        });
    }
}

async function getSewingProcessById(req, res) {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ.',
            });
        }

        const data = await sewingProcessService.getSewingProcessById(id);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        console.error('getSewingProcessById error:', err);

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Lấy chi tiết quy trình may thất bại.',
        });
    }
}

async function calculateSewingProcess(req, res) {
    try {
        const data = sewingProcessService.calculateSewingProcess(req.body);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        console.error('calculateSewingProcess error:', err);

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Tính quy trình may thất bại.',
        });
    }
}

async function calculateMachineNeeds(req, res) {
    try {
        const data = sewingProcessService.calculateMachineNeedsOnly(req.body);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        console.error('calculateMachineNeeds error:', err);

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Tính nhu cầu MMTB thất bại.',
        });
    }
}

async function createSewingProcess(req, res) {
    try {
        const data = await sewingProcessService.createSewingProcess(req.body);

        return res.status(201).json({
            success: true,
            message: 'Tạo quy trình may thành công.',
            data,
        });
    } catch (err) {
        console.error('createSewingProcess error:', err);

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Tạo quy trình may thất bại.',
        });
    }
}

async function updateSewingProcess(req, res) {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ.',
            });
        }

        const data = await sewingProcessService.updateSewingProcess(id, req.body);

        return res.status(200).json({
            success: true,
            message: 'Cập nhật quy trình may thành công.',
            data,
        });
    } catch (err) {
        console.error('updateSewingProcess error:', err);

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Cập nhật quy trình may thất bại.',
        });
    }
}

async function uploadSewingProcessImage(req, res) {
    try {
        console.log('Uploaded file:', req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn file ảnh.',
            });
        }

        return res.json({
            success: true,
            data: {
                imageFileName: req.file.filename,
                imageUrl: req.file.filename,
            },
        });
    } catch (err) {
        console.error('uploadSewingProcessImage error:', err);

        return res.status(500).json({
            success: false,
            message: err.message || 'Upload hình ảnh thất bại.',
        });
    }
}

async function getActionDetailsById(req, res) {
    try {
        const data = await sewingProcessService.getActionDetailsById(req.params.id)

        return res.status(200).json({
            success: true,
            data
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

async function getGsdActionDetailsById(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu mã phân tích GSD.',
            });
        }

        const data = await service.getActionDetailsById(id);

        return res.json({
            success: true,
            data,
        });
    } catch (err) {
        next(err);
    }
}

async function getActionDetailsByOperationClusterLineId(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu mã dòng kho cụm công đoạn.',
            });
        }

        const data =
            await sewingProcessService.getActionDetailsByOperationClusterLineId(id);

        return res.json({
            success: true,
            data,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getSewingProcesses,
    getSewingProcessById,
    calculateSewingProcess,
    calculateMachineNeeds,
    createSewingProcess,
    updateSewingProcess,
    uploadSewingProcessImage,
    getActionDetailsById,
    getGsdActionDetailsById,
    getActionDetailsByOperationClusterLineId,
};