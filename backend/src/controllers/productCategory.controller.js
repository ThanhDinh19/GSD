const asyncHandler = require('../utils/asyncHandler');
const productCategoryService = require('../services/productCategory.service');

const getProductCategories = asyncHandler(async (req, res) => {
  const cates = await productCategoryService.getProductCategories();
  return res.json(cates);
});


const createProductCategory = asyncHandler(async (req, res) => {
  const { productCode, productName, statusId } = req.body;

  if (!productCode || !productName) {
    return res.status(400).json({
      error: 'Mã và Tên là bắt buộc.'
    });
  }

  await productCategoryService.createProductCate({
    productCode,
    productName,
    statusId
  });

  return res.json({
    message: 'Đã thêm thành công.'
  });
});


const updateProductCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { productCode, productName, statusId } = req.body;

  if (!productCode || !productName) {
    return res.status(400).json({
      error: 'Mã và tên là bắt buộc.'
    });
  }

  const updated = await productCategoryService.updateProductCate(Number(id), {
    productCode,
    productName,
    statusId
  });

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy chủng loại.'
    });
  }

  return res.json({
    message: 'Đã cập nhật thành công.'
  });
});

module.exports = {
    getProductCategories,
    createProductCategory,
    updateProductCategory,
}