const roleService =
    require('../services/role.service');

const {
    parsePositiveId,
} = require('../utils/validation');

/**
 * GET /api/roles
 * Lấy danh sách vai trò.
 */
async function getRoles(req, res, next) {
    try {
        const data =
            await roleService.getRoles();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/roles/:id
 * Lấy chi tiết một vai trò.
 */
async function getRoleById(req, res, next) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID vai trò'
        );

        const data =
            await roleService.getRoleById(id);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/roles
 * Tạo vai trò mới.
 */
async function createRole(req, res, next) {
    try {
        const data =
            await roleService.createRole(
                req.body,
                req.user.id
            );

        return res.status(201).json({
            success: true,
            message:
                'Tạo vai trò thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/roles/:id
 * Không xóa cứng, chỉ chuyển role sang ngừng sử dụng.
 */
async function deactivateRole(
    req,
    res,
    next
) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID vai trò'
        );

        const data =
            await roleService.deactivateRole(
                id,
                req.user.id
            );

        return res.status(200).json({
            success: true,
            message:
                'Đã ngừng sử dụng vai trò.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function updateRole(
    req,
    res,
    next
) {
    try {
        const id = parsePositiveId(
            req.params.id,
            'ID vai trò'
        );

        const data =
            await roleService.updateRole(
                id,
                req.body,
                req.user.id
            );

        return res.status(200).json({
            success: true,
            message:
                'Cập nhật vai trò thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRoles,
    getRoleById,
    createRole,
    deactivateRole,
    updateRole,
};