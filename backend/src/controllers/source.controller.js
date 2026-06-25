const asyncHandler = require('../utils/asyncHandler');
const sourceService = require('../services/source.service');

const getSources = asyncHandler(async (req, res) => {
  const sources = await sourceService.getSources();
  return res.json(sources);
});

const createSource = asyncHandler(async (req, res) => {
  const { sourceCode, sourceName, note, statusId } = req.body;

  if (!sourceCode) {
    return res.status(400).json({
      error: 'Mã source là bắt buộc.'
    });
  }

  await sourceService.createSource({
    sourceCode,
    sourceName,
    note,
    statusId
  });

  return res.json({
    message: 'Đã thêm source thành công.'
  });
});

const updateSource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sourceCode, sourceName, note, statusId } = req.body;

  if (!sourceCode) {
    return res.status(400).json({
      error: 'Mã source là bắt buộc.'
    });
  }

  const updated = await sourceService.updateSource(Number(id), {
    sourceCode,
    sourceName,
    note,
    statusId
  });

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy source.'
    });
  }

  return res.json({
    message: 'Đã cập nhật source thành công.'
  });
});

const deactivateSource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await sourceService.deactivateSource(Number(id));

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy source.'
    });
  }

  return res.json({
    message: 'Đã chuyển source sang Không sử dụng.'
  });
});


async function importSourcesExcel(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Vui lòng chọn file Excel.',
      });
    }

    const result = await sourceService.importSourcesFromExcel(req.file.buffer);

    return res.json({
      message: 'Import danh mục source thành công.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSources,
  createSource,
  updateSource,
  deactivateSource,
  importSourcesExcel,
};