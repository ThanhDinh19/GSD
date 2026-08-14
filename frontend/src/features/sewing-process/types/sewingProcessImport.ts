export type SewingProcessImportDataType =
  | 'string'
  | 'integer'
  | 'decimal'
  | 'percent'
  | 'unknown';

export type SewingProcessImportRowType =
  | 'DATA'
  | 'GROUP';


export interface SewingProcessImportColumn {
  key: string;
  title: string;
  sourceIndex: number;

  mapped: boolean;

  field: string | null;

  dataType: SewingProcessImportDataType;

  calculated: boolean;

  saveInput: boolean;
}


export interface SewingProcessImportCalculated {
  laborCount?: number;
  standardPrice?: number;
  adjustedSam?: number;
  usedEfficiency?: number;
}


export interface SewingProcessImportNormalizedInput {
  lineNo?: number | null;

  operationName?: string | null;

  skillGradeLevel?: number | null;

  machineName?: string | null;

  machineCode?: string | null;

  samGsd?: number | null;

  salaryCoefficient?: number | null;

  requiredEfficiency?: number | null;

  sewingEmployee?: string | null;

  cbcTime?: number | null;

  note?: string | null;

  lineOrder?: number | null;

  clusterNo?: number | null;

  clusterName?: string | null;
}


export interface SewingProcessImportRow {
  excelRow: number;

  rowType: SewingProcessImportRowType;

  clusterNo: number | null;

  clusterName: string | null;

  values: Record<
    string,
    unknown
  >;

  errors: Record<
    string,
    string
  >;

  normalizedInput:
    SewingProcessImportNormalizedInput | null;

  calculated?:
    SewingProcessImportCalculated;

  isValid: boolean;

  checked: boolean;
}


export interface SewingProcessImportSummary {
  totalRows: number;

  validRows: number;

  invalidRows: number;

  checkedRows: number;
}


export interface SewingProcessImportCalculationSummary {
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


export interface SewingProcessImportMachineNeed {
  machineId?: number | null;

  machineCode?: string | null;

  machineName?: string | null;

  sumSmv: number;

  machineNeed: number;

  machineQuantity: number;

  usedEfficiency?: number | null;
}


export interface SewingProcessImportCalculation {
  summary:
    SewingProcessImportCalculationSummary;

  machineNeeds:
    SewingProcessImportMachineNeed[];
}


export interface SewingProcessImportPreview {
  sheetName: string;

  headerRow: number;

  columns:
    SewingProcessImportColumn[];

  rows:
    SewingProcessImportRow[];

  summary:
    SewingProcessImportSummary;

  calculation:
    SewingProcessImportCalculation | null;

  calculationError:
    string | null;
}


export interface SewingProcessImportPreviewResponse {
  success: boolean;

  message: string;

  data:
    SewingProcessImportPreview;
}