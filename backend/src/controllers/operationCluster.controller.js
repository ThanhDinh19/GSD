const operationClusterService = require('../services/operationCluster.service');

const getOperationClusterHeaders = async (req, res) => {
  try {
    const data = await operationClusterService.getOperationClusterHeaders();

    return res.status(200).json({
      success: true,
      data,
    })

  } catch (error) {
    console.error('getOperationClusterHeaders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không lấy được danh sách kho cụm công đoạn'
    });
  }
};

const getGsdOptions = async (req, res) => {
  try {
    const data = await operationClusterService.getGsdOptions();

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('getGsdOptions error:', error);
    res.status(500).json({ message: 'Không lấy được danh sách công đoạn GSD' });
  }
};

const getGsdActions = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: 'Thiếu id công đoạn GSD',
      });
    }

    const data = await operationClusterService.getGsdActions(id);

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('getGsdActions error:', error);
    res.status(500).json({
      message: 'Không lấy được danh sách thao tác GSD',
    });
  }
};

const getOperationClusterById = async (req, res) => {
  try {
    const data = await operationClusterService.getOperationClusterById(Number(req.params.id));

    if (!data) {
      return res.status(404).json({ message: 'Không tìm thấy chứng từ' });
    }

    return res.status(200).json({
      success: true,
      data,
    })

  } catch (error) {
    console.error('getOperationClusterById error:', error);
    res.status(500).json({ message: 'Không lấy được chi tiết chứng từ' });
  }
};

const createOperationCluster = async (req, res) => {
  try {
    const data = await operationClusterService.createOperationCluster(req.body, {
      userId:
        req.user.id,

      employeeId:
        req.user
          .employeeId,

      departmentCode:
        req.user
          .departmentCode,

    });
    res.status(201).json(data);
  } catch (error) {
    console.error('createOperationCluster error:', error);

    res.status(400).json({
      message: error.message || 'Không tạo được kho cụm công đoạn',
    });
  }
};

const updateOperationCluster = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: 'ID chứng từ không hợp lệ',
      });
    }

    const data = await operationClusterService.updateOperationCluster(id, req.body,
      {
        userId:
          req.user.id,

        employeeId:
          req.user
            .employeeId,

        departmentCode:
          req.user
            .departmentCode,

      });

    res.json(data);
  } catch (error) {
    console.error('updateOperationCluster error:', error);

    res.status(400).json({
      message: error.message || 'Không cập nhật được kho cụm công đoạn',
    });
  }
};

const copyOperationCluster = async (req, res) => {
  try {
    const data =
      await operationClusterService.copyOperationCluster(
        req.body,
        {
          userId:
            req.user.id,

          employeeId:
            req.user.employeeId,

          departmentCode:
            req.user.departmentCode,
        }
      );

    return res.status(201).json(data);
  } catch (error) {
    console.error(
      'copyOperationCluster error:',
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        'Không sao chép được kho cụm công đoạn',
    });
  }
};

module.exports = {
  getOperationClusterHeaders,
  getGsdOptions,
  getOperationClusterById,
  createOperationCluster,
  getGsdActions,
  updateOperationCluster,
  copyOperationCluster
};