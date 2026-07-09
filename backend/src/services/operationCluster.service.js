const sql = require('mssql');
const { getPool } = require('../database/connection');

const toNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : defaultValue;
};

const calculateOperationValues = ({
    samGsd,
    requiredEfficiency,
    salaryCoefficient,
    priceMethod,
}) => {
    const sam = toNumber(samGsd, 0);
    const efficiency = toNumber(requiredEfficiency, 0);
    const coefficient = toNumber(salaryCoefficient, 0);

    const adjustedSam = efficiency > 0 ? sam / efficiency : sam;
    const utilizationRate = sam > 0 ? adjustedSam / sam : null;

    const standardPrice =
        priceMethod === 'ADJUSTED'
            ? adjustedSam * coefficient
            : sam * coefficient;

    return {
        adjustedSam,
        utilizationRate,
        standardPrice,
    };
};


const getSalaryCoefficient = async (transaction, skillGradeId) => {
    if (!skillGradeId) return 0;

    const result = await new sql.Request(transaction)
        .input('skill_grade_id', sql.Int, skillGradeId)
        .query(`
      SELECT TOP 1
        coefficient
      FROM salary_coefficients
      WHERE level_id = @skill_grade_id
        AND status_id = 0
      ORDER BY id DESC
    `);

    return Number(result.recordset[0]?.coefficient || 0);
};

const getOperationClusterHeaders = async () => {
    const pool = await getPool();

    const result = await pool.request().query(`
    SELECT
      h.id,
      h.document_code,

      h.work_id,
      w.work_code,
      w.work_name,

      h.product_category_id,
      pc.product_code,
      pc.product_name,

      h.product_category_group_id,
      pcg.category_group_code,
      pcg.category_group_name,

      h.required_efficiency,
      h.price_method,
      h.note,
      h.status_id,
      ms.status_code,
      ms.status_name,
      h.created_at,
      h.updated_at,

      ISNULL(SUM(o.adjusted_sam), 0) AS total_adjusted_sam,
      ISNULL(SUM(o.sam_gsd), 0) AS total_sam_gsd,
      ISNULL(SUM(o.total_actions), 0) AS total_actions,
      ISNULL(SUM(o.total_action_seconds), 0) AS total_action_seconds,
      ISNULL(SUM(o.manpower), 0) AS total_manpower
    FROM operation_cluster_headers h
    LEFT JOIN works w
      ON w.id = h.work_id
    LEFT JOIN product_categories pc
      ON pc.id = h.product_category_id
    LEFT JOIN product_category_groups pcg
      ON pcg.id = h.product_category_group_id
    LEFT JOIN master_status ms
      ON ms.id = h.status_id
    LEFT JOIN operation_cluster_operations o
      ON o.header_id = h.id
    GROUP BY
      h.id,
      h.document_code,

      h.work_id,
      w.work_code,
      w.work_name,

      h.product_category_id,
      pc.product_code,
      pc.product_name,

      h.product_category_group_id,
      pcg.category_group_code,
      pcg.category_group_name,

      h.required_efficiency,
      h.price_method,
      h.note,
      h.status_id,
      ms.status_code,
      ms.status_name,
      h.created_at,
      h.updated_at
    ORDER BY h.id DESC
  `);

    return result.recordset;
};

const getGsdOptions = async () => {
    const pool = await getPool();

    const result = await pool.request().query(`
    SELECT
      h.id AS gsd_analysis_id,
      h.analysis_no AS operation_code,
      h.operation_name,

      sg.id AS skill_grade_id,
      TRY_CAST(h.skill_grade AS INT) AS skill_level,
      ISNULL(sc.coefficient, 0) AS salary_coefficient,

      h.machine_id AS machine_equipment_id,
      m.machine_code,
      m.machine_name,
      m.code_mmtb,

      CAST(ISNULL(h.final_smv, 0) AS DECIMAL(10,2)) AS sam_gsd,

      CAST(
        ISNULL(SUM((ISNULL(d.tmu, 0) * ISNULL(d.frequency, 1)) / 27.8), 0)
        AS DECIMAL(18,2)
      ) AS total_action_seconds,

      COUNT(d.id) AS total_actions
    FROM gsd_analysis_headers h
    LEFT JOIN gsd_analysis_details d
      ON d.analysis_id = h.id
    LEFT JOIN machine_equipments_test m
      ON m.id = h.machine_id
    LEFT JOIN skill_grade sg
      ON sg.level = TRY_CAST(h.skill_grade AS INT)
    LEFT JOIN salary_coefficients sc
      ON sc.level_id = sg.id
      AND sc.status_id = 0
    GROUP BY
      h.id,
      h.analysis_no,
      h.operation_name,
      h.skill_grade,
      sg.id,
      sc.coefficient,
      h.machine_id,
      m.machine_code,
      m.machine_name,
      m.code_mmtb,
      h.final_smv
    ORDER BY h.id DESC
  `);

    return result.recordset;
};


const getGsdActions = async (gsdAnalysisId) => {
    const pool = await getPool();

    const result = await pool.request()
        .input('analysis_id', sql.Int, gsdAnalysisId)
        .query(`
      SELECT
        d.id,
        d.analysis_id,
        d.line_no,
        d.step_no,
        d.gsd_code_id,
        d.gsd_code,
        d.action_name,
        d.tmu,
        d.frequency,
        CAST((ISNULL(d.tmu, 0) * ISNULL(d.frequency, 1)) / 27.8 AS DECIMAL(18, 6)) AS seconds,
        d.note,
        d.is_selected
      FROM gsd_analysis_details d
      WHERE d.analysis_id = @analysis_id
      ORDER BY
        d.line_no,
        d.id
    `);

    return result.recordset;
};


const getOperationClusterById = async (id) => {
    const pool = await getPool();

    const headerResult = await pool.request()
        .input('id', sql.Int, id)
        .query(`
      SELECT
        h.id,
        h.document_code,

        h.work_id,
        w.work_code,
        w.work_name,

        h.product_category_id,
        pc.product_code,
        pc.product_name,

        h.product_category_group_id,
        pcg.category_group_code,
        pcg.category_group_name,

        h.required_efficiency,
        h.price_method,
        h.note,
        h.status_id,
        ms.status_code,
        ms.status_name,
        h.created_at,
        h.updated_at
      FROM operation_cluster_headers h
      LEFT JOIN works w
        ON w.id = h.work_id
      LEFT JOIN product_categories pc
        ON pc.id = h.product_category_id
      LEFT JOIN product_category_groups pcg
        ON pcg.id = h.product_category_group_id
      LEFT JOIN master_status ms
        ON ms.id = h.status_id
      WHERE h.id = @id
    `);

    const header = headerResult.recordset[0];

    if (!header) return null;

    const groupsResult = await pool.request()
        .input('header_id', sql.Int, id)
        .query(`
      SELECT
        g.id,
        g.header_id,
        g.line_no,
        g.cluster_name,
        g.created_at,
        g.updated_at,

        ISNULL(SUM(o.adjusted_sam), 0) AS tgcn,
        ISNULL(SUM(o.sam_gsd), 0) AS total_sam_gsd,
        ISNULL(SUM(o.standard_price), 0) AS total_standard_price,
        ISNULL(SUM(o.manpower), 0) AS total_manpower
      FROM operation_cluster_groups g
      LEFT JOIN operation_cluster_operations o
        ON o.group_id = g.id
      WHERE g.header_id = @header_id
      GROUP BY
        g.id,
        g.header_id,
        g.line_no,
        g.cluster_name,
        g.created_at,
        g.updated_at
      ORDER BY g.line_no
    `);

    const operationsResult = await pool.request()
        .input('header_id', sql.Int, id)
        .query(`
     SELECT
    o.id,
    o.header_id,
    o.group_id,
    g.cluster_name,
    g.line_no AS group_line_no_master,

    o.line_no,
    o.group_line_no,
    o.line_balance_no,

    o.gsd_analysis_id,
    gah.analysis_no,
    gah.operation_name AS gsd_operation_name,

    o.operation_code,
    o.operation_name,

    o.skill_grade_id,
    sg.level AS skill_level_master,
    o.skill_level,

    o.machine_equipment_id,
    m.machine_code AS machine_code_master,
    m.machine_name AS machine_name_master,
    m.code_mmtb,

    o.machine_code,
    o.machine_name,

    o.sam_gsd,
    o.salary_coefficient,
    o.manpower,
    o.standard_price,
    o.required_efficiency,
    o.adjusted_sam,
    o.utilization_rate,
    o.total_action_seconds,
    o.total_actions,

    o.status_id,
    ms.status_code,
    ms.status_name,
    o.created_at,
    o.updated_at
FROM operation_cluster_operations o
LEFT JOIN operation_cluster_groups g
    ON g.id = o.group_id
LEFT JOIN gsd_analysis_headers gah
    ON gah.id = o.gsd_analysis_id
LEFT JOIN skill_grade sg
    ON sg.id = o.skill_grade_id
LEFT JOIN machine_equipments_test m
    ON m.id = o.machine_equipment_id
LEFT JOIN master_status ms
    ON ms.id = o.status_id
WHERE o.header_id = @header_id
ORDER BY
    o.group_line_no,
    o.line_no;
    `);

    const dashboardResult = await pool.request()
        .input('header_id', sql.Int, id)
        .query(`
      WITH ClusterTgcn AS (
        SELECT
          group_id,
          SUM(adjusted_sam) AS tgcn
        FROM operation_cluster_operations
        WHERE header_id = @header_id
        GROUP BY group_id
      )
      SELECT
        ISNULL(SUM(o.adjusted_sam), 0) AS total_adjusted_sam,
        ISNULL(SUM(o.sam_gsd), 0) AS total_sam_gsd,
        ISNULL(SUM(o.total_actions), 0) AS total_actions,
        ISNULL(SUM(o.total_action_seconds), 0) AS total_action_seconds,
        ISNULL(SUM(o.manpower), 0) AS total_manpower,
        ISNULL(SUM(o.standard_price), 0) AS total_standard_price,
        ISNULL(AVG(ct.tgcn), 0) AS avg_tgcn_per_cluster
      FROM operation_cluster_operations o
      LEFT JOIN ClusterTgcn ct
        ON ct.group_id = o.group_id
      WHERE o.header_id = @header_id
    `);

    return {
        header,
        groups: groupsResult.recordset,
        operations: operationsResult.recordset,
        dashboard: dashboardResult.recordset[0],
    };
};

const createOperationCluster = async (payload) => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
        if (!payload.document_code) {
            throw new Error('Vui lòng nhập mã chứng từ');
        }

        const documentCode = payload.document_code.trim();

        const duplicateResult = await new sql.Request(transaction)
            .input('document_code', sql.VarChar(16), documentCode)
            .query(`
            SELECT TOP 1 id
            FROM operation_cluster_headers
            WHERE document_code = @document_code
      `);

        if (duplicateResult.recordset.length > 0) {
            throw new Error(`Mã chứng từ "${documentCode}" đã tồn tại`);
        }

        if (!payload.work_id) {
            throw new Error('Vui lòng chọn công việc');
        }

        if (!payload.product_category_id) {
            throw new Error('Vui lòng chọn chủng loại hàng');
        }

        if (!payload.product_category_group_id) {
            throw new Error('Vui lòng chọn nhóm chủng loại hàng');
        }

        const priceMethod = payload.price_method || 'GSD';
        const headerEfficiency = payload.required_efficiency ?? null;

        const headerRequest = new sql.Request(transaction);

        const headerResult = await headerRequest
            .input('document_code', sql.VarChar(16), documentCode)
            .input('work_id', sql.Int, payload.work_id)
            .input('product_category_id', sql.Int, payload.product_category_id)
            .input('product_category_group_id', sql.Int, payload.product_category_group_id)
            .input('required_efficiency', sql.Decimal(10, 4), headerEfficiency)
            .input('price_method', sql.VarChar(20), priceMethod)
            .input('note', sql.NVarChar(500), payload.note || null)
            .input('status_id', sql.TinyInt, payload.status_id ?? 0)
            .query(`
        INSERT INTO operation_cluster_headers (
          document_code,
          work_id,
          product_category_id,
          product_category_group_id,
          required_efficiency,
          price_method,
          note,
          status_id
        )
        OUTPUT INSERTED.*
        VALUES (
          @document_code,
          @work_id,
          @product_category_id,
          @product_category_group_id,
          @required_efficiency,
          @price_method,
          @note,
          @status_id
        )
      `);

        const header = headerResult.recordset[0];
        const groups = Array.isArray(payload.groups) ? payload.groups : [];

        for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
            const group = groups[groupIndex];
            const groupLineNo = group.line_no || groupIndex + 1;

            if (!group.cluster_name) {
                throw new Error(`Vui lòng nhập tên cụm ở dòng ${groupLineNo}`);
            }

            const groupRequest = new sql.Request(transaction);

            const groupResult = await groupRequest
                .input('header_id', sql.Int, header.id)
                .input('line_no', sql.Int, groupLineNo)
                .input('cluster_name', sql.NVarChar(100), group.cluster_name)
                .query(`
          INSERT INTO operation_cluster_groups (
            header_id,
            line_no,
            cluster_name
          )
          OUTPUT INSERTED.*
          VALUES (
            @header_id,
            @line_no,
            @cluster_name
          )
        `);

            const savedGroup = groupResult.recordset[0];
            const operations = Array.isArray(group.operations) ? group.operations : [];

            for (let operationIndex = 0; operationIndex < operations.length; operationIndex += 1) {
                const operation = operations[operationIndex];

                if (!operation.operation_name) {
                    throw new Error(`Vui lòng nhập tên công đoạn ở cụm ${groupLineNo}, dòng ${operationIndex + 1}`);
                }

                const effectiveEfficiency =
                    operation.required_efficiency ?? headerEfficiency ?? null;

                const salaryCoefficientFromPayload = toNumber(operation.salary_coefficient, 0);

                const salaryCoefficientFromDb = await getSalaryCoefficient(
                    transaction,
                    operation.skill_grade_id
                );

                const salaryCoefficient =
                    salaryCoefficientFromPayload > 0
                        ? salaryCoefficientFromPayload
                        : salaryCoefficientFromDb;

                const calculated = calculateOperationValues({
                    samGsd: operation.sam_gsd,
                    requiredEfficiency: effectiveEfficiency,
                    salaryCoefficient,
                    priceMethod,
                });

                const operationRequest = new sql.Request(transaction);

                await operationRequest
                    .input('header_id', sql.Int, header.id)
                    .input('group_id', sql.Int, savedGroup.id)
                    .input('line_no', sql.Int, operation.line_no || operationIndex + 1)
                    .input('group_line_no', sql.Int, groupLineNo)
                    .input('line_balance_no', sql.Int, operation.line_balance_no || null)

                    .input('gsd_analysis_id', sql.Int, operation.gsd_analysis_id || null)
                    .input('operation_code', sql.VarChar(32), operation.operation_code || null)
                    .input('operation_name', sql.NVarChar(200), operation.operation_name)

                    .input('skill_grade_id', sql.Int, operation.skill_grade_id || null)
                    .input('skill_level', sql.Int, operation.skill_level || null)

                    .input('machine_equipment_id', sql.Int, operation.machine_equipment_id || null)
                    .input('machine_name', sql.NVarChar(200), operation.machine_name || null)
                    .input('machine_code', sql.VarChar(32), operation.machine_code || null)

                    .input('sam_gsd', sql.Decimal(10, 2), toNumber(operation.sam_gsd, 0))
                    // .input('salary_coefficient', sql.Decimal(10, 2), toNumber(operation.salary_coefficient, 0))
                    .input('salary_coefficient', sql.Decimal(10, 2), salaryCoefficient)
                    .input('manpower', sql.Decimal(10, 2), operation.manpower ?? null)

                    .input('standard_price', sql.Decimal(18, 2), calculated.standardPrice)
                    .input('required_efficiency', sql.Decimal(10, 4), effectiveEfficiency)
                    .input('adjusted_sam', sql.Decimal(10, 2), calculated.adjustedSam)
                    .input('utilization_rate', sql.Decimal(10, 4), calculated.utilizationRate)

                    .input('total_action_seconds', sql.Decimal(18, 2), toNumber(operation.total_action_seconds, 0))
                    .input('total_actions', sql.Int, toNumber(operation.total_actions, 0))
                    .input('status_id', sql.TinyInt, operation.status_id ?? 0)
                    .query(`
            INSERT INTO operation_cluster_operations (
              header_id,
              group_id,
              line_no,
              group_line_no,
              line_balance_no,

              gsd_analysis_id,
              operation_code,
              operation_name,

              skill_grade_id,
              skill_level,

              machine_equipment_id,
              machine_name,
              machine_code,

              sam_gsd,
              salary_coefficient,
              manpower,

              standard_price,
              required_efficiency,
              adjusted_sam,
              utilization_rate,

              total_action_seconds,
              total_actions,
              status_id
            )
            VALUES (
              @header_id,
              @group_id,
              @line_no,
              @group_line_no,
              @line_balance_no,

              @gsd_analysis_id,
              @operation_code,
              @operation_name,

              @skill_grade_id,
              @skill_level,

              @machine_equipment_id,
              @machine_name,
              @machine_code,

              @sam_gsd,
              @salary_coefficient,
              @manpower,

              @standard_price,
              @required_efficiency,
              @adjusted_sam,
              @utilization_rate,

              @total_action_seconds,
              @total_actions,
              @status_id
            )
          `);
            }
        }

        await transaction.commit();

        return getOperationClusterById(header.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    getOperationClusterHeaders,
    getGsdOptions,
    getGsdActions,
    getOperationClusterById,
    createOperationCluster,
};