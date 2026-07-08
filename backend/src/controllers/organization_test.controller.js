const organizationService_test = require('../services/organization_test.service');
const asyncHandler = require('../utils/asyncHandler');

// const getDepartmentTypes_test = async (req, res) => {
//   try {
//     const data = await organizationService_test.getDepartmentTypes_test();
//     res.json(data);
//   } catch (error) {
//     console.error('getDepartmentTypes error:', error);
//     res.status(500).json({ message: 'Không lấy được danh mục loại phòng ban' });
//   }
// };

// const createDepartmentType = async (req, res) => {
//   try {
//     const data = await organizationService_test.createDepartmentType_test(req.body);
//     res.status(201).json(data);
//   } catch (error) {
//     console.error('createDepartmentType error:', error);
//     res.status(500).json({ message: error.message || 'Không tạo được loại phòng ban' });
//   }
// };


// const updateDepartmentType_test = async (req, res) => {
//   try {
//     const data = await organizationService_test.updateDepartmentType_test(req.params.id, req.body);
//     res.json(data);
//   } catch (error) {
//     console.error('updateDepartmentType error:', error);
//     res.status(500).json({ message: error.message || 'Không cập nhật được loại phòng ban' });
//   }
// };

const getDepartmentTree_test = async (req, res) => {
  try {
    const includeInactive =
      req.query.includeInactive === 'true' ||
      req.query.includeInactive === '1';

    const data = await organizationService_test.getDepartmentTree(includeInactive);
    res.json(data);
  } catch (error) {
    console.error('getDepartmentTree error:', error);
    res.status(500).json({ message: 'Không lấy được cây sơ đồ tổ chức' });
  }
};

const getDepartmentById_test = async (req, res) => {
  try {
    const data = await organizationService_test.getDepartmentById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    }

    res.json(data);
  } catch (error) {
    console.error('getDepartmentById error:', error);
    res.status(500).json({ message: 'Không lấy được thông tin phòng ban' });
  }
};

const createDepartment_test = async (req, res) => {
  try {
    const data = await organizationService_test.createDepartment(req.body);
    res.status(201).json(data);
  } catch (error) {
    console.error('createDepartment error:', error);
    res.status(500).json({ message: error.message || 'Không tạo được phòng ban' });
  }
};

const updateDepartment_test = async (req, res) => {
  try {
    const data = await organizationService_test.updateDepartment(
      req.params.code,
      req.body
    );

    return res.status(200).json({
      message: 'Cập nhật thành công',
      data
    });
  } catch (error) {
    console.error('updateDepartment error:', error);

    return res.status(500).json({
      message: error.message || 'Không cập nhật được phòng ban'
    });
  }
};

const dissolveDepartment_test = async (req, res) => {
  try {
    const data = await organizationService_test.dissolveDepartment(req.params.id);
    res.json(data);
  } catch (error) {
    console.error('dissolveDepartment error:', error);
    res.status(500).json({ message: error.message || 'Không giải thể được phòng ban' });
  }
};

const getEmployees_test = async (req, res) => {
  try {
    const data = await organizationService_test.getEmployees();
    res.json(data);
  } catch (error) {
    console.error('getEmployees error:', error);
    res.status(500).json({ message: 'Không lấy được danh sách nhân sự' });
  }
};

// loai phong ban test
const getDepartmentTypes_test_1 = async (req, res) => {
  try {
    const data = await organizationService_test.getDepartmentTypes_test();
    res.json(data);
  } catch (error) {
    console.error('getDepartmentTypes_test error:', error);
    res.status(500).json({ message: 'Không lấy được danh mục loại phòng ban' });
  }
};

const createDepartmentType_test_1 = asyncHandler(async (req, res) => {
  const { departmentTypeCode, departmentTypeName, statusId } = req.body;

  if (!departmentTypeCode || !departmentTypeName) {
    return res.status(400).json({
      error: 'Mã và Tên là bắt buộc.'
    });
  }

  await organizationService_test.createDepartmentType_test({
    departmentTypeCode,
    departmentTypeName,
    statusId
  });

  return res.json({
    message: 'Đã thêm thành công.'
  });
});

const updateDepartmentType_test_1 = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { departmentTypeCode, departmentTypeName, statusId } = req.body;

  if (!departmentTypeCode || !departmentTypeName) {
    return res.status(400).json({
      error: 'Mã và tên là bắt buộc.'
    });
  }

  const updated = await organizationService_test.updateDepartmentType_test(Number(id), {
    departmentTypeCode,
    departmentTypeName,
    statusId
  });

  if (!updated) {
    return res.status(404).json({
      error: 'Không tìm thấy loại phòng ban.'
    });
  }

  return res.json({
    message: 'Đã cập nhật thành công.'
  });
});

module.exports = {
//   getDepartmentTypes_test,
// createDepartmentType,
//   updateDepartmentType_test,
  getDepartmentTree_test,
  getDepartmentById_test,
  createDepartment_test,
  updateDepartment_test,
  dissolveDepartment_test,
  getEmployees_test, 
  getDepartmentTypes_test_1,
  createDepartmentType_test_1,
  updateDepartmentType_test_1,
};