const asyncHandler = require('../utils/asyncHandler');
const employeeService = require('../services/employee.service');

const getEmployees = asyncHandler(async (req, res) => {
  const rows = await employeeService.getEmployeesWithSeed();
  return res.json(rows);
});

const saveEmployees = asyncHandler(async (req, res) => {
  const records = req.body;

  if (!Array.isArray(records)) {
    return res.status(400).json({
      error: 'Data must be a JSON array of rows.'
    });
  }

  await employeeService.replaceEmployees(records);

  return res.json({
    message: 'Successfully synced all employee records!',
    count: records.length
  });
});

module.exports = {
  getEmployees,
  saveEmployees
};