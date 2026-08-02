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

export interface CreateOperationClusterPayload {
  document_code: string;

  work_id: number | null;

  product_category_id: number | null;

  product_category_group_id: number | null;

  required_efficiency?: number | null;

  price_method:
    | 'GSD'
    | 'ADJUSTED';

  note?: string;

  status_id: number | null;

  groups: Groups[];
}

export interface Groups {
    line_no: number | null;
    cluster_name?: string;
    operations: Operations[];
}

export interface OperationClusterDetail {
  header: OperationClusterHeader;
  groups: any[];
  operations: Operations[];
  dashboard: Dashboard;
}

export interface Operations{
  id: number,
  header_id: number,
  group_id: number,
  cluster_name: string,
  group_line_no_master: number,
  line_no: number,
  group_line_no: number,
  line_balance_no: number,
  gsd_analysis_id: number,
  analysis_no: string,
  gsd_operation_name: string,
  operation_code: string,
  operation_name: string,
  skill_grade_id: number,
  skill_level_master: number,
  skill_level: number,
  machine_equipment_id: number,
  machine_code_master: string,
  machine_name_master: string,
  code_mmtb: string,
  machine_code: string,
  machine_name: string,
  sam_gsd: number,
  salary_coefficient: number,
  manpower: number,
  standard_price: number,
  required_efficiency: number,
  adjusted_sam: number,
  utilization_rate: number,
  total_action_seconds: number,
  total_actions: number,
  image_file_name: string,
  image_url: string,
  status_id: number,
  status_code: string,
  status_name: string,
  created_at: string,
  updated_at: string,
}

export interface Dashboard {
  total_adjusted_sam: number;
  total_sam_gsd: number;
  total_actions: number;
  total_action_seconds: number;
  total_manpower: number;
  total_standard_price: number;
  avg_tgcn_per_cluster: number;
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

// export interface CreateOperationClusterPayload {
//   document_code: string;
//   work_id: number;
//   product_category_id: number;
//   product_category_group_id: number;
//   required_efficiency?: number | null;
//   price_method: 'GSD' | 'ADJUSTED';
//   note?: string | null;
//   status_id: number;
//   groups: OperationClusterGroupPayload[];
// }

export interface OperationClusterPayload extends OperationClusterHeader{
  operations: Operations
}

