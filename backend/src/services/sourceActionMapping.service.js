const { getPool, sql } = require('../database/connection');

async function getMappingBySourceId(sourceId) {
    const pool = getPool();

    const sourceResult = await pool.request()
        .input('source_id', sql.Int, sourceId)
        .query(`
            SELECT
                s.id AS [id],
                s.source_code AS [sourceCode],
                s.source_name AS [sourceName],
                s.note AS [note],
                s.status_id AS [statusId]
            FROM sources s
            WHERE s.id = @source_id
        `);

    if (sourceResult.recordset.length === 0) {
        const err = new Error('Không tìm thấy source.');
        err.statusCode = 404;
        throw err;
    }

    const headerResult = await pool.request()
        .input('source_id', sql.Int, sourceId)
        .query(`
            SELECT
                h.id AS [id],
                h.source_id AS [sourceId],
                h.total_actions AS [totalActions],
                h.total_tmu AS [totalTmu],
                h.note AS [note],
                h.created_at AS [createdAt],
                h.updated_at AS [updatedAt]
            FROM source_action_headers h
            WHERE h.source_id = @source_id
        `);

    const header = headerResult.recordset[0] || null;

    if (!header) {
        return {
            source: sourceResult.recordset[0],
            header: null,
            totalActions: 0,
            totalTmu: 0,
            details: [],
        };
    }

    const detailResult = await pool.request()
        .input('header_id', sql.Int, header.id)
        .query(`
            SELECT
                d.id AS [id],
                d.header_id AS [headerId],
                d.line_no AS [lineNo],
                d.gsd_code_id AS [gsdCodeId],
                d.action_name AS [actionName],
                d.gsd_code AS [gsdCode],
                d.code_new AS [codeNew],
                d.frequency AS [frequency],
                d.tmu AS [tmu],
                d.note AS [note]
            FROM source_action_details d
            WHERE d.header_id = @header_id
            ORDER BY d.line_no
        `);

    return {
        source: sourceResult.recordset[0],
        header,
        totalActions: header.totalActions,
        totalTmu: header.totalTmu,
        details: detailResult.recordset,
    };
}

async function saveMapping(sourceId, payload) {
    const pool = getPool();
    const transaction = new sql.Transaction(pool);

    const details = Array.isArray(payload.details) ? payload.details : [];
    const totalActions = details.length;
    const totalTmu = details.reduce((sum, item) => {
        return sum + Number(item.tmu || 0);
    }, 0);

    await transaction.begin();

    try {
        const sourceCheck = await new sql.Request(transaction)
            .input('source_id', sql.Int, sourceId)
            .query(`
        SELECT COUNT(*) AS count
        FROM sources
        WHERE id = @source_id
      `);

        if (sourceCheck.recordset[0].count === 0) {
            const err = new Error('Không tìm thấy source.');
            err.statusCode = 404;
            throw err;
        }

        let headerId;

        const headerResult = await new sql.Request(transaction)
            .input('source_id', sql.Int, sourceId)
            .query(`
        SELECT id
        FROM source_action_headers
        WHERE source_id = @source_id
      `);

        if (headerResult.recordset.length > 0) {
            headerId = headerResult.recordset[0].id;

            await new sql.Request(transaction)
                .input('header_id', sql.Int, headerId)
                .query(`
          DELETE FROM source_action_details
          WHERE header_id = @header_id
        `);

            await new sql.Request(transaction)
                .input('header_id', sql.Int, headerId)
                .input('total_actions', sql.Int, totalActions)
                .input('total_tmu', sql.Int, totalTmu)
                .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
                .query(`
          UPDATE source_action_headers
          SET
            total_actions = @total_actions,
            total_tmu = @total_tmu,
            note = @note,
            updated_at = SYSDATETIME()
          WHERE id = @header_id
        `);
        } else {
            const insertHeaderResult = await new sql.Request(transaction)
                .input('source_id', sql.Int, sourceId)
                .input('total_actions', sql.Int, totalActions)
                .input('total_tmu', sql.Int, totalTmu)
                .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
                .query(`
          INSERT INTO source_action_headers (
            source_id,
            total_actions,
            total_tmu,
            note
          )
          OUTPUT INSERTED.id
          VALUES (
            @source_id,
            @total_actions,
            @total_tmu,
            @note
          )
        `);

            headerId = insertHeaderResult.recordset[0].id;
        }

        for (let index = 0; index < details.length; index += 1) {
            const item = details[index];

            await new sql.Request(transaction)
                .input('header_id', sql.Int, headerId)
                .input('line_no', sql.Int, index + 1)
                .input('gsd_code_id', sql.Int, item.gsdCodeId ? Number(item.gsdCodeId) : null)
                .input('action_name', sql.NVarChar, String(item.actionName || '').trim())
                .input('gsd_code', sql.NVarChar, item.gsdCode ? String(item.gsdCode).trim() : null)
                .input('code_new', sql.NVarChar, item.codeNew ? String(item.codeNew).trim() : null)
                .input('frequency', sql.Int, item.frequency !== null && item.frequency !== undefined && item.frequency !== '' ? Number(item.frequency) : null)
                .input('tmu', sql.Int, item.tmu !== null && item.tmu !== undefined && item.tmu !== '' ? Number(item.tmu) : 0)
                .input('note', sql.NVarChar, item.note ? String(item.note).trim() : null)
                .query(`
          INSERT INTO source_action_details (
            header_id,
            line_no,
            gsd_code_id,
            action_name,
            gsd_code,
            code_new,
            frequency,
            tmu,
            note
          )
          VALUES (
            @header_id,
            @line_no,
            @gsd_code_id,
            @action_name,
            @gsd_code,
            @code_new,
            @frequency,
            @tmu,
            @note
          )
        `);
        }

        await transaction.commit();

        return {
            totalActions,
            totalTmu,
        };
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

module.exports = {
    getMappingBySourceId,
    saveMapping,
};