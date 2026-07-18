const asyncHandler = require('../utils/asyncHandler');
const gsdAnalysisService = require('../services/gsdAnalysis.service');

const getSourceActionsForAnalysis = asyncHandler(async (req, res) => {
  const { sourceId } = req.params;

  const data = await gsdAnalysisService.getSourceActionsForAnalysis(Number(sourceId));

  return res.json(data);
});

const calculateAnalysis = asyncHandler(async (req, res) => {
  const data = await gsdAnalysisService.calculateAnalysis(req.body);

  return res.json(data);
});

const createAnalysis = asyncHandler(async (req, res) => {
  const data = await gsdAnalysisService.createAnalysis(req.body);

  return res.json({
    message: 'Đã phân tích công đoạn thành công.',
    data,
  });
});

const getAnalyses = asyncHandler(async (req, res) => {
  const data = await gsdAnalysisService.getAnalyses();

  return res.json(data);
});

const getAnalysisById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await gsdAnalysisService.getAnalysisById(Number(id));

  return res.json(data);
});

const updateAnalysis = asyncHandler(async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Mã phân tích công đoạn không hợp lệ.',
            });
        }

        const data =
            await gsdAnalysisService.updateAnalysis(
                id,
                req.body
            );

        return res.json({
            success: true,
            message: 'Cập nhật phân tích công đoạn thành công.',
            data,
        });
    } catch (err) {
        next(err);
    }
});

const getAnalysisCopyDraft = asyncHandler(
    async (req, res) => {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message:
                    'Mã phân tích công đoạn không hợp lệ.',
            });
        }

        const data =
            await gsdAnalysisService.getAnalysisCopyDraft(id);

        return res.json({
            success: true,
            message:
                'Đã tạo dữ liệu sao chép công đoạn.',
            data,
        });
    }
);

module.exports = {
  getSourceActionsForAnalysis,
  calculateAnalysis,
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  updateAnalysis,
  getAnalysisCopyDraft
};