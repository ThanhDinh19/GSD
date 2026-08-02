import type {
  SewingProcessLine,
  SewingProcessPayload,
} from '../types/sewingProcess.types';

function getToday(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export function createInitialSewingProcessLine():
  SewingProcessLine {
  return {
    gsdAnalysisId: null,

    lineNo: 1,

    clusterNo: 1,
    clusterName: '',

    operationCode: '',
    operationName: '',

    lineOrder: 1,

    skillGradeId: null,
    skillGradeLevel: null,

    machineId: null,
    machineCode: '',
    machineName: '',

    samGsd: 0,
    salaryCoefficient: 0,

    requiredEfficiency: 100,
    totalActions: 0,

    toolNeed: '',
    sewingEmployee: '',

    cbcTime: 0,

    note: '',

    imageFileName: null,
    imageUrl: null,
  };
}

export function createInitialSewingProcessPayload():
  SewingProcessPayload {
  const today = getToday();

  return {
    documentCode: '',

    customerId: null,
    customerCode: '',
    customerName: '',

    itemCode: '',

    productionLine: '',
    productionRound: 1,

    workingHours: 9,

    manpower: 0,
    productionManpower: 0,

    quantity: 0,

    effectiveDate: today,
    issuedDate: today,

    priceMode: 'GSD',

    statusId: 0,

    note: '',

    lines: [
      createInitialSewingProcessLine(),
    ],

    images: [],
  };
}