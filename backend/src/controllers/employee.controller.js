const service =
    require('../services/employee.service');

const {
    parsePositiveId,
} = require('../utils/validation');

async function getEmployees(req, res, next) {
    try {
        console.log('Employee query:', req.query);

        const data =
            await service.getEmployees({
                search:
                    req.query.search || null,

                statusId:
                    req.query.statusId ??
                    req.query.status_id ??
                    null,

                departmentCode:
                    req.query.departmentCode ??
                    req.query.department_code ??
                    null,
            });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function getEmployeeById(
    req,
    res,
    next
) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID nhân viên'
        );

        const data =
            await service.getEmployeeById(id);

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function createEmployee(
    req,
    res,
    next
) {
    try {
        const data =
            await service.createEmployee(
                req.body,
                req.user.id
            );

        return res.status(201).json({
            success: true,
            message:
                'Tạo nhân viên thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function updateEmployee(
    req,
    res,
    next
) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID nhân viên'
        );

        const data =
            await service.updateEmployee(
                id,
                req.body,
                req.user.id
            );

        return res.json({
            success: true,
            message:
                'Cập nhật nhân viên thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function deleteEmployee(
    req,
    res,
    next
) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID nhân viên'
        );

        const data =
            await service.deactivateEmployee(
                id,
                req.user.id
            );

        return res.json({
            success: true,
            message:
                'Đã ngừng sử dụng nhân viên.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function getEmployeeOptions(
    req,
    res,
    next
) {
    try {
        const data =
            await service.getEmployeeOptions(
                req.query.search
            );

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeOptions
};