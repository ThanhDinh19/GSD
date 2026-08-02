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

// async function saveMapping(sourceId, payload) {
//     const pool = getPool();
//     const transaction = new sql.Transaction(pool);

//     const details = Array.isArray(payload.details) ? payload.details : [];
//     const totalActions = details.length;
//     const totalTmu = details.reduce((sum, item) => {
//         return sum + Number(item.tmu || 0);
//     }, 0);

//     await transaction.begin();

//     try {
//         const sourceCheck = await new sql.Request(transaction)
//             .input('source_id', sql.Int, sourceId)
//             .query(`
//         SELECT COUNT(*) AS count
//         FROM sources
//         WHERE id = @source_id
//       `);

//         if (sourceCheck.recordset[0].count === 0) {
//             const err = new Error('Không tìm thấy source.');
//             err.statusCode = 404;
//             throw err;
//         }

//         let headerId;

//         const headerResult = await new sql.Request(transaction)
//             .input('source_id', sql.Int, sourceId)
//             .query(`
//         SELECT id
//         FROM source_action_headers
//         WHERE source_id = @source_id
//       `);

//         if (headerResult.recordset.length > 0) {
//             headerId = headerResult.recordset[0].id;

//             await new sql.Request(transaction)
//                 .input('header_id', sql.Int, headerId)
//                 .query(`
//           DELETE FROM source_action_details
//           WHERE header_id = @header_id
//         `);

//             await new sql.Request(transaction)
//                 .input('header_id', sql.Int, headerId)
//                 .input('total_actions', sql.Int, totalActions)
//                 .input('total_tmu', sql.Int, totalTmu)
//                 .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
//                 .query(`
//           UPDATE source_action_headers
//           SET
//             total_actions = @total_actions,
//             total_tmu = @total_tmu,
//             note = @note,
//             updated_at = SYSDATETIME()
//           WHERE id = @header_id
//         `);
//         } else {
//             const insertHeaderResult = await new sql.Request(transaction)
//                 .input('source_id', sql.Int, sourceId)
//                 .input('total_actions', sql.Int, totalActions)
//                 .input('total_tmu', sql.Int, totalTmu)
//                 .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
//                 .query(`
//           INSERT INTO source_action_headers (
//             source_id,
//             total_actions,
//             total_tmu,
//             note
//           )
//           OUTPUT INSERTED.id
//           VALUES (
//             @source_id,
//             @total_actions,
//             @total_tmu,
//             @note
//           )
//         `);

//             headerId = insertHeaderResult.recordset[0].id;
//         }

//         for (let index = 0; index < details.length; index += 1) {
//             const item = details[index];

//             await new sql.Request(transaction)
//                 .input('header_id', sql.Int, headerId)
//                 .input('line_no', sql.Int, index + 1)
//                 .input('gsd_code_id', sql.Int, item.gsdCodeId ? Number(item.gsdCodeId) : null)
//                 .input('action_name', sql.NVarChar, String(item.actionName || '').trim())
//                 .input('gsd_code', sql.NVarChar, item.gsdCode ? String(item.gsdCode).trim() : null)
//                 .input('code_new', sql.NVarChar, item.codeNew ? String(item.codeNew).trim() : null)
//                 .input('frequency', sql.Int, item.frequency !== null && item.frequency !== undefined && item.frequency !== '' ? Number(item.frequency) : null)
//                 .input('tmu', sql.Int, item.tmu !== null && item.tmu !== undefined && item.tmu !== '' ? Number(item.tmu) : 0)
//                 .input('note', sql.NVarChar, item.note ? String(item.note).trim() : null)
//                 .query(`
//           INSERT INTO source_action_details (
//             header_id,
//             line_no,
//             gsd_code_id,
//             action_name,
//             gsd_code,
//             code_new,
//             frequency,
//             tmu,
//             note
//           )
//           VALUES (
//             @header_id,
//             @line_no,
//             @gsd_code_id,
//             @action_name,
//             @gsd_code,
//             @code_new,
//             @frequency,
//             @tmu,
//             @note
//           )
//         `);
//         }

//         await transaction.commit();

//         return {
//             totalActions,
//             totalTmu,
//         };
//     } catch (err) {
//         await transaction.rollback();
//         throw err;
//     }
// }
async function saveMapping(
    sourceId,
    payload
) {
    const pool = await getPool();

    const transaction =
        new sql.Transaction(pool);

    const details =
        Array.isArray(payload.details)
            ? payload.details
            : [];

    const totalActions =
        details.length;

    const totalTmu =
        details.reduce(
            (sum, item) => {
                return (
                    sum +
                    Number(item.tmu || 0)
                );
            },
            0
        );

    let transactionStarted = false;

    try {
        await transaction.begin();

        transactionStarted = true;

        /*
         * 1. Kiểm tra source tồn tại.
         */
        const sourceCheck =
            await new sql.Request(
                transaction
            )
                .input(
                    'source_id',
                    sql.Int,
                    sourceId
                )
                .query(`
                    SELECT TOP 1
                        id
                    FROM dbo.sources
                    WHERE id = @source_id;
                `);

        if (
            sourceCheck.recordset.length ===
            0
        ) {
            const error = new Error(
                'Không tìm thấy source.'
            );

            error.statusCode = 404;

            throw error;
        }

        /*
         * 2. Lấy header hiện tại.
         */
        const headerResult =
            await new sql.Request(
                transaction
            )
                .input(
                    'source_id',
                    sql.Int,
                    sourceId
                )
                .query(`
                    SELECT TOP 1
                        id
                    FROM dbo.source_action_headers
                    WHERE source_id =
                          @source_id;
                `);

        let headerId;

        if (
            headerResult.recordset.length >
            0
        ) {
            headerId =
                Number(
                    headerResult
                        .recordset[0]
                        .id
                );
        } else {
            /*
             * Source chưa có header thì tạo mới.
             */
            const insertHeaderResult =
                await new sql.Request(
                    transaction
                )
                    .input(
                        'source_id',
                        sql.Int,
                        sourceId
                    )
                    .input(
                        'total_actions',
                        sql.Int,
                        totalActions
                    )
                    .input(
                        'total_tmu',
                        sql.Int,
                        totalTmu
                    )
                    .input(
                        'note',
                        sql.NVarChar,
                        payload.note
                            ? String(
                                payload.note
                            ).trim()
                            : null
                    )
                    .query(`
                        INSERT INTO dbo.source_action_headers (
                            source_id,
                            total_actions,
                            total_tmu,
                            note
                        )
                        OUTPUT
                            INSERTED.id
                                AS [id]
                        VALUES (
                            @source_id,
                            @total_actions,
                            @total_tmu,
                            @note
                        );
                    `);

            headerId =
                Number(
                    insertHeaderResult
                        .recordset[0]
                        .id
                );
        }

        /*
         * 3. Lấy các detail đang tồn tại.
         */
        const existingDetailResult =
            await new sql.Request(
                transaction
            )
                .input(
                    'header_id',
                    sql.Int,
                    headerId
                )
                .query(`
                    SELECT
                        id,
                        action_name
                    FROM dbo.source_action_details
                    WHERE header_id =
                          @header_id
                    ORDER BY line_no;
                `);

        const existingDetails =
            existingDetailResult.recordset;

        const existingIds =
            new Set(
                existingDetails.map(
                    (item) =>
                        Number(item.id)
                )
            );

        /*
         * ID của các dòng cũ được frontend
         * gửi lại trong lần lưu này.
         */
        const submittedExistingIds =
            new Set();

        /*
         * Kiểm tra trường hợp frontend làm mất
         * toàn bộ ID của dữ liệu cũ.
         *
         * Nếu không chặn, backend sẽ hiểu tất cả
         * là dòng mới và có nguy cơ thay đổi ID.
         */
        const payloadExistingIds =
            details
                .map((item) => {
                    const rawId =
                        item.id ??
                        item.detailId ??
                        item.detail_id ??
                        null;

                    if (
                        rawId === null ||
                        rawId === undefined ||
                        rawId === ''
                    ) {
                        return null;
                    }

                    const id =
                        Number(rawId);

                    return Number.isInteger(id) &&
                        id > 0
                        ? id
                        : null;
                })
                .filter(
                    (id) =>
                        id !== null
                );

        if (
            existingIds.size > 0 &&
            details.length > 0 &&
            payloadExistingIds.length === 0
        ) {
            const error = new Error(
                'Dữ liệu gửi lên không còn ID của các thao tác cũ. Hệ thống dừng lưu để tránh thay đổi liên kết dữ liệu.'
            );

            error.statusCode = 400;
            error.code =
                'DETAIL_IDS_MISSING';

            throw error;
        }

        /*
         * 4. Đồng bộ từng detail.
         *
         * Có ID:
         * → UPDATE, giữ nguyên ID.
         *
         * Không có ID:
         * → INSERT dòng mới.
         */
        for (
            let index = 0;
            index < details.length;
            index += 1
        ) {
            const item =
                details[index];

            const rawDetailId =
                item.id ??
                item.detailId ??
                item.detail_id ??
                null;

            const detailId =
                rawDetailId !== null &&
                rawDetailId !== undefined &&
                rawDetailId !== ''
                    ? Number(rawDetailId)
                    : null;

            const actionName =
                String(
                    item.actionName || ''
                ).trim();

            if (!actionName) {
                const error = new Error(
                    `Tên thao tác tại dòng ${
                        index + 1
                    } là bắt buộc.`
                );

                error.statusCode = 400;
                error.code =
                    'ACTION_NAME_REQUIRED';

                throw error;
            }

            const detailRequest =
                new sql.Request(
                    transaction
                )
                    .input(
                        'header_id',
                        sql.Int,
                        headerId
                    )
                    .input(
                        'line_no',
                        sql.Int,
                        index + 1
                    )
                    .input(
                        'gsd_code_id',
                        sql.Int,
                        item.gsdCodeId !==
                            null &&
                        item.gsdCodeId !==
                            undefined &&
                        item.gsdCodeId !== ''
                            ? Number(
                                item.gsdCodeId
                            )
                            : null
                    )
                    .input(
                        'action_name',
                        sql.NVarChar,
                        actionName
                    )
                    .input(
                        'gsd_code',
                        sql.NVarChar,
                        item.gsdCode
                            ? String(
                                item.gsdCode
                            ).trim()
                            : null
                    )
                    .input(
                        'code_new',
                        sql.NVarChar,
                        item.codeNew
                            ? String(
                                item.codeNew
                            ).trim()
                            : null
                    )
                    .input(
                        'frequency',
                        sql.Int,
                        item.frequency !==
                            null &&
                        item.frequency !==
                            undefined &&
                        item.frequency !== ''
                            ? Number(
                                item.frequency
                            )
                            : null
                    )
                    .input(
                        'tmu',
                        sql.Int,
                        item.tmu !== null &&
                        item.tmu !==
                            undefined &&
                        item.tmu !== ''
                            ? Number(
                                item.tmu
                            )
                            : 0
                    )
                    .input(
                        'note',
                        sql.NVarChar,
                        item.note
                            ? String(
                                item.note
                            ).trim()
                            : null
                    );

            if (detailId !== null) {
                /*
                 * Kiểm tra ID hợp lệ.
                 */
                if (
                    !Number.isInteger(
                        detailId
                    ) ||
                    detailId <= 0
                ) {
                    const error = new Error(
                        `ID thao tác tại dòng ${
                            index + 1
                        } không hợp lệ.`
                    );

                    error.statusCode = 400;
                    error.code =
                        'INVALID_DETAIL_ID';

                    throw error;
                }

                /*
                 * Không cho cập nhật một detail
                 * thuộc source/header khác.
                 */
                if (
                    !existingIds.has(
                        detailId
                    )
                ) {
                    const error = new Error(
                        `Thao tác ID ${detailId} không thuộc source hiện tại.`
                    );

                    error.statusCode = 400;
                    error.code =
                        'DETAIL_NOT_IN_HEADER';

                    throw error;
                }

                /*
                 * Không cho một ID xuất hiện
                 * nhiều lần trong payload.
                 */
                if (
                    submittedExistingIds.has(
                        detailId
                    )
                ) {
                    const error = new Error(
                        `Thao tác ID ${detailId} bị gửi trùng.`
                    );

                    error.statusCode = 400;
                    error.code =
                        'DUPLICATE_DETAIL_ID';

                    throw error;
                }

                submittedExistingIds.add(
                    detailId
                );

                const updateResult =
                    await detailRequest
                        .input(
                            'detail_id',
                            sql.Int,
                            detailId
                        )
                        .query(`
                            UPDATE dbo.source_action_details
                            SET
                                line_no =
                                    @line_no,

                                gsd_code_id =
                                    @gsd_code_id,

                                action_name =
                                    @action_name,

                                gsd_code =
                                    @gsd_code,

                                code_new =
                                    @code_new,

                                frequency =
                                    @frequency,

                                tmu =
                                    @tmu,

                                note =
                                    @note

                            WHERE id =
                                  @detail_id
                              AND header_id =
                                  @header_id;
                        `);

                if (
                    !updateResult.rowsAffected ||
                    updateResult.rowsAffected[0] ===
                        0
                ) {
                    const error = new Error(
                        `Không cập nhật được thao tác ID ${detailId}.`
                    );

                    error.statusCode = 400;
                    error.code =
                        'DETAIL_UPDATE_FAILED';

                    throw error;
                }
            } else {
                /*
                 * Dòng mới chưa có ID.
                 */
                await detailRequest.query(`
                    INSERT INTO dbo.source_action_details (
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
                    );
                `);
            }
        }

        /*
         * 5. Tìm các dòng cũ không còn xuất hiện
         * trong payload.
         */
        const removedIds =
            [...existingIds].filter(
                (id) =>
                    !submittedExistingIds.has(
                        id
                    )
            );

        for (
            const removedId of removedIds
        ) {
            /*
             * Kiểm tra detail có đang được
             * gsd_analysis_details sử dụng.
             */
            const referenceResult =
                await new sql.Request(
                    transaction
                )
                    .input(
                        'detail_id',
                        sql.Int,
                        removedId
                    )
                    .query(`
                        SELECT
                            COUNT(*) AS
                                [referenceCount]
                        FROM dbo.gsd_analysis_details
                        WHERE
                            source_action_detail_id =
                            @detail_id;
                    `);

            const referenceCount =
                Number(
                    referenceResult
                        .recordset[0]
                        ?.referenceCount ||
                    0
                );

            if (referenceCount > 0) {
                const existingDetail =
                    existingDetails.find(
                        (item) =>
                            Number(
                                item.id
                            ) ===
                            removedId
                    );

                const error = new Error(
                    `Không thể xóa thao tác "${
                        existingDetail
                            ?.action_name ||
                        removedId
                    }" vì đang được ${referenceCount} dòng phân tích GSD sử dụng.`
                );

                error.statusCode = 409;
                error.code =
                    'SOURCE_ACTION_IN_USE';

                throw error;
            }

            /*
             * Chỉ xóa detail chưa từng được
             * phân tích GSD sử dụng.
             */
            await new sql.Request(
                transaction
            )
                .input(
                    'detail_id',
                    sql.Int,
                    removedId
                )
                .input(
                    'header_id',
                    sql.Int,
                    headerId
                )
                .query(`
                    DELETE FROM
                        dbo.source_action_details
                    WHERE id =
                          @detail_id
                      AND header_id =
                          @header_id;
                `);
        }

        /*
         * 6. Cập nhật tổng header sau khi
         * đồng bộ detail thành công.
         */
        await new sql.Request(
            transaction
        )
            .input(
                'header_id',
                sql.Int,
                headerId
            )
            .input(
                'total_actions',
                sql.Int,
                totalActions
            )
            .input(
                'total_tmu',
                sql.Int,
                totalTmu
            )
            .input(
                'note',
                sql.NVarChar,
                payload.note
                    ? String(
                        payload.note
                    ).trim()
                    : null
            )
            .query(`
                UPDATE dbo.source_action_headers
                SET
                    total_actions =
                        @total_actions,

                    total_tmu =
                        @total_tmu,

                    note =
                        @note,

                    updated_at =
                        SYSDATETIME()

                WHERE id =
                      @header_id;
            `);

        await transaction.commit();

        transactionStarted = false;

        return {
            headerId,
            totalActions,
            totalTmu,
        };
    } catch (error) {
        if (transactionStarted) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error(
                    'Rollback saveMapping thất bại:',
                    rollbackError
                );
            }
        }

        throw error;
    }
}

module.exports = {
    getMappingBySourceId,
    saveMapping,
};