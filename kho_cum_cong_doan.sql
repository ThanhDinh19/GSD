use [demo_db]

CREATE TABLE operation_cluster_headers (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    document_code VARCHAR(16) NOT NULL,

    work_id INT NOT NULL,
    product_category_id INT NOT NULL,
    product_category_group_id INT NOT NULL,

    required_efficiency DECIMAL(10,4) NULL,

    -- GSD hoặc ADJUSTED
    price_method VARCHAR(20) NOT NULL DEFAULT 'GSD',

    note NVARCHAR(500) NULL,

    status_id TINYINT NOT NULL DEFAULT 0,

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL
);


CREATE TABLE operation_cluster_groups (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    header_id INT NOT NULL,

    line_no INT NOT NULL,
    cluster_name NVARCHAR(100) NOT NULL,

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL
);



CREATE TABLE operation_cluster_operations (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    header_id INT NOT NULL,
    group_id INT NOT NULL,

    line_no INT NOT NULL,
    group_line_no INT NOT NULL,
    line_balance_no INT NULL,

    gsd_analysis_id INT NULL,

    operation_code VARCHAR(32) NULL,
    operation_name NVARCHAR(200) NOT NULL,

    skill_grade_id INT NULL,
    skill_level INT NULL,

    machine_equipment_id INT NULL,
    machine_name NVARCHAR(200) NULL,
    machine_code VARCHAR(32) NULL,

    sam_gsd DECIMAL(10,2) NOT NULL DEFAULT 0,

    salary_coefficient DECIMAL(10,2) NOT NULL DEFAULT 0,
    manpower DECIMAL(10,2) NULL,

    standard_price DECIMAL(18,2) NOT NULL DEFAULT 0,

    required_efficiency DECIMAL(10,4) NULL,
    adjusted_sam DECIMAL(10,2) NOT NULL DEFAULT 0,
    utilization_rate DECIMAL(10,4) NULL,

    total_action_seconds DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_actions INT NOT NULL DEFAULT 0,

    status_id TINYINT NOT NULL DEFAULT 0,

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL
);
GO

select * from salary_coefficients;

select * from operation_cluster_headers;

select * from operation_cluster_groups;

select * from operation_cluster_operations;


CREATE INDEX IX_operation_cluster_headers_work_id
ON operation_cluster_headers(work_id);
GO

CREATE INDEX IX_operation_cluster_headers_product_category_id
ON operation_cluster_headers(product_category_id);
GO

CREATE INDEX IX_operation_cluster_headers_product_category_group_id
ON operation_cluster_headers(product_category_group_id);
GO

CREATE INDEX IX_operation_cluster_groups_header_id
ON operation_cluster_groups(header_id);
GO

CREATE INDEX IX_operation_cluster_operations_header_id
ON operation_cluster_operations(header_id);
GO

CREATE INDEX IX_operation_cluster_operations_group_id
ON operation_cluster_operations(group_id);
GO

CREATE INDEX IX_operation_cluster_operations_gsd_analysis_id
ON operation_cluster_operations(gsd_analysis_id);
GO

CREATE INDEX IX_operation_cluster_operations_machine_equipment_id
ON operation_cluster_operations(machine_equipment_id);
GO

CREATE INDEX IX_operation_cluster_operations_skill_grade_id
ON operation_cluster_operations(skill_grade_id);
GO

select * from machine_equipments_test;




SELECT
      h.id AS gsd_analysis_id,

      CAST(h.id AS VARCHAR(32)) AS operation_code,
      h.operation_name,

      sg.id AS skill_grade_id,
      TRY_CAST(h.skill_grade AS INT) AS skill_level,
      ISNULL(sc.coefficient, 0) AS salary_coefficient,

      h.machine_id AS machine_equipment_id,
      COALESCE(h.machine_name, m.machine_name) AS machine_name,
      COALESCE(h.machine_code, m.machine_code) AS machine_code,

      CAST(ISNULL(h.final_smv, 0) AS DECIMAL(10,2)) AS sam_gsd,

      CAST(
        ISNULL(SUM((ISNULL(d.tmu, 0) * ISNULL(d.frequency, 1)) / 27.8), 0)
        AS DECIMAL(18,2)
      ) AS total_action_seconds,

      COUNT(d.id) AS total_actions
    FROM gsd_analysis_headers h
    LEFT JOIN gsd_analysis_details d
      ON d.header_id = h.id
    LEFT JOIN machine_equipments m
      ON m.id = h.machine_id
    LEFT JOIN skill_grade sg
      ON sg.level = TRY_CAST(h.skill_grade AS INT)
    LEFT JOIN salary_coefficients sc
      ON sc.level_id = sg.id
      AND sc.status_id = 0
    GROUP BY
      h.id,
      h.operation_name,
      h.skill_grade,
      sg.id,
      sc.coefficient,
      h.machine_id,
      h.machine_name,
      h.machine_code,
      m.machine_name,
      m.machine_code,
      h.final_smv
    ORDER BY h.id DESC



    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN (
    'operation_cluster_headers',
    'operation_cluster_groups',
    'operation_cluster_operations'
)
ORDER BY TABLE_NAME, ORDINAL_POSITION;



SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN (
    'works',
    'product_categories',
    'product_category_groups',
    'master_status',
    'skill_grade',
    'salary_coefficients'
)
ORDER BY TABLE_NAME, ORDINAL_POSITION;





SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN (
    'gsd_analysis_headers',
    'gsd_analysis_details',
    'machine_equipments_test'
)
ORDER BY TABLE_NAME, ORDINAL_POSITION;



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
ORDER BY h.id DESC;


select * from machine_equipments_test
where machine_code = 'MMTB0016'

select * from operation_cluster_operations
select * from gsd_analysis_headers
select * from gsd_analysis_details;
select * from gsd_codes;