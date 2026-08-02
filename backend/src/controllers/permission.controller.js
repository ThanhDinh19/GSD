const permissionService =
    require('../services/permission.service');

async function getPermissionCatalog(
    req,
    res,
    next
) {
    try {
        const data =
            await permissionService
                .getPermissionCatalog();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function getScopeTypes(
    req,
    res,
    next
) {
    try {
        const data =
            await permissionService
                .getScopeTypes();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPermissionCatalog,
    getScopeTypes,
};