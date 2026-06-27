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

  totalTmu: number;
  totalManualSeconds: number;
  machineSeconds: number;
  totalSmvBeforeDifficulty: number;
  difficultySeconds: number;
  finalSmv: number;
  skillGrade?: number | null;

  createdAt?: string;
}

export interface GsdAnalysisSummary {
  id: number;
  analysisNo: string;
  analysisDate?: string;
  operationName: string;

  sourceCode?: string | null;
  machineCode?: string | null;
  machineName?: string | null;

  totalTmu: number;
  totalManualSeconds: number;
  machineSeconds: number;
  totalSmvBeforeDifficulty: number;
  difficultySeconds: number;
  finalSmv: number;
  skillGrade?: number | null;

  createdAt?: string;
}


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