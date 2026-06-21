const asyncHandler = require('../utils/asyncHandler');

const getMappingConfig = asyncHandler(async (req, res) => {
  return res.status(404).json({
    error: `Mapping config not implemented yet: ${req.params.key}`
  });
});

const saveMappingConfig = asyncHandler(async (req, res) => {
  return res.json({
    message: 'Mapping config endpoint is ready.'
  });
});

module.exports = {
  getMappingConfig,
  saveMappingConfig
};