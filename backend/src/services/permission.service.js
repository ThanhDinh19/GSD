const {
    getPool,
} = require('../database/connection');

async function getPermissionCatalog() {
    const pool = await getPool();

    const result = await pool
        .request()
        .query(`
            SELECT
                m.id AS [moduleId],
                m.module_code AS [moduleCode],
                m.module_name AS [moduleName],
                m.sort_order AS [moduleSortOrder],

                s.id AS [screenId],
                s.parent_screen_id
                    AS [parentScreenId],
                s.screen_code AS [screenCode],
                s.screen_name AS [screenName],
                s.route_path AS [routePath],
                s.sort_order AS [screenSortOrder],

                p.id AS [permissionId],
                p.permission_code
                    AS [permissionCode],
                p.permission_name
                    AS [permissionName],

                a.id AS [actionId],
                a.action_code AS [actionCode],
                a.action_name AS [actionName],
                a.action_group_code
                    AS [actionGroupCode],
                a.sort_order AS [actionSortOrder]

            FROM app.modules m

            INNER JOIN app.screens s
                ON s.module_id = m.id

            INNER JOIN auth.permissions p
                ON p.screen_id = s.id

            INNER JOIN app.actions a
                ON a.id = p.action_id

            WHERE m.status_id = 0
              AND s.status_id = 0
              AND p.status_id = 0
              AND a.status_id = 0

            ORDER BY
                m.sort_order,
                s.sort_order,
                a.sort_order;
        `);

    const moduleMap = new Map();

    for (const row of result.recordset) {
        if (!moduleMap.has(row.moduleId)) {
            moduleMap.set(row.moduleId, {
                id: row.moduleId,
                code: row.moduleCode,
                name: row.moduleName,
                screens: [],
            });
        }

        const module =
            moduleMap.get(row.moduleId);

        let screen = module.screens.find(
            (item) =>
                item.id === row.screenId
        );

        if (!screen) {
            screen = {
                id: row.screenId,
                parentScreenId:
                    row.parentScreenId,
                code: row.screenCode,
                name: row.screenName,
                routePath: row.routePath,
                permissions: [],
            };

            module.screens.push(screen);
        }

        screen.permissions.push({
            id: row.permissionId,
            code: row.permissionCode,
            name: row.permissionName,
            actionCode: row.actionCode,
            actionName: row.actionName,
            actionGroupCode:
                row.actionGroupCode,
        });
    }

    return Array.from(
        moduleMap.values()
    );
}

async function getScopeTypes() {
    const pool = await getPool();

    const result = await pool
        .request()
        .query(`
            SELECT
                id AS [id],
                scope_code AS [scopeCode],
                scope_name AS [scopeName],
                description AS [description]
            FROM auth.scope_types
            WHERE status_id = 0
            ORDER BY sort_order;
        `);

    return result.recordset;
}

module.exports = {
    getPermissionCatalog,
    getScopeTypes,
};