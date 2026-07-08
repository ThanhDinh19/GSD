const asyncHandler = require('../utils/asyncHandler');
const salaryCoefficientService = require('../services/salaryCoefficient.service');

const getSalaryCoefficients = asyncHandler(async (req, res) => {
  const data = await salaryCoefficientService.getSalaryCoefficients();
  return res.json(data);
});

const createSalaryCoefficient = asyncHandler(async (req, res) => {
  const { levelId, coefficient, statusId } = req.body;

  if (levelId === undefined || levelId === null || levelId === '') {
    return res.status(400).json({
      error: 'Cấp bậc là bắt buộc.'
    });
  }

  if (coefficient === undefined || coefficient === null || coefficient === '') {
    return res.status(400).json({
      error: 'Hệ số lương là bắt buộc.'
    });
  }

  if (Number.isNaN(Number(levelId))) {
    return res.status(400).json({
      error: 'Cấp bậc không hợp lệ.'
    });
  }

  if (Number.isNaN(Number(coefficient))) {
    return res.status(400).json({
      error: 'Hệ số lương không hợp lệ.'
    });
  }

  await salaryCoefficientService.createSalaryCoefficient({
    levelId,
    coefficient,
    statusId
  });

  return res.json({
    message: 'Đã thêm thành công.'
  });
});

const updateSalaryCoefficient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { levelId, coefficient, statusId } = req.body;

  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).json({
      error: 'ID không hợp lệ.'
    });
  }

  if (levelId === undefined || levelId === null || levelId === '') {
    return res.status(400).json({
      error: 'Cấp bậc là bắt buộc.'
    });
  }

  if (coefficient === undefined || coefficient === null || coefficient === '') {
    return res.status(400).json({
      error: 'Hệ số lương là bắt buộc.'
    });
  }

  if (Number.isNaN(Number(levelId))) {
    return res.status(400).json({
      error: 'Cấp bậc không hợp lệ.'
    });
  }

  if (Number.isNaN(Number(coefficient))) {
    return res.status(400).json({
      error: 'Hệ số lương không hợp lệ.'
    });
  }

  const updated = await salaryCoefficientService.updateSalaryCoefficient(
    Number(id),
    {
      levelId,
      coefficient,
      statusId
    }
  );

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy hệ số lương.'
    });
  }

  return res.json({
    message: 'Đã cập nhật thành công.'
  });
});

module.exports = {
  getSalaryCoefficients,
  createSalaryCoefficient,
  updateSalaryCoefficient
};