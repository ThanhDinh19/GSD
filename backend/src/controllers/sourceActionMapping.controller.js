const asyncHandler = require('../utils/asyncHandler');
const sourceActionMappingService = require('../services/sourceActionMapping.service');

const getMappingBySourceId = asyncHandler(async (req, res) => {
  const { sourceId } = req.params;

  const data = await sourceActionMappingService.getMappingBySourceId(Number(sourceId));

  return res.json(data);
});

const saveMapping = asyncHandler(async (req, res) => {
  const { sourceId } = req.params;

  const result = await sourceActionMappingService.saveMapping(Number(sourceId), req.body);

  return res.json({
    message: 'Đã lưu khai báo thao tác thuộc source.',
    totalActions: result.totalActions,
    totalTmu: result.totalTmu,
  });
});

module.exports = {
  getMappingBySourceId,
  saveMapping,
};