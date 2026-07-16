const asyncHandler = require('../utils/asyncHandler');
const customerService = require('../services/customer.service');

const getCustomers = asyncHandler(async (req, res) => {
  const data = await customerService.getCustomers();
  return res.json(data);
});

// const getCustomerById = asyncHandler(async (req, res) => {
//   try {
//     const clusters = await clusterService.getClusterById(Number(req.params.id));

//     if (!clusters) {
//       return res.status(404).json({ message: "Không tìm thấy data" });
//     }

//     return res.json(clusters);
//   } catch (err) {
//     console.error("error: ", err);
//     res.status(500).json({message: "Không lấy được cụm"})
//   }
// })

const createCustomer = asyncHandler(async (req, res) => {
  const { cusCode, cusName, statusId } = req.body;

  if (!cusCode || !cusName) {
    return res.status(400).json({
      error: 'Mã và Tên là bắt buộc.'
    });
  }

  await customerService.createCustomer({
    cusCode,
    cusName,
    statusId
  });

  return res.json({
    message: 'Đã thêm thành công.'
  });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cusCode, cusName, statusId } = req.body;

  if (!cusCode || !cusName) {
    return res.status(400).json({
      error: 'Mã và Tên là bắt buộc.'
    });
  }

  const updated = await customerService.updateCustomer(Number(id), {
    cusCode,
    cusName,
    statusId
  });

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy để cập nhật.'
    });
  }

  return res.json({
    message: 'Đã cập nhật thành công.'
  });
});

const deactivateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await clusterService.deactivateCluster(Number(id));

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy.'
    });
  }

  return res.json({
    message: 'Đã chuyển sang Không sử dụng.'
  });
});

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deactivateCustomer,
};