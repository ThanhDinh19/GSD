const asyncHandler = require('../utils/asyncHandler');
const balanceTypeService = require('../services/balanceType.service');

const getBalanceTypes = asyncHandler(async (req, res) => {
  const data = await balanceTypeService.getBalanceTypes();
  return res.json(data);
});

const createBalanceType = asyncHandler(async (req, res) => {
  const { balanceTypeCode, balanceTypeName, statusId } = req.body;

  if (!balanceTypeCode || !balanceTypeName) {
    return res.status(400).json({
      error: 'Mã và Tên loại cân bằng là bắt buộc.'
    });
  }

  await balanceTypeService.createBalanceType({
    balanceTypeCode,
    balanceTypeName,
    statusId
  });

  return res.json({
    message: 'Đã thêm thành công.'
  });
});

const updateBalanceType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { balanceTypeCode, balanceTypeName, statusId } = req.body;

  if (!balanceTypeCode || !balanceTypeName) {
    return res.status(400).json({
      error: 'Mã và Tên loại cân bằng là bắt buộc.'
    });
  }

  const updated = await balanceTypeService.updateBalanceType(Number(id), {
    balanceTypeCode,
    balanceTypeName,
    statusId
  });

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy loại cân bằng.'
    });
  }

  return res.json({
    message: 'Đã cập nhật thành công.'
  });
});

module.exports = {
  getBalanceTypes,
  createBalanceType,
  updateBalanceType,
};
