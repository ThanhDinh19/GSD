const { getPool, sql } = require('../database/connection');
const xlsx = require('xlsx');

async function getSources() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT
      s.id,
      s.source_code AS sourceCode,
      s.source_name AS sourceName,
      s.note,
      s.status_id AS statusId,
      ms.status_name AS statusName,
      s.created_at AS createdAt
    FROM sources s
    LEFT JOIN master_status ms ON s.status_id = ms.id
    ORDER BY s.id DESC
  `);

  return result.recordset;
}

async function createSource(payload) {
  const pool = getPool();

  try {
    await pool.request()
      .input('source_code', sql.NVarChar, String(payload.sourceCode).trim())
      .input('source_name', sql.NVarChar, payload.sourceName ? String(payload.sourceName).trim() : null)
      .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        INSERT INTO sources (
          source_code,
          source_name,
          note,
          status_id
        )
        VALUES (
          @source_code,
          @source_name,
          @note,
          @status_id
        )
      `);
  } catch (err) {
    if (
      err.message.includes('UNIQUE') ||
      err.message.includes('duplicate') ||
      err.number === 2627 ||
      err.number === 2601
    ) {
      const duplicateError = new Error('Mã source đã tồn tại.');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw err;
  }
}

async function updateSource(id, payload) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('source_code', sql.NVarChar, String(payload.sourceCode).trim())
    .input('source_name', sql.NVarChar, payload.sourceName ? String(payload.sourceName).trim() : null)
    .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
    .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
    .query(`
      UPDATE sources
      SET
        source_code = @source_code,
        source_name = @source_name,
        note = @note,
        status_id = @status_id
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

async function deactivateSource(id) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      UPDATE sources
      SET status_id = 1
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}


// import data from excel file 


function normalizeText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
}

function normalizeStatus(value) {
  const raw = normalizeText(value);

  if (!raw) return 0;

  const lower = raw.toLowerCase();

  // DB hiện tại của mình: 0 = Còn sử dụng, 1 = Không sử dụng
  if (
    lower.includes('không') ||
    lower.includes('ngưng') ||
    lower.includes('inactive') ||
    lower.includes('disable')
  ) {
    return 1;
  }

  if (raw === '1') return 1;

  return 0;
}

function getCellValue(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return row[key];
    }
  }

  return null;
}

async function importSourcesFromExcel(fileBuffer) {
  const workbook = xlsx.read(fileBuffer, {
    type: 'buffer',
    cellDates: false,
  });

  const sheetName =
    workbook.SheetNames.find((name) => name.trim().toLowerCase() === 'danh mục source name') ||
    workbook.SheetNames[0];

  if (!sheetName) {
    const err = new Error('File Excel không có sheet dữ liệu.');
    err.statusCode = 400;
    throw err;
  }

  const worksheet = workbook.Sheets[sheetName];

  const rows = xlsx.utils.sheet_to_json(worksheet, {
    defval: null,
  });

  const pool = getPool();
  const transaction = new sql.Transaction(pool);

  const result = {
    sheetName,
    totalRows: rows.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const seenCodes = new Set();

  await transaction.begin();

  try {
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const excelRowNumber = index + 2;

      const sourceCode = normalizeText(
        getCellValue(row, ['Mã source', 'Ma source', 'source_code', 'Source Code'])
      );

      const sourceName = normalizeText(
        getCellValue(row, ['Tên source', 'Ten source', 'source_name', 'Source Name'])
      );

      const note = normalizeText(
        getCellValue(row, ['Ghi chú', 'Ghi chu', 'note', 'Note'])
      );

      const statusValue = getCellValue(row, ['Trạng thái', 'Trang thai', 'status', 'Status']);
      const statusId = normalizeStatus(statusValue);

      if (!sourceCode) {
        result.skipped += 1;
        result.errors.push(`Dòng ${excelRowNumber}: Thiếu Mã source.`);
        continue;
      }

      if (seenCodes.has(sourceCode)) {
        result.skipped += 1;
        result.errors.push(`Dòng ${excelRowNumber}: Mã source bị trùng trong file: ${sourceCode}.`);
        continue;
      }

      seenCodes.add(sourceCode);

      const checkResult = await new sql.Request(transaction)
        .input('source_code', sql.NVarChar(255), sourceCode)
        .query(`
          SELECT id
          FROM sources
          WHERE source_code = @source_code
        `);

      if (checkResult.recordset.length > 0) {
        await new sql.Request(transaction)
          .input('source_code', sql.NVarChar(255), sourceCode)
          .input('source_name', sql.NVarChar(255), sourceName)
          .input('note', sql.NVarChar(500), note)
          .input('status_id', sql.TinyInt, statusId)
          .query(`
            UPDATE sources
            SET
              source_name = @source_name,
              note = @note,
              status_id = @status_id
            WHERE source_code = @source_code
          `);

        result.updated += 1;
      } else {
        await new sql.Request(transaction)
          .input('source_code', sql.NVarChar(255), sourceCode)
          .input('source_name', sql.NVarChar(255), sourceName)
          .input('note', sql.NVarChar(500), note)
          .input('status_id', sql.TinyInt, statusId)
          .query(`
            INSERT INTO sources (
              source_code,
              source_name,
              note,
              status_id
            )
            VALUES (
              @source_code,
              @source_name,
              @note,
              @status_id
            )
          `);

        result.inserted += 1;
      }
    }

    await transaction.commit();

    return result;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}


module.exports = {
  getSources,
  createSource,
  updateSource,
  deactivateSource,
  importSourcesFromExcel,
};