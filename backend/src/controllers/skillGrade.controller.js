const asyncHandler = require('../utils/asyncHandler');
const skillGradeService = require('../services/skillGrade.service');

const getSkillGrades = asyncHandler(async (req, res) => {
  const data = await skillGradeService.getSkillGrades();
  return res.json(data);
});


const createSkillGrade = asyncHandler(async (req, res) => {
  const { level, note, status_id } = req.body;

  if (!level) {
    return res.status(400).json({
      error: 'Cấp bậc là bắt buộc.'
    });
  }

  await skillGradeService.createSkillGrade({
    level,
    note,
    status_id
  });

  return res.json({
    message: 'Đã thêm thành công.'
  });
});


const updateSkillGrade = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { level, note, status_id } = req.body;

  if (!level) {
    return res.status(400).json({
      error: 'cấp bậc là bắt buộc.'
    });
  }

  const updated = await skillGradeService.updateSkillGrade(Number(id), {
    level,
    note,
    status_id
  });

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy bậc thợ.'
    });
  }

  return res.json({
    message: 'Đã cập nhật thành công.'
  });
});

module.exports = {
    getSkillGrades,
    createSkillGrade,
    updateSkillGrade,
}