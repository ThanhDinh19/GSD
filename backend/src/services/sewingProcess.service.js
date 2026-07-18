const { getPool, sql } = require('../database/connection');

function toNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') return defaultValue;

    const numberValue = Number(value);

    return Number.isNaN(numberValue) ? defaultValue : numberValue;
}

function round4(value) {
    return Math.round(toNumber(value, 0) * 10000) / 10000;
}

function normalizeEfficiency(value) {
    const numberValue = toNumber(value, 0);

    if (numberValue <= 0) return 1;

    // Cho phép frontend gửi 85 hoặc 0.85 đều được hiểu là 85%
    if (numberValue > 1) {
        return numberValue / 100;
    }

    return numberValue;
}

function generateDocumentCode() {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');

    return `QTM${yyyy}${mm}${dd}${hh}${mi}${ss}${ms}`;
}

function normalizeHeader(payload) {
    return {
        documentCode: payload.documentCode || payload.document_code || generateDocumentCode(),

        customerId: payload.customerId ?? payload.customer_id ?? null,
        customerCode: payload.customerCode ?? payload.customer_code ?? null,
        customerName: payload.customerName ?? payload.customer_name ?? null,

        itemCode: payload.itemCode ?? payload.item_code ?? null,
        productionLine: payload.productionLine ?? payload.production_line ?? null,
        productionRound: payload.productionRound ?? payload.production_round ?? null,

        workingHours: toNumber(payload.workingHours ?? payload.working_hours, 9),
        manpower: payload.manpower === '' ? null : payload.manpower ?? null,
        productionManpower: payload.productionManpower ?? payload.production_manpower ?? null,
        quantity: payload.quantity ?? null,

        effectiveDate: payload.effectiveDate ?? payload.effective_date ?? null,
        issuedDate: payload.issuedDate ?? payload.issued_date ?? null,

        priceMode: payload.priceMode ?? payload.price_mode ?? 'GSD',
        statusId: payload.statusId ?? payload.status_id ?? 0,
        note: payload.note ?? null,
    };
}

function normalizeLine(row, index) {
    return {
        gsdAnalysisId: row.gsdAnalysisId ?? row.gsd_analysis_id ?? null,
        sourceDocumentCode: row.sourceDocumentCode ?? row.source_document_code ?? null,
        sourceLineId: row.sourceLineId ?? row.source_line_id ?? null,

        lineNo: toNumber(row.lineNo ?? row.line_no, index + 1),
        clusterNo: row.clusterNo ?? row.cluster_no ?? null,
        clusterName: row.clusterName ?? row.cluster_name ?? null,

        operationCode: row.operationCode ?? row.operation_code ?? null,
        operationName: row.operationName ?? row.operation_name ?? '',

        lineOrder: row.lineOrder ?? row.line_order ?? index + 1,

        skillGradeId: row.skillGradeId ?? row.skill_grade_id ?? null,
        skillGradeLevel: row.skillGradeLevel ?? row.skill_grade_level ?? null,

        machineId: row.machineId ?? row.machine_id ?? null,
        machineCode: row.machineCode ?? row.machine_code ?? null,
        machineName: row.machineName ?? row.machine_name ?? null,

        samGsd: toNumber(row.samGsd ?? row.sam_gsd, 0),
        salaryCoefficient: toNumber(row.salaryCoefficient ?? row.salary_coefficient, 0),

        requiredEfficiency: row.requiredEfficiency ?? row.required_efficiency ?? null,

        totalActions: toNumber(row.totalActions ?? row.total_actions, 0),

        sewingEmployee: row.sewingEmployee ?? row.sewing_employee ?? null,
        
        toolNeed: row.toolNeed ?? row.tool_need ?? null,

        cbcTime: row.cbcTime ?? row.cbc_time ?? null,
        note: row.note ?? null,
    };
}

function normalizeImages(payload) {
    // Không gửi images => null, nghĩa là không cập nhật ảnh
    if (!Object.prototype.hasOwnProperty.call(payload, 'images')) {
        return null;
    }

    if (!Array.isArray(payload.images)) {
        return [];
    }

    return payload.images
        .filter((item) => item && item.imageUrl)
        .map((item, index) => ({
            imageUrl: item.imageUrl ?? item.image_url,
            imageFileName: item.imageFileName ?? item.image_file_name ?? null,
            sortOrder: toNumber(item.sortOrder ?? item.sort_order, index + 1),
            note: item.note ?? null,
        }));
}

function validatePayload(header, lines) {
    if (!header.documentCode) {
        const err = new Error('Mã chứng từ là bắt buộc.');
        err.statusCode = 400;
        throw err;
    }

    if (!Array.isArray(lines) || lines.length === 0) {
        const err = new Error('Quy trình may phải có ít nhất 1 dòng công đoạn.');
        err.statusCode = 400;
        throw err;
    }

    if (header.workingHours <= 0) {
        const err = new Error('Thời gian làm việc phải lớn hơn 0.');
        err.statusCode = 400;
        throw err;
    }

    if (toNumber(header.productionManpower, 0) <= 0) {
        const err = new Error('Nhân sự sản xuất phải lớn hơn 0.');
        err.statusCode = 400;
        throw err;
    }

    for (const line of lines) {
        if (!String(line.operationName || '').trim()) {
            const err = new Error(`Dòng ${line.lineNo} chưa có tên công đoạn.`);
            err.statusCode = 400;
            throw err;
        }
    }
}

function calculateSewingProcess(payload) {
    const header = normalizeHeader(payload);
    const inputLines = Array.isArray(payload.lines) ? payload.lines : [];
    const normalizedLines = inputLines.map(normalizeLine);

    validatePayload(header, normalizedLines);

    const priceMode = String(header.priceMode || 'GSD').toUpperCase();
    const productionManpower = toNumber(header.productionManpower, 0);
    const workingHours = toNumber(header.workingHours, 9);

    const firstPassLines = normalizedLines.map((line) => {
        const samGsd = toNumber(line.samGsd, 0);
        const salaryCoefficient = toNumber(line.salaryCoefficient, 0);

        const usedEfficiency = normalizeEfficiency(line.requiredEfficiency);

        const adjustedSam = usedEfficiency > 0
            ? samGsd / usedEfficiency
            : samGsd;

        const standardPrice =
            priceMode === 'ADJUSTED'
                ? adjustedSam * salaryCoefficient
                : samGsd * salaryCoefficient;

        return {
            ...line,
            samGsd: round4(samGsd),
            salaryCoefficient: round4(salaryCoefficient),
            adjustedSam: round4(adjustedSam),
            usedEfficiency: round4(usedEfficiency),
            standardPrice: round4(standardPrice),
        };
    });

    const totalTime = round4(
        firstPassLines.reduce((sum, line) => sum + toNumber(line.adjustedSam, 0), 0)
    );

    const totalSamGsd = round4(
        firstPassLines.reduce((sum, line) => sum + toNumber(line.samGsd, 0), 0)
    );

    const taktTime = productionManpower > 0
        ? round4(totalTime / productionManpower)
        : 0;

    const calculatedLines = firstPassLines.map((line) => {
        const laborCount = taktTime > 0
            ? toNumber(line.adjustedSam, 0) / taktTime
            : 0;

        return {
            ...line,
            laborCount: round4(laborCount),
        };
    });

    const c1 = round4(totalTime / 60);
    const c3 = round4(taktTime / 60);
    const c4 = totalSamGsd > 0 ? round4(totalTime / totalSamGsd) : 0;

    const standardOutput = totalTime > 0
        ? round4((3600 / totalTime) * workingHours * productionManpower)
        : 0;

    const c5 = workingHours > 0
        ? round4(standardOutput / workingHours)
        : 0;

    const c6 = totalSamGsd > 0
        ? round4((3600 / totalSamGsd) * workingHours * productionManpower)
        : 0;

    const totalStandardPrice = round4(
        calculatedLines.reduce((sum, line) => sum + toNumber(line.standardPrice, 0), 0)
    );

    const totalPriceByOutput = round4(standardOutput * totalStandardPrice);

    const averagePrice = productionManpower > 0
        ? round4(totalPriceByOutput / productionManpower)
        : 0;

    const summary = {
        totalTime,
        c1,
        totalSamGsd,
        taktTime,
        c3,
        c4,
        standardOutput,
        c5,
        c6,
        totalStandardPrice,
        totalPriceByOutput,
        averagePrice,
    };

    const machineNeeds = calculateMachineNeeds(header, calculatedLines, summary);

    return {
        header,
        summary,
        lines: calculatedLines,
        machineNeeds,
    };
}

function calculateMachineNeeds(header, lines, summary) {
    const taktTime = toNumber(summary?.taktTime, 0);

    if (taktTime <= 0) return [];

    const map = new Map();

    for (const line of lines) {
        const machineKey =
            line.machineId ||
            line.machineCode ||
            line.machineName ||
            'NO_MACHINE';

        if (!map.has(machineKey)) {
            map.set(machineKey, {
                machineId: line.machineId,
                machineCode: line.machineCode,
                machineName: line.machineName || 'Chưa khai báo máy',
                sumSmv: 0,
                usedEfficiency: 1,
            });
        }

        const item = map.get(machineKey);

        item.sumSmv += toNumber(line.adjustedSam || line.samGsd, 0);
    }

    return Array.from(map.values()).map((item) => {
        const sumSmv = round4(item.sumSmv);
        const machineNeed = taktTime > 0 ? round4(sumSmv / taktTime) : 0;

        return {
            machineId: item.machineId,
            machineCode: item.machineCode,
            machineName: item.machineName,
            sumSmv,
            machineNeed,
            machineQuantity: Math.ceil(machineNeed),
            usedEfficiency: item.usedEfficiency,
        };
    });
}

function calculateMachineNeedsOnly(payload) {
    const calculated = calculateSewingProcess(payload);

    return calculated.machineNeeds;
}

async function getSewingProcesses() {
    const pool = await getPool();

    const result = await pool.request().query(`
       SELECT
    h.id AS [id],
    h.document_code AS [documentCode],
    h.customer_code AS [customerCode],
    h.customer_name AS [customerName],
    h.item_code AS [itemCode],
    h.production_line AS [productionLine],
    h.production_round AS [productionRound],
    h.working_hours AS [workingHours],
    h.manpower AS [manpower],
    h.production_manpower AS [productionManpower],
    h.quantity AS [quantity],
    h.effective_date AS [effectiveDate],
    h.issued_date AS [issuedDate],
    h.price_mode AS [priceMode],
    h.status_id AS [statusId],
    h.note AS [note],
    h.created_at AS [createdAt],
    h.updated_at AS [updatedAt],

    img.image_file_name AS [imageFileName],
    img.image_url AS [imageUrl],

    s.total_time AS [totalTime],
    s.total_sam_gsd AS [totalSamGsd],
    s.takt_time AS [taktTime],
    s.standard_output AS [standardOutput],
    s.total_standard_price AS [totalStandardPrice],
    s.average_price AS [averagePrice]
FROM sewing_process_headers h
LEFT JOIN sewing_process_summaries s
    ON s.document_code = h.document_code
OUTER APPLY (
    SELECT TOP 1
        image_url,
        image_file_name
    FROM sewing_process_images i
    WHERE i.document_code = h.document_code
    ORDER BY i.sort_order ASC, i.id ASC
) img
ORDER BY h.id DESC
    `);

    return result.recordset;
}

async function getSewingProcessById(id) {
    const pool = await getPool();

    const headerResult = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT
                id AS [id],
                document_code AS [documentCode],
                customer_id AS [customerId],
                customer_code AS [customerCode],
                customer_name AS [customerName],
                item_code AS [itemCode],
                production_line AS [productionLine],
                production_round AS [productionRound],
                working_hours AS [workingHours],
                manpower AS [manpower],
                production_manpower AS [productionManpower],
                quantity AS [quantity],
                effective_date AS [effectiveDate],
                issued_date AS [issuedDate],
                price_mode AS [priceMode],
                status_id AS [statusId],
                note AS [note],
                created_at AS [createdAt],
                updated_at AS [updatedAt]
            FROM sewing_process_headers
            WHERE id = @id
        `);

    const header = headerResult.recordset[0];

    if (!header) {
        const err = new Error('Không tìm thấy quy trình may.');
        err.statusCode = 404;
        throw err;
    }

    const documentCode = header.documentCode;

    const summaryResult = await pool.request()
        .input('document_code', sql.VarChar(32), documentCode)
        .query(`
            SELECT
                id AS [id],
                document_code AS [documentCode],
                total_time AS [totalTime],
                c1 AS [c1],
                total_sam_gsd AS [totalSamGsd],
                takt_time AS [taktTime],
                c3 AS [c3],
                c4 AS [c4],
                standard_output AS [standardOutput],
                c5 AS [c5],
                c6 AS [c6],
                total_standard_price AS [totalStandardPrice],
                total_price_by_output AS [totalPriceByOutput],
                average_price AS [averagePrice],
                created_at AS [createdAt],
                updated_at AS [updatedAt]
            FROM sewing_process_summaries
            WHERE document_code = @document_code
        `);

    const lineResult = await pool.request()
        .input('document_code', sql.VarChar(32), documentCode)
        .query(`
           SELECT
                id AS [id],
                document_code AS [documentCode],
                source_document_code AS [sourceDocumentCode],
                gsd_analysis_id AS [gsdAnalysisId],
                source_line_id AS [sourceLineId],
                line_no AS [lineNo],
                cluster_no AS [clusterNo],
                cluster_name AS [clusterName],
                operation_code AS [operationCode],
                operation_name AS [operationName],
                line_order AS [lineOrder],
                skill_grade_id AS [skillGradeId],
                skill_grade_level AS [skillGradeLevel],
                machine_id AS [machineId],
                machine_code AS [machineCode],
                machine_name AS [machineName],
                sam_gsd AS [samGsd],
                salary_coefficient AS [salaryCoefficient],
                labor_count AS [laborCount],
                standard_price AS [standardPrice],
                required_efficiency AS [requiredEfficiency],
                adjusted_sam AS [adjustedSam],
                used_efficiency AS [usedEfficiency],
                total_actions AS [totalActions],
                tool_need AS [toolNeed],
                sewing_employee AS [sewingEmployee],
                cbc_time AS [cbcTime],
                note AS [note],
                created_at AS [createdAt],
                updated_at AS [updatedAt]
            FROM sewing_process_lines
            WHERE document_code = @document_code
            ORDER BY line_no ASC, id ASC
        `);

    const machineNeedResult = await pool.request()
        .input('document_code', sql.VarChar(32), documentCode)
        .query(`
            SELECT
                id AS [id],
                document_code AS [documentCode],
                machine_id AS [machineId],
                machine_code AS [machineCode],
                machine_name AS [machineName],
                sum_smv AS [sumSmv],
                machine_need AS [machineNeed],
                machine_quantity AS [machineQuantity],
                used_efficiency AS [usedEfficiency],
                created_at AS [createdAt],
                updated_at AS [updatedAt]
            FROM sewing_process_machine_needs
            WHERE document_code = @document_code
            ORDER BY machine_name ASC
        `);

    const imageResult = await pool.request()
        .input('document_code', sql.VarChar(32), documentCode)
        .query(`
        SELECT
            id AS [id],
            document_code AS [documentCode],
            image_url AS [imageUrl],
            image_file_name AS [imageFileName],
            sort_order AS [sortOrder],
            note AS [note],
            created_at AS [createdAt],
            updated_at AS [updatedAt]
        FROM sewing_process_images
        WHERE document_code = @document_code
        ORDER BY sort_order ASC, id ASC
    `);

    return {
        header,
        summary: summaryResult.recordset[0] || null,
        lines: lineResult.recordset,
        machineNeeds: machineNeedResult.recordset,
        images: imageResult.recordset,
    };
}

async function ensureDocumentCodeNotExists(pool, documentCode, exceptId = null) {
    const request = pool.request()
        .input('document_code', sql.VarChar(32), documentCode);

    let query = `
        SELECT TOP 1 id
        FROM sewing_process_headers
        WHERE document_code = @document_code
    `;

    if (exceptId) {
        request.input('id', sql.Int, exceptId);
        query += ` AND id <> @id`;
    }

    const result = await request.query(query);

    if (result.recordset.length > 0) {
        const err = new Error(`Mã chứng từ "${documentCode}" đã tồn tại.`);
        err.statusCode = 400;
        throw err;
    }
}

async function createSewingProcess(payload) {
    const pool = await getPool();

    const calculated = calculateSewingProcess(payload);
    const { header, summary, lines, machineNeeds } = calculated;
    const images = normalizeImages(payload) || [];

    await ensureDocumentCodeNotExists(pool, header.documentCode);

    const transaction = new sql.Transaction(pool);


    await transaction.begin();

    try {
        await insertHeader(transaction, header);
        await insertSummary(transaction, header.documentCode, summary);
        await insertLines(transaction, header.documentCode, lines);
        await insertMachineNeeds(transaction, header.documentCode, machineNeeds);
        await insertImages(transaction, header.documentCode, images);
        await transaction.commit();

        return {
            documentCode: header.documentCode,
            summary,
            lines,
            machineNeeds,
        };
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

async function updateSewingProcess(id, payload) {
    const pool = await getPool();

    const currentResult = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT TOP 1 id, document_code AS [documentCode]
            FROM sewing_process_headers
            WHERE id = @id
        `);

    const images = normalizeImages(payload);
    const current = currentResult.recordset[0];

    if (!current) {
        const err = new Error('Không tìm thấy quy trình may cần cập nhật.');
        err.statusCode = 404;
        throw err;
    }

    const calculated = calculateSewingProcess(payload);
    const { header, summary, lines, machineNeeds } = calculated;

    await ensureDocumentCodeNotExists(pool, header.documentCode, id);

    const oldDocumentCode = current.documentCode;
    const newDocumentCode = header.documentCode;

    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
        await updateHeader(transaction, id, header);

        await deleteChildData(transaction, oldDocumentCode);

        await insertSummary(transaction, newDocumentCode, summary);
        await insertLines(transaction, newDocumentCode, lines);
        await insertMachineNeeds(transaction, newDocumentCode, machineNeeds);
        if (images !== null) {
            await deleteImages(transaction, oldDocumentCode);
            await insertImages(transaction, newDocumentCode, images);
        } else {
            await moveImagesToNewDocumentCode(transaction, oldDocumentCode, newDocumentCode);
        }
        await transaction.commit();

        return {
            id,
            documentCode: newDocumentCode,
            summary,
            lines,
            machineNeeds,
        };
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

async function insertHeader(transaction, header) {
    await new sql.Request(transaction)
        .input('document_code', sql.VarChar(32), header.documentCode)
        .input('customer_id', sql.Int, header.customerId)
        .input('customer_code', sql.VarChar(32), header.customerCode)
        .input('customer_name', sql.NVarChar(100), header.customerName)
        .input('item_code', sql.VarChar(32), header.itemCode)
        .input('production_line', sql.NVarChar(50), header.productionLine)
        .input('production_round', sql.Int, header.productionRound)
        .input('working_hours', sql.Decimal(6, 2), header.workingHours)
        .input('manpower', sql.Int, header.manpower)
        .input('production_manpower', sql.Int, header.productionManpower)
        .input('quantity', sql.Decimal(18, 2), header.quantity)
        .input('effective_date', sql.DateTime2, header.effectiveDate)
        .input('issued_date', sql.DateTime2, header.issuedDate)
        .input('price_mode', sql.VarChar(32), header.priceMode)
        .input('status_id', sql.TinyInt, header.statusId)
        .input('note', sql.NVarChar(500), header.note)
        .query(`
            INSERT INTO sewing_process_headers (
                document_code,
                customer_id,
                customer_code,
                customer_name,
                item_code,
                production_line,
                production_round,
                working_hours,
                manpower,
                production_manpower,
                quantity,
                effective_date,
                issued_date,
                price_mode,
                status_id,
                note
            )
            VALUES (
                @document_code,
                @customer_id,
                @customer_code,
                @customer_name,
                @item_code,
                @production_line,
                @production_round,
                @working_hours,
                @manpower,
                @production_manpower,
                @quantity,
                @effective_date,
                @issued_date,
                @price_mode,
                @status_id,
                @note
            )
        `);
}

async function updateHeader(transaction, id, header) {
    await new sql.Request(transaction)
        .input('id', sql.Int, id)
        .input('document_code', sql.VarChar(32), header.documentCode)
        .input('customer_id', sql.Int, header.customerId)
        .input('customer_code', sql.VarChar(32), header.customerCode)
        .input('customer_name', sql.NVarChar(100), header.customerName)
        .input('item_code', sql.VarChar(32), header.itemCode)
        .input('production_line', sql.NVarChar(50), header.productionLine)
        .input('production_round', sql.Int, header.productionRound)
        .input('working_hours', sql.Decimal(6, 2), header.workingHours)
        .input('manpower', sql.Int, header.manpower)
        .input('production_manpower', sql.Int, header.productionManpower)
        .input('quantity', sql.Decimal(18, 2), header.quantity)
        .input('effective_date', sql.DateTime2, header.effectiveDate)
        .input('issued_date', sql.DateTime2, header.issuedDate)
        .input('price_mode', sql.VarChar(32), header.priceMode)
        .input('status_id', sql.TinyInt, header.statusId)
        .input('note', sql.NVarChar(500), header.note)
        .query(`
            UPDATE sewing_process_headers
            SET
                document_code = @document_code,
                customer_id = @customer_id,
                customer_code = @customer_code,
                customer_name = @customer_name,
                item_code = @item_code,
                production_line = @production_line,
                production_round = @production_round,
                working_hours = @working_hours,
                manpower = @manpower,
                production_manpower = @production_manpower,
                quantity = @quantity,
                effective_date = @effective_date,
                issued_date = @issued_date,
                price_mode = @price_mode,
                status_id = @status_id,
                note = @note,
                updated_at = SYSDATETIME()
            WHERE id = @id
        `);
}

async function insertSummary(transaction, documentCode, summary) {
    await new sql.Request(transaction)
        .input('document_code', sql.VarChar(32), documentCode)
        .input('total_time', sql.Decimal(18, 4), summary.totalTime)
        .input('c1', sql.Decimal(18, 4), summary.c1)
        .input('total_sam_gsd', sql.Decimal(18, 4), summary.totalSamGsd)
        .input('takt_time', sql.Decimal(18, 4), summary.taktTime)
        .input('c3', sql.Decimal(18, 4), summary.c3)
        .input('c4', sql.Decimal(18, 4), summary.c4)
        .input('standard_output', sql.Decimal(18, 4), summary.standardOutput)
        .input('c5', sql.Decimal(18, 4), summary.c5)
        .input('c6', sql.Decimal(18, 4), summary.c6)
        .input('total_standard_price', sql.Decimal(18, 4), summary.totalStandardPrice)
        .input('total_price_by_output', sql.Decimal(18, 4), summary.totalPriceByOutput)
        .input('average_price', sql.Decimal(18, 4), summary.averagePrice)
        .query(`
            INSERT INTO sewing_process_summaries (
                document_code,
                total_time,
                c1,
                total_sam_gsd,
                takt_time,
                c3,
                c4,
                standard_output,
                c5,
                c6,
                total_standard_price,
                total_price_by_output,
                average_price
            )
            VALUES (
                @document_code,
                @total_time,
                @c1,
                @total_sam_gsd,
                @takt_time,
                @c3,
                @c4,
                @standard_output,
                @c5,
                @c6,
                @total_standard_price,
                @total_price_by_output,
                @average_price
            )
        `);
}

async function insertLines(transaction, documentCode, lines) {
    for (const line of lines) {
        await new sql.Request(transaction)
            .input('document_code', sql.VarChar(32), documentCode)
            .input('source_document_code', sql.VarChar(32), line.sourceDocumentCode)
            .input('gsd_analysis_id', sql.Int, line.gsdAnalysisId)
            .input('source_line_id', sql.Int, line.sourceLineId)
            .input('line_no', sql.Int, line.lineNo)
            .input('cluster_no', sql.Int, line.clusterNo)
            .input('cluster_name', sql.NVarChar(100), line.clusterName)
            .input('operation_code', sql.VarChar(32), line.operationCode)
            .input('operation_name', sql.NVarChar(200), line.operationName)
            .input('line_order', sql.Int, line.lineOrder)
            .input('skill_grade_id', sql.Int, line.skillGradeId)
            .input('skill_grade_level', sql.Int, line.skillGradeLevel)
            .input('machine_id', sql.Int, line.machineId)
            .input('machine_code', sql.VarChar(32), line.machineCode)
            .input('machine_name', sql.NVarChar(200), line.machineName)
            .input('sam_gsd', sql.Decimal(18, 4), line.samGsd)
            .input('salary_coefficient', sql.Decimal(18, 4), line.salaryCoefficient)
            .input('labor_count', sql.Decimal(18, 4), line.laborCount)
            .input('standard_price', sql.Decimal(18, 4), line.standardPrice)
            .input('required_efficiency', sql.Decimal(18, 4), line.requiredEfficiency)
            .input('adjusted_sam', sql.Decimal(18, 4), line.adjustedSam)
            .input('used_efficiency', sql.Decimal(18, 4), line.usedEfficiency)
            .input('total_actions', sql.Int, line.totalActions)
            .input('sewing_employee', sql.NVarChar(200), line.sewingEmployee)
            .input('cbc_time', sql.Decimal(18, 4), line.cbcTime)
            .input('note', sql.NVarChar(200), line.note)
            .input('tool_need', sql.NVarChar(200), line.toolNeed)
            .query(`
                INSERT INTO sewing_process_lines (
                    document_code,
                    source_document_code,
                    gsd_analysis_id,
                    source_line_id,
                    line_no,
                    cluster_no,
                    cluster_name,
                    operation_code,
                    operation_name,
                    line_order,
                    skill_grade_id,
                    skill_grade_level,
                    machine_id,
                    machine_code,
                    machine_name,
                    sam_gsd,
                    salary_coefficient,
                    labor_count,
                    standard_price,
                    required_efficiency,
                    adjusted_sam,
                    used_efficiency,
                    total_actions,
                    tool_need,
                    sewing_employee,
                    cbc_time,
                    note
                )
                VALUES (
                    @document_code,
                    @source_document_code,
                    @gsd_analysis_id,
                    @source_line_id,
                    @line_no,
                    @cluster_no,
                    @cluster_name,
                    @operation_code,
                    @operation_name,
                    @line_order,
                    @skill_grade_id,
                    @skill_grade_level,
                    @machine_id,
                    @machine_code,
                    @machine_name,
                    @sam_gsd,
                    @salary_coefficient,
                    @labor_count,
                    @standard_price,
                    @required_efficiency,
                    @adjusted_sam,
                    @used_efficiency,
                    @total_actions,
                    @tool_need,
                    @sewing_employee,
                    @cbc_time,
                    @note
                )
            `);
    }
}

async function insertMachineNeeds(transaction, documentCode, machineNeeds) {
    for (const item of machineNeeds) {
        await new sql.Request(transaction)
            .input('document_code', sql.VarChar(32), documentCode)
            .input('machine_id', sql.Int, item.machineId)
            .input('machine_code', sql.VarChar(32), item.machineCode)
            .input('machine_name', sql.NVarChar(200), item.machineName)
            .input('sum_smv', sql.Decimal(18, 4), item.sumSmv)
            .input('machine_need', sql.Decimal(18, 4), item.machineNeed)
            .input('machine_quantity', sql.Decimal(18, 4), item.machineQuantity)
            .input('used_efficiency', sql.Decimal(18, 4), item.usedEfficiency)
            .query(`
                INSERT INTO sewing_process_machine_needs (
                    document_code,
                    machine_id,
                    machine_code,
                    machine_name,
                    sum_smv,
                    machine_need,
                    machine_quantity,
                    used_efficiency
                )
                VALUES (
                    @document_code,
                    @machine_id,
                    @machine_code,
                    @machine_name,
                    @sum_smv,
                    @machine_need,
                    @machine_quantity,
                    @used_efficiency
                )
            `);
    }
}

async function insertImages(transaction, documentCode, images) {
    if (!Array.isArray(images) || images.length === 0) return;

    for (const item of images) {
        const fileName =
            item.imageFileName ||
            item.image_file_name ||
            item.imageUrl ||
            item.image_url;

        if (!fileName) continue;

        await new sql.Request(transaction)
            .input('document_code', sql.VarChar(32), documentCode)
            .input('image_url', sql.NVarChar(500), fileName)
            .input('image_file_name', sql.NVarChar(255), fileName)
            .input('sort_order', sql.Int, item.sortOrder || item.sort_order || 1)
            .input('note', sql.NVarChar(255), item.note || null)
            .query(`
                INSERT INTO sewing_process_images (
                    document_code,
                    image_url,
                    image_file_name,
                    sort_order,
                    note
                )
                VALUES (
                    @document_code,
                    @image_url,
                    @image_file_name,
                    @sort_order,
                    @note
                )
            `);
    }
}

async function deleteImages(transaction, documentCode) {
    await new sql.Request(transaction)
        .input('document_code', sql.VarChar(32), documentCode)
        .query(`
            DELETE FROM sewing_process_images
            WHERE document_code = @document_code
        `);
}

async function moveImagesToNewDocumentCode(transaction, oldDocumentCode, newDocumentCode) {
    if (oldDocumentCode === newDocumentCode) return;

    await new sql.Request(transaction)
        .input('old_document_code', sql.VarChar(32), oldDocumentCode)
        .input('new_document_code', sql.VarChar(32), newDocumentCode)
        .query(`
            UPDATE sewing_process_images
            SET document_code = @new_document_code,
                updated_at = SYSDATETIME()
            WHERE document_code = @old_document_code
        `);
}

async function deleteChildData(transaction, documentCode) {
    await new sql.Request(transaction)
        .input('document_code', sql.VarChar(32), documentCode)
        .query(`
            DELETE FROM sewing_process_machine_needs
            WHERE document_code = @document_code;

            DELETE FROM sewing_process_lines
            WHERE document_code = @document_code;

            DELETE FROM sewing_process_summaries
            WHERE document_code = @document_code;
        `);
}

async function addSewingProcessImage(documentCode, image) {
    const pool = await getPool();

    await pool.request()
        .input('document_code', sql.VarChar(32), documentCode)
        .input('image_url', sql.NVarChar(500), image.imageUrl)
        .input('image_file_name', sql.NVarChar(255), image.imageFileName || null)
        .input('sort_order', sql.Int, image.sortOrder || 1)
        .input('note', sql.NVarChar(255), image.note || null)
        .query(`
            INSERT INTO sewing_process_images (
                document_code,
                image_url,
                image_file_name,
                sort_order,
                note
            )
            VALUES (
                @document_code,
                @image_url,
                @image_file_name,
                @sort_order,
                @note
            )
        `);
}

async function deleteSewingProcessImage(id) {
    const pool = await getPool();

    await pool.request()
        .input('id', sql.Int, id)
        .query(`
            DELETE FROM sewing_process_images
            WHERE id = @id
        `);
}

async function getActionDetailsById(id){
    const pool = await getPool();

    const result = await pool.request()
        .input('analysis_id', sql.Int, id)
        .query(`
            select 
                gd.id,
                gd.line_no,
                gd.step_no,
                gd.gsd_code,
                gd.action_name,
                gd.tmu,
                gd.frequency
            from gsd_analysis_details gd
            where analysis_id = @analysis_id
        `)
    return result.recordset;
}

async function getActionDetailsById(id) {
    const pool = await getPool();

    const result = await pool.request()
        .input('analysis_id', sql.Int, id)
        .query(`
            SELECT
                d.id AS [id],
                d.analysis_id AS [analysisId],
                d.line_no AS [lineNo],
                d.step_no AS [stepNo],
                d.gsd_code AS [gsdCode],
                d.action_name AS [actionName],
                d.tmu AS [tmu],
                d.frequency AS [frequency],
                CAST((ISNULL(d.tmu, 0) * ISNULL(d.frequency, 1)) / 27.8 AS DECIMAL(18, 6)) AS [seconds],
                d.note AS [note],
                d.is_selected AS [isSelected]
            FROM gsd_analysis_details d
            WHERE d.analysis_id = @analysis_id
            ORDER BY d.line_no ASC, d.step_no ASC, d.id ASC
        `);

    return result.recordset;
}

async function getActionDetailsByOperationClusterLineId(operationLineId) {
    const pool = await getPool();

    const result = await pool.request()
        .input('operation_line_id', sql.Int, operationLineId)
        .query(`
            SELECT
                o.id AS [operationClusterLineId],
                o.operation_code AS [operationCode],
                o.operation_name AS [operationName],
                o.gsd_analysis_id AS [gsdAnalysisId],

                h.id AS [analysisId],
                h.analysis_no AS [analysisNo],

                d.id AS [id],
                d.line_no AS [lineNo],
                d.step_no AS [stepNo],
                d.gsd_code AS [gsdCode],
                d.action_name AS [actionName],
                d.tmu AS [tmu],
                d.frequency AS [frequency],
                CAST((ISNULL(d.tmu, 0) * ISNULL(d.frequency, 1)) / 27.8 AS DECIMAL(18, 6)) AS [seconds],
                d.note AS [note],
                d.is_selected AS [isSelected]
            FROM operation_cluster_operations o
            OUTER APPLY (
                SELECT TOP 1
                    gh.id,
                    gh.analysis_no
                FROM gsd_analysis_headers gh
                WHERE
                    gh.analysis_no = o.operation_code
                    OR gh.id = o.gsd_analysis_id
                ORDER BY
                    CASE
                        WHEN gh.analysis_no = o.operation_code THEN 0
                        WHEN gh.id = o.gsd_analysis_id THEN 1
                        ELSE 2
                    END
            ) h
            INNER JOIN gsd_analysis_details d
                ON d.analysis_id = h.id
            WHERE o.id = @operation_line_id
            ORDER BY d.line_no ASC, d.step_no ASC, d.id ASC
        `);

    return result.recordset;
}

module.exports = {
    getSewingProcesses,
    getSewingProcessById,
    calculateSewingProcess,
    calculateMachineNeedsOnly,
    createSewingProcess,
    updateSewingProcess,
    addSewingProcessImage,
    deleteSewingProcessImage,
    getActionDetailsById,
    getActionDetailsById,
    getActionDetailsByOperationClusterLineId
};