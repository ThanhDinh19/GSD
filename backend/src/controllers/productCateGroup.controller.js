const asyncHandler = require('../utils/asyncHandler');
const productCateGroupService = require('../services/productCateGroup.service');

const getProductCateGroups = asyncHandler(async (req, res) => {
  const data = await productCateGroupService.getProductCateGroups();
  return res.json(data);
});


const createProductCateGroup = asyncHandler(async (req, res) => {
  const { cateGroupCode, cateGroupName, statusId } = req.body;

  if (!cateGroupCode || !cateGroupName) {
    return res.status(400).json({
      error: 'Mã và Tên là bắt buộc.'
    });
  }

  await productCateGroupService.createProductCateGroup({
    cateGroupCode,
    cateGroupName,
    statusId
  });

  return res.json({
    message: 'Đã thêm thành công.'
  });
});


const updateProductCateGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cateGroupCode, cateGroupName, statusId } = req.body;

  if (!cateGroupCode || !cateGroupName) {
    return res.status(400).json({
      error: 'Mã và tên là bắt buộc.'
    });
  }

  const updated = await productCateGroupService.updateProductCateGroup(Number(id), {
    cateGroupCode,
    cateGroupName,
    statusId
  });

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy nhóm chủng loại.'
    });
  }

  return res.json({
    message: 'Đã cập nhật thành công.'
  });
});

module.exports = {
    getProductCateGroups,
    createProductCateGroup,
    updateProductCateGroup, 
}