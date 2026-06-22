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

module.exports = {
  getSourceActionsForAnalysis,
  calculateAnalysis,
  createAnalysis,
  getAnalyses,
  getAnalysisById
};