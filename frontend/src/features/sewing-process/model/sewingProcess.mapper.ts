import type {
  SewingProcessActionDetail,
  SewingProcessLine,
} from '../types/sewingProcess.types';

import type {
  OperationClusterDetailDto,
  OperationClusterLineDto,
  SewingProcessActionDetailDto,
} from '../types/sewingProcess.dto';

function toNumber(
  value: unknown,
  defaultValue = 0
): number {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : defaultValue;
}

function toNullableNumber(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
}

export function getOperationClusterRows(
  detail: OperationClusterDetailDto
): OperationClusterLineDto[] {
  return (
    detail.details ??
    detail.lines ??
    detail.operations ??
    detail.items ??
    []
  );
}

function getOperationClusterLineId(
  row: OperationClusterLineDto
): number | null {
  return toNullableNumber(
    row.sourceLineId ??
    row.source_line_id ??
    row.id
  );
}

export function mapOperationClusterToLines(
  detail: OperationClusterDetailDto
): SewingProcessLine[] {
  const documentCode =
    detail.header?.documentCode ??
    detail.header?.document_code ??
    '';

  const rows =
    getOperationClusterRows(detail);

  return rows.map((row, index) => ({
    sourceDocumentCode:
      documentCode,

    sourceLineId:
      getOperationClusterLineId(row),

    gsdAnalysisId:
      toNullableNumber(
        row.gsdAnalysisId ??
        row.gsd_analysis_id
      ),

    lineNo: index + 1,

    clusterNo:
      toNullableNumber(
        row.clusterNo ??
        row.cluster_no ??
        row.lineNo ??
        row.line_no
      ) ??
      index + 1,

    clusterName:
      row.clusterName ??
      row.cluster_name ??
      row.groupName ??
      row.group_name ??
      '',

    operationCode:
      row.operationCode ??
      row.operation_code ??
      '',

    operationName:
      row.operationName ??
      row.operation_name ??
      '',

    lineOrder:
      toNullableNumber(
        row.lineBalanceNo ??
        row.line_balance_no
      ) ??
      index + 1,

    skillGradeId:
      toNullableNumber(
        row.skillGradeId ??
        row.skill_grade_id
      ),

    skillGradeLevel:
      toNullableNumber(
        row.skillLevel ??
        row.skill_level
      ),

    machineId:
      toNullableNumber(
        row.machineId ??
        row.machine_id ??
        row.machineEquipmentId ??
        row.machine_equipment_id
      ),

    machineCode:
      row.codeMmtb ??
      row.code_mmtb ??
      row.machineCode ??
      row.machine_code ??
      '',

    machineName:
      row.machineName ??
      row.machine_name ??
      '',

    samGsd:
      toNumber(
        row.samGsd ??
        row.sam_gsd
      ),

    salaryCoefficient:
      toNumber(
        row.salaryCoefficient ??
        row.salary_coefficient
      ),

    requiredEfficiency:
      toNumber(
        row.requiredEfficiency ??
        row.required_efficiency,
        100
      ),

    totalActions:
      toNumber(
        row.totalActions ??
        row.total_actions
      ),

    toolNeed:
      row.toolNeed ??
      row.tool_need ??
      '',

    sewingEmployee:
      row.sewingEmployee ??
      row.sewing_employee ??
      '',

    cbcTime:
      toNullableNumber(
        row.cbcTime ??
        row.cbc_time
      ),

    note:
      row.note ?? '',

    imageFileName:
      row.imageFileName ??
      row.image_file_name ??
      null,

    imageUrl:
      row.imageUrl ??
      row.image_url ??
      null,
  }));
}

export function mapActionDetailDto(
  row: SewingProcessActionDetailDto
): SewingProcessActionDetail {
  return {
    id: toNumber(row.id),

    operationClusterLineId:
      toNullableNumber(
        row.operationClusterLineId ??
        row.operation_cluster_line_id
      ),

    operationCode:
      row.operationCode ??
      row.operation_code ??
      null,

    operationName:
      row.operationName ??
      row.operation_name ??
      null,

    gsdAnalysisId:
      toNullableNumber(
        row.gsdAnalysisId ??
        row.gsd_analysis_id
      ),

    analysisId:
      toNullableNumber(
        row.analysisId ??
        row.analysis_id
      ),

    analysisNo:
      row.analysisNo ??
      row.analysis_no ??
      null,

    lineNo:
      toNumber(
        row.lineNo ??
        row.line_no
      ),

    stepNo:
      toNullableNumber(
        row.stepNo ??
        row.step_no
      ),

    gsdCodeId:
      toNullableNumber(
        row.gsdCodeId ??
        row.gsd_code_id
      ),

    gsdCode:
      row.gsdCode ??
      row.gsd_code ??
      null,

    actionName:
      row.actionName ??
      row.action_name ??
      '',

    tmu:
      toNumber(row.tmu),

    frequency:
      toNumber(
        row.frequency,
        1
      ),

    seconds:
      toNumber(row.seconds),

    note:
      row.note ?? null,

    isSelected:
      Boolean(
        row.isSelected ??
        row.is_selected ??
        false
      ),
  };
}