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
