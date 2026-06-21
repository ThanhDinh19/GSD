const asyncHandler = require('../utils/asyncHandler');

const getRouting = asyncHandler(async (req, res) => {
  return res.json([]);
});

const saveRouting = asyncHandler(async (req, res) => {
  return res.json({
    message: 'Routing save endpoint is ready.',
    count: Array.isArray(req.body) ? req.body.length : 0
  });
});

module.exports = {
  getRouting,
  saveRouting
};