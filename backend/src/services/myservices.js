const { getPool, sql } = require('../database/connection');
const {mapSqlType} = require('../utils/mapSqlType');

async function vGSD30BizDoc() {
    const pool = getPool();

    const result = await pool.request().query(`
        SELECT * FROM dbo.vGSD30BizDoc   
    `);

    const data = result.recordset;

    const columns = Object.entries(result.recordset.columns).map(
        ([field, meta]) => ({
            field,
            label: field,
            type: mapSqlType(meta.type),
        })
    );

    return {
        columns,
        data,
    };
}

module.exports = {
    vGSD30BizDoc
}


