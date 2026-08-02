export type SewingProcessPriceMode =
  | 'GSD'
  | 'ADJUSTED';

export interface SewingProcessImage {
  id?: number;

  documentCode?: string | null;

  imageUrl?: string | null;
  imageFileName?: string | null;

  sortOrder?: number;

  note?: string | null;

  createdAt?: string;
  updatedAt?: string | null;
}

export interface SewingProcessLine {
  id?: number;

  /**
   * Nguồn của dòng khi chọn từ kho cụm.
   */
  sourceDocumentCode?: string | null;
  sourceLineId?: number | null;

  /**
   * ID phân tích GSD.
   */
  gsdAnalysisId?: number | null;

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

  /**
   * Ảnh của phân tích GSD.
   */
  imageFileName?: string | null;
  imageUrl?: string | null;
}

export interface SewingProcessHeader {
  id?: number;

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

  priceMode: SewingProcessPriceMode;

  statusId: number;

  note?: string | null;
}

export interface SewingProcessPayload extends SewingProcessHeader {
  lines: SewingProcessLine[];
  images: SewingProcessImage[];
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
  header: SewingProcessHeader;

  summary: SewingProcessSummary;

  lines: SewingProcessLine[];

  machineNeeds: SewingProcessMachineNeed[];

  images?: SewingProcessImage[];
}

export interface SewingProcessListItem {
  id: number;

  documentCode: string;

  customerId?: number | null;
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

  priceMode?: SewingProcessPriceMode;

  statusId?: number;

  note?: string | null;

  imageUrl?: string | null;
  imageFileName?: string | null;

  totalTime?: number;
  totalSamGsd?: number;
  taktTime?: number;

  standardOutput?: number;

  totalStandardPrice?: number;
  totalPriceByOutput?: number;
  averagePrice?: number;
}

export interface SewingProcessActionDetail {
  id: number;

  operationClusterLineId?: number | null;

  operationCode?: string | null;
  operationName?: string | null;

  gsdAnalysisId?: number | null;

  analysisId?: number | null;
  analysisNo?: string | null;

  lineNo: number;
  stepNo?: number | null;

  gsdCodeId?: number | null;
  gsdCode?: string | null;

  actionName: string;

  tmu: number;
  frequency: number;
  seconds: number;

  note?: string | null;
  isSelected?: boolean;
}

export interface SewingProcessUploadResult {
  imageFileName: string;
  imageUrl: string;
}

export interface SewingProcessMutationResult {
  id?: number;
  documentCode?: string;
}