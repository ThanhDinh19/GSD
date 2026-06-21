const asyncHandler = require('../utils/asyncHandler');
const statusService = require('../services/status.service');

const getStatuses = asyncHandler(async (req, res) => {
  const statuses = await statusService.getStatuses();
  return res.json(statuses);
});

module.exports = {
  getStatuses
};