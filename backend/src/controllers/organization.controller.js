const organizationService = require('../services/organization.service');

const getDepartmentTypes = async (req, res) => {
  try {
    const data = await organizationService.getDepartmentTypes();
    res.json(data);
  } catch (error) {
    console.error('getDepartmentTypes error:', error);
    res.status(500).json({ message: 'Không lấy được danh mục loại phòng ban' });
  }
};

const createDepartmentType = async (req, res) => {
  try {
    const data = await organizationService.createDepartmentType(req.body);
    res.status(201).json(data);
  } catch (error) {
    console.error('createDepartmentType error:', error);
    res.status(500).json({ message: error.message || 'Không tạo được loại phòng ban' });
  }
};

const updateDepartmentType = async (req, res) => {
  try {
    const data = await organizationService.updateDepartmentType(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    console.error('updateDepartmentType error:', error);
    res.status(500).json({ message: error.message || 'Không cập nhật được loại phòng ban' });
  }
};

const getDepartmentTree = async (req, res) => {
  try {
    const includeInactive =
      req.query.includeInactive === 'true' ||
      req.query.includeInactive === '1';

    const data = await organizationService.getDepartmentTree(includeInactive);
    res.json(data);
  } catch (error) {
    console.error('getDepartmentTree error:', error);
    res.status(500).json({ message: 'Không lấy được cây sơ đồ tổ chức' });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const data = await organizationService.getDepartmentById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    }

    res.json(data);
  } catch (error) {
    console.error('getDepartmentById error:', error);
    res.status(500).json({ message: 'Không lấy được thông tin phòng ban' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const data = await organizationService.createDepartment(req.body);
    res.status(201).json(data);
  } catch (error) {
    console.error('createDepartment error:', error);
    res.status(500).json({ message: error.message || 'Không tạo được phòng ban' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const data = await organizationService.updateDepartment(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    console.error('updateDepartment error:', error);
    res.status(500).json({ message: error.message || 'Không cập nhật được phòng ban' });
  }
};

const dissolveDepartment = async (req, res) => {
  try {
    const data = await organizationService.dissolveDepartment(req.params.id);
    res.json(data);
  } catch (error) {
    console.error('dissolveDepartment error:', error);
    res.status(500).json({ message: error.message || 'Không giải thể được phòng ban' });
  }
};

const getEmployees = async (req, res) => {
  try {
    const data = await organizationService.getEmployees();
    res.json(data);
  } catch (error) {
    console.error('getEmployees error:', error);
    res.status(500).json({ message: 'Không lấy được danh sách nhân sự' });
  }
};

module.exports = {
  getDepartmentTypes,
  createDepartmentType,
  updateDepartmentType,
  getDepartmentTree,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  dissolveDepartment,
  getEmployees, 
};