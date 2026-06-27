const asyncHandler = require('../utils/asyncHandler');
const machineEquipmentService = require('../services/machineEquipment.service');

const getMachineEquipments = asyncHandler(async (req, res) => {
  const data = await machineEquipmentService.getMachineEquipments();
  return res.json(data);
});

const getMachineEquiments_Test = asyncHandler(async (req, res) => {
  const data = await machineEquipmentService.getMachineEquipments_test();
  return res.json(data);
});

const createMachineEquipment = asyncHandler(async (req, res) => {
  const { machineCode, machineName } = req.body;

  if (!machineCode || !machineName) {
    return res.status(400).json({
      error: 'Mã MMTB và Tên MMTB là bắt buộc.',
    });
  }

  await machineEquipmentService.createMachineEquipment(req.body);

  return res.json({
    message: 'Đã thêm MMTB thành công.',
  });
});

const updateMachineEquipment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { machineCode, machineName } = req.body;

  if (!machineCode || !machineName) {
    return res.status(400).json({
      error: 'Mã MMTB và Tên MMTB là bắt buộc.',
    });
  }

  const updated = await machineEquipmentService.updateMachineEquipment(Number(id), req.body);

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy MMTB.',
    });
  }

  return res.json({
    message: 'Đã cập nhật MMTB thành công.',
  });
});

const deactivateMachineEquipment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await machineEquipmentService.deactivateMachineEquipment(Number(id));

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy MMTB.',
    });
  }

  return res.json({
    message: 'Đã chuyển MMTB sang Không sử dụng.',
  });
});

module.exports = {
  getMachineEquipments,
  createMachineEquipment,
  updateMachineEquipment,
  deactivateMachineEquipment,
  getMachineEquiments_Test,
};