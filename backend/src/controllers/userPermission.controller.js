const userPermissionService =
    require('../services/userPermission.service');

async function getPermissionMatrix(
    req,
    res,
    next
) {
    try {
        const data =
            await userPermissionService
                .getUserPermissionMatrix(
                    req.params.id
                );

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function savePermissionOverrides(
    req,
    res,
    next
) {
    try {
        const data =
            await userPermissionService
                .saveUserPermissionOverrides(
                    req.params.id,
                    req.body,
                    req.user.id
                );

        res.json({
            success: true,
            message:
                'Cập nhật phân quyền thành công.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPermissionMatrix,
    savePermissionOverrides,
};