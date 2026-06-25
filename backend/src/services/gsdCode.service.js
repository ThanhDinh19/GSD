const { getPool, sql } = require('../database/connection');
const xlsx = require('xlsx');


async function getGsdCodes() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT
      g.id,
      g.action_code AS actionCode,
      g.action_name AS actionName,
      g.gsd_code AS gsdCode,
      g.code_new AS codeNew,
      g.frequency,
      g.tmu,
      g.seconds,
      g.note,
      g.status_id AS statusId,
      s.status_name AS statusName,
      g.created_at AS createdAt
    FROM gsd_codes g
    LEFT JOIN master_status s ON g.status_id = s.id
    ORDER BY g.id DESC
  `);

  return result.recordset;
}

async function getActiveGsdCodes() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT
      g.id AS [id],
      g.action_code AS [actionCode],
      g.action_name AS [actionName],
      g.gsd_code AS [gsdCode],
      g.code_new AS [codeNew],
      g.frequency AS [frequency],
      g.tmu AS [tmu],
      g.seconds AS [seconds],
      g.note AS [note],
      g.status_id AS [statusId],
      s.status_name AS [statusName],
      g.created_at AS [createdAt]
    FROM gsd_codes g
    LEFT JOIN master_status s ON g.status_id = s.id
    WHERE g.status_id = 0
    ORDER BY g.id DESC
  `);

  return result.recordset;
}

async function createGsdCode(payload) {
  const pool = getPool();

  try {
    await pool.request()
      .input('action_code', sql.NVarChar, String(payload.actionCode).trim())
      .input('action_name', sql.NVarChar, String(payload.actionName).trim())
      .input('gsd_code', sql.NVarChar, payload.gsdCode ? String(payload.gsdCode).trim() : null)
      .input('code_new', sql.NVarChar, payload.codeNew ? String(payload.codeNew).trim() : null)
      .input('frequency', sql.Int, payload.frequency !== undefined && payload.frequency !== null ? Number(payload.frequency) : null)
      .input('tmu', sql.Int, payload.tmu !== undefined && payload.tmu !== null ? Number(payload.tmu) : 0)
      .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        INSERT INTO gsd_codes (
          action_code,
          action_name,
          gsd_code,
          code_new,
          frequency,
          tmu,
          note,
          status_id
        )
        VALUES (
          @action_code,
          @action_name,
          @gsd_code,
          @code_new,
          @frequency,
          @tmu,
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
      const duplicateError = new Error('Mã thao tác đã tồn tại.');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw err;
  }
}

async function updateGsdCode(id, payload) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('action_code', sql.NVarChar, String(payload.actionCode).trim())
    .input('action_name', sql.NVarChar, String(payload.actionName).trim())
    .input('gsd_code', sql.NVarChar, payload.gsdCode ? String(payload.gsdCode).trim() : null)
    .input('code_new', sql.NVarChar, payload.codeNew ? String(payload.codeNew).trim() : null)
    .input('frequency', sql.Int, payload.frequency !== undefined && payload.frequency !== null ? Number(payload.frequency) : null)
    .input('tmu', sql.Int, payload.tmu !== undefined && payload.tmu !== null ? Number(payload.tmu) : 0)
    .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
    .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
    .query(`
      UPDATE gsd_codes
      SET
        action_code = @action_code,
        action_name = @action_name,
        gsd_code = @gsd_code,
        code_new = @code_new,
        frequency = @frequency,
        tmu = @tmu,
        note = @note,
        status_id = @status_id
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

async function deactivateGsdCode(id) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      UPDATE gsd_codes
      SET status_id = 1
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}


function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase();
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? null : numberValue;
}

function buildImportKey(item) {
  return [
    normalizeKey(item.gsdCode),
    normalizeKey(item.actionName),
    normalizeKey(item.codeNew),
    normalizeKey(item.tmu),
  ].join('|');
}

async function getNextActionCodeStart(pool) {
  const result = await pool.request().query(`
    SELECT action_code AS actionCode
    FROM gsd_codes
    WHERE action_code LIKE 'TT%'
  `);

  let maxNumber = 0;

  for (const row of result.recordset) {
    const raw = String(row.actionCode || '');
    const match = raw.match(/^TT(\d+)$/i);

    if (match) {
      maxNumber = Math.max(maxNumber, Number(match[1]));
    }
  }

  return maxNumber + 1;
}

function formatActionCode(numberValue) {
  return `TT${String(numberValue).padStart(6, '0')}`;
}

// async function importGsdCodesFromExcel(filePath, sheetName = 'GSD') {
//   const pool = getPool();

//   const workbook = XLSX.readFile(filePath);
//   const worksheet = workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]];

//   if (!worksheet) {
//     const err = new Error(`Không tìm thấy sheet ${sheetName}.`);
//     err.statusCode = 400;
//     throw err;
//   }

//   const rows = XLSX.utils.sheet_to_json(worksheet, {
//     header: 1,
//     defval: '',
//     raw: false,
//   });

//   const existingResult = await pool.request().query(`
//     SELECT
//       gsd_code AS gsdCode,
//       action_name AS actionName,
//       code_new AS codeNew,
//       tmu AS tmu
//     FROM gsd_codes
//   `);

//   const existingKeys = new Set(
//     existingResult.recordset.map((row) => buildImportKey(row))
//   );

//   const fileKeys = new Set();
//   const validRows = [];
//   let skippedEmpty = 0;
//   let skippedDuplicate = 0;

//   for (const row of rows) {
//     const sourceCode = normalizeText(row[0]);
//     const stt = normalizeText(row[1]);
//     const actionName = normalizeText(row[2]);
//     const gsdCode = normalizeText(row[3]);
//     const frequency = toNumberOrNull(row[5]);
//     const tmu = toNumberOrNull(row[6]);
//     const note = normalizeText(row[7]);
//     const codeNew = normalizeText(row[8]);

//     const isHeaderRow =
//       sourceCode.toLowerCase() === 'source.name' ||
//       sourceCode.toLowerCase() === 'source' ||
//       stt.toLowerCase() === 'stt' ||
//       actionName.toLowerCase() === 'thaotac' ||
//       actionName.toLowerCase() === 'thao tác';

//     if (isHeaderRow) continue;

//     if (!actionName || !gsdCode) {
//       skippedEmpty += 1;
//       continue;
//     }

//     const item = {
//       actionName,
//       gsdCode,
//       codeNew,
//       frequency,
//       tmu: tmu ?? 0,
//       note,
//     };

//     const key = buildImportKey(item);

//     if (existingKeys.has(key) || fileKeys.has(key)) {
//       skippedDuplicate += 1;
//       continue;
//     }

//     fileKeys.add(key);
//     validRows.push(item);
//   }

//   if (validRows.length === 0) {
//     return {
//       inserted: 0,
//       skippedDuplicate,
//       skippedEmpty,
//       totalRead: rows.length,
//       message: 'Không có thao tác mới để import.',
//     };
//   }

//   const transaction = new sql.Transaction(pool);
//   await transaction.begin();

//   try {
//     let nextNumber = await getNextActionCodeStart(pool);

//     for (const item of validRows) {
//       const actionCode = formatActionCode(nextNumber);
//       nextNumber += 1;

//       await new sql.Request(transaction)
//         .input('action_code', sql.NVarChar, actionCode)
//         .input('action_name', sql.NVarChar, item.actionName)
//         .input('gsd_code', sql.NVarChar, item.gsdCode)
//         .input('code_new', sql.NVarChar, item.codeNew || null)
//         .input('frequency', sql.Int, item.frequency)
//         .input('tmu', sql.Int, item.tmu)
//         .input('note', sql.NVarChar, item.note || null)
//         .input('status_id', sql.TinyInt, 0)
//         .query(`
//           INSERT INTO gsd_codes (
//             action_code,
//             action_name,
//             gsd_code,
//             code_new,
//             frequency,
//             tmu,
//             note,
//             status_id
//           )
//           VALUES (
//             @action_code,
//             @action_name,
//             @gsd_code,
//             @code_new,
//             @frequency,
//             @tmu,
//             @note,
//             @status_id
//           )
//         `);
//     }

//     await transaction.commit();

//     return {
//       inserted: validRows.length,
//       skippedDuplicate,
//       skippedEmpty,
//       totalRead: rows.length,
//       message: `Đã import ${validRows.length} thao tác mới.`,
//     };
//   } catch (err) {
//     await transaction.rollback();
//     throw err;
//   }
// }



// import data from excel file 

function normalizeText(value) {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();

  return text === '' ? null : text;
}

function normalizeNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? defaultValue : numberValue;
}

function normalizeStatus(value) {
  const raw = normalizeText(value);

  if (!raw) return 0;

  const lower = raw.toLowerCase();

  // DB đang dùng: 0 = Còn sử dụng, 1 = Không sử dụng
  if (
    lower.includes('không') ||
    lower.includes('ngưng') ||
    lower.includes('inactive') ||
    lower.includes('disable')
  ) {
    return 1;
  }

  // File BA đang để Trạng thái = 1 nhưng ý nghĩa là còn sử dụng
  if (raw === '1') return 0;
  if (raw === '0') return 0;

  return 0;
}

function normalizeHeader(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function getCellValue(row, candidates) {
  const rowKeys = Object.keys(row);

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeHeader(candidate);

    const matchedKey = rowKeys.find((key) => {
      return normalizeHeader(key) === normalizedCandidate;
    });

    if (
      matchedKey &&
      row[matchedKey] !== undefined &&
      row[matchedKey] !== null &&
      String(row[matchedKey]).trim() !== ''
    ) {
      return row[matchedKey];
    }
  }

  return null;
}

async function importGsdCodesFromExcel_ver2(fileBuffer) {
  const workbook = xlsx.read(fileBuffer, {
    type: 'buffer',
    cellDates: false,
  });

  const sheetName =
    workbook.SheetNames.find((name) => {
      return name.trim().toLowerCase() === 'kho thao tác chuẩn';
    }) || workbook.SheetNames[0];

  if (!sheetName) {
    const err = new Error('File Excel không có sheet dữ liệu.');
    err.statusCode = 400;
    throw err;
  }

  const worksheet = workbook.Sheets[sheetName];

  // Sheet này header nằm ở dòng 2, dòng 1 trống
  const rows = xlsx.utils.sheet_to_json(worksheet, {
    defval: null,
    range: 1,
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

      // Vì range: 1 nên data bắt đầu từ dòng Excel số 3
      const excelRowNumber = index + 3;

      const actionCode = normalizeText(
        getCellValue(row, [
          'Mã thao tác',
          'Ma thao tac',
          'action_code',
          'Action Code',
        ])
      );

      const actionName = normalizeText(
        getCellValue(row, [
          'Tên thao tác',
          'Ten thao tac',
          'action_name',
          'Action Name',
        ])
      );

      const gsdCode = normalizeText(
        getCellValue(row, [
          'Code',
          'gsd_code',
          'GSD Code',
        ])
      );

      const codeNew = normalizeText(
        getCellValue(row, [
          'Code mới',
          'Code moi',
          'code_new',
          'Code New',
        ])
      );

      const frequency = normalizeNumber(
        getCellValue(row, [
          'Tần suất',
          'Tan suat',
          'frequency',
          'Frequency',
        ]),
        1
      );

      const tmu = normalizeNumber(
        getCellValue(row, [
          'TMU',
          'tmu',
        ]),
        0
      );

      const note = normalizeText(
        getCellValue(row, [
          'Ghi chú',
          'Ghi chu',
          'note',
          'Note',
        ])
      );

      const statusValue = getCellValue(row, [
        'Trạng thái',
        'Trang thai',
        'status',
        'Status',
      ]);

      const statusId = normalizeStatus(statusValue);

      if (!actionCode) {
        result.skipped += 1;
        result.errors.push(`Dòng ${excelRowNumber}: Thiếu Mã thao tác.`);
        continue;
      }

      if (!actionName) {
        result.skipped += 1;
        result.errors.push(`Dòng ${excelRowNumber}: Thiếu Tên thao tác.`);
        continue;
      }

      if (seenCodes.has(actionCode)) {
        result.skipped += 1;
        result.errors.push(
          `Dòng ${excelRowNumber}: Mã thao tác bị trùng trong file: ${actionCode}.`
        );
        continue;
      }

      seenCodes.add(actionCode);

      const existedResult = await new sql.Request(transaction)
        .input('action_code', sql.NVarChar(50), actionCode)
        .query(`
          SELECT id
          FROM gsd_codes
          WHERE action_code = @action_code
        `);

      if (existedResult.recordset.length > 0) {
        await new sql.Request(transaction)
          .input('action_code', sql.NVarChar(50), actionCode)
          .input('action_name', sql.NVarChar(256), actionName)
          .input('gsd_code', sql.NVarChar(50), gsdCode)
          .input('code_new', sql.NVarChar(50), codeNew)
          .input('frequency', sql.Int, frequency)
          .input('tmu', sql.Int, tmu)
          .input('note', sql.NVarChar(500), note)
          .input('status_id', sql.TinyInt, statusId)
          .query(`
            UPDATE gsd_codes
            SET
              action_name = @action_name,
              gsd_code = @gsd_code,
              code_new = @code_new,
              frequency = @frequency,
              tmu = @tmu,
              note = @note,
              status_id = @status_id
            WHERE action_code = @action_code
          `);

        result.updated += 1;
      } else {
        await new sql.Request(transaction)
          .input('action_code', sql.NVarChar(50), actionCode)
          .input('action_name', sql.NVarChar(256), actionName)
          .input('gsd_code', sql.NVarChar(50), gsdCode)
          .input('code_new', sql.NVarChar(50), codeNew)
          .input('frequency', sql.Int, frequency)
          .input('tmu', sql.Int, tmu)
          .input('note', sql.NVarChar(500), note)
          .input('status_id', sql.TinyInt, statusId)
          .query(`
            INSERT INTO gsd_codes (
              action_code,
              action_name,
              gsd_code,
              code_new,
              frequency,
              tmu,
              note,
              status_id
            )
            VALUES (
              @action_code,
              @action_name,
              @gsd_code,
              @code_new,
              @frequency,
              @tmu,
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
  getGsdCodes,
  getActiveGsdCodes,
  createGsdCode,
  updateGsdCode,
  deactivateGsdCode,
  importGsdCodesFromExcel_ver2,
};