const asyncHandler = require('../utils/asyncHandler');
const clusterService = require('../services/cluster.service');

const getClusters = asyncHandler(async (req, res) => {
  const clusters = await clusterService.getClusters();
  return res.json(clusters);
});

const createCluster = asyncHandler(async (req, res) => {
  const { clusterCode, clusterName, statusId } = req.body;

  if (!clusterCode || !clusterName) {
    return res.status(400).json({
      error: 'Mã cụm và Tên cụm là bắt buộc.'
    });
  }

  await clusterService.createCluster({
    clusterCode,
    clusterName,
    statusId
  });

  return res.json({
    message: 'Đã thêm cụm thành công.'
  });
});

const updateCluster = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { clusterCode, clusterName, statusId } = req.body;

  if (!clusterCode || !clusterName) {
    return res.status(400).json({
      error: 'Mã cụm và Tên cụm là bắt buộc.'
    });
  }

  const updated = await clusterService.updateCluster(Number(id), {
    clusterCode,
    clusterName,
    statusId
  });

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy cụm.'
    });
  }

  return res.json({
    message: 'Đã cập nhật cụm thành công.'
  });
});

const deactivateCluster = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await clusterService.deactivateCluster(Number(id));

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy cụm.'
    });
  }

  return res.json({
    message: 'Đã chuyển cụm sang Không sử dụng.'
  });
});

module.exports = {
  getClusters,
  createCluster,
  updateCluster,
  deactivateCluster
};