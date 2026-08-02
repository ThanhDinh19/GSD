export interface SewingProcessActionDetailDto {
  id?: number | string;

  operationClusterLineId?:
    number | string | null;
  operation_cluster_line_id?:
    number | string | null;

  operationCode?: string | null;
  operation_code?: string | null;

  operationName?: string | null;
  operation_name?: string | null;

  gsdAnalysisId?:
    number | string | null;
  gsd_analysis_id?:
    number | string | null;

  analysisId?: number | string | null;
  analysis_id?: number | string | null;

  analysisNo?: string | null;
  analysis_no?: string | null;

  lineNo?: number | string | null;
  line_no?: number | string | null;

  stepNo?: number | string | null;
  step_no?: number | string | null;

  gsdCodeId?: number | string | null;
  gsd_code_id?: number | string | null;

  gsdCode?: string | null;
  gsd_code?: string | null;

  actionName?: string | null;
  action_name?: string | null;

  tmu?: number | string | null;
  frequency?: number | string | null;
  seconds?: number | string | null;

  note?: string | null;

  isSelected?: boolean | null;
  is_selected?: boolean | null;
}

export interface OperationClusterLineDto {
  id?: number | string;

  sourceLineId?: number | string | null;
  source_line_id?: number | string | null;

  gsdAnalysisId?: number | string | null;
  gsd_analysis_id?: number | string | null;

  lineNo?: number | string | null;
  line_no?: number | string | null;

  lineBalanceNo?: number | string | null;
  line_balance_no?: number | string | null;

  clusterNo?: number | string | null;
  cluster_no?: number | string | null;

  clusterName?: string | null;
  cluster_name?: string | null;

  groupName?: string | null;
  group_name?: string | null;

  operationCode?: string | null;
  operation_code?: string | null;

  operationName?: string | null;
  operation_name?: string | null;

  skillGradeId?: number | string | null;
  skill_grade_id?: number | string | null;

  skillLevel?: number | string | null;
  skill_level?: number | string | null;

  machineId?: number | string | null;
  machine_id?: number | string | null;

  machineEquipmentId?: number | string | null;
  machine_equipment_id?: number | string | null;

  machineCode?: string | null;
  machine_code?: string | null;

  codeMmtb?: string | null;
  code_mmtb?: string | null;

  machineName?: string | null;
  machine_name?: string | null;

  samGsd?: number | string | null;
  sam_gsd?: number | string | null;

  salaryCoefficient?: number | string | null;
  salary_coefficient?: number | string | null;

  requiredEfficiency?: number | string | null;
  required_efficiency?: number | string | null;

  totalActions?: number | string | null;
  total_actions?: number | string | null;

  toolNeed?: string | null;
  tool_need?: string | null;

  sewingEmployee?: string | null;
  sewing_employee?: string | null;

  cbcTime?: number | string | null;
  cbc_time?: number | string | null;

  note?: string | null;

  imageFileName?: string | null;
  image_file_name?: string | null;

  imageUrl?: string | null;
  image_url?: string | null;
}

export interface OperationClusterDetailDto {
  header?: {
    documentCode?: string | null;
    document_code?: string | null;
  };

  operations?: OperationClusterLineDto[];
  details?: OperationClusterLineDto[];
  lines?: OperationClusterLineDto[];
  items?: OperationClusterLineDto[];
}