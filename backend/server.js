const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the compiled frontend dist directory
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// SQL Server Connection Configuration
const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'demo_db',
  options: {
    encrypt: true,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  }
};

let dbPool = null;

async function connectDB() {
  try {
    console.log(`Attempting connection to SQL Server: ${dbConfig.server}:${dbConfig.port}...`);
    
    // Try to connect directly first
    dbPool = await sql.connect(dbConfig);
    console.log(`Connected directly to target database: ${dbConfig.database}`);
  } catch (directErr) {
    console.log('Direct connection failed, attempting to connect to master to create database...', directErr.message);
    try {
      // Connect to master database first to check/create target database
      const masterConfig = { ...dbConfig, database: 'master' };
      const masterPool = await sql.connect(masterConfig);
      await masterPool.request().query(`
        IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'${dbConfig.database}')
        BEGIN
          CREATE DATABASE [${dbConfig.database}]
        END
      `);
      await sql.close();
      
      // Connect back to target database
      dbPool = await sql.connect(dbConfig);
      console.log(`Database [${dbConfig.database}] verified/created and connected.`);
    } catch (masterErr) {
      console.error('Failed to connect or create target database:', masterErr.message);
      throw masterErr;
    }
  }

  // Create tables if they do not exist
  await dbPool.request().query(`
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

  await dbPool.request().query(`
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

  await dbPool.request().query(`
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

  // Seed or Update default mapping_configs
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
    const existRes = await dbPool.request()
      .input('config_key', sql.NVarChar, conf.config_key)
      .query('SELECT COUNT(*) as count FROM mapping_configs WHERE config_key = @config_key');
    
    const exists = existRes.recordset[0].count > 0;
    if (exists) {
      // Sync defaults to match the requested A, B, C structure
      await dbPool.request()
        .input('config_key', sql.NVarChar, conf.config_key)
        .input('table_name', sql.NVarChar, conf.table_name)
        .input('sheet_name', sql.NVarChar, conf.sheet_name)
        .input('start_row', sql.Int, conf.start_row)
        .input('end_row', sql.Int, conf.end_row)
        .input('mapping_items', sql.NVarChar, conf.mapping_items)
        .query(`
          UPDATE mapping_configs
          SET table_name = @table_name, sheet_name = @sheet_name, start_row = @start_row, end_row = @end_row, mapping_items = @mapping_items
          WHERE config_key = @config_key
        `);
    } else {
      await dbPool.request()
        .input('config_key', sql.NVarChar, conf.config_key)
        .input('table_name', sql.NVarChar, conf.table_name)
        .input('sheet_name', sql.NVarChar, conf.sheet_name)
        .input('start_row', sql.Int, conf.start_row)
        .input('end_row', sql.Int, conf.end_row)
        .input('mapping_items', sql.NVarChar, conf.mapping_items)
        .query(`
          INSERT INTO mapping_configs (config_key, table_name, sheet_name, start_row, end_row, mapping_items)
          VALUES (@config_key, @table_name, @sheet_name, @start_row, @end_row, @mapping_items)
        `);
    }
  }
  console.log('Seeded/Updated default mapping configs.');
  
  console.log('SQL Server Tables are ready.');
}

// Connect to Database
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server due to Database Connection failure:', err.message);
    process.exit(1);
  });

// ==========================================
// EMPLOYEES ENDPOINTS
// ==========================================

app.get('/api/data', async (req, res) => {
  try {
    const result = await dbPool.request().query('SELECT name, email, phone, address FROM employees ORDER BY id');
    let rows = result.recordset;

    if (rows.length > 0) {
      return res.json(rows);
    } else {
      console.log('Database empty. Seeding with default employee records...');
      const sampleData = [
        {
          name: 'Nguyễn Văn A',
          email: 'a.nguyen@example.com',
          phone: '0901234567',
          address: '123 Đường Lê Lợi, Quận 1, TP. HCM'
        },
        {
          name: 'Trần Thị B',
          email: 'b.tran@example.com',
          phone: '0912345678',
          address: '456 Đường Nguyễn Huệ, Quận Hải Châu, Đà Nẵng'
        },
        {
          name: 'Phạm Văn C',
          email: 'c.pham@example.com',
          phone: '0923456789',
          address: '789 Đường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội'
        }
      ];

      const transaction = new sql.Transaction(dbPool);
      await transaction.begin();
      try {
        for (const data of sampleData) {
          await new sql.Request(transaction)
            .input('name', sql.NVarChar, data.name)
            .input('email', sql.NVarChar, data.email)
            .input('phone', sql.NVarChar, data.phone)
            .input('address', sql.NVarChar, data.address)
            .query('INSERT INTO employees (name, email, phone, address) VALUES (@name, @email, @phone, @address)');
        }
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }

      return res.json(sampleData);
    }
  } catch (err) {
    console.error('Error querying employees database:', err.message);
    return res.status(500).json({ error: 'Failed to query database.' });
  }
});

app.post('/api/save', async (req, res) => {
  const records = req.body;

  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'Data must be a JSON array of rows.' });
  }

  console.log(`Received ${records.length} records to sync. Replacing employees table contents...`);

  const transaction = new sql.Transaction(dbPool);
  try {
    await transaction.begin();
    
    await new sql.Request(transaction).query('DELETE FROM employees');

    for (const record of records) {
      await new sql.Request(transaction)
        .input('name', sql.NVarChar, record.name !== undefined && record.name !== null ? String(record.name) : null)
        .input('email', sql.NVarChar, record.email !== undefined && record.email !== null ? String(record.email) : null)
        .input('phone', sql.NVarChar, record.phone !== undefined && record.phone !== null ? String(record.phone) : null)
        .input('address', sql.NVarChar, record.address !== undefined && record.address !== null ? String(record.address) : null)
        .query('INSERT INTO employees (name, email, phone, address) VALUES (@name, @email, @phone, @address)');
    }

    await transaction.commit();
    return res.json({ message: 'Successfully synced all employee records!', count: records.length });
  } catch (err) {
    console.error('Error inserting employees rows:', err.message);
    try {
      await transaction.rollback();
    } catch (rollbackErr) {}
    return res.status(500).json({ error: 'Database transaction failed during synchronization.' });
  }
});

// ==========================================
// ROUTING ENDPOINTS
// ==========================================

app.get('/api/routing', async (req, res) => {
  try {
    const result = await dbPool.request().query('SELECT stt, op_code, op_name, machine, sam, smv, rate, difficulty, skill FROM routing_data ORDER BY stt');
    let rows = result.recordset;

    if (rows.length > 0) {
      return res.json(rows);
    } else {
      console.log('Routing database empty. Seeding with default planning operations...');
      const defaultRouting = [
        { stt: 1, op_code: 'OP010', op_name: 'May vai thân trước', machine: '1N', sam: 0.85, smv: 0.79, rate: 2.62, difficulty: 'B', skill: 'B' },
        { stt: 2, op_code: 'OP020', op_name: 'May vai thân sau', machine: '1N', sam: 0.80, smv: 0.74, rate: 2.46, difficulty: 'B', skill: 'B' },
        { stt: 3, op_code: 'OP030', op_name: 'May nối vai', machine: '1N', sam: 0.75, smv: 0.70, rate: 2.31, difficulty: 'B', skill: 'B' },
        { stt: 4, op_code: 'OP040', op_name: 'Tra tay', machine: '2N', sam: 1.20, smv: 1.12, rate: 3.69, difficulty: 'C', skill: 'C' },
        { stt: 5, op_code: 'OP050', op_name: 'May sườn', machine: '1N', sam: 0.95, smv: 0.88, rate: 2.92, difficulty: 'B', skill: 'B' },
        { stt: 6, op_code: 'OP060', op_name: 'May cổ', machine: '1N', sam: 0.75, smv: 0.70, rate: 2.31, difficulty: 'B', skill: 'B' },
        { stt: 7, op_code: 'OP070', op_name: 'Gắn mũ', machine: '1N', sam: 1.10, smv: 1.02, rate: 3.38, difficulty: 'C', skill: 'C' },
        { stt: 8, op_code: 'OP080', op_name: 'May khóa kéo', machine: '1N', sam: 1.40, smv: 1.30, rate: 4.31, difficulty: 'C', skill: 'B' },
        { stt: 9, op_code: 'OP090', op_name: 'May túi', machine: '1N', sam: 1.50, smv: 1.39, rate: 4.62, difficulty: 'C', skill: 'B' },
        { stt: 10, op_code: 'OP100', op_name: 'May lai áo', machine: '1N', sam: 0.90, smv: 0.83, rate: 2.77, difficulty: 'B', skill: 'B' },
        { stt: 11, op_code: 'OP110', op_name: 'Ép seam', machine: 'SP', sam: 0.90, smv: 0.83, rate: 2.77, difficulty: 'B', skill: 'B' },
        { stt: 12, op_code: 'OP120', op_name: 'Kiểm tra & hoàn thiện', machine: 'BÀN', sam: 1.25, smv: 1.16, rate: 3.85, difficulty: 'B', skill: 'B' },
        { stt: 13, op_code: 'OP130', op_name: 'May bo lai tay', machine: '1N', sam: 1.10, smv: 1.01, rate: 3.38, difficulty: 'B', skill: 'B' },
        { stt: 14, op_code: 'OP140', op_name: 'May viền cổ áo', machine: '1N', sam: 1.15, smv: 1.05, rate: 3.54, difficulty: 'B', skill: 'B' },
        { stt: 15, op_code: 'OP150', op_name: 'Ráp bo lai áo', machine: '1N', sam: 1.20, smv: 1.10, rate: 3.69, difficulty: 'B', skill: 'B' },
        { stt: 16, op_code: 'OP160', op_name: 'Diễu sườn thân', machine: '1N', sam: 0.90, smv: 0.82, rate: 2.77, difficulty: 'B', skill: 'B' },
        { stt: 17, op_code: 'OP170', op_name: 'May nẹp lót khóa', machine: '1N', sam: 1.35, smv: 1.24, rate: 4.15, difficulty: 'C', skill: 'B' },
        { stt: 18, op_code: 'OP180', op_name: 'May thun bo tay', machine: '1N', sam: 1.25, smv: 1.15, rate: 3.85, difficulty: 'B', skill: 'B' },
        { stt: 19, op_code: 'OP190', op_name: 'Ráp lót mũ áo', machine: '1N', sam: 1.50, smv: 1.38, rate: 4.62, difficulty: 'C', skill: 'B' },
        { stt: 20, op_code: 'OP200', op_name: 'Diễu mí khóa dán', machine: '1N', sam: 1.45, smv: 1.33, rate: 4.46, difficulty: 'C', skill: 'B' },
        { stt: 21, op_code: 'OP210', op_name: 'Chần bông tay trái', machine: 'CB', sam: 2.50, smv: 2.25, rate: 7.69, difficulty: 'C', skill: 'C' },
        { stt: 22, op_code: 'OP220', op_name: 'Chần bông tay phải', machine: 'CB', sam: 2.40, smv: 2.15, rate: 7.38, difficulty: 'C', skill: 'C' },
        { stt: 23, op_code: 'OP230', op_name: 'Ráp sườn mũ lót', machine: '1N', sam: 1.15, smv: 1.05, rate: 3.54, difficulty: 'B', skill: 'B' },
        { stt: 24, op_code: 'OP240', op_name: 'May túi trong lót', machine: '1N', sam: 1.60, smv: 1.42, rate: 4.92, difficulty: 'C', skill: 'B' },
        { stt: 25, op_code: 'OP250', op_name: 'Ủi tạo dáng form', machine: 'BÀN', sam: 1.25, smv: 1.15, rate: 3.85, difficulty: 'B', skill: 'B' },
        { stt: 26, op_code: 'OP260', op_name: 'Ép keo nẹp ngực', machine: 'SP', sam: 1.25, smv: 1.12, rate: 3.85, difficulty: 'B', skill: 'B' }
      ];

      const transaction = new sql.Transaction(dbPool);
      await transaction.begin();
      try {
        for (const data of defaultRouting) {
          await new sql.Request(transaction)
            .input('stt', sql.Int, data.stt)
            .input('op_code', sql.NVarChar, data.op_code)
            .input('op_name', sql.NVarChar, data.op_name)
            .input('machine', sql.NVarChar, data.machine)
            .input('sam', sql.Float, data.sam)
            .input('smv', sql.Float, data.smv)
            .input('rate', sql.Float, data.rate)
            .input('difficulty', sql.NVarChar, data.difficulty)
            .input('skill', sql.NVarChar, data.skill)
            .query(`
              INSERT INTO routing_data (stt, op_code, op_name, machine, sam, smv, rate, difficulty, skill) 
              VALUES (@stt, @op_code, @op_name, @machine, @sam, @smv, @rate, @difficulty, @skill)
            `);
        }
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }

      return res.json(defaultRouting);
    }
  } catch (err) {
    console.error('Error querying routing database:', err.message);
    return res.status(500).json({ error: 'Failed to query database.' });
  }
});

app.post('/api/routing/save', async (req, res) => {
  const records = req.body;

  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'Data must be a JSON array.' });
  }

  console.log(`Received ${records.length} routing records to sync. Replacing table contents...`);

  const transaction = new sql.Transaction(dbPool);
  try {
    await transaction.begin();
    
    await new sql.Request(transaction).query('DELETE FROM routing_data');

    for (const record of records) {
      await new sql.Request(transaction)
        .input('stt', sql.Int, record.stt !== undefined && record.stt !== null ? Number(record.stt) : null)
        .input('op_code', sql.NVarChar, record.op_code || null)
        .input('op_name', sql.NVarChar, record.op_name || null)
        .input('machine', sql.NVarChar, record.machine || null)
        .input('sam', sql.Float, record.sam !== undefined && record.sam !== null ? Number(record.sam) : null)
        .input('smv', sql.Float, record.smv !== undefined && record.smv !== null ? Number(record.smv) : null)
        .input('rate', sql.Float, record.rate !== undefined && record.rate !== null ? Number(record.rate) : null)
        .input('difficulty', sql.NVarChar, record.difficulty || null)
        .input('skill', sql.NVarChar, record.skill || null)
        .query(`
          INSERT INTO routing_data (stt, op_code, op_name, machine, sam, smv, rate, difficulty, skill) 
          VALUES (@stt, @op_code, @op_name, @machine, @sam, @smv, @rate, @difficulty, @skill)
        `);
    }

    await transaction.commit();
    return res.json({ message: 'Successfully synced all routing records!', count: records.length });
  } catch (err) {
    console.error('Error inserting routing rows:', err.message);
    try {
      await transaction.rollback();
    } catch (rollbackErr) {}
    return res.status(500).json({ error: 'Database transaction failed during synchronization.' });
  }
});

// ========================================================
// GENERIC DYNAMIC SAVE ENDPOINT
// ========================================================

app.post('/api/generic/save', async (req, res) => {
  const { tableName, data } = req.body;

  if (!tableName || !Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: 'Payload requires tableName and non-empty data array.' });
  }

  const cleanTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
  if (!cleanTableName) {
    return res.status(400).json({ error: 'Invalid database table name.' });
  }

  const sample = data[0];
  const columns = Object.keys(sample).filter(k => k.match(/^[a-zA-Z0-9_]+$/));

  if (columns.length === 0) {
    return res.status(400).json({ error: 'No valid data fields matched database structure.' });
  }

  console.log(`Generic Batch Save: Syncing ${data.length} records into table: [${cleanTableName}]`);

  const transaction = new sql.Transaction(dbPool);
  try {
    await transaction.begin();
    
    await new sql.Request(transaction).query(`DELETE FROM [${cleanTableName}]`);

    for (const record of data) {
      const request = new sql.Request(transaction);
      const valueParams = [];

      columns.forEach((col, idx) => {
        const paramName = `val_${idx}`;
        const val = record[col];

        if (val !== null && val !== undefined) {
          const numVal = Number(val);
          if (!isNaN(numVal) && String(val).trim() !== '') {
            request.input(paramName, sql.Float, numVal);
          } else {
            request.input(paramName, sql.NVarChar, String(val));
          }
        } else {
          request.input(paramName, sql.NVarChar, null);
        }
        valueParams.push(`@${paramName}`);
      });

      const colList = columns.map(c => `[${c}]`).join(', ');
      const paramList = valueParams.join(', ');

      const query = `INSERT INTO [${cleanTableName}] (${colList}) VALUES (${paramList})`;
      await request.query(query);
    }

    await transaction.commit();
    return res.json({ 
      message: `Đồng bộ thành công ${data.length} dòng dữ liệu vào bảng [${cleanTableName}]!`, 
      count: data.length 
    });
  } catch (err) {
    console.error('Generic transaction save error:', err.message);
    try {
      await transaction.rollback();
    } catch (rollbackErr) {}
    return res.status(500).json({ error: `Giao dịch CSDL thất bại: ${err.message}` });
  }
});

// ========================================================
// MAPPING CONFIGURATION ENDPOINTS
// ========================================================

app.get('/api/mapping-config/:key', async (req, res) => {
  const { key } = req.params;
  try {
    const result = await dbPool.request()
      .input('config_key', sql.NVarChar, key)
      .query('SELECT table_name, sheet_name, start_row, end_row, mapping_items FROM mapping_configs WHERE config_key = @config_key');
    
    if (result.recordset.length > 0) {
      const config = result.recordset[0];
      return res.json({
        tableName: config.table_name,
        sheetName: config.sheet_name,
        startRow: config.start_row,
        endRow: config.end_row,
        mappingItems: JSON.parse(config.mapping_items)
      });
    } else {
      return res.status(404).json({ error: 'Configuration not found.' });
    }
  } catch (err) {
    console.error('Error fetching mapping config:', err.message);
    return res.status(500).json({ error: 'Failed to fetch configuration.' });
  }
});

app.post('/api/mapping-config', async (req, res) => {
  const { configKey, tableName, sheetName, startRow, endRow, mappingItems } = req.body;

  if (!configKey || !tableName || !startRow || !endRow || !Array.isArray(mappingItems)) {
    return res.status(400).json({ error: 'Invalid config payload.' });
  }

  try {
    const checkResult = await dbPool.request()
      .input('config_key', sql.NVarChar, configKey)
      .query('SELECT COUNT(*) as count FROM mapping_configs WHERE config_key = @config_key');
    
    const exists = checkResult.recordset[0].count > 0;
    const mappingItemsJson = JSON.stringify(mappingItems);

    if (exists) {
      await dbPool.request()
        .input('config_key', sql.NVarChar, configKey)
        .input('table_name', sql.NVarChar, tableName)
        .input('sheet_name', sql.NVarChar, sheetName)
        .input('start_row', sql.Int, startRow)
        .input('end_row', sql.Int, endRow)
        .input('mapping_items', sql.NVarChar, mappingItemsJson)
        .query(`
          UPDATE mapping_configs 
          SET table_name = @table_name, sheet_name = @sheet_name, start_row = @start_row, end_row = @end_row, mapping_items = @mapping_items
          WHERE config_key = @config_key
        `);
    } else {
      await dbPool.request()
        .input('config_key', sql.NVarChar, configKey)
        .input('table_name', sql.NVarChar, tableName)
        .input('sheet_name', sql.NVarChar, sheetName)
        .input('start_row', sql.Int, startRow)
        .input('end_row', sql.Int, endRow)
        .input('mapping_items', sql.NVarChar, mappingItemsJson)
        .query(`
          INSERT INTO mapping_configs (config_key, table_name, sheet_name, start_row, end_row, mapping_items)
          VALUES (@config_key, @table_name, @sheet_name, @start_row, @end_row, @mapping_items)
        `);
    }

    return res.json({ message: 'Configuration saved successfully!' });
  } catch (err) {
    console.error('Error saving mapping config:', err.message);
    return res.status(500).json({ error: 'Failed to save configuration.' });
  }
});

// ==========================================
// SPA FRONTEND ROUTING FALLBACK
// ==========================================

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});
