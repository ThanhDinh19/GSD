const { getPool, sql } = require('./connection');

async function initDb() {
  const pool = getPool();

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='employees' and xtype='U')
    BEGIN
      CREATE TABLE employees (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NULL,
        email NVARCHAR(255) NULL,
        phone NVARCHAR(50) NULL,
        address NVARCHAR(500) NULL
      )
    END
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='routing_data' and xtype='U')
    BEGIN
      CREATE TABLE routing_data (
        id INT IDENTITY(1,1) PRIMARY KEY,
        stt INT NULL,
        op_code NVARCHAR(50) NULL,
        op_name NVARCHAR(255) NULL,
        machine NVARCHAR(50) NULL,
        sam FLOAT NULL,
        smv FLOAT NULL,
        rate FLOAT NULL,
        difficulty NVARCHAR(50) NULL,
        skill NVARCHAR(50) NULL
      )
    END
  `);

  await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='mapping_configs' and xtype='U')
  BEGIN
    CREATE TABLE mapping_configs (
      id INT IDENTITY(1,1) PRIMARY KEY,
      config_key NVARCHAR(50) NOT NULL UNIQUE,
      table_name NVARCHAR(100) NOT NULL,
      sheet_name NVARCHAR(100) NULL,
      start_row INT NOT NULL,
      end_row INT NOT NULL,
      mapping_items NVARCHAR(MAX) NOT NULL
    )
  END
`);

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='master_status' and xtype='U')
    BEGIN
      CREATE TABLE master_status (
        id TINYINT PRIMARY KEY,
        status_code NVARCHAR(20) NOT NULL UNIQUE,
        status_name NVARCHAR(100) NOT NULL
      )
    END
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM master_status WHERE id = 0)
    BEGIN
      INSERT INTO master_status (id, status_code, status_name)
      VALUES (0, N'ACTIVE', N'Còn sử dụng')
    END
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM master_status WHERE id = 1)
    BEGIN
      INSERT INTO master_status (id, status_code, status_name)
      VALUES (1, N'INACTIVE', N'Không sử dụng')
    END
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='clusters' and xtype='U')
    BEGIN
      CREATE TABLE clusters (
        id INT IDENTITY(1,1) PRIMARY KEY,
        cluster_code NVARCHAR(50) NOT NULL UNIQUE,
        cluster_name NVARCHAR(255) NOT NULL,
        status_id TINYINT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

        CONSTRAINT FK_clusters_status 
          FOREIGN KEY (status_id) REFERENCES master_status(id)
      )
    END
  `);

  await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sources' and xtype='U')
  BEGIN
    CREATE TABLE sources (
      id INT IDENTITY(1,1) PRIMARY KEY,
      source_code NVARCHAR(255) NOT NULL UNIQUE,
      source_name NVARCHAR(255) NULL,
      note NVARCHAR(500) NULL,
      status_id TINYINT NOT NULL DEFAULT 0,
      created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

      CONSTRAINT FK_sources_status 
        FOREIGN KEY (status_id) REFERENCES master_status(id)
    )
  END
`);

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='gsd_codes' and xtype='U')
    BEGIN
      CREATE TABLE gsd_codes (
        id INT IDENTITY(1,1) PRIMARY KEY,

        action_code NVARCHAR(16) NOT NULL UNIQUE,     -- Mã thao tác
        action_name NVARCHAR(256) NOT NULL,           -- Tên thao tác

        gsd_code NVARCHAR(16) NULL,                   -- Code
        code_new NVARCHAR(16) NULL,                   -- Code mới

        frequency INT NULL,                           -- Tần suất
        tmu INT NOT NULL DEFAULT 0,                   -- TMU

        seconds AS CAST(tmu / 27.8 AS DECIMAL(18,6)) PERSISTED,

        note NVARCHAR(256) NULL,
        status_id TINYINT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

        CONSTRAINT FK_gsd_codes_status 
          FOREIGN KEY (status_id) REFERENCES master_status(id)
        )
    END
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='machine_equipments' and xtype='U')
    BEGIN
      CREATE TABLE machine_equipments (
        id INT IDENTITY(1,1) PRIMARY KEY,

        machine_code NVARCHAR(16) NOT NULL UNIQUE,   -- Mã MMTB
        machine_name NVARCHAR(256) NOT NULL,         -- Tên MMTB

        cluster_id INT NULL,                         -- Cụm

        code_mmtb NVARCHAR(16) NULL,                 -- Code
        allowance DECIMAL(5,2) NULL,                 -- Hao phí
        stitch_count DECIMAL(5,2) NULL,              -- Số mũi chỉ
        machine_speed INT NULL,                      -- Tốc độ máy

        default_smv DECIMAL(5,2) NULL,               -- SMV
        skill_grade CHAR(1) NULL,                    -- Bậc CĐ

        note NVARCHAR(256) NULL,
        status_id TINYINT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

        CONSTRAINT FK_machine_equipments_cluster
          FOREIGN KEY (cluster_id) REFERENCES clusters(id),

        CONSTRAINT FK_machine_equipments_status
          FOREIGN KEY (status_id) REFERENCES master_status(id)
      )
    END
  `);


  await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='source_action_headers' and xtype='U')
  BEGIN
    CREATE TABLE source_action_headers (
      id INT IDENTITY(1,1) PRIMARY KEY,
      source_id INT NOT NULL,
      total_actions INT NOT NULL DEFAULT 0,
      total_tmu INT NOT NULL DEFAULT 0,
      note NVARCHAR(256) NULL,
      created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
      updated_at DATETIME2 NULL,

      CONSTRAINT FK_source_action_header_source 
        FOREIGN KEY (source_id) REFERENCES sources(id),

      CONSTRAINT UQ_source_action_header_source 
        UNIQUE(source_id)
    )
  END
`);

  await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='source_action_details' and xtype='U')
  BEGIN
    CREATE TABLE source_action_details (
      id INT IDENTITY(1,1) PRIMARY KEY,
      header_id INT NOT NULL,
      line_no INT NOT NULL,

      gsd_code_id INT NULL,

      action_name NVARCHAR(256) NOT NULL,
      gsd_code NVARCHAR(16) NULL,
      code_new NVARCHAR(16) NULL,
      frequency INT NULL,
      tmu INT NOT NULL DEFAULT 0,
      note NVARCHAR(256) NULL,

      CONSTRAINT FK_source_action_detail_header 
        FOREIGN KEY (header_id) REFERENCES source_action_headers(id),

      CONSTRAINT FK_source_action_detail_gsd 
        FOREIGN KEY (gsd_code_id) REFERENCES gsd_codes(id),

      CONSTRAINT UQ_source_action_detail_line 
        UNIQUE(header_id, line_no)
    )
  END
`);

  await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='gsd_analysis_headers' and xtype='U')
  BEGIN
    CREATE TABLE gsd_analysis_headers (
      id INT IDENTITY(1,1) PRIMARY KEY,

      analysis_no NVARCHAR(50) NOT NULL UNIQUE,
      analysis_date DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

      source_id INT NULL,
      machine_id INT NULL,

      operation_name NVARCHAR(255) NOT NULL,

      seam_length DECIMAL(18,4) NULL,
      attached_action_time DECIMAL(18,4) NULL,
      difficulty_percent DECIMAL(18,4) NULL,
      product_multiplier DECIMAL(18,4) NOT NULL DEFAULT 1,

      stitch_count DECIMAL(18,4) NULL,
      machine_speed DECIMAL(18,4) NULL,
      allowance DECIMAL(18,4) NULL,

      total_tmu DECIMAL(18,4) NOT NULL DEFAULT 0,
      total_manual_seconds DECIMAL(18,4) NOT NULL DEFAULT 0,
      machine_seconds DECIMAL(18,4) NOT NULL DEFAULT 0,
      total_smv_before_difficulty DECIMAL(18,4) NOT NULL DEFAULT 0,
      difficulty_seconds DECIMAL(18,4) NOT NULL DEFAULT 0,
      final_smv DECIMAL(18,4) NOT NULL DEFAULT 0,

      skill_grade TINYINT NULL,
      note NVARCHAR(500) NULL,

      created_by INT NULL,
      created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
      updated_at DATETIME2 NULL,

      CONSTRAINT FK_gsd_analysis_source
        FOREIGN KEY (source_id) REFERENCES sources(id),

      CONSTRAINT FK_gsd_analysis_machine
        FOREIGN KEY (machine_id) REFERENCES machine_equipments(id),

      CONSTRAINT FK_gsd_analysis_employee
        FOREIGN KEY (created_by) REFERENCES employees(id)
    )
  END
`);

  await pool.request().query(`
    IF COL_LENGTH('gsd_analysis_headers', 'machine_velocity') IS NULL
    BEGIN
        ALTER TABLE gsd_analysis_headers
        ADD machine_velocity DECIMAL(18,4) NOT NULL
            CONSTRAINT DF_gsd_analysis_headers_machine_velocity DEFAULT 0;
    END  
  `);

  await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='gsd_analysis_details' and xtype='U')
  BEGIN
    CREATE TABLE gsd_analysis_details (
      id INT IDENTITY(1,1) PRIMARY KEY,

      analysis_id INT NOT NULL,
      line_no INT NOT NULL,
      step_no DECIMAL(18,4) NULL,

      source_action_detail_id INT NULL,
      gsd_code_id INT NULL,

      gsd_code NVARCHAR(50) NULL,
      action_name NVARCHAR(500) NOT NULL,

      tmu DECIMAL(18,4) NOT NULL DEFAULT 0,
      repeat_count DECIMAL(18,4) NOT NULL DEFAULT 1,

      seconds AS CAST((tmu * repeat_count) / 27.8 AS DECIMAL(18,6)) PERSISTED,

      note NVARCHAR(500) NULL,
      is_selected BIT NOT NULL DEFAULT 1,

      CONSTRAINT FK_gsd_analysis_detail_header
        FOREIGN KEY (analysis_id) REFERENCES gsd_analysis_headers(id),

      CONSTRAINT FK_gsd_analysis_detail_source_action
        FOREIGN KEY (source_action_detail_id) REFERENCES source_action_details(id),

      CONSTRAINT FK_gsd_analysis_detail_gsd
        FOREIGN KEY (gsd_code_id) REFERENCES gsd_codes(id),

      CONSTRAINT UQ_gsd_analysis_detail_line
        UNIQUE(analysis_id, line_no)
    )
  END
`);

  await seedDefaultMappingConfigs(pool);

  console.log('SQL Server Tables are ready.');
}

async function seedDefaultMappingConfigs(pool) {
  console.log('Verifying default mapping configs...');

  const defaultConfigs = [
    {
      config_key: 'employees',
      table_name: 'employees',
      sheet_name: 'Employee Database',
      start_row: 2,
      end_row: 4,
      mapping_items: JSON.stringify([
        { excelColumn: 'A', dbColumn: 'name' },
        { excelColumn: 'B', dbColumn: 'email' },
        { excelColumn: 'C', dbColumn: 'phone' },
        { excelColumn: 'D', dbColumn: 'address' }
      ])
    },
    {
      config_key: 'routing_data',
      table_name: 'routing_data',
      sheet_name: 'Routing Details',
      start_row: 2,
      end_row: 13,
      mapping_items: JSON.stringify([
        { excelColumn: 'A', dbColumn: 'stt' },
        { excelColumn: 'B', dbColumn: 'op_code' },
        { excelColumn: 'C', dbColumn: 'op_name' },
        { excelColumn: 'D', dbColumn: 'machine' },
        { excelColumn: 'E', dbColumn: 'sam' },
        { excelColumn: 'F', dbColumn: 'smv' },
        { excelColumn: 'G', dbColumn: 'rate' },
        { excelColumn: 'H', dbColumn: 'difficulty' },
        { excelColumn: 'I', dbColumn: 'skill' }
      ])
    }
  ];

  for (const conf of defaultConfigs) {
    const existRes = await pool.request()
      .input('config_key', sql.NVarChar, conf.config_key)
      .query('SELECT COUNT(*) as count FROM mapping_configs WHERE config_key = @config_key');

    const exists = existRes.recordset[0].count > 0;

    if (exists) {
      await pool.request()
        .input('config_key', sql.NVarChar, conf.config_key)
        .input('table_name', sql.NVarChar, conf.table_name)
        .input('sheet_name', sql.NVarChar, conf.sheet_name)
        .input('start_row', sql.Int, conf.start_row)
        .input('end_row', sql.Int, conf.end_row)
        .input('mapping_items', sql.NVarChar, conf.mapping_items)
        .query(`
          UPDATE mapping_configs
          SET table_name = @table_name,
              sheet_name = @sheet_name,
              start_row = @start_row,
              end_row = @end_row,
              mapping_items = @mapping_items
          WHERE config_key = @config_key
        `);
    } else {
      await pool.request()
        .input('config_key', sql.NVarChar, conf.config_key)
        .input('table_name', sql.NVarChar, conf.table_name)
        .input('sheet_name', sql.NVarChar, conf.sheet_name)
        .input('start_row', sql.Int, conf.start_row)
        .input('end_row', sql.Int, conf.end_row)
        .input('mapping_items', sql.NVarChar, conf.mapping_items)
        .query(`
          INSERT INTO mapping_configs 
            (config_key, table_name, sheet_name, start_row, end_row, mapping_items)
          VALUES 
            (@config_key, @table_name, @sheet_name, @start_row, @end_row, @mapping_items)
        `);
    }
  }

  console.log('Seeded/Updated default mapping configs.');
}

module.exports = {
  initDb
};