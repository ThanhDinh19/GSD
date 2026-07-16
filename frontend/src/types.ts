export type SkillLevel = 'A' | 'B' | 'C' | 'D';
export type WorkRole = 'Operator' | 'Helper';

export interface Worker {
  id: string;
  name: string;
  role: WorkRole;
  skillLevel: SkillLevel;
  efficiency: number; // e.g. 75 (%)
  assignedOpId?: string | null; // Currently assigned operation ID
}

export interface RoutingStep {
  id: string; // Internal UUID or Mã công đoạn (e.g., OP010)
  stt: number;
  opCode: string; // e.g. OP010
  opName: string; // e.g. May vai thân trước
  machineType: string; // e.g. 1N, 2N, Kansai, Thắt nút, etc.
  sam: number; // standard allowed minutes
  smv: number; // standard minute value
  ratio: number; // % of total SAM
  difficulty: SkillLevel;
  requiredSkill: SkillLevel;
  assignedWorkersCount: number;
  assignedWorkerIds: string[];
}

export interface Style {
  code: string; // e.g., DOWN-JK-2201
  name: string; // e.g., Down Jacket Winter
  productType: string; // e.g., Down Jacket
  mainFabric: string; // e.g., Nylon Taslon
  targetOutput: number; // e.g., 1200
  workingTime: number; // e.g., 600 minutes
  historicSam: number; // e.g., 31.20
  historicSmv: number; // e.g., 28.70
  historicEfficiency: number; // e.g., 74.2 (%)
  historicOutput: number; // e.g., 1180
  routing: RoutingStep[];
}

export interface OrderCapacity {
  orderId: string;
  customerName: string;
  styleCode: string;
  qty: number;
  deliveryDate: string;
  targetDate: string;
  lineCount: number;
  allocEfficiency: number;
}


export interface MasterStatus {
  id: number;
  statusCode: string;
  statusName: string;
}

export interface Cluster {
  id: number;
  clusterCode: string;
  clusterName: string;
  statusId: number;
  statusName?: string;
  createdAt?: string;
}

export interface ClusterPayload {
  clusterCode: string;
  clusterName: string;
  statusId: number;
}


export interface GsdCode {
  id: number;
  actionCode: string;
  actionName: string;
  gsdCode?: string | null;
  codeNew?: string | null;
  frequency?: number | null;
  tmu: number;
  seconds?: number;
  note?: string | null;
  statusId: number;
  statusName?: string;
  createdAt?: string;
}

export interface GsdCodePayload {
  actionCode: string;
  actionName: string;
  gsdCode?: string | null;
  codeNew?: string | null;
  frequency?: number | null;
  tmu: number;
  note?: string | null;
  statusId: number;
}


export interface MachineEquipment {
  id: number;
  machineCode: string;
  machineName: string;

  clusterId?: number | null;
  clusterName?: string | null;

  codeMmtb?: string | null;
  allowance?: number | null;
  stitchCount?: number | null;
  machineSpeed?: number | null;

  defaultSmv?: number | null;
  skillGrade?: string | null;

  note?: string | null;
  statusId: number;
  statusName?: string;
  createdAt?: string;
}

export interface MachineEquipmentPayload {
  machineCode: string;
  machineName: string;

  clusterId?: number | null;

  codeMmtb?: string | null;
  allowance?: number | null;

  attachedActionTime?: number | null;

  stitchCount?: number | null;
  machineSpeed?: number | null;

  defaultSmv?: number | null;
  skillGrade?: string | null;

  note?: string | null;
  statusId: number;
}

export interface MachineEquipment_test {
  id: number;
  machineCode: string;
  machineName: string;

  clusterId?: number | null;

  codeMmtb?: string | null;
  allowance?: number | null;
  stitchCount?: number | null;
  machineSpeed?: number | null;

  defaultSmv?: number | null;
  skillGrade?: string | null;

  note?: string | null;
  statusId: number;
  statusName?: string;
  createdAt?: string;

  attachedActionTime: number;
}

export interface SourceMaster {
  id: number;
  sourceCode: string;
  sourceName?: string | null;
  note?: string | null;
  statusId: number;
  statusName?: string;
  createdAt?: string;
}

export interface SourceMasterPayload {
  sourceCode: string;
  sourceName?: string | null;
  note?: string | null;
  statusId: number;
}


export interface SourceActionDetail {
  id?: number;
  headerId?: number;
  lineNo: number;
  gsdCodeId?: number | null;
  actionName: string;
  gsdCode?: string | null;
  codeNew?: string | null;
  frequency?: number | null;
  tmu: number;
  note?: string | null;
}

export interface SourceActionMapping {
  source: SourceMaster;
  header: {
    id: number;
    sourceId: number;
    totalActions: number;
    totalTmu: number;
    note?: string | null;
    createdAt?: string;
    updatedAt?: string | null;
  } | null;
  totalActions: number;
  totalTmu: number;
  details: SourceActionDetail[];
}

export interface SaveSourceActionMappingPayload {
  note?: string | null;
  details: SourceActionDetail[];
}

export interface SourceActionForAnalysis {
  sourceActionDetailId: number;
  lineNo: number;
  gsdCodeId?: number | null;
  actionName: string;
  gsdCode?: string | null;
  codeNew?: string | null;
  frequency?: number | null;
  tmu: number;
  note?: string | null;
}

export interface GsdAnalysisDetailPayload {
  sourceActionDetailId?: number | null;
  gsdCodeId?: number | null;
  gsdCode?: string | null;
  actionName: string;
  tmu: number;
  frequency: number;
  stepNo?: number | null;
  note?: string | null;
  isSelected?: boolean;
}

export interface GsdAnalysisPayload {
  sourceId?: number | null;
  machineId?: number | null;
  operationName: string;
  seamLength?: number | null;
  // attachedActionTime có thể được edit nên cho vào payload (lấy data từ frontend)
  attachedActionTime?: number | null;
  stitchCount?: number | null;
  allowance?: number | null;
  machineSpeed?: number | null;
  difficultyPercent?: number | null;
  productMultiplier?: number | null;
  note?: string | null;
  details: GsdAnalysisDetailPayload[];
}

export interface GsdAnalysisCalculateResult {
  totalTmu: number;
  totalManualSeconds: number;
  machineSeconds: number;
  totalSmvBeforeDifficulty: number;
  difficultySeconds: number;
  finalSmv: number;
  skillGrade: number;
  stitchCount?: number;
  machineSpeed?: number;
  machineVelocity?: number;
  allowance?: number;
  details: Array<GsdAnalysisDetailPayload & {
    lineNo: number;
    seconds: number;
  }>;
  machine?: {
    id: number;
    machineCode: string;
    machineName: string;
    codeMMTB: string;
    stitchCount?: number | null;
    machineSpeed?: number | null;
    allowance?: number | null;
    skillGrade?: string | null;
  } | null;
}

export interface GsdAnalysisRow extends SourceActionForAnalysis {
  sourceId?: number | null;
  sourceCode?: string;
  sourceName?: string | null;
  stepNo?: number | string | null;
  frequency: number;
  isSelected: boolean;
}

export interface GsdAnalysisSummary {
  id: number;
  analysisNo: string;
  analysisDate?: string;
  operationName: string;

  sourceCode?: string | null;
  machineCode?: string | null;
  machineName?: string | null;
  codeMMTB?: string | null;

  totalTmu: number;
  totalManualSeconds: number;
  machineSeconds: number;
  totalSmvBeforeDifficulty: number;
  difficultySeconds: number;
  finalSmv: number;
  skillGrade?: number | null;

  createdAt?: string;
}

// export interface GsdAnalysisSummary {
//   id: number;
//   analysisNo: string;
//   analysisDate?: string;
//   operationName: string;

//   sourceCode?: string | null;
//   machineCode?: string | null;
//   machineName?: string | null;
//   codeMMTB?: string | null;

//   totalTmu: number;
//   totalManualSeconds: number;
//   machineSeconds: number;
//   totalSmvBeforeDifficulty: number;
//   difficultySeconds: number;
//   finalSmv: number;
//   skillGrade?: number | null;

//   createdAt?: string;
// }


export interface GsdAnalysisDetailRow {
  id: number;
  analysisId: number;
  lineNo: number;
  stepNo?: number | null;
  sourceActionDetailId?: number | null;
  gsdCodeId?: number | null;
  gsdCode?: string | null;
  actionName: string;
  tmu: number;
  frequency: number;
  seconds: number;
  note?: string | null;
  isSelected?: boolean;
}

export interface GsdAnalysisDetail extends GsdAnalysisSummary {
  sourceId?: number | null;
  sourceName?: string | null;

  machineId?: number | null;

  seamLength?: number | null;
  attachedActionTime?: number | null;
  difficultyPercent?: number | null;
  productMultiplier?: number | null;

  stitchCount?: number | null;
  machineSpeed?: number | null;
  machineVelocity?: number | null;
  allowance?: number | null;

  note?: string | null;
  updatedAt?: string | null;

  details: GsdAnalysisDetailRow[];
}


export interface DepartmentType {
  department_type_id: string;
  department_type_name: string;
  sort_order: number;
  status: number;
}



export interface DepartmentNode {
  department_id: string;
  department_name: string;
  manager_employee_id?: string | null;
  manager_name?: string | null;
  parent_department_id?: string | null;
  department_type_id: string;
  department_type_name?: string | null;
  department_type_sort_order?: number | null;
  status: number;
  dissolved_at?: string | null;
  children: DepartmentNode[];
}

export interface DepartmentPayload {
  department_name: string;
  manager_employee_id?: string | null;
  parent_department_id?: string | null;
  department_type_id: string;
  status: number;
}

export interface DepartmentNode_test {
  department_code: string;
  department_name: string;
  manager_employee_id?: string | null;
  manager_name?: string | null;
  parent_department_code?: string | null;
  department_type_code: string;
  department_type_name?: string | null;
  department_type_sort_order?: number | null;
  status_id: number;
  dissolved_at?: string | null;
  children: DepartmentNode_test[];
}

export interface DepartmentPayload_test {
  department_name: string;
  manager_employee_id?: string | null;
  parent_department_code?: string | null;
  department_type_code: string;
  status_id: number;
}


export interface EmployeeLite_test {
  id: number;
  employee_id: string;
  name: string | null;
  email?: string | null;
  phone?: string | null;
}


export interface DepartmentType_test {
  id: number;
  departmentTypeCode: string;
  departmentTypeName: string;
  statusId: number;
  statusName?: string;
  createdAt?: string;
}

export interface DepartmentTypePayload_test {
  departmentTypeCode: string;
  departmentTypeName: string;
  statusId: number;
}

export interface EmployeeLite {
  id: number;
  employee_id: string;
  name: string | null;
  email?: string | null;
  phone?: string | null;
}

// dinh 07/06/2026
export interface Work {
  id: number;
  workCode: string;
  workName: string;
  statusId: number;
  statusName?: string;
  createdAt?: string;
}

export interface WorkPayload {
  workCode: string;
  workName: string;
  statusId: number;
}

export interface ProductCate {
  id: number;
  productCode: string;
  productName: string;
  statusId: number;
  statusName?: string;
  createdAt?: string;
}

export interface ProductCatePayload {
  productCode: string;
  productName: string;
  statusId: number;
}

// dinh 07/07/2026
export interface ProductCateGroup {
  id: number;
  cateGroupCode: string;
  cateGroupName: string;
  statusId: number;
  statusName?: string;
  createdAt?: string;
}

export interface ProductCateGroupPayload {
  cateGroupCode: string;
  cateGroupName: string;
  statusId: number;
}


export interface SkillGrade {
  id: number;
  level: number;
  note: string;
  status_id: number;
  status_name?: string;
  created_at?: string;
}

export interface SkillGradePayload {
  level: number;
  note: string;
  status_id: number;
}



// dinh 08/07/2026

export interface SalaryCoefficient {
  id: number;
  levelId: number;
  level?: number;
  levelNote?: string;
  coefficient: number;
  statusId: number;
  statusName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryCoefficientPayload {
  levelId: number;
  coefficient: number;
  statusId: number;
}


// dinh 08/07/2026

export interface OperationClusterHeader {
  id: number;
  document_code: string;

  work_id: number;
  work_code?: string;
  work_name?: string;

  product_category_id: number;
  product_code?: string;
  product_name?: string;

  product_category_group_id: number;
  category_group_code?: string;
  category_group_name?: string;

  required_efficiency?: number | null;
  price_method: 'GSD' | 'ADJUSTED';
  note?: string | null;
  status_id: number;
  status_name?: string;

  total_adjusted_sam?: number;
  total_sam_gsd?: number;
  total_actions?: number;
  total_action_seconds?: number;
  total_manpower?: number;

  created_at?: string;
  updated_at?: string | null;
}


export interface OperationClusterDetail {
  header: OperationClusterHeader;
  groups: any[];
  operations: any[];
  dashboard: any;
}


export interface GsdOption {
  gsd_analysis_id: number;
  operation_code: string;
  operation_name: string;

  skill_grade_id: number | null; // bậc thợ trong danh mục
  skill_level: number | null;
  salary_coefficient: number;

  machine_equipment_id: number | null;
  machine_code: string | null;
  machine_name: string | null;
  code_mmtb?: string | null;
  total_tmu?: number | null;

  sam_gsd: number;
  total_action_seconds: number;
  total_actions: number;
}


export interface OperationClusterOperationPayload {
  line_no: number;
  line_balance_no?: number | null;

  gsd_analysis_id?: number | null;
  operation_code?: string | null;
  operation_name: string;

  skill_grade_id?: number | null;
  skill_level?: number | null;

  machine_equipment_id?: number | null;
  machine_name?: string | null;
  machine_code?: string | null;
  code_mmtb?: string | null;

  sam_gsd: number;
  salary_coefficient?: number;
  manpower?: number | null;
  required_efficiency?: number | string | null;

  total_action_seconds?: number;
  total_actions?: number;
  status_id?: number;
}

export interface OperationClusterGroupPayload {
  line_no: number;
  cluster_name: string;
  operations: OperationClusterOperationPayload[];
}

export interface CreateOperationClusterPayload {
  document_code: string;
  work_id: number;
  product_category_id: number;
  product_category_group_id: number;
  required_efficiency?: number | null;
  price_method: 'GSD' | 'ADJUSTED';
  note?: string | null;
  status_id: number;
  groups: OperationClusterGroupPayload[];
}




// dinh 09/07/2026
export interface GsdActionDetail {
  id: number;
  analysis_id: number;
  line_no: number;
  step_no: number | null;
  gsd_code_id: number | null;
  gsd_code: string | null;
  action_name: string;
  tmu: number;
  frequency: number;
  seconds: number;
  note?: string | null;
  is_selected?: boolean;
}


// dinh 15/07/2026
export interface Customer {
  id: number;
  cusCode: string;
  cusName: string;
  statusId: number;
  statusName?: string;
  createdAt?: string;
}

export interface CustomerPayload {
  cusCode: string;
  cusName: string;
  statusId: number;
}


export interface SewingProcessLine {
  id?: number;

  sourceDocumentCode?: string | null;
  sourceLineId?: number | null;

  lineNo: number;
  clusterNo?: number | null;
  clusterName?: string | null;

  operationCode?: string | null;
  operationName: string;

  lineOrder?: number | null;

  skillGradeId?: number | null;
  skillGradeLevel?: number | null;

  machineId?: number | null;
  machineCode?: string | null;
  machineName?: string | null;

  samGsd: number;
  salaryCoefficient: number;

  laborCount?: number;
  standardPrice?: number;

  requiredEfficiency?: number | null;
  adjustedSam?: number;
  usedEfficiency?: number;

  totalActions?: number;

  toolNeed?: string | null;

  sewingEmployee?: string | null;
  cbcTime?: number | null;
  note?: string | null;
}

export interface SewingProcessPayload {
  documentCode: string;

  customerId?: number | null;
  customerCode?: string | null;
  customerName?: string | null;

  itemCode?: string | null;
  productionLine?: string | null;
  productionRound?: number | null;

  workingHours: number;
  manpower?: number | null;
  productionManpower: number;
  quantity?: number | null;

  effectiveDate?: string | null;
  issuedDate?: string | null;

  priceMode: 'GSD' | 'ADJUSTED';
  statusId: number;
  note?: string | null;

  lines: SewingProcessLine[];
}

export interface SewingProcessSummary {
  totalTime: number;
  c1: number;
  totalSamGsd: number;
  taktTime: number;
  c3: number;
  c4: number;
  standardOutput: number;
  c5: number;
  c6: number;
  totalStandardPrice: number;
  totalPriceByOutput: number;
  averagePrice: number;
}

export interface SewingProcessMachineNeed {
  id?: number;
  machineId?: number | null;
  machineCode?: string | null;
  machineName?: string | null;
  sumSmv: number;
  machineNeed: number;
  machineQuantity: number;
  usedEfficiency?: number | null;
}

export interface SewingProcessResult {
  header: Omit<SewingProcessPayload, 'lines'>;
  summary: SewingProcessSummary;
  lines: SewingProcessLine[];
  machineNeeds: SewingProcessMachineNeed[];
  images?: SewingProcessImage[];
}

export interface SewingProcessListItem {
  id: number;
  documentCode: string;
  customerCode?: string | null;
  customerName?: string | null;
  itemCode?: string | null;
  productionLine?: string | null;
  productionRound?: number | null;
  workingHours?: number;
  manpower?: number | null;
  productionManpower?: number | null;
  quantity?: number | null;
  effectiveDate?: string | null;
  issuedDate?: string | null;
  priceMode?: string;
  statusId?: number;
  note?: string | null;

  imageUrl?: string | null;
  imageFileName?: string | null;

  totalTime?: number;
  totalSamGsd?: number;
  taktTime?: number;
  standardOutput?: number;
  totalStandardPrice?: number;
  averagePrice?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}


// dinh 17/06/2026

export interface SewingProcessImage {
  id?: number;
  documentCode?: string;
  imageUrl?: string;
  imageFileName?: string;
  sortOrder?: number;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface SewingProcessPayload {
  documentCode: string;

  customerId?: number | null;
  customerCode?: string | null;
  customerName?: string | null;

  itemCode?: string | null;
  productionLine?: string | null;
  productionRound?: number | null;

  workingHours: number;
  manpower?: number | null;
  productionManpower: number;
  quantity?: number | null;

  effectiveDate?: string | null;
  issuedDate?: string | null;

  priceMode: 'GSD' | 'ADJUSTED';
  statusId: number;
  note?: string | null;

  lines: SewingProcessLine[];

  images?: SewingProcessImage[];
}