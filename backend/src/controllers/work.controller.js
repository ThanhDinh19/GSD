const asyncHandler = require('../utils/asyncHandler');
const workService = require('../services/work.service');

const getWorks = asyncHandler(async (req, res) => {
  const works = await workService.getWorks();
  return res.json(works);
});


const createWork = asyncHandler(async (req, res) => {
  const { workCode, workName, statusId } = req.body;

  if (!workCode || !workName) {
    return res.status(400).json({
      error: 'Mã và Tên là bắt buộc.'
    });
  }

  await workService.createWork({
    workCode,
    workName,
    statusId
  });

  return res.json({
    message: 'Đã thêm thành công.'
  });
});


const updateWork = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { workCode, workName, statusId } = req.body;

  if (!workCode || !workName) {
    return res.status(400).json({
      error: 'Mã và cụm là bắt buộc.'
    });
  }

  const updated = await workService.updateWork(Number(id), {
    workCode,
    workName,
    statusId
  });

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy công việc.'
    });
  }

  return res.json({
    message: 'Đã cập nhật thành công.'
  });
});

module.exports = {
    getWorks,
    createWork,
    updateWork,
}