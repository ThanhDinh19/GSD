const { getPool, sql } = require('../database/connection');

async function getMachineEquipments() {
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT
      m.id,
      m.machine_code AS machineCode,
      m.machine_name AS machineName,

      m.cluster_id AS clusterId,
      c.cluster_name AS clusterName,

      m.code_mmtb AS codeMmtb,
      m.allowance,
      m.stitch_count AS stitchCount,
      m.machine_speed AS machineSpeed,

      m.default_smv AS defaultSmv,
      m.skill_grade AS skillGrade,

      m.note,
      m.status_id AS statusId,
      s.status_name AS statusName,
      m.created_at AS createdAt
    FROM machine_equipments m
    LEFT JOIN clusters c ON m.cluster_id = c.id
    LEFT JOIN master_status s ON m.status_id = s.id
    ORDER BY m.id DESC
  `);

  return result.recordset;
}


async function getMachineEquipments_test(){
  const pool = getPool();

  const result = await pool.request().query(
    `
    SELECT
      m.id,
      m.machine_code AS machineCode,
      m.machine_name AS machineName,

      m.cluster_id AS clusterId,

      m.code_mmtb AS codeMmtb,
      m.allowance,
      m.stitch_count AS stitchCount,
      m.machine_speed AS machineSpeed,

      m.default_smv AS defaultSmv,
      m.skill_grade AS skillGrade,

      m.note,
      m.status_id AS statusId,
      s.status_name AS statusName,
      m.created_at AS createdAt,
      m.attached_action_time AS attachedActionTime
    FROM machine_equipments_test m
    LEFT JOIN master_status s ON m.status_id = s.id
    ORDER BY m.id DESC
    `
  );
  return result.recordset;
}

async function createMachineEquipment(payload) {
  const pool = getPool();

  try {
    await pool.request()
      .input('machine_code', sql.NVarChar, String(payload.machineCode).trim())
      .input('machine_name', sql.NVarChar, String(payload.machineName).trim())
      .input('cluster_id', sql.Int, payload.clusterId ? Number(payload.clusterId) : null)
      .input('code_mmtb', sql.NVarChar, payload.codeMmtb ? String(payload.codeMmtb).trim() : null)
      .input('allowance', sql.Decimal(5, 2), payload.allowance !== null && payload.allowance !== undefined && payload.allowance !== '' ? Number(payload.allowance) : null)
      .input('attached_action_time', sql.Decimal(5,2), payload.attachedActionTime !== null && payload.attachedActionTime !== undefined && payload.attachedActionTime !== '' ? Number(payload.attachedActionTime) : null)
      .input('stitch_count', sql.Decimal(5, 2), payload.stitchCount !== null && payload.stitchCount !== undefined && payload.stitchCount !== '' ? Number(payload.stitchCount) : null)
      .input('machine_speed', sql.Int, payload.machineSpeed !== null && payload.machineSpeed !== undefined && payload.machineSpeed !== '' ? Number(payload.machineSpeed) : null)
      .input('default_smv', sql.Decimal(5, 2), payload.defaultSmv !== null && payload.defaultSmv !== undefined && payload.defaultSmv !== '' ? Number(payload.defaultSmv) : null)
      .input('skill_grade', sql.Char, payload.skillGrade ? String(payload.skillGrade).trim() : null)
      .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
      .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
      .query(`
        INSERT INTO machine_equipments_test (
          machine_code,
          machine_name,
          cluster_id,
          code_mmtb,
          allowance,
          attached_action_time,
          stitch_count,
          machine_speed,
          default_smv,
          skill_grade,
          note,
          status_id
        )
        VALUES (
          @machine_code,
          @machine_name,
          @cluster_id,
          @code_mmtb,
          @allowance,
          @attached_action_time,
          @stitch_count,
          @machine_speed,
          @default_smv,
          @skill_grade,
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
      const duplicateError = new Error('Mã MMTB đã tồn tại.');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw err;
  }
}

async function updateMachineEquipment(id, payload) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('machine_code', sql.NVarChar, String(payload.machineCode).trim())
    .input('machine_name', sql.NVarChar, String(payload.machineName).trim())
    .input('cluster_id', sql.Int, payload.clusterId ? Number(payload.clusterId) : null)
    .input('code_mmtb', sql.NVarChar, payload.codeMmtb ? String(payload.codeMmtb).trim() : null)
    .input('allowance', sql.Decimal(5, 2), payload.allowance !== null && payload.allowance !== undefined && payload.allowance !== '' ? Number(payload.allowance) : null)
    .input('attached_action_time', sql.Decimal(5,2), payload.attachedActionTime !== null && payload.attachedActionTime !== undefined && payload.attachedActionTime !== '' ? Number(payload.attachedActionTime) : null)
    .input('stitch_count', sql.Decimal(5, 2), payload.stitchCount !== null && payload.stitchCount !== undefined && payload.stitchCount !== '' ? Number(payload.stitchCount) : null)
    .input('machine_speed', sql.Int, payload.machineSpeed !== null && payload.machineSpeed !== undefined && payload.machineSpeed !== '' ? Number(payload.machineSpeed) : null)
    .input('default_smv', sql.Decimal(5, 2), payload.defaultSmv !== null && payload.defaultSmv !== undefined && payload.defaultSmv !== '' ? Number(payload.defaultSmv) : null)
    .input('skill_grade', sql.Char, payload.skillGrade ? String(payload.skillGrade).trim() : null)
    .input('note', sql.NVarChar, payload.note ? String(payload.note).trim() : null)
    .input('status_id', sql.TinyInt, payload.statusId !== undefined ? Number(payload.statusId) : 0)
    .query(`
      UPDATE machine_equipments_test
      SET
        machine_code = @machine_code,
        machine_name = @machine_name,
        cluster_id = @cluster_id,
        code_mmtb = @code_mmtb,
        allowance = @allowance,
        attached_action_time = @attached_action_time,
        stitch_count = @stitch_count,
        machine_speed = @machine_speed,
        default_smv = @default_smv,
        skill_grade = @skill_grade,
        note = @note,
        status_id = @status_id
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

async function deactivateMachineEquipment(id) {
  const pool = getPool();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      UPDATE machine_equipments
      SET status_id = 1
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

module.exports = {
  getMachineEquipments,
  createMachineEquipment,
  updateMachineEquipment,
  deactivateMachineEquipment,
  getMachineEquipments_test,
};