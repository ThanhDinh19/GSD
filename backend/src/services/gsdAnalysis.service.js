const { getPool, sql } = require('../database/connection');

function toNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') return defaultValue;

    const numberValue = Number(value);

    return Number.isNaN(numberValue) ? defaultValue : numberValue;
}

function calculateSkillGrade(difficultyPercent) {
    const value = toNumber(difficultyPercent, 0);

    if (!value) return 2;
    if (value === 5) return 3;
    if (value === 10) return 4;
    if (value === 15) return 5;

    return 6;
}

function generateAnalysisNo() {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');

    return `PT${yyyy}${mm}${dd}${hh}${mi}${ss}${ms}`;
}

async function getSourceActionsForAnalysis(sourceId) {
    const pool = getPool();

    const result = await pool.request()
        .input('source_id', sql.Int, sourceId)
        .query(`
      SELECT
        d.id AS [sourceActionDetailId],
        d.line_no AS [lineNo],
        d.gsd_code_id AS [gsdCodeId],
        d.action_name AS [actionName],
        d.gsd_code AS [gsdCode],
        d.code_new AS [codeNew],
        d.frequency AS [frequency],
        d.tmu AS [tmu],
        d.note AS [note]
      FROM source_action_headers h
      INNER JOIN source_action_details d ON d.header_id = h.id
      WHERE h.source_id = @source_id
      ORDER BY d.line_no
    `);

    return result.recordset;
}

async function calculateAnalysis(payload) {
    const pool = getPool();

    const machineId = payload.machineId ? Number(payload.machineId) : null;

    let machine = null;

    if (machineId) {
        const machineResult = await pool.request()
            .input('machine_id', sql.Int, machineId)
            .query(`
        SELECT
          id,
          machine_code AS [machineCode],
          machine_name AS [machineName],
          code_mmtb AS [codeMMTB],
          stitch_count AS [stitchCount],
          machine_speed AS [machineSpeed],
          attached_action_time AS [attachedActionTime],
          allowance AS [allowance],
          skill_grade AS [skillGrade]
        FROM machine_equipments_test
        WHERE id = @machine_id
      `);

        machine = machineResult.recordset[0] || null;
    }

    const seamLength = toNumber(payload.seamLength, 0);
    const attachedActionTime = toNumber(payload.attachedActionTime, 0); // attachedActionTime có thể được edit nên cho vào payload (lấy data từ frontend)
    const difficultyPercent = toNumber(payload.difficultyPercent, 0);
    const productMultiplier = toNumber(payload.productMultiplier, 1);

    const stitchCount =
        payload.stitchCount !== undefined && payload.stitchCount !== null
            ? toNumber(payload.stitchCount, 0)
            : machine
                ? toNumber(machine.stitchCount, 0)
                : 0;

    const machineSpeed =
        payload.machineSpeed !== undefined && payload.machineSpeed !== null
            ? toNumber(payload.machineSpeed, 0)
            : machine
                ? toNumber(machine.machineSpeed, 0)
                : 0;

    const allowance =
        payload.allowance !== undefined && payload.allowance !== null
            ? toNumber(payload.allowance, 0)
            : machine
                ? toNumber(machine.allowance, 0)
                : 0;

    const details = Array.isArray(payload.details) ? payload.details : [];

    const selectedInputDetails = details.filter((item) => {
        return item.stepNo !== null &&
            item.stepNo !== undefined &&
            item.stepNo !== '' &&
            item.isSelected !== false;
    });

    const usedStepNos = new Set();

    for (const item of selectedInputDetails) {
        const stepNo = Number(item.stepNo);

        if (!Number.isInteger(stepNo) || stepNo <= 0) {
            const err = new Error(`Bước "${item.stepNo}" không hợp lệ. Bước phải là số nguyên lớn hơn 0.`);
            err.statusCode = 400;
            throw err;
        }

        if (usedStepNos.has(stepNo)) {
            const err = new Error(`Bước ${stepNo} bị trùng. Vui lòng kiểm tra lại.`);
            err.statusCode = 400;
            throw err;
        }

        usedStepNos.add(stepNo);
    }

    const normalizedDetails = selectedInputDetails.map((item, index) => {
        const tmu = toNumber(item.tmu, 0);
        const frequency = toNumber(item.frequency, 1);
        const seconds = (tmu * frequency) / 27.8;

        return {
            lineNo: index + 1,
            stepNo: Number(item.stepNo),
            sourceActionDetailId: item.sourceActionDetailId || null,
            gsdCodeId: item.gsdCodeId || null,
            gsdCode: item.gsdCode || null,
            actionName: item.actionName || '',
            tmu,
            frequency,
            seconds,
            note: item.note || null,
            isSelected: true,
        };
    }).filter(item => item.frequency > 0);

    const totalTmu = normalizedDetails.reduce((sum, item) => {
        return sum + item.tmu * item.frequency;
    }, 0);

    const totalManualSeconds = normalizedDetails.reduce((sum, item) => {
        return sum + item.seconds;
    }, 0);

    // vận tốc máy (cm/giây)
    const machineVelocity = machineSpeed > 0
        ? (stitchCount / machineSpeed) * 60
        : 0;

    // thời gian máy móc thiết bị
    const machineSeconds =
        (machineVelocity * seamLength) + attachedActionTime + allowance;

    const totalSmvBeforeDifficulty =
        (totalManualSeconds + machineSeconds) * productMultiplier;

    // totalManualSeconds: tổng giây thao tác

    // tổng smv = ( tổng giây thao tác + thời gian MMTB ) * hệ số nhân SP
    // smv cuối = (tổng smv + thời gian mức độ)

    const difficultySeconds =
        totalSmvBeforeDifficulty * difficultyPercent / 100;

    // difficultySeconds: thời gian mức độ
    // difficultyPercent: mức độ phức tạp

    const finalSmv =
        Math.ceil(totalSmvBeforeDifficulty + difficultySeconds);


    // smv = thời gian thủ công * (

    const skillGrade = calculateSkillGrade(difficultyPercent);

    return {
        machine,
        stitchCount,
        machineSpeed,
        machineVelocity,
        allowance,
        totalTmu,
        totalManualSeconds,
        machineSeconds,
        totalSmvBeforeDifficulty,
        difficultySeconds,
        finalSmv,
        skillGrade,
        details: normalizedDetails,
    };
}

async function createAnalysis(payload) {
    const pool = getPool();
    const transaction = new sql.Transaction(pool);

    const operationName = String(payload.operationName || '').trim();

    const machineId = payload.machineId ? Number(payload.machineId) : null;

    if (!operationName) {
        const err = new Error('Tên công đoạn là bắt buộc.');
        err.statusCode = 400;
        throw err;
    }

    if (!Array.isArray(payload.details) || payload.details.length === 0) {
        const err = new Error('Vui lòng chọn thao tác trước khi phân tích.');
        err.statusCode = 400;
        throw err;
    }

    const calculated = await calculateAnalysis(payload);

    if (calculated.details.length === 0) {
        const err = new Error('Vui lòng chọn thao tác có số lần lặp lại lớn hơn 0.');
        err.statusCode = 400;
        throw err;
    }

    const analysisNo = payload.analysisNo || generateAnalysisNo();

    await transaction.begin();

    try {

        // const updateAttachedActionTime = await new sql.Request(transaction)
        //     .input('attached_action_time', sql.Decimal(5, 2), toNumber(payload.attachedActionTime, 0))
        //     .input('machineId', sql.Int, payload.machineId ? Number(payload.machineId) : null)
        //     .query(`
        //         UPDATE machine_equipments_test 
        //         SET attached_action_time = @attached_action_time
        //         WHERE Id = @machineId
        //     `);


        const headerResult = await new sql.Request(transaction)
            .input('analysis_no', sql.NVarChar, analysisNo)
            .input('source_id', sql.Int, payload.sourceId ? Number(payload.sourceId) : null)
            .input('machine_id', sql.Int, payload.machineId ? Number(payload.machineId) : null)
            .input('operation_name', sql.NVarChar, operationName)
            .input('seam_length', sql.Decimal(18, 4), toNumber(payload.seamLength, 0))
            .input('attached_action_time', sql.Decimal(18, 4), toNumber(payload.attachedActionTime, 0))
            .input('difficulty_percent', sql.Decimal(18, 4), toNumber(payload.difficultyPercent, 0))
            .input('product_multiplier', sql.Decimal(18, 4), toNumber(payload.productMultiplier, 1))
            .input('stitch_count', sql.Decimal(18, 4), calculated.stitchCount)
            .input('machine_speed', sql.Decimal(18, 4), calculated.machineSpeed)
            .input('machine_velocity', sql.Decimal(18, 4), calculated.machineVelocity)
            .input('allowance', sql.Decimal(18, 4), calculated.allowance)
            .input('total_tmu', sql.Decimal(18, 4), calculated.totalTmu)
            .input('total_manual_seconds', sql.Decimal(18, 4), calculated.totalManualSeconds)
            .input('machine_seconds', sql.Decimal(18, 4), calculated.machineSeconds)
            .input('total_smv_before_difficulty', sql.Decimal(18, 4), calculated.totalSmvBeforeDifficulty)
            .input('difficulty_seconds', sql.Decimal(18, 4), calculated.difficultySeconds)
            .input('final_smv', sql.Decimal(18, 4), calculated.finalSmv)
            .input('skill_grade', sql.TinyInt, calculated.skillGrade)
            .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
            .query(`
        INSERT INTO gsd_analysis_headers (
          analysis_no,
          source_id,
          machine_id,
          operation_name,
          seam_length,
          attached_action_time,
          difficulty_percent,
          product_multiplier,
          stitch_count,
          machine_speed,
          machine_velocity,
          allowance,
          total_tmu,
          total_manual_seconds,
          machine_seconds,
          total_smv_before_difficulty,
          difficulty_seconds,
          final_smv,
          skill_grade,
          note
        )
        OUTPUT INSERTED.id
        VALUES (
          @analysis_no,
          @source_id,
          @machine_id,
          @operation_name,
          @seam_length,
          @attached_action_time,
          @difficulty_percent,
          @product_multiplier,
          @stitch_count,
          @machine_speed,
          @machine_velocity,
          @allowance,
          @total_tmu,
          @total_manual_seconds,
          @machine_seconds,
          @total_smv_before_difficulty,
          @difficulty_seconds,
          @final_smv,
          @skill_grade,
          @note
        )
      `);

        const analysisId = headerResult.recordset[0].id;

        for (const item of calculated.details) {
            await new sql.Request(transaction)
                .input('analysis_id', sql.Int, analysisId)
                .input('line_no', sql.Int, item.lineNo)
                .input('step_no', sql.Decimal(18, 4), item.stepNo)
                .input('source_action_detail_id', sql.Int, item.sourceActionDetailId)
                .input('gsd_code_id', sql.Int, item.gsdCodeId)
                .input('gsd_code', sql.NVarChar, item.gsdCode)
                .input('action_name', sql.NVarChar, item.actionName)
                .input('tmu', sql.Decimal(18, 4), item.tmu)
                .input('frequency', sql.Decimal(18, 4), item.frequency)
                .input('note', sql.NVarChar, item.note)
                .input('is_selected', sql.Bit, item.isSelected ? 1 : 0)
                .query(`
          INSERT INTO gsd_analysis_details (
            analysis_id,
            line_no,
            step_no,
            source_action_detail_id,
            gsd_code_id,
            gsd_code,
            action_name,
            tmu,
            frequency,
            note,
            is_selected
          )
          VALUES (
            @analysis_id,
            @line_no,
            @step_no,
            @source_action_detail_id,
            @gsd_code_id,
            @gsd_code,
            @action_name,
            @tmu,
            @frequency,
            @note,
            @is_selected
          )
        `);
        }

        await transaction.commit();

        return {
            id: analysisId,
            analysisNo,
            ...calculated,
        };
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

async function getAnalyses() {
    const pool = getPool();

    const result = await pool.request().query(`
    SELECT
      a.id AS [id],
      a.analysis_no AS [analysisNo],
      a.analysis_date AS [analysisDate],
      a.operation_name AS [operationName],

      s.source_code AS [sourceCode],
      m.machine_code AS [machineCode],
      m.machine_name AS [machineName],
      m.code_mmtb AS [codeMMTB],

      a.total_tmu AS [totalTmu],
      a.total_manual_seconds AS [totalManualSeconds],
      a.machine_seconds AS [machineSeconds],
      a.total_smv_before_difficulty AS [totalSmvBeforeDifficulty],
      a.difficulty_seconds AS [difficultySeconds],
      a.final_smv AS [finalSmv],
      a.skill_grade AS [skillGrade],
      a.created_at AS [createdAt]
    FROM gsd_analysis_headers a
    LEFT JOIN sources s ON a.source_id = s.id
    LEFT JOIN machine_equipments_test m ON a.machine_id = m.id
    ORDER BY a.id DESC
  `);

    return result.recordset;
}

async function getAnalysisById(id) {
    const pool = getPool();

    const headerResult = await pool.request()
        .input('id', sql.Int, id)
        .query(`
      SELECT
        a.id AS [id],
        a.analysis_no AS [analysisNo],
        a.analysis_date AS [analysisDate],
        a.operation_name AS [operationName],

        a.source_id AS [sourceId],
        s.source_code AS [sourceCode],
        s.source_name AS [sourceName],

        a.machine_id AS [machineId],
        m.machine_code AS [machineCode],
        m.machine_name AS [machineName],
        m.code_mmtb AS [codeMMTB],

        a.seam_length AS [seamLength],
        a.attached_action_time AS [attachedActionTime],
        a.difficulty_percent AS [difficultyPercent],
        a.product_multiplier AS [productMultiplier],

        a.stitch_count AS [stitchCount],
        a.machine_speed AS [machineSpeed],
        a.machine_velocity AS [machineVelocity],
        a.allowance AS [allowance],

        a.total_tmu AS [totalTmu],
        a.total_manual_seconds AS [totalManualSeconds],
        a.machine_seconds AS [machineSeconds],
        a.total_smv_before_difficulty AS [totalSmvBeforeDifficulty],
        a.difficulty_seconds AS [difficultySeconds],
        a.final_smv AS [finalSmv],
        a.skill_grade AS [skillGrade],

        a.note AS [note],
        a.created_at AS [createdAt],
        a.updated_at AS [updatedAt]
      FROM gsd_analysis_headers a
      LEFT JOIN sources s ON a.source_id = s.id
      LEFT JOIN machine_equipments_test m ON a.machine_id = m.id
      WHERE a.id = @id
    `);

    if (headerResult.recordset.length === 0) {
        const err = new Error('Không tìm thấy phân tích công đoạn.');
        err.statusCode = 404;
        throw err;
    }

    const detailResult = await pool.request()
        .input('analysis_id', sql.Int, id)
        .query(`
        SELECT
            d.id AS [id],
            d.analysis_id AS [analysisId],
            d.line_no AS [lineNo],
            d.step_no AS [stepNo],

            d.source_action_detail_id
                AS [sourceActionDetailId],

            sad.header_id AS [sourceActionHeaderId],

            s.id AS [sourceId],
            s.source_code AS [sourceCode],
            s.source_name AS [sourceName],

            d.gsd_code_id AS [gsdCodeId],
            d.gsd_code AS [gsdCode],
            d.action_name AS [actionName],
            d.tmu AS [tmu],
            d.frequency AS [frequency],

            CAST(
                (ISNULL(d.tmu, 0) *
                 ISNULL(d.frequency, 1)) / 27.8
                AS DECIMAL(18, 6)
            ) AS [seconds],

            d.note AS [note],
            d.is_selected AS [isSelected]

        FROM gsd_analysis_details d

        LEFT JOIN source_action_details sad
            ON sad.id = d.source_action_detail_id

        LEFT JOIN source_action_headers sah
            ON sah.id = sad.header_id

        LEFT JOIN sources s
            ON s.id = sah.source_id

        WHERE d.analysis_id = @analysis_id

        ORDER BY
            d.step_no ASC,
            d.line_no ASC,
            d.id ASC
    `);

    return {
        ...headerResult.recordset[0],
        details: detailResult.recordset,
    };
}

function buildCopyOperationName(operationName) {
    const name = String(operationName || '').trim();

    if (!name) {
        return 'Công đoạn_COPY';
    }

    // Không thêm lặp lại nếu tên đã có _COPY
    if (name.toUpperCase().endsWith('_COPY')) {
        return name;
    }

    return `${name}_COPY`;
}

async function getAnalysisCopyDraft(id) {
    const analysisId = Number(id);

    if (!Number.isInteger(analysisId) || analysisId <= 0) {
        const err = new Error(
            'Mã phân tích công đoạn không hợp lệ.'
        );
        err.statusCode = 400;
        throw err;
    }

    // Dùng lại hàm lấy chi tiết hiện tại
    const current = await getAnalysisById(analysisId);

    /*
     * Không trả lại các trường định danh của bản ghi cũ.
     * Khi lưu, frontend sẽ gọi createAnalysis để sinh:
     * - id mới
     * - analysis_no mới
     * - detail id mới
     */
    const {
        id: ignoredId,
        analysisNo: ignoredAnalysisNo,
        analysisDate: ignoredAnalysisDate,
        createdAt: ignoredCreatedAt,
        updatedAt: ignoredUpdatedAt,
        details: currentDetails,
        ...headerData
    } = current;

    const details = Array.isArray(currentDetails)
        ? currentDetails.map((item, index) => {
            const {
                id: ignoredDetailId,
                analysisId: ignoredDetailAnalysisId,
                ...detailData
            } = item;

            return {
                ...detailData,

                // Đánh lại số dòng cho bản sao
                lineNo: index + 1,

                // Giữ lại các thao tác đã chọn
                isSelected: item.isSelected !== false,
            };
        })
        : [];

    return {
        ...headerData,

        // Dùng để frontend biết bản này được sao chép từ đâu
        copyOfAnalysisId: analysisId,

        operationName: buildCopyOperationName(
            current.operationName
        ),

        details,
    };
}

async function updateAnalysis(id, payload) {
    const pool = getPool();

    const analysisId = Number(id);
    const operationName = String(payload.operationName || '').trim();

    if (!Number.isInteger(analysisId) || analysisId <= 0) {
        const err = new Error('Mã phân tích công đoạn không hợp lệ.');
        err.statusCode = 400;
        throw err;
    }

    if (!operationName) {
        const err = new Error('Tên công đoạn là bắt buộc.');
        err.statusCode = 400;
        throw err;
    }

    if (!Array.isArray(payload.details) || payload.details.length === 0) {
        const err = new Error('Vui lòng chọn thao tác trước khi cập nhật.');
        err.statusCode = 400;
        throw err;
    }

    // Kiểm tra chứng từ tồn tại trước khi tính và mở transaction
    const currentResult = await pool.request()
        .input('id', sql.Int, analysisId)
        .query(`
            SELECT TOP 1
                id,
                analysis_no AS [analysisNo]
            FROM gsd_analysis_headers
            WHERE id = @id
        `);

    const current = currentResult.recordset[0];

    if (!current) {
        const err = new Error('Không tìm thấy phân tích công đoạn cần cập nhật.');
        err.statusCode = 404;
        throw err;
    }

    // Tính lại toàn bộ dữ liệu header và detail
    const calculated = await calculateAnalysis(payload);

    if (!calculated.details.length) {
        const err = new Error(
            'Vui lòng chọn thao tác có số lần lặp lại lớn hơn 0.'
        );
        err.statusCode = 400;
        throw err;
    }

    const sourceId = payload.sourceId
        ? Number(payload.sourceId)
        : null;

    const machineId = payload.machineId
        ? Number(payload.machineId)
        : null;

    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
        const updateHeaderResult = await new sql.Request(transaction)
            .input('id', sql.Int, analysisId)
            .input('source_id', sql.Int, sourceId)
            .input('machine_id', sql.Int, machineId)
            .input('operation_name', sql.NVarChar(255), operationName)
            .input(
                'seam_length',
                sql.Decimal(18, 4),
                toNumber(payload.seamLength, 0)
            )
            .input(
                'attached_action_time',
                sql.Decimal(18, 4),
                toNumber(payload.attachedActionTime, 0)
            )
            .input(
                'difficulty_percent',
                sql.Decimal(18, 4),
                toNumber(payload.difficultyPercent, 0)
            )
            .input(
                'product_multiplier',
                sql.Decimal(18, 4),
                toNumber(payload.productMultiplier, 1)
            )
            .input(
                'stitch_count',
                sql.Decimal(18, 4),
                calculated.stitchCount
            )
            .input(
                'machine_speed',
                sql.Decimal(18, 4),
                calculated.machineSpeed
            )
            .input(
                'machine_velocity',
                sql.Decimal(18, 4),
                calculated.machineVelocity
            )
            .input(
                'allowance',
                sql.Decimal(18, 4),
                calculated.allowance
            )
            .input(
                'total_tmu',
                sql.Decimal(18, 4),
                calculated.totalTmu
            )
            .input(
                'total_manual_seconds',
                sql.Decimal(18, 4),
                calculated.totalManualSeconds
            )
            .input(
                'machine_seconds',
                sql.Decimal(18, 4),
                calculated.machineSeconds
            )
            .input(
                'total_smv_before_difficulty',
                sql.Decimal(18, 4),
                calculated.totalSmvBeforeDifficulty
            )
            .input(
                'difficulty_seconds',
                sql.Decimal(18, 4),
                calculated.difficultySeconds
            )
            .input(
                'final_smv',
                sql.Decimal(18, 4),
                calculated.finalSmv
            )
            .input(
                'skill_grade',
                sql.TinyInt,
                calculated.skillGrade
            )
            .input(
                'note',
                sql.NVarChar(500),
                payload.note
                    ? String(payload.note).trim()
                    : null
            )
            .query(`
                UPDATE gsd_analysis_headers
                SET
                    source_id = @source_id,
                    machine_id = @machine_id,
                    operation_name = @operation_name,
                    seam_length = @seam_length,
                    attached_action_time = @attached_action_time,
                    difficulty_percent = @difficulty_percent,
                    product_multiplier = @product_multiplier,
                    stitch_count = @stitch_count,
                    machine_speed = @machine_speed,
                    machine_velocity = @machine_velocity,
                    allowance = @allowance,
                    total_tmu = @total_tmu,
                    total_manual_seconds = @total_manual_seconds,
                    machine_seconds = @machine_seconds,
                    total_smv_before_difficulty =
                        @total_smv_before_difficulty,
                    difficulty_seconds = @difficulty_seconds,
                    final_smv = @final_smv,
                    skill_grade = @skill_grade,
                    note = @note,
                    updated_at = SYSDATETIME()
                WHERE id = @id
            `);

        if (!updateHeaderResult.rowsAffected[0]) {
            const err = new Error(
                'Không tìm thấy phân tích công đoạn cần cập nhật.'
            );
            err.statusCode = 404;
            throw err;
        }

        // Xóa detail cũ
        await new sql.Request(transaction)
            .input('analysis_id', sql.Int, analysisId)
            .query(`
                DELETE FROM gsd_analysis_details
                WHERE analysis_id = @analysis_id
            `);

        // Insert lại detail mới
        for (const item of calculated.details) {
            await new sql.Request(transaction)
                .input('analysis_id', sql.Int, analysisId)
                .input('line_no', sql.Int, item.lineNo)
                .input(
                    'step_no',
                    sql.Decimal(18, 4),
                    item.stepNo
                )
                .input(
                    'source_action_detail_id',
                    sql.Int,
                    item.sourceActionDetailId
                )
                .input(
                    'gsd_code_id',
                    sql.Int,
                    item.gsdCodeId
                )
                .input(
                    'gsd_code',
                    sql.NVarChar(50),
                    item.gsdCode
                )
                .input(
                    'action_name',
                    sql.NVarChar(500),
                    item.actionName
                )
                .input(
                    'tmu',
                    sql.Decimal(18, 4),
                    item.tmu
                )
                .input(
                    'frequency',
                    sql.Decimal(18, 4),
                    item.frequency
                )
                .input(
                    'note',
                    sql.NVarChar(500),
                    item.note
                )
                .input(
                    'is_selected',
                    sql.Bit,
                    item.isSelected ? 1 : 0
                )
                .query(`
                    INSERT INTO gsd_analysis_details (
                        analysis_id,
                        line_no,
                        step_no,
                        source_action_detail_id,
                        gsd_code_id,
                        gsd_code,
                        action_name,
                        tmu,
                        frequency,
                        note,
                        is_selected
                    )
                    VALUES (
                        @analysis_id,
                        @line_no,
                        @step_no,
                        @source_action_detail_id,
                        @gsd_code_id,
                        @gsd_code,
                        @action_name,
                        @tmu,
                        @frequency,
                        @note,
                        @is_selected
                    )
                `);
        }

        await transaction.commit();

        // Trả lại đầy đủ header + details sau cập nhật
        return await getAnalysisById(analysisId);
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

module.exports = {
    getSourceActionsForAnalysis,
    calculateAnalysis,
    createAnalysis,
    getAnalyses,
    getAnalysisById,
    updateAnalysis,
    getAnalysisCopyDraft
};



